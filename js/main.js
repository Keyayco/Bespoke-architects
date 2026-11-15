"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");

if (menuToggle && primaryNavigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      primaryNavigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && primaryNavigation.classList.contains("is-open")) {
      primaryNavigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.focus();
    }
  });
}

const year = document.querySelector("#copyright-year");
if (year) year.textContent = String(new Date().getFullYear());

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const imageDialog = document.querySelector(".image-dialog");
const dialogImage = imageDialog?.querySelector("img");
if (imageDialog instanceof HTMLDialogElement && dialogImage instanceof HTMLImageElement) {
  document.querySelectorAll("[data-gallery-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const imagePath = button.getAttribute("data-gallery-image");
      if (!imagePath) return;
      dialogImage.src = imagePath;
      dialogImage.alt = button.getAttribute("data-gallery-alt") || "Architectural image";
      imageDialog.showModal();
    });
  });

  imageDialog.querySelector(".image-dialog__close")?.addEventListener("click", () => imageDialog.close());
  imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) imageDialog.close();
  });
  imageDialog.addEventListener("close", () => {
    dialogImage.removeAttribute("src");
    dialogImage.alt = "";
  });
}

const enquiryForm = document.querySelector("#enquiry-form");
if (enquiryForm instanceof HTMLFormElement) {
  const status = document.querySelector("#form-status");
  const fieldMessages = {
    name: document.querySelector("#name-error"),
    contact: document.querySelector("#contact-error"),
    message: document.querySelector("#message-error"),
  };

  const showFieldError = (field, message) => {
    const fieldMessage = fieldMessages[field.name];
    if (fieldMessage) fieldMessage.textContent = message;
    field.setAttribute("aria-invalid", "true");
  };

  const clearFieldError = (field) => {
    const fieldMessage = fieldMessages[field.name];
    if (fieldMessage) fieldMessage.textContent = "";
    field.removeAttribute("aria-invalid");
  };

  enquiryForm.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  enquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = enquiryForm.elements.namedItem("name");
    const contact = enquiryForm.elements.namedItem("contact");
    const projectType = enquiryForm.elements.namedItem("projectType");
    const message = enquiryForm.elements.namedItem("message");
    if (!(name instanceof HTMLInputElement) || !(contact instanceof HTMLInputElement) ||
        !(projectType instanceof HTMLSelectElement) || !(message instanceof HTMLTextAreaElement)) return;

    [name, contact, message].forEach(clearFieldError);
    let firstInvalidField = null;
    const trimmedName = name.value.trim();
    const trimmedContact = contact.value.trim();
    const trimmedMessage = message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[+\d\s().-]+$/;

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      showFieldError(name, "Please enter a name between 2 and 100 characters.");
      firstInvalidField = name;
    }
    if (trimmedContact.length > 120 ||
        !(emailPattern.test(trimmedContact) ||
          (phonePattern.test(trimmedContact) && trimmedContact.replace(/\D/g, "").length >= 5))) {
      showFieldError(contact, "Enter a valid email address or phone number.");
      firstInvalidField ||= contact;
    }
    if (trimmedMessage.length < 10 || trimmedMessage.length > 1000) {
      showFieldError(message, "Please describe your project in 10 to 1,000 characters.");
      firstInvalidField ||= message;
    }
    if (firstInvalidField) {
      if (status) status.textContent = "Please check the highlighted fields and try again.";
      firstInvalidField.focus();
      return;
    }

    const details = [
      "Hello Bespoke Architects, I’d like to ask about a potential architectural project.",
      "",
      `Name: ${trimmedName}`,
      `Contact: ${trimmedContact}`,
      `Project type: ${projectType.value || "Not specified"}`,
      `Project details: ${trimmedMessage}`,
    ].join("\n");
    if (status) status.textContent = "Opening WhatsApp with your message. Please review it and tap send.";
    const whatsappUrl = `https://wa.me/27828553238?text=${encodeURIComponent(details)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
}