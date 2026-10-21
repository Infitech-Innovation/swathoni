document.addEventListener("DOMContentLoaded", () => {
  const fallback = {
    sending: "Sending your enquiry…",
    success: "Your enquiry has been submitted. We'll be in touch soon.",
    invalid: "Please check your details and try again.",
    error: "We couldn't send your enquiry. Please try again or email swafric.wildfotografie@gmail.com.",
  };
  const message = (key) => {
    const value = window.i18n?.t(`enquiry.${key}`);
    return value && value !== `enquiry.${key}` ? value : fallback[key];
  };

  document.querySelectorAll('form[action="api/send-mail.php"]').forEach((form) => {
    const feedback = form.querySelector('[role="status"]');
    const button = form.querySelector('[type="submit"]');
    let sending = false;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      sending = true;
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      feedback.textContent = message("sending");

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) {
          feedback.textContent = message(result.code === "invalid" ? "invalid" : "error");
          return;
        }
        feedback.textContent = message("success");
        form.reset();
      } catch {
        feedback.textContent = message("error");
      } finally {
        sending = false;
        button.disabled = false;
        form.removeAttribute("aria-busy");
      }
    });
  });
});
