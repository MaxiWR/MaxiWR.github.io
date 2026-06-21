/* ============================================================
   EL BANCO SUPLEMENTOS — pp-page.js
   Product page interactions: image lightbox
   ============================================================ */
(function () {
  "use strict";

  const stage      = document.getElementById("ppImageStage");
  const lightbox   = document.getElementById("ppLightbox");
  const lightboxImg = document.getElementById("ppLightboxImg");
  const closeBtn   = document.getElementById("ppLightboxClose");

  if (!stage || !lightbox || !lightboxImg || !closeBtn) return;

  const surface    = stage.querySelector(".pp-image-surface");
  const productImg = stage.querySelector(".pp-product-image");
  if (!productImg) return;

  const trigger = surface || stage;
  let lastFocus = null;

  function openLightbox() {
    lastFocus = document.activeElement;
    lightboxImg.src = productImg.src;
    lightboxImg.alt = productImg.alt;
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  trigger.addEventListener("click", openLightbox);

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  /* Trap focus inside open lightbox */
  lightbox.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !lightbox.classList.contains("is-open")) return;
    const focusable = lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });
})();
