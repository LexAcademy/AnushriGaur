document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.LEX_CONFIG || {};
  const menu = document.getElementById("menu");
  const nav = document.getElementById("nav");

  menu?.addEventListener("click", () => nav.classList.toggle("open"));
  nav?.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );

  document.getElementById("year").textContent = new Date().getFullYear();

  const direct = document.getElementById("directFormLink");
  if (direct) direct.hidden = true;

  document.querySelectorAll("[data-program]").forEach(link =>
    link.addEventListener("click", () => {
      const select = document.getElementById("programSelect");
      if (select) {
        const wanted = link.dataset.program;
        const match = [...select.options].find(
          o => o.text === wanted || o.value === wanted
        );
        if (match) select.value = match.value;
      }
    })
  );

  // WHATSAPP ENQUIRY FORM
  const form = document.getElementById("enquiryForm");
  const status = document.getElementById("formStatus");
  const button = document.getElementById("submitButton");

  const whatsappNumber = "919950823636";

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form).entries());

    if (!values.consent) {
      status.textContent = "Please confirm the privacy notice consent.";
      status.style.color = "#9a4b20";
      return;
    }

    let message = "Hello Adv. Anushri Gaur,\n\n";
    message += "I would like to enquire about Lex Academy programmes.\n\n";
    message += "STUDENT ENQUIRY DETAILS\n";
    message += "----------------------------\n";

    for (const [key, value] of Object.entries(values)) {
      if (key === "consent" || !value) continue;

      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/^./, c => c.toUpperCase());

      message += label + ": " + value + "\n";
    }

    message += "\nKindly share the programme details and further information.";

    const whatsappURL =
      "https://wa.me/" +
      whatsappNumber +
      "?text=" +
      encodeURIComponent(message);

    status.textContent = "Opening WhatsApp. Please press Send to submit your enquiry.";
    status.style.color = "#246b45";

    window.open(whatsappURL, "_blank");
  });
});
