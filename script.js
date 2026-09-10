"use strict";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
const navAnchors = [...document.querySelectorAll(".nav-links a")];

function closeMenu() {
  if (!menuButton || !navLinks) return;
  menuButton.classList.remove("is-open");
  navLinks.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navAnchors.forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });
}

// Image files are intentionally optional. The initial badges remain visible until
// a matching photo is placed in assets/images/.
document.querySelectorAll(".image-frame img").forEach((image) => {
  const markMissing = () => image.classList.add("is-missing");
  image.addEventListener("error", markMissing, { once: true });
  if (image.complete && image.naturalWidth === 0) markMissing();
});

// Remove any legacy leader placeholder if an older live preview retained it.
const leaderCards = [...document.querySelectorAll(".leader-card")];
if (leaderCards.length > 1) {
  leaderCards
    .filter((card) => card.querySelector(".leader-info h3")?.textContent.trim() === "Leader Name")
    .forEach((card) => card.remove());
} else {
  leaderCards.forEach((card) => {
    card.querySelectorAll(".leader-info").forEach((info) => {
      if (info.querySelector("h3")?.textContent.trim() !== "Leader Name") return;
      const previousImage = info.previousElementSibling;
      if (previousImage?.classList.contains("leader-image")) previousImage.remove();
      info.remove();
    });
  });
}

// Keep the six-card team grid clean if a live preview retained old placeholders.
// A named coordinator always replaces its matching generic Coordinator 01–03 card.
const namedCoordinators = [
  ["Coordinator 01", "Nidhi"],
  ["Coordinator 02", "Shakshi"],
  ["Coordinator 03", "Mohini"],
];

namedCoordinators.forEach(([placeholderName, memberName]) => {
  const memberCards = [...document.querySelectorAll(".member-card")];
  const namedCard = memberCards.find(
    (card) => card.querySelector("h3")?.textContent.trim() === memberName,
  );
  const placeholderCard = memberCards.find(
    (card) => card.querySelector("h3")?.textContent.trim() === placeholderName,
  );
  if (namedCard && placeholderCard && namedCard !== placeholderCard) {
    placeholderCard.remove();
  }
});

const revealItems = document.querySelectorAll(".reveal");
if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -28px" });
  revealItems.forEach((element) => revealObserver.observe(element));
}

// Keep the navigation state tied to the section currently in view.
const sections = [...document.querySelectorAll("main section[id]")];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = `#${visible.target.id}`;
    navAnchors.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === id));
  }, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.3, 0.6] });
  sections.forEach((section) => sectionObserver.observe(section));
}

// The centerpiece shifts gently with a desktop pointer. CSS carries all constant animation.
const signalStage = document.querySelector("#signal-stage");
const canUsePointerDepth = window.matchMedia("(hover: hover) and (pointer: fine)");

function enableStageDepth() {
  if (!signalStage || !canUsePointerDepth.matches || prefersReducedMotion.matches) return;

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const updateStage = () => {
    signalStage.style.setProperty("--rx", `${pointerY * -3.5}deg`);
    signalStage.style.setProperty("--ry", `${pointerX * 4.5}deg`);
    signalStage.style.setProperty("--px", `${pointerX}px`);
    signalStage.style.setProperty("--py", `${pointerY}px`);
    frame = 0;
  };

  signalStage.addEventListener("pointermove", (event) => {
    const bounds = signalStage.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (!frame) frame = window.requestAnimationFrame(updateStage);
  });

  signalStage.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    if (!frame) frame = window.requestAnimationFrame(updateStage);
  });
}

enableStageDepth();