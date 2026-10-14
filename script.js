const nav = document.getElementById("nav");
window.addEventListener(
  "scroll",
  () => nav.classList.toggle("scrolled", scrollY > 70),
  { passive: true },
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const heroSlides = [...document.querySelectorAll(".hero-slide")];
let heroSlideIndex = 0;
function setHeroSlide(index) {
  if (!heroSlides.length) return;
  heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => slide.classList.toggle("active", i === heroSlideIndex));
}
if (!reduce && heroSlides.length > 1) {
  setInterval(() => setHeroSlide(heroSlideIndex + 1), 5200);
}
if (!reduce) {
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          document.querySelectorAll(".parallax").forEach((el) => {
            const r = el.parentElement.getBoundingClientRect();
            if (r.bottom > 0 && r.top < innerHeight) {
              const p = (r.top - innerHeight) / (r.height + innerHeight);
              el.style.transform = `translate3d(0,${p * 55}px,0) scale(1.07)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
}

const journeyImage = document.getElementById("journeyImage");
const journeyCaption = document.getElementById("journeyCaption");
const journeyPhoto = document.querySelector(".journey-photo");
document.querySelectorAll(".step").forEach((step) =>
  step.addEventListener("click", () => {
    document
      .querySelectorAll(".step")
      .forEach((s) => s.classList.remove("active"));
    step.classList.add("active");
    journeyPhoto.classList.add("changing");
    const src = step.dataset.image,
      cap = step.dataset.caption;
    const preload = new Image();
    preload.src = src;
    const swap = () => {
      journeyImage.src = src;
      journeyCaption.textContent = cap;
      setTimeout(() => journeyPhoto.classList.remove("changing"), 70);
    };
    preload.complete
      ? setTimeout(swap, 180)
      : (preload.onload = () => setTimeout(swap, 180));
  }),
);

const storyQuotes = [
  {
    text: "We came for the safari, but it was the feeling of the whole journey that stayed with us.",
    guest: ["SOPHIE & MARK", "SAFARI + DIANI", "AMSTERDAM"],
  },
  {
    text: "Every detail felt considered, from the first game drive to the quiet coast days that followed.",
    guest: ["AMINA & JAMES", "WILD + COAST", "NAIROBI"],
  },
  {
    text: "Swathoni shaped the trip around how we wanted to feel, not just where we wanted to go.",
    guest: ["LENA FAMILY", "KENYA ESCAPE", "LONDON"],
  },
];
let storyIndex = 0;
const storyQuote = document.getElementById("storyQuote");
const storyGuest = document.getElementById("storyGuest");
const storyCount = document.getElementById("storyCount");
const storyPrev = document.getElementById("storyPrev");
const storyNext = document.getElementById("storyNext");
if (storyPrev) storyPrev.textContent = "\u2190";
if (storyNext) storyNext.textContent = "\u2192";
function setStory(n) {
  if (!storyQuote || !storyGuest || !storyCount) return;
  storyIndex = (n + storyQuotes.length) % storyQuotes.length;
  const story = storyQuotes[storyIndex];
  storyQuote.textContent = story.text;
  storyGuest.innerHTML = story.guest.map((item) => `<span>${item}</span>`).join("<i></i>");
  storyCount.textContent = `0${storyIndex + 1} / 03`;
}
storyPrev?.addEventListener("click", () => setStory(storyIndex - 1));
storyNext?.addEventListener("click", () => setStory(storyIndex + 1));
setStory(storyIndex);
