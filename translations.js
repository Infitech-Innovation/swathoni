/*! Swathoni Travels - shared translation engine (vanilla JS)
 *
 * Reads translation files from /translations/<lang>.json, applies them to the
 * page using data-* attributes, remembers the choice in localStorage and
 * updates the HTML lang attribute. No dependencies, no build step.
 *
 * Data attributes supported on any element:
 *   data-i18n               -> replaces innerHTML (keeps <em>, <br>, <span>, etc.)
 *   data-i18n-text          -> replaces textContent (plain text, no markup)
 *   data-i18n-placeholder   -> sets the placeholder attribute
 *   data-i18n-aria-label    -> sets the aria-label attribute
 *   data-i18n-content       -> sets the content attribute (meta tags)
 *   data-i18n-title         -> replaces textContent of <title>
 *
 * Global API (available once the module has loaded):
 *   window.i18n.t(key)              -> translated string (falls back to English)
 *   window.i18n.getLang()           -> 'en' | 'nl'
 *   window.i18n.setLang('nl')       -> switch language, persists + re-renders
 *   window.i18n.onLangChange(fn)    -> register a callback for language changes
 */
(() => {
  "use strict";

  const STORAGE_KEY = "swathoni-lang";
  const DEFAULT_LANG = "en";
  const SUPPORTED = ["en", "nl"];
  const TRANSLATION_DIR = "translations";

  let currentLang = DEFAULT_LANG;
  const cache = {}; // lang -> parsed object
  const changeListeners = [];

  // Resolve the translation URL relative to the page location. All pages live
  // at the site root, so "translations/<lang>.json" works everywhere.
  function translationUrl(lang) {
    return `${TRANSLATION_DIR}/${lang}.json`;
  }

  function normalize(lang) {
    return SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;
  }

  // Look up a dotted key inside a translation object.
  function getKey(obj, key) {
    return key.split(".").reduce((acc, part) => {
      return acc && typeof acc === "object" && part in acc
        ? acc[part]
        : undefined;
    }, obj);
  }

  // Translate a key. Falls back to English, then returns the key itself.
  function t(key) {
    let value = getKey(cache[currentLang], key);
    if (value === undefined && currentLang !== DEFAULT_LANG) {
      value = getKey(cache[DEFAULT_LANG], key);
    }
    return value === undefined ? key : value;
  }

  async function loadLang(lang) {
    if (cache[lang]) return;
    const response = await fetch(translationUrl(lang), { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Translation file not found: ${translationUrl(lang)}`);
    }
    cache[lang] = await response.json();
  }

  async function init() {
    try {
      await loadLang("en");

      if (currentLang !== "en") {
        await loadLang(currentLang);
      }

      applyTranslations();
      updateSelectorUI();
    } catch (error) {
      console.error("Failed to initialize translations:", error);
    }
  }

  function applyTranslations() {
    // Elements whose innerHTML is replaced (markup such as <em>/<br> kept).
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n"));
      if (value !== undefined && value !== el.getAttribute("data-i18n")) {
        el.innerHTML = value;
      }
    });

    // Plain text replacement (no markup).
    document.querySelectorAll("[data-i18n-text]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-text"));
      if (value !== undefined && value !== el.getAttribute("data-i18n-text")) {
        el.textContent = value;
      }
    });

    // Placeholder attributes.
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-placeholder"));
      if (
        value !== undefined &&
        value !== el.getAttribute("data-i18n-placeholder")
      ) {
        el.placeholder = value;
      }
    });

    // aria-label attributes.
    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-aria-label"));
      if (
        value !== undefined &&
        value !== el.getAttribute("data-i18n-aria-label")
      ) {
        el.setAttribute("aria-label", value);
      }
    });

    // alt attributes (images).
    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-alt"));
      if (value !== undefined && value !== el.getAttribute("data-i18n-alt")) {
        el.setAttribute("alt", value);
      }
    });

    // Generic title attribute (e.g. iframe titles).
    document.querySelectorAll("[data-i18n-attr-title]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-attr-title"));
      if (
        value !== undefined &&
        value !== el.getAttribute("data-i18n-attr-title")
      ) {
        el.title = value;
      }
    });

    // Meta content attributes.
    document.querySelectorAll("[data-i18n-content]").forEach((el) => {
      const value = t(el.getAttribute("data-i18n-content"));
      if (
        value !== undefined &&
        value !== el.getAttribute("data-i18n-content")
      ) {
        el.setAttribute("content", value);
      }
    });

    // Document title.
    const titleEl = document.querySelector("title[data-i18n-title]");
    if (titleEl) {
      const value = t(titleEl.getAttribute("data-i18n-title"));
      if (
        value !== undefined &&
        value !== titleEl.getAttribute("data-i18n-title")
      ) {
        titleEl.textContent = value;
        document.title = value;
      }
    }
  }

  // function updateSelectorUI() {
  //   document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
  //     const code = btn.getAttribute("data-lang-btn");
  //     btn.textContent = code.toUpperCase();
  //     btn.setAttribute("aria-pressed", code === currentLang);
  //     btn.classList.toggle("active", code === currentLang);
  //   });
  // }

  function updateSelectorUI() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      // Display the language the visitor can switch to.
      const nextLang = currentLang === "en" ? "nl" : "en";

      btn.textContent = nextLang.toUpperCase();

      const labelKey =
        nextLang === "nl" ? "lang.switchToDutch" : "lang.switchToEnglish";

      btn.setAttribute("aria-label", t(labelKey));
      btn.setAttribute("aria-pressed", "false");

      btn.classList.toggle("active", currentLang === "nl");
    });
  }

  function setupSelector() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      // Prevent duplicate click listeners if setupSelector runs again.
      if (btn.dataset.langListenerAttached === "true") return;
      btn.dataset.langListenerAttached = "true";

      btn.addEventListener("click", async () => {
        // Always switch from the currently active language.
        const target = currentLang === "en" ? "nl" : "en";

        try {
          await setLang(target, true);
        } catch (error) {
          console.error("Could not switch language:", error);
        }

        // Close the mobile navigation menu if it is open.
        const header = document.getElementById("nav");

        if (header?.classList.contains("menu-open")) {
          header.classList.remove("menu-open");

          const toggle = header.querySelector(".nav-toggle");

          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", t("nav.toggleOpen"));
          }
        }
      });
    });
  }

  async function setLang(lang, persist = true) {
    lang = normalize(lang);
    if (lang === currentLang && cache[lang]) {
      updateSelectorUI();
      return;
    }
    currentLang = lang;
    document.documentElement.lang = lang;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {
        // localStorage unavailable; continue without persisting.
      }
    }
    await loadLang(lang);
    applyTranslations();
    updateSelectorUI();
    changeListeners.forEach((fn) => {
      try {
        fn({ lang: currentLang });
      } catch (e) {
        // listener errors should not break the language switch
      }
    });
    document.dispatchEvent(
      new CustomEvent("swathoni:langchange", { detail: { lang: currentLang } }),
    );
  }

  // Determine language and set the HTML lang attribute synchronously so there
  // is no flash of the wrong language attribute. Actual translation loading
  // happens once the DOM is ready.
  const stored = localStorage.getItem(STORAGE_KEY);
  currentLang = normalize(stored || DEFAULT_LANG);
  document.documentElement.lang = currentLang;

  let readyResolve;
  const ready = new Promise((res) => {
    readyResolve = res;
  });

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await init();
      setupSelector();
    } finally {
      readyResolve();
      document.dispatchEvent(new Event("swathoni:i18nready"));
    }
  });

  // Expose public API.
  window.i18n = {
    t,
    getLang: () => currentLang,
    setLang,
    onLangChange: (fn) => changeListeners.push(fn),
    ready,
    init,
  };
})();
