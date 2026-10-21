// Requires Playwright and its WebKit browser. Uses installed Windows Chrome.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { chromium, webkit, devices } = require(process.env.SWATHONI_PLAYWRIGHT || "playwright");

const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!file.startsWith(root + path.sep) || pathname.split("/").some(part => part.startsWith("."))
        || !mime[path.extname(file)]) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] });
    response.end(await fs.readFile(file));
  } catch {
    response.end();
  }
});

let checks = 0;
async function checkPage(context, url) {
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(15000);
  await page.route("**/*", route => {
    const request = route.request();
    if (!request.url().startsWith(url) || request.resourceType() === "image") return route.abort();
    return route.continue();
  });
  return page;
}

async function ready(page, url, file) {
  await page.goto(`${url}/${file}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.i18n.ready);
  await page.evaluate(() => window.i18n.setLang("en"));
}

async function touchChecks(context, url, file) {
  const page = await checkPage(context, url);
  await ready(page, url, file);
  const trigger = page.locator(".lang-switch");
  const choices = page.locator(".lang-options");
  const before = await page.locator(".nav-toggle").boundingBox();
  await trigger.tap();
  assert.equal(await choices.isVisible(), true);
  await page.locator(".lang-picker").dispatchEvent("pointerleave", { pointerType: "touch" });
  await trigger.dispatchEvent("focusout", { relatedTarget: null });
  assert.equal(await choices.isVisible(), true);
  assert.deepEqual(await page.locator(".nav-toggle").boundingBox(), before);
  await page.locator('[data-lang-option="nl"]').tap();
  await page.waitForFunction(() => document.documentElement.lang === "nl");
  assert.equal(await trigger.textContent(), "NL");
  assert.equal(await choices.isVisible(), false);
  await trigger.tap();
  await trigger.tap();
  assert.equal(await choices.isVisible(), false);
  await trigger.tap();
  await page.touchscreen.tap(10, 300);
  assert.equal(await choices.isVisible(), false);
  checks++;
  await page.close();
}

async function desktopChecks(context, url, file) {
  const page = await checkPage(context, url);
  await ready(page, url, file);
  const choices = page.locator(".lang-options");
  await page.locator(".lang-picker").hover();
  assert.equal(await choices.isVisible(), true);
  await page.locator('[data-lang-option="nl"]').click();
  await page.waitForFunction(() => document.documentElement.lang === "nl");
  await page.mouse.move(0, 0);
  await page.locator(".lang-switch").focus();
  await page.keyboard.press("Enter");
  assert.equal(await choices.isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await choices.isVisible(), false);
  assert.equal(await page.locator(".lang-switch").evaluate(el => el === document.activeElement), true);
  checks++;
  await page.close();
}

(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browsers = [];
  try {
    const chrome = await chromium.launch({ channel: "chrome" });
    browsers.push(chrome);
    const windows = await chrome.newContext({ viewport: { width: 1440, height: 900 } });
    for (const file of ["index.html", "about.html", "contact.html", "experiences.html"]) {
      await desktopChecks(windows, url, file);
    }
    console.log("Windows Chrome hover and keyboard checks passed.");
    if (process.argv.includes("--chromium-only")) {
      const touch = await chrome.newContext({ ...devices["iPhone 13"] });
      for (const file of ["index.html", "about.html", "contact.html", "experiences.html"]) {
        await touchChecks(touch, url, file);
      }
      console.log(`${checks} Chrome mouse, keyboard and mobile touch scenarios passed.`);
      return;
    }
    console.log("Launching WebKit for iPhone touch checks...");
    const safari = await webkit.launch({ timeout: 20000 });
    browsers.push(safari);
    const iphone = await safari.newContext({ ...devices["iPhone 13"] });
    for (const file of ["index.html", "about.html", "contact.html", "experiences.html"]) {
      console.log(`WebKit touch check: ${file}`);
      await touchChecks(iphone, url, file);
    }

    const restricted = await safari.newContext({ ...devices["iPhone 13"] });
    await restricted.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() { throw new DOMException("Storage blocked", "SecurityError"); },
      });
      const matchMedia = window.matchMedia.bind(window);
      window.matchMedia = query => {
        const media = matchMedia(query);
        media.addEventListener = undefined;
        return media;
      };
    });
    console.log("WebKit storage and media-query fallback check...");
    await touchChecks(restricted, url, "index.html");

    console.log("WebKit failed download and retry check...");
    const fresh = await safari.newContext({ ...devices["iPhone 13"] });
    const page = await checkPage(fresh, url);
    await ready(page, url, "index.html");
    await page.route("**/translations/nl.json", route => route.fulfill({ status: 503, body: "Unavailable" }));
    await page.locator(".lang-switch").tap();
    await page.locator('[data-lang-option="nl"]').tap();
    await page.waitForFunction(() => !document.querySelector(".lang-options").hasAttribute("aria-busy"));
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.equal(await page.locator(".lang-switch").textContent(), "EN");
    await page.unroute("**/translations/nl.json");
    await page.locator('[data-lang-option="nl"]').tap();
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    checks++;
    await page.close();

    console.log(`${checks} WebKit/iPhone and Windows Chrome scenarios passed.`);
  } finally {
    await Promise.all(browsers.map(browser => browser.close()));
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
