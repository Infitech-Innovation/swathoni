(() => {
  "use strict";

  const header = document.getElementById("nav");
  const toggle = header?.querySelector(".nav-toggle");
  const links = header?.querySelector("#main-navigation");

  if (!header || !toggle || !links) return;

  const mobile = window.matchMedia("(max-width: 900px)");

  const translate = (key, fallback) => {
    const engine = window.i18n;

    if (typeof engine?.t !== "function") return fallback;

    const value = engine.t(key);
    return value && value !== key ? value : fallback;
  };

  const setOpen = (open) => {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));

    toggle.setAttribute(
      "aria-label",
      open
        ? translate("nav.toggleClose", "Close navigation menu")
        : translate("nav.toggleOpen", "Open navigation menu"),
    );
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  header.addEventListener("focusout", (event) => {
    if (!header.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });

  if (mobile.addEventListener) {
    mobile.addEventListener("change", () => setOpen(false));
  } else {
    mobile.addListener(() => setOpen(false));
  }

  // Subscribe when the translation engine is ready.
  const setupLanguageListener = () => {
    const engine = window.i18n;

    if (typeof engine?.onLangChange === "function") {
      engine.onLangChange(() => {
        setOpen(header.classList.contains("menu-open"));
      });

      setOpen(header.classList.contains("menu-open"));
    }
  };

  if (window.i18n?.ready) {
    window.i18n.ready.then(setupLanguageListener).catch(console.error);
  } else {
    document.addEventListener("swathoni:i18nready", setupLanguageListener, {
      once: true,
    });
  }
})();

// (() => {
//   const header = document.getElementById("nav");
//   const toggle = header?.querySelector(".nav-toggle");
//   const links = header?.querySelector("#main-navigation");
//   if (!toggle || !links) return;

//   const mobile = matchMedia("(max-width: 900px)");
//   const setOpen = (open) => {
//     header.classList.toggle("menu-open", open);
//     toggle.setAttribute("aria-expanded", String(open));
//     const openLabel = i18n && i18n.t("nav.toggleOpen");
//     const closeLabel = i18n && i18n.t("nav.toggleClose");
//     toggle.setAttribute(
//       "aria-label",
//       open ? (closeLabel || "Close navigation menu") : (openLabel || "Open navigation menu")
//     );
//   };

//   toggle.addEventListener("click", () => {
//     setOpen(toggle.getAttribute("aria-expanded") !== "true");
//   });
//   links.addEventListener("click", (event) => {
//     if (event.target.closest("a")) setOpen(false);
//   });
//   document.addEventListener("click", (event) => {
//     if (!header.contains(event.target)) setOpen(false);
//   });
//   document.addEventListener("keydown", (event) => {
//     if (event.key === "Escape" && header.classList.contains("menu-open")) {
//       setOpen(false);
//       toggle.focus();
//     }
//   });
//   header.addEventListener("focusout", (event) => {
//     if (!header.contains(event.relatedTarget)) setOpen(false);
//   });
//   mobile.addEventListener("change", () => setOpen(false));

//   // Keep the toggle label in sync when the language changes.
//   i18n.ready.then(() => {
//     i18n.onLangChange(() => {
//       setOpen(header.classList.contains("menu-open"));
//     });
//   });
// })();
