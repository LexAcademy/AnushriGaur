document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.LEX_CONFIG || {};
  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");
  menu?.addEventListener("click", () => nav.classList.toggle("open"));
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  document.getElementById("year").textContent = new Date().getFullYear();

  const direct = document.getElementById("directFormLink");
  if (direct && cfg.googleFormUrl) { direct.href = cfg.googleFormUrl; direct.hidden = false; }
  else if (direct) direct.hidden = true;

  document.querySelectorAll("[data-program]").forEach(link => link.addEventListener("click", () => {
    const select = document.getElementById("programSelect");
    if (select) {
      const wanted = link.dataset.program;
      const match = [...select.options].find(o => o.text === wanted || o.value === wanted);
      if (match) select.value = match.value;
    }
  }));

  const form = document.getElementById("enquiryForm");
  const status = document.getElementById("formStatus");
  const button = document.getElementById("submitButton");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!cfg.googleScriptUrl || cfg.googleScriptUrl.includes("PASTE_YOUR")) {
      status.textContent = "The enquiry form is not connected yet. Please use the direct enquiry form link or contact the academy.";
      status.style.color = "#9a4b20";
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());
    if (!values.consent) { status.textContent = "Please confirm the privacy notice consent."; return; }
    values.page_url = location.href;
    values.submitted_at = new Date().toISOString();
    button.disabled = true; button.textContent = "Submitting…";
    try {
      // Apps Script web apps can return an opaque CORS response in browsers.
      // The script records the enquiry; no sensitive payment information is collected.
      await fetch(cfg.googleScriptUrl, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(values)
      });
      status.textContent = "Your enquiry has been submitted. If you do not hear back, please contact the academy using the official contact details.";
      status.style.color = "#246b45";
      form.reset();
    } catch (err) {
      status.textContent = "We could not submit the enquiry. Please use the direct enquiry form link or try again later.";
      status.style.color = "#9a4b20";
    } finally {
      button.disabled = false; button.textContent = "Submit Enquiry";
    }
  });
});