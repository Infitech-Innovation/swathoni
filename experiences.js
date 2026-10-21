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
  const galleryCollections = {
    wild: [
      {
        src: "images/lion.jpeg",
        alt: "Lion resting in Kenya",
        caption: "A moment in the wild",
      },
      {
        src: "images/lion1.jpeg",
        alt: "Male lion resting beneath a tree",
        caption: "The king at rest",
      },
      {
        src: "images/lion2.jpeg",
        alt: "Lion lying in the grass",
        caption: "Quiet on the savannah",
      },
      {
        src: "images/lion3.jpeg",
        alt: "Close-up of a lion",
        caption: "An unforgettable gaze",
      },
      {
        src: "images/lion4.jpeg",
        alt: "Male lion in profile",
        caption: "A regal moment",
      },
      {
        src: "images/thewild.jpeg",
        alt: "Zebra in the wild",
        caption: "The wild, wide open",
      },
      {
        src: "images/cheetah.jpeg",
        alt: "Leopard walking through the greenery",
        caption: "A quiet trail through the wild",
      },
      {
        src: "images/thecheeter.jpeg",
        alt: "Cheetah sitting on the open plains",
        caption: "Watching over the plains",
      },
      {
        src: "images/zebra.jpeg",
        alt: "Zebras grazing together",
        caption: "Pattern and movement",
      },
      {
        src: "images/wildbeasts.jpeg",
        alt: "Wildebeest on the plains",
        caption: "Life on the move",
      },
      {
        src: "images/feel.jpeg",
        alt: "Lion resting on a safari sign",
        caption: "The feeling of being here",
      },
      {
        src: "images/feel1.jpeg",
        alt: "Lion stretched out on a safari sign",
        caption: "A pause worth keeping",
      },
    ],
    coast: [
      {
        src: "images/diani.jpeg",
        alt: "Boat on turquoise water in Diani",
        caption: "A little closer to paradise",
      },
      {
        src: "images/diani1.jpeg",
        alt: "Palm trees beside Diani beach",
        caption: "Soft mornings by the sea",
      },
      {
        src: "images/diani2.jpeg",
        alt: "Visitors walking along Diani beach",
        caption: "A walk beside the ocean",
      },
      {
        src: "images/diani3.jpeg",
        alt: "Kitesurfing at Diani beach",
        caption: "Barefoot days in Diani",
      },
      {
        src: "images/diani4.jpeg",
        alt: "White sand and beach activities in Diani",
        caption: "Days by the shore",
      },
      {
        src: "images/dianimap.jpeg",
        alt: "Colourful destination signs in Diani",
        caption: "Finding your way along the coast",
      },
      {
        src: "images/coastbeach.jpeg",
        alt: "Kenyan coast beach",
        caption: "Where the coast slows time",
      },
      {
        src: "images/privatebeach.jpeg",
        alt: "Palm-fringed beach on the coast",
        caption: "Room to breathe",
      },
      {
        src: "images/beach.jpeg",
        alt: "Palm trees beside a sandy beach",
        caption: "A place in the shade",
      },
      {
        src: "images/sandybeaches.jpg",
        alt: "Patterns in beach sand",
        caption: "Small details by the sea",
      },
      {
        src: "images/ocean.jpeg",
        alt: "Clear turquoise ocean water",
        caption: "Open water, endless blue",
      },
      {
        src: "images/ocean2.jpeg",
        alt: "Palm tree above a white sand beach",
        caption: "A view of paradise",
      },
      {
        src: "images/ocean3.jpeg",
        alt: "Boat beneath the moon over the ocean",
        caption: "Moonlight on the water",
      },
      {
        src: "images/ocean4.jpeg",
        alt: "Wide sandy shoreline",
        caption: "Space to wander",
      },
      {
        src: "images/map.jpeg",
        alt: "Destination signs beside a coastal path",
        caption: "Coastal paths and possibilities",
      },
      {
        src: "images/sunrise.jpeg",
        alt: "Golden sun reflected on the sea",
        caption: "Golden light by the ocean",
      },
    ],
    plains: [
      {
        src: "images/thesafari.jpeg",
        alt: "Safari vehicle beneath an acacia tree",
        caption: "The beauty of the open plains",
      },
      {
        src: "images/van.jpeg",
        alt: "Travellers inside a safari van",
        caption: "On the road through Kenya",
      },
      {
        src: "images/grass.jpg",
        alt: "Green grass across the landscape",
        caption: "The plains in green",
      },
      {
        src: "images/hill.jpeg",
        alt: "Rocky hills above the landscape",
        caption: "Beyond the open plains",
      },
    ],
    moments: [
      {
        src: "images/night.jpeg",
        alt: "Sunset over a quiet landscape",
        caption: "Evenings made slow",
      },
      {
        src: "images/people.jpeg",
        alt: "Travellers sharing a moment together",
        caption: "Human moments along the journey",
      },
      {
        src: "images/people2.jpeg",
        alt: "Traveller enjoying a journey",
        caption: "A smile worth keeping",
      },
      {
        src: "images/people3.jpeg",
        alt: "Traveller seated in a vehicle",
        caption: "Stories from the road",
      },
    ],
    wildlife: [
      {
        src: "images/elephant.jpeg",
        alt: "Elephant walking along a red dirt road",
        caption: "A path through the wild",
      },
      {
        src: "images/elephant2.avif",
        alt: "Elephant standing on the open plains",
        caption: "Face to face with a giant",
      },
      {
        src: "images/elephant3.jpeg",
        alt: "Elephant in the grass",
        caption: "In the company of giants",
      },
      {
        src: "images/elephant4.jpeg",
        alt: "Elephant beneath the trees",
        caption: "Shelter in the shade",
      },
      {
        src: "images/elephant5.jpeg",
        alt: "Close-up of an elephant trunk and tusks",
        caption: "The details of a giant",
      },
      {
        src: "images/elephant6.jpeg",
        alt: "Elephant seen up close",
        caption: "A closer look",
      },
      {
        src: "images/elephant7.jpeg",
        alt: "Elephants gathered beside water",
        caption: "Together at the water",
      },
      {
        src: "images/elephant8.jpeg",
        alt: "Elephant walking across the plains",
        caption: "A gentle presence",
      },
      {
        src: "images/elephant9.jpeg",
        alt: "Elephant among trees in black and white",
        caption: "Stillness among the trees",
      },
      {
        src: "images/zebra1.jpeg",
        alt: "Zebras seen up close",
        caption: "Lines across the landscape",
      },
      {
        src: "images/zebra2.jpeg",
        alt: "Visitor beside a zebra",
        caption: "A memorable encounter",
      },
      {
        src: "images/zebra3.jpeg",
        alt: "Zebra standing in green grass",
        caption: "Stripes in the greenery",
      },
      {
        src: "images/zebra4.jpeg",
        alt: "Zebras in black and white",
        caption: "Patterns of the wild",
      },
      {
        src: "images/zebra5.jpeg",
        alt: "Zebra beneath the trees",
        caption: "A pause in the shade",
      },
      {
        src: "images/cheeter.jpeg",
        alt: "Leopard resting on a tree branch",
        caption: "Stillness above the ground",
      },
      {
        src: "images/cheeter1.jpeg",
        alt: "Leopard stretched out on a branch",
        caption: "Resting in the treetops",
      },
      {
        src: "images/cheeter2.jpeg",
        alt: "Leopard resting in a tree",
        caption: "A quiet lookout",
      },
      {
        src: "images/cheeter3.jpeg",
        alt: "Close-up of a leopard",
        caption: "Spots and stillness",
      },
      {
        src: "images/cheeter4.jpeg",
        alt: "Leopard looking to the side",
        caption: "An alert gaze",
      },
      {
        src: "images/cheeter5.jpeg",
        alt: "Leopard lying on a branch",
        caption: "At ease in the wild",
      },
      {
        src: "images/cheeter6.jpeg",
        alt: "Leopard climbing through branches",
        caption: "Moving through the trees",
      },
      {
        src: "images/cheeter7.jpeg",
        alt: "Leopard among dry branches",
        caption: "Hidden in plain sight",
      },
      {
        src: "images/girrafe.jpeg",
        alt: "Giraffes standing together",
        caption: "Above the savannah",
      },
      {
        src: "images/girrafe4.jpeg",
        alt: "Giraffes on the open plains",
        caption: "A gathering on the plains",
      },
      {
        src: "images/girrafe10.jpeg",
        alt: "Giraffe among green trees",
        caption: "A glimpse through the greenery",
      },
      {
        src: "images/giffare5.jpeg",
        alt: "Close-up of a giraffe",
        caption: "A different perspective",
      },
      {
        src: "images/bird.jpeg",
        alt: "Bird beside a safari road",
        caption: "Small encounters along the way",
      },
      {
        src: "images/impala.jpeg",
        alt: "Antelope standing together",
        caption: "Life across the plains",
      },
    ],
    culture: [
      {
        src: "images/maasai.jpeg",
        alt: "Maasai people in traditional dress",
        caption: "Maasai culture and connection",
      },
      {
        src: "images/maasai.svg",
        alt: "Illustration of Maasai people in traditional dress",
        caption: "A portrait of Maasai culture",
      },
      {
        src: "images/maasai1.jpeg",
        alt: "Maasai people walking together",
        caption: "Stories shared along the way",
      },
      {
        src: "images/maasai2.jpeg",
        alt: "Visitors and Maasai hosts outside a home",
        caption: "A warm welcome",
      },
      {
        src: "images/maasai3.jpeg",
        alt: "Maasai community gathering",
        caption: "Traditions brought together",
      },
      {
        src: "images/maasai4.jpeg",
        alt: "Maasai people seated together",
        caption: "A moment of connection",
      },
      {
        src: "images/maasaiculture.jpeg",
        alt: "Maasai cultural experience",
        caption: "Traditions shared with care",
      },
      {
        src: "images/maaworias.jpeg",
        alt: "Maasai people in traditional dress",
        caption: "The people and stories of Kenya",
      },
      {
        src: "images/fmasai.jpeg",
        alt: "Woman wearing traditional beaded jewellery",
        caption: "A deeper sense of place",
      },
      {
        src: "images/park.jpeg",
        alt: "Visitors gathered outdoors",
        caption: "Connections along the journey",
      },
    ],
  };
  const galleryItems = $$(".xp-gallery-item");
  const getGalleryPhotos = (item) =>
    galleryCollections[item.dataset.galleryKey] || [];
  const updateGalleryFilter = (category = "all") => {
    let visibleIndex = 0;
    galleryItems.forEach((item) => {
      const hasPhotos = getGalleryPhotos(item).length > 0;
      const isVisible =
        hasPhotos && (category === "all" || item.dataset.category === category);
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
    activePhotos = [],
    lastFocus = null,
    currentGalleryKey = null;
  function showPhoto(n) {
    if (!activePhotos.length) return;
    galleryIndex = (n + activePhotos.length) % activePhotos.length;
    const photo = activePhotos[galleryIndex];
    $("#lightboxImage").src = photo.src;
    $("#lightboxImage").alt = photo.alt;
    const translatedCaption =
      window.i18n && window.i18n.t("galleryCaptions." + photo.caption);
    $("#lightboxCaption").textContent = translatedCaption || photo.caption;
  }
  function openPhoto(item) {
    activePhotos = getGalleryPhotos(item);
    currentGalleryKey = item.dataset.galleryKey;
    if (!activePhotos.length) return;
    lastFocus = document.activeElement;
    showPhoto(0);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $(".xp-lightbox-close").focus();
  }
  function closePhoto() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activePhotos = [];
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
    const translated = window.i18n
      ? window.i18n.t("experiences.testimonial.quotes")
      : null;
    const quoteList = Array.isArray(translated) ? translated : quotes;
    const q = quoteList[quoteIndex];
    quoteText.textContent = q.text;
    quoteGuest.innerHTML = q.guest
      .map((item) => `<span>${item}</span>`)
      .join("<i></i>");
    quoteCount.textContent = `0${quoteIndex + 1} / 03`;
  }
  $("#xpStoryPrev")?.addEventListener("click", () => setQuote(quoteIndex - 1));
  $("#xpStoryNext")?.addEventListener("click", () => setQuote(quoteIndex + 1));

  window.i18n.ready.then(() => {
    setQuote(quoteIndex);
    window.i18n.onLangChange(() => {
      setQuote(quoteIndex);
    });
  });
})();
