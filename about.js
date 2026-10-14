(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chapters = document.getElementById("chapters");
  const panels = [...document.querySelectorAll(".chapter-panel")];
  const images = [...document.querySelectorAll(".chapter-img")];
  const bars = [...document.querySelectorAll(".chapter-bars i")];
  const counter = document.querySelector(".chapter-count");
  let current = -1;
  function setChapter(index) {
    if (index === current) return;
    current = index;
    panels.forEach((p, i) => p.classList.toggle("on", i === index));
    images.forEach((p, i) => p.classList.toggle("on", i === index));
    bars.forEach((p, i) => p.classList.toggle("on", i === index));
    counter.textContent = `0${index + 1} / 03`;
  }
  setChapter(0);
  const gallery = [...document.querySelectorAll(".difference-item")];
  let differenceIndex = Math.max(
    0,
    gallery.findIndex((el) => el.classList.contains("active")),
  );
  function setDifference(index) {
    if (!gallery.length) return;
    differenceIndex = (index + gallery.length) % gallery.length;
    gallery.forEach((g, i) =>
      g.classList.toggle("active", i === differenceIndex),
    );
    gallery[differenceIndex].focus({ preventScroll: true });
  }
  gallery.forEach((el, index) => {
    el.addEventListener("mouseenter", () => {
      differenceIndex = index;
      gallery.forEach((g) => g.classList.toggle("active", g === el));
    });
    el.addEventListener("focus", () => {
      differenceIndex = index;
      gallery.forEach((g) => g.classList.toggle("active", g === el));
    });
    el.addEventListener("click", () => {
      differenceIndex = index;
      gallery.forEach((g) => g.classList.toggle("active", g === el));
    });
  });
  const scenePrev = document.getElementById("scenePrev");
  const sceneNext = document.getElementById("sceneNext");
  if (scenePrev) scenePrev.textContent = "\u2190";
  if (sceneNext) sceneNext.textContent = "\u2192";
  scenePrev?.addEventListener("click", () =>
    setDifference(differenceIndex - 1),
  );
  sceneNext?.addEventListener("click", () =>
    setDifference(differenceIndex + 1),
  );
  if (reduce) {
    document.querySelector(".transition-sea").style.clipPath =
      "inset(0 0 0 50%)";
    return;
  }
  const transition = document.querySelector(".transition-section");
  const sea = document.querySelector(".transition-sea");
  let busy = false;
  function update() {
    const r = chapters.getBoundingClientRect();
    const distance = chapters.offsetHeight - innerHeight;
    const progress = Math.min(1, Math.max(0, -r.top / Math.max(1, distance)));
    setChapter(Math.min(2, Math.floor(progress * 3)));
    const tr = transition.getBoundingClientRect();
    const p = Math.min(
      1,
      Math.max(0, (innerHeight - tr.top) / (innerHeight + tr.height)),
    );
    sea.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    busy = false;
  }
  addEventListener(
    "scroll",
    () => {
      if (!busy) {
        busy = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener("resize", update);
  update();
})();
