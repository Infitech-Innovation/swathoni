document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".contact-page .reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("visible"));
  const form = document.getElementById("enquiryForm"),
    feedback = document.getElementById("formFeedback");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const val = (k) => String(data.get(k) || "").trim();
    const body = `Name: ${val("name")}\nEmail: ${val("email")}\nExperience: ${val("experience")}\nPreferred month: ${val("travelMonth") || "Flexible"}\nTravellers: ${val("travellers")}\nMessage: ${val("message") || "Not specified"}`;
    const subject = "Swathoni Travels — Journey enquiry";
    const draft = `Subject: ${subject}\n\n${body}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(draft)
        .then(
          () =>
            (feedback.textContent =
              window.i18n && window.i18n.t("contact.form.messages.copied")
                ? window.i18n.t("contact.form.messages.copied")
                : "Enquiry copied. Please paste it into your email to Swathoni Travels."),
        )
        .catch(
          () =>
            (feedback.textContent =
              window.i18n && window.i18n.t("contact.form.messages.copyFailed")
                ? window.i18n.t("contact.form.messages.copyFailed")
                : "Please copy your details and send them to Swathoni Travels once their contact email is confirmed."),
        );
    } else {
      feedback.textContent =
        (window.i18n && window.i18n.t("contact.form.messages.fallback")) ||
        "Your details are ready. Please copy them and email Swathoni Travels once the official address is confirmed.";
      const ta = document.createElement("textarea");
      ta.value = draft;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (_) {}
      ta.remove();
    }
  });
});
