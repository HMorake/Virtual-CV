"use strict";

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleLabel = document.querySelector(".theme-toggle-label");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
const sections = [...document.querySelectorAll("main section[id]")];
const scrollTopButton = document.querySelector(".scroll-top");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectCards = [...document.querySelectorAll(".project-card")];
const contactForm = document.querySelector("#contact-form");
const copyEmailButton = document.querySelector(".copy-email");
const copyMessage = document.querySelector(".copy-message");

// Theme preference: saved choice first, then system preference.
function getStoredTheme() {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    // The site still works when browser storage is unavailable.
  }
}

const storedTheme = getStoredTheme();
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
root.dataset.theme = storedTheme || (prefersDark ? "dark" : "light");

function updateThemeLabel() {
  const isDark = root.dataset.theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
  themeToggle.title = `Switch to ${nextTheme} theme`;
  themeToggleLabel.textContent = isDark ? "Light mode" : "Dark mode";
}

updateThemeLabel();

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  saveTheme(root.dataset.theme);
  updateThemeLabel();
});

function closeMenu() {
  navMenu.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open navigation menu");
  document.body.classList.remove("nav-open");
}

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  document.body.classList.toggle("nav-open", isOpen);
});

navLinks.forEach((link) => link.addEventListener("click", closeMenu));

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

// Reveal elements as they enter the viewport.
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Animate selected statistics once.
const counters = [...document.querySelectorAll("[data-count]")];
const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      let current = 0;
      const increment = Math.max(1, Math.ceil(target / 25));
      const timer = window.setInterval(() => {
        current = Math.min(current + increment, target);
        element.textContent = String(current);
        if (current >= target) window.clearInterval(timer);
      }, 45);
      observer.unobserve(element);
    });
  },
  { threshold: 0.75 }
);

counters.forEach((counter) => counterObserver.observe(counter));

// Project category filtering.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;

    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const show = filter === "all" || categories.includes(filter);
      card.classList.toggle("hidden", !show);
    });
  });
});

// Active navigation state and scroll-to-top visibility.
function handleScroll() {
  const scrollPosition = window.scrollY + 160;
  let currentSection = "home";

  sections.forEach((section) => {
    if (scrollPosition >= section.offsetTop) currentSection = section.id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
  });

  scrollTopButton.classList.toggle("visible", window.scrollY > 650);
}

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

scrollTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Contact form uses a mailto link, so no visitor information is stored.
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
  window.location.href = `mailto:h.morake7@gmail.com?subject=${subject}&body=${body}`;
});

copyEmailButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyEmailButton.dataset.email);
    copyMessage.textContent = "Email address copied.";
  } catch (error) {
    copyMessage.textContent = "Copying was blocked. Select the email address above instead.";
  }

  window.setTimeout(() => {
    copyMessage.textContent = "";
  }, 3000);
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
