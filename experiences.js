(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = $("#nav");
  const updateNav = () => nav?.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", updateNav, { passive: true });
  updateNav();
  const reveal = $$(".xp-reveal");
  if (!reduce && "IntersectionObserver" in window) {
    document.body.classList.add("xp-js");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("xp-visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    reveal.forEach((el) => observer.observe(el));
  }
  let scene = 0;
  const stageSide = $(".xp-stage-side");
  const setScene = (n) => {
    scene = (n + 3) % 3;
    if (stageSide) stageSide.dataset.activeScene = String(scene);
    $$(".xp-stage-image,.xp-scene").forEach((el) =>
      el.classList.toggle("is-active", Number(el.dataset.scene) === scene),
    );
    $(".xp-scene-counter").textContent = `0${scene + 1} / 03`;
    $("#xpProgress").style.width = `${((scene + 1) / 3) * 100}%`;
  };
  setScene(scene);
  $("#scenePrev")?.addEventListener("click", () => {
    setScene(scene - 1);
    manualUntil = Date.now() + 2200;
  });
  $("#sceneNext")?.addEventListener("click", () => {
    setScene(scene + 1);
    manualUntil = Date.now() + 2200;
  });
  let manualUntil = 0;
  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to(".xp-hero-art-back img", {
      yPercent: 9,
      ease: "none",
      scrollTrigger: {
        trigger: ".xp-hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(".xp-breath-photo img", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".xp-breath",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    gsap.to(".xp-booking-background img", {
      yPercent: 10,
      ease: "none",
      scrollTrigger: {
        trigger: ".xp-booking",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    ScrollTrigger.create({
      trigger: ".xp-experience",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        if (Date.now() > manualUntil)
          setScene(Math.min(2, Math.floor(self.progress * 3)));
      },
    });
  } else {
    const onScroll = () => {
      if (Date.now() < manualUntil) return;
      const el = $(".xp-experience");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const range = Math.max(1, el.offsetHeight - innerHeight);
      if (rect.top <= 0 && rect.bottom >= innerHeight)
        setScene(Math.min(2, Math.floor((-rect.top / range) * 3)));
    };
    addEventListener("scroll", onScroll, { passive: true });
  }
  $$(".xp-inline-link").forEach((a) =>
    a.addEventListener("click", () => {
      const radio = $(`input[name="trip"][value="${a.dataset.trip}"]`);
      if (radio) radio.checked = true;
    }),
  );
  $("#filmPrev")?.addEventListener("click", () =>
    $("#filmTrack").scrollBy({
      left: -Math.min(innerWidth * 0.75, 710),
      behavior: "smooth",
    }),
  );
  $("#filmNext")?.addEventListener("click", () =>
    $("#filmTrack").scrollBy({
      left: Math.min(innerWidth * 0.75, 710),
      behavior: "smooth",
    }),
  );
  const galleryItems = $$(".xp-gallery-item");
  const updateGalleryFilter = (category = "all") => {
    let visibleIndex = 0;
    galleryItems.forEach((item) => {
      const isVisible = category === "all" || item.dataset.category === category;
      item.hidden = !isVisible;
      if (isVisible) {
        item.dataset.gallerySlot = String(visibleIndex % 6);
        visibleIndex += 1;
      } else {
        delete item.dataset.gallerySlot;
      }
    });
  };
  updateGalleryFilter();
  $$(".xp-filters button").forEach((button) =>
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      $("#filmPrev")?.addEventListener("click", () =>
        $("#filmTrack").scrollBy({
          left: -Math.min(innerWidth * 0.75, 710),
          behavior: "smooth",
        }),
      );
      $("#filmNext")?.addEventListener("click", () =>
        $("#filmTrack").scrollBy({
          left: Math.min(innerWidth * 0.75, 710),
          behavior: "smooth",
        }),
      );
      $$(".xp-filters button").forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      updateGalleryFilter(category);
    }),
  );
  const modal = $("#lightbox"),
    gallery = galleryItems;
  let galleryIndex = 0,
    lastFocus = null;
  const visibleGallery = () => gallery.filter((el) => !el.hidden);
  function showPhoto(n) {
    const visible = visibleGallery();
    if (!visible.length) return;
    galleryIndex = (n + visible.length) % visible.length;
    const item = visible[galleryIndex];
    $("#lightboxImage").src = $("img", item).src;
    $("#lightboxImage").alt = $("img", item).alt;
    $("#lightboxCaption").textContent = item.dataset.caption;
  }
  function openPhoto(item) {
    lastFocus = document.activeElement;
    galleryIndex = visibleGallery().indexOf(item);
    showPhoto(galleryIndex);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".xp-lightbox-close").focus();
  }
  function closePhoto() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocus?.focus();
  }
  gallery.forEach((item) =>
    item.addEventListener("click", () => openPhoto(item)),
  );
  $(".xp-lightbox-close").addEventListener("click", closePhoto);
  $(".xp-lightbox-prev").addEventListener("click", () =>
    showPhoto(galleryIndex - 1),
  );
  $(".xp-lightbox-next").addEventListener("click", () =>
    showPhoto(galleryIndex + 1),
  );
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePhoto();
  });
  addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closePhoto();
    if (e.key === "ArrowLeft") showPhoto(galleryIndex - 1);
    if (e.key === "ArrowRight") showPhoto(galleryIndex + 1);
    if (e.key === "Tab") {
      const buttons = $$("button", modal);
      const focusables = buttons.filter((b) => b.offsetParent !== null);
      const first = focusables[0],
        last = focusables.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  const quotes = [
    {
      text: "We came for the safari, but it was the feeling of the whole journey that stayed with us.",
      guest: ["SOPHIE & MARK", "SAFARI + DIANI", "AMSTERDAM"],
    },
    {
      text: "Every turn brought a new view, a new moment, a new reason to fall in love with Kenya.",
      guest: ["AMINA & JAMES", "WILD + COAST", "NAIROBI"],
    },
    {
      text: "From the open plains to the ocean breeze, it felt like two beautiful holidays in one.",
      guest: ["LENA FAMILY", "SAFARI + SEA", "LONDON"],
    },
  ];
  let quoteIndex = 0;
  function setQuote(n) {
    const quoteText = $("#xpStoryQuote");
    const quoteGuest = $("#xpStoryGuest");
    const quoteCount = $("#xpStoryCount");
    if (!quoteText || !quoteGuest || !quoteCount) return;
    quoteIndex = (n + quotes.length) % quotes.length;
    const q = quotes[quoteIndex];
    quoteText.textContent = q.text;
    quoteGuest.innerHTML = q.guest.map((item) => `<span>${item}</span>`).join("<i></i>");
    quoteCount.textContent = `0${quoteIndex + 1} / 03`;
  }
  $("#xpStoryPrev")?.addEventListener("click", () => setQuote(quoteIndex - 1));
  $("#xpStoryNext")?.addEventListener("click", () => setQuote(quoteIndex + 1));
  setQuote(quoteIndex);
  const form = $("#travelForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const details = `Name: ${d.get("name")}\nEmail: ${d.get("email")}\nExperience: ${d.get("trip")}\nPreferred date: ${d.get("date") || "Flexible"}\nTravellers: ${d.get("travellers")}\nAdditional details: ${d.get("notes") || "None provided"}`;
    const subject = encodeURIComponent("Swathoni Travels — Journey enquiry");
    const body = encodeURIComponent(
      `Hello Swathoni Travels,\n\nI would like to enquire about a journey.\n\n${details}\n\nThank you.`,
    );
    $("#formNotice").textContent =
      "Your email app will open with your enquiry. Please review it and send it to Swathoni once their official address is confirmed.";
    const email = "";
    if (email) {
      location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      const fallback = `Swathoni Travels — Journey enquiry\n\n${details}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(fallback)
          .then(() => {
            $("#formNotice").textContent =
              "Enquiry copied! Paste it into your email or message to Swathoni. The official booking email has not been configured yet.";
          })
          .catch(() => {
            $("#formNotice").textContent =
              "Booking email is not configured. Please copy your details manually or ask the site owner to connect the form.";
          });
      } else {
        $("#formNotice").textContent =
          "Booking email is not configured yet. Please ask the site owner to connect the form before launch.";
      }
    }
  });
})();
