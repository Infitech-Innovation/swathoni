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
