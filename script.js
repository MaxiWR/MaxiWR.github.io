/* ============================================================
   EL BANCO SUPLEMENTOS — script.js
   ============================================================ */

let products = [];

// ============================================================
// STATE
// ============================================================
let activeFilter = "all";
let activeBrand  = "all";
let searchQuery  = "";

// ============================================================
// PRODUCT LOADER
// ============================================================
async function loadProducts() {
  let data;

  if (Array.isArray(window.__PRODUCTS__)) {
    data = window.__PRODUCTS__;
  } else {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error(
        `Unable to load products.json: ${response.status} ${response.statusText}`
      );
    }

    data = await response.json();

    if (!Array.isArray(data)) {
      throw new TypeError("products.json must contain an array.");
    }
  }

  products = data.filter(product => product.active !== false);
}

function showCatalogError() {
  const catalog = document.getElementById("catalog");
  if (catalog) {
    catalog.innerHTML = `
      <div class="no-results" style="display:flex">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>No se pudo cargar el catálogo.</p>
        <span>Intentá nuevamente más tarde.</span>
      </div>
    `;
  }
}

// ============================================================
// UTILITIES
// ============================================================
function getInitials(name) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function getBadgeClass(badge) {
  const map = {
    "Más Vendido": "badge--gold",
    "Nuevo":       "badge--blue",
    "Promo":       "badge--red",
    "Disponible":  "badge--green",
    "Combo":       "badge--gold"
  };
  return map[badge] || "";
}

// ============================================================
// FILTER
// ============================================================
function getFilteredProducts() {
  const barBrands = ["integra", "crudda", "pont", "wik"];

  return products.filter(p => {
    let matchFilter = activeFilter === "all";
    if (!matchFilter) {
      if (activeFilter === "protein-bars") {
        matchFilter = p.category === "protein-bars" || p.category === "combos";
      } else if (activeFilter === "combos") {
        matchFilter = p.category === "combos";
      } else if (barBrands.includes(activeFilter)) {
        matchFilter = p.subcategory === activeFilter;
      } else {
        matchFilter = p.subcategory === activeFilter || p.category === activeFilter;
      }
    }

    const matchBrand = activeBrand === "all" || p.brand === activeBrand;

    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);

    return matchFilter && matchBrand && matchSearch;
  });
}

// ============================================================
// CARD TEMPLATE
// ============================================================
function createCard(p) {
  const badge = p.badge
    ? `<span class="card-badge ${getBadgeClass(p.badge)}">${p.badge}</span>`
    : "";
  const stockLabel = p.stock ? "Disponible" : "Agotado";
  const stockClass = p.stock ? "stock--available" : "stock--out";

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="card-image-wrap">
        <div class="card-image">
          <img
            src="${p.image}"
            alt="${p.name}"
            loading="lazy"
            onerror="this.style.display='none'"
          />
        </div>
        ${badge}
        <div class="card-overlay">
          <h4 class="overlay-title">Info Rápida</h4>
          <table class="overlay-table">
            <tr><td>Marca</td><td>${p.brand}</td></tr>
            <tr><td>Presentación</td><td>${p.characteristics.presentation}</td></tr>
            <tr><td>Sabor</td><td>${p.characteristics.flavor}</td></tr>
            <tr><td>Porciones</td><td>${p.characteristics.servings}</td></tr>
            <tr><td>Objetivo</td><td>${p.characteristics.goal}</td></tr>
            <tr><td>Stock</td><td><span class="${stockClass}">${stockLabel}</span></td></tr>
          </table>
        </div>
      </div>
      <div class="card-body">
        <p class="card-brand">${p.brand}</p>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-price">${p.price}</p>
        <div class="card-actions">
          <a href="${p.links.whatsapp}" target="_blank" rel="noopener noreferrer"
             class="btn btn-whatsapp btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </a>
          <a href="${p.slug}.html" class="btn btn-outline btn-sm"
             onclick="event.preventDefault(); openModal(${p.id})">
            Ver Detalles
          </a>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// RENDER
// ============================================================
const sectionMap = {
  creatines:    "creatines",
  proteins:     "proteins",
  vitamins:     "vitamins",
  integra:      "protein-bars",
  crudda:       "protein-bars",
  pont:         "protein-bars",
  wik:          "protein-bars",
  combos:       "combos",
  accessories:  "accessories"
};

function renderProducts() {
  const filtered = getFilteredProducts();

  const grouped = {
    "creatines":    [],
    "proteins":     [],
    "vitamins":     [],
    "protein-bars": [],
    "combos":       [],
    "accessories":  []
  };

  filtered.forEach(p => {
    const section = sectionMap[p.subcategory];
    if (section) grouped[section].push(p);
  });

  let totalVisible = 0;

  Object.keys(grouped).forEach(sectionId => {
    const grid    = document.getElementById(`grid-${sectionId}`);
    const section = document.getElementById(sectionId);
    const items   = grouped[sectionId];
    if (!grid || !section) return;

    if (items.length === 0) {
      section.style.display = "none";
    } else {
      section.style.display = "block";
      grid.innerHTML = items.map(createCard).join("");
      totalVisible += items.length;
    }
  });

  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = totalVisible === 0 ? "flex" : "none";
}

// ============================================================
// MODAL
// ============================================================
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  document.getElementById("modalName").textContent        = p.name;
  document.getElementById("modalBrand").textContent       = p.brand;
  document.getElementById("modalPrice").textContent       = p.price;
  document.getElementById("modalDescription").textContent = p.description;

  const badgeEl = document.getElementById("modalBadge");
  if (p.badge) {
    badgeEl.textContent  = p.badge;
    badgeEl.className    = `modal-badge ${getBadgeClass(p.badge)}`;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }

  const modalImg = document.getElementById("modalImg");
  modalImg.src   = p.image;
  modalImg.alt   = p.name;
  modalImg.style.display = "block";

  const stockLabel = p.stock ? "Disponible" : "Agotado";
  const stockClass = p.stock ? "stock--available" : "stock--out";
  const c = p.characteristics;
  document.getElementById("modalCharsTable").innerHTML = `
    <tr><th>Marca</th><td>${p.brand}</td></tr>
    <tr><th>Presentación</th><td>${c.presentation}</td></tr>
    <tr><th>Sabor</th><td>${c.flavor}</td></tr>
    <tr><th>Porciones</th><td>${c.servings}</td></tr>
    <tr><th>Objetivo</th><td>${c.goal}</td></tr>
    <tr><th>Stock</th><td><span class="${stockClass}">${stockLabel}</span></td></tr>
  `;

  document.getElementById("modalWA").href = p.links.whatsapp;

  const modalProductPage = document.getElementById("modalProductPage");
  if (typeof p.slug === "string" && p.slug.trim() !== "") {
    modalProductPage.href = `${p.slug}.html`;
    modalProductPage.setAttribute(
      "aria-label",
      `Ver página completa de ${p.name}`
    );
    modalProductPage.style.display = "";
  } else {
    modalProductPage.removeAttribute("href");
    modalProductPage.style.display = "none";
  }

  const nutritionImg    = document.getElementById("nutritionImg");
  const nutritionToggle = document.getElementById("nutritionToggle");
  if (p.nutritionTable) {
    nutritionImg.src            = p.nutritionTable;
    nutritionImg.alt            = `${p.name} — Tabla Nutricional`;
    nutritionToggle.style.display = "";
  } else {
    nutritionImg.src            = "";
    nutritionToggle.style.display = "none";
  }
  document.getElementById("nutritionWrap").style.display = "none";
  nutritionToggle.textContent = "Información Nutricional";

  document.getElementById("modalOverlay").classList.add("modal--active");
  document.body.classList.add("modal-open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("modal--active");
  document.body.classList.remove("modal-open");
}

// ============================================================
// INIT — FILTERS
// ============================================================
function initFilters() {
  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeFilter = pill.dataset.filter;
      renderProducts();
      scrollToCatalog();
    });
  });

  document.getElementById("brandSelect").addEventListener("change", e => {
    activeBrand = e.target.value;
    renderProducts();
  });

  document.getElementById("searchInput").addEventListener("input", e => {
    searchQuery = e.target.value.trim();
    renderProducts();
  });
}

// ============================================================
// INIT — MODAL EVENTS
// ============================================================
function initModal() {
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", e => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("nutritionToggle").addEventListener("click", () => {
    const wrap   = document.getElementById("nutritionWrap");
    const toggle = document.getElementById("nutritionToggle");
    const hidden = wrap.style.display === "none";
    wrap.style.display   = hidden ? "block" : "none";
    toggle.textContent   = hidden ? "Ocultar Info Nutricional" : "Información Nutricional";
  });

  document.getElementById("modalImg").addEventListener("error", function () {
    this.style.display = "none";
  });
}

// ============================================================
// INIT — MOBILE MENU
// ============================================================
function initMobileMenu() {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("is-active");
    mobileMenu.classList.toggle("mobile-menu--open");
    document.body.classList.toggle("menu-open");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("is-active");
      mobileMenu.classList.remove("mobile-menu--open");
      document.body.classList.remove("menu-open");
    });
  });

  mobileMenu.querySelectorAll(".mobile-parent-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sub = btn.nextElementSibling;
      const isOpen = sub.classList.contains("submenu--open");
      mobileMenu.querySelectorAll(".mobile-submenu").forEach(s => s.classList.remove("submenu--open"));
      mobileMenu.querySelectorAll(".mobile-parent-btn").forEach(b => b.classList.remove("parent--open"));
      if (!isOpen) {
        sub.classList.add("submenu--open");
        btn.classList.add("parent--open");
      }
    });
  });
}

// ============================================================
// INIT — NAV DROPDOWN FILTERS
// ============================================================
function initNavFilters() {
  document.querySelectorAll("[data-filter]").forEach(link => {
    link.addEventListener("click", e => {
      const filter = link.dataset.filter;
      if (!filter) return;

      activeFilter = filter;

      const pillTarget = ["integra","crudda","pont","wik"].includes(filter)
        ? "protein-bars"
        : filter === "combos"
          ? "combos"
          : filter;

      document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      const pill = document.querySelector(`.pill[data-filter="${pillTarget}"]`);
      if (pill) pill.classList.add("active");

      renderProducts();
    });
  });
}

// ============================================================
// INIT — SMOOTH SCROLL
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (href === "#" || href === "#!") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ============================================================
// INIT — INTERSECTION OBSERVER
// ============================================================
function initObserver() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.08 });

  document.querySelectorAll(".product-section, .contact-section, .filters-bar").forEach(el => {
    observer.observe(el);
  });
}

// ============================================================
// INIT — HEADER SCROLL
// ============================================================
function initHeaderScroll() {
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("header--scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ============================================================
// HELPER — SCROLL TO CATALOG
// ============================================================
function scrollToCatalog() {
  const catalog = document.getElementById("catalog");
  if (catalog) catalog.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ============================================================
// INIT — THEME TOGGLE
// ============================================================
function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
  }
  btn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadProducts();

    renderProducts();
    initFilters();
    initModal();
    initMobileMenu();
    initSmoothScroll();
    initObserver();
    initNavFilters();
    initHeaderScroll();
    initThemeToggle();
  } catch (error) {
    console.error("The product catalog could not be initialized:", error);
    showCatalogError();
  }
});
