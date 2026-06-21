/* ============================================================
   EL BANCO SUPLEMENTOS — script.js
   ============================================================ */

const WA_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ============================================================
// STATE
// ============================================================
let products      = [];
let activeFilter  = "all";
let activeBrand   = "all";
let searchQuery   = "";
let lastOpenedCardEl = null; // for focus return after modal close

// ============================================================
// SCROLL LOCK — prevents page shift when modal opens
// ============================================================
let lockedScrollY    = 0;
let scrollLockActive = false;

function lockPageScroll() {
  if (scrollLockActive) return;
  scrollLockActive = true;
  lockedScrollY    = window.scrollY;

  const scrollbarWidth = Math.max(
    0,
    window.innerWidth - document.documentElement.clientWidth
  );

  document.documentElement.style.setProperty(
    '--scrollbar-compensation',
    `${scrollbarWidth}px`
  );

  document.body.style.position    = 'fixed';
  document.body.style.top         = `-${lockedScrollY}px`;
  document.body.style.left        = '0';
  document.body.style.right       = '0';
  document.body.style.width       = '100%';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
  document.body.classList.add('modal-open');
}

function unlockPageScroll() {
  if (!scrollLockActive) return;
  scrollLockActive = false;

  document.body.classList.remove('modal-open');
  document.body.style.position    = '';
  document.body.style.top         = '';
  document.body.style.left        = '';
  document.body.style.right       = '';
  document.body.style.width       = '';
  document.body.style.paddingRight = '';

  document.documentElement.style.removeProperty('--scrollbar-compensation');

  window.scrollTo(0, lockedScrollY);
}

// ============================================================
// PRODUCT LOADER
// ============================================================
async function loadProducts() {
  const response = await fetch("./products.json");

  if (!response.ok) {
    throw new Error(
      `Unable to load products.json: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new TypeError("products.json must contain an array.");
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
  showToast("No se pudo cargar el catálogo.", "error");
}

// ============================================================
// UTILITIES
// ============================================================
function getBadgeClass(badge) {
  const map = {
    "Más Vendido": "badge--gold",
    "Nuevo":       "badge--blue",
    "Promo":       "badge--red",
    "Disponible":  "badge--green",
    "Combo":       "badge--gold",
    "Agotado":     "badge--red"
  };
  return map[badge] || "";
}

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = {
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("is-dismissing");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3000);
}

// ============================================================
// SKELETON LOADERS
// ============================================================
function showSkeletons() {
  const grids = [
    "grid-creatines", "grid-proteins", "grid-vitamins",
    "grid-protein-bars", "grid-combos", "grid-accessories"
  ];
  const skeletonHTML = Array.from({ length: 3 }).map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--med"></div>
        <div class="skeleton-line skeleton-line--lg"></div>
        <div class="skeleton-line skeleton-line--price"></div>
      </div>
    </div>
  `).join("");

  grids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = skeletonHTML;
  });

  document.querySelectorAll(".product-section").forEach(s => {
    s.style.display = "block";
  });
}

function hideSkeletons() {
  document.querySelectorAll(".skeleton-card").forEach(el => el.remove());
}

// ============================================================
// FILTER
// ============================================================
function getFilteredProducts() {
  const barBrands = ["integra", "crudda", "pont"];

  return products.filter(p => {
    let matchFilter = activeFilter === "all";
    if (!matchFilter) {
      if (activeFilter === "protein-bars") {
        matchFilter = p.category === "protein-bars";
      } else if (activeFilter === "combos") {
        matchFilter = p.category === "combos";
      } else if (barBrands.includes(activeFilter)) {
        matchFilter = p.subcategory === activeFilter;
      } else {
        matchFilter = p.subcategory === activeFilter || p.category === activeFilter;
      }
    }

    const matchBrand  = activeBrand === "all" || p.brand === activeBrand;

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
    <div class="product-card" data-id="${p.id}" data-subcategory="${p.subcategory}" data-category="${p.category}" role="article" aria-label="${p.name}">
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
        <div class="card-overlay" aria-hidden="true">
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
             class="btn btn-whatsapp btn-sm" aria-label="Consultar ${p.name} por WhatsApp">
            ${WA_SVG}
            WhatsApp
          </a>
          <button class="btn btn-outline btn-sm card-btn-details"
                  data-open-modal="${p.id}"
                  aria-label="Ver detalles de ${p.name}">
            Ver Detalles
          </button>
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
  combos:       "combos",
  accessories:  "accessories"
};

function renderProducts(animate = true) {
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

  const doRender = () => {
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
        if (animate) {
          grid.classList.remove("is-fading");
          grid.classList.add("is-visible");
        }
        totalVisible += items.length;
      }
    });

    const noResults = document.getElementById("noResults");
    if (noResults) noResults.style.display = totalVisible === 0 ? "flex" : "none";
  };

  if (animate) {
    // Fade out
    document.querySelectorAll(".product-grid").forEach(g => {
      g.classList.add("is-fading");
      g.classList.remove("is-visible");
    });
    // Render after micro-delay
    requestAnimationFrame(() => requestAnimationFrame(doRender));
  } else {
    doRender();
  }
}

// ============================================================
// SPOTLIGHT CARD EFFECT
// ============================================================
function initSpotlightCards() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  // Clean up any stale handlers from previous renders
  catalog._activeSpotlightCard = null;

  catalog.addEventListener("mouseover", handleCardMouseOver);
  catalog.addEventListener("mouseout",  handleCardMouseOut);
}

function handleCardMouseOver(e) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const card = e.target.closest(".product-card");
  if (!card) return;

  const catalog = e.currentTarget;
  const prev = catalog._activeSpotlightCard;

  if (prev && prev !== card && prev._onCardMove) {
    prev.removeEventListener("mousemove", prev._onCardMove);
    prev.style.transform = "";
    prev._onCardMove = null;
  }

  if (card === prev) return;
  catalog._activeSpotlightCard = card;

  card._onCardMove = (ev) => {
    const rect = card.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 100;
    const y = ((ev.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", x + "%");
    card.style.setProperty("--mouse-y", y + "%");

    if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
      const rx = ((ev.clientY - rect.top) / rect.height - 0.5) * 3.0;
      const ry = ((ev.clientX - rect.left) / rect.width - 0.5) * -3.0;
      card.style.transform = `translateY(-5px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    } else {
      card.style.transform = "translateY(-5px)";
    }
  };

  card.addEventListener("mousemove", card._onCardMove, { passive: true });
}

function handleCardMouseOut(e) {
  const card = e.target.closest(".product-card");
  if (!card || !card._onCardMove) return;

  const related = e.relatedTarget;
  if (related && card.contains(related)) return;

  card.removeEventListener("mousemove", card._onCardMove);
  card._onCardMove = null;
  card.style.transform = "";

  const catalog = e.currentTarget;
  if (catalog._activeSpotlightCard === card) {
    catalog._activeSpotlightCard = null;
  }
}

// ============================================================
// MODAL — FOCUS TRAP
// ============================================================
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.closest("[hidden]") && el.offsetParent !== null);
}

function trapFocus(e, container) {
  const focusable = getFocusableElements(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.key === "Tab") {
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
}

// ============================================================
// MODAL — TAB SYSTEM
// ============================================================
function initModalTabs() {
  const tabsEl = document.querySelector(".modal-tabs");
  if (!tabsEl) return;

  tabsEl.addEventListener("click", e => {
    const tab = e.target.closest(".modal-tab");
    if (!tab) return;
    activateModalTab(tab.dataset.mtab);
  });

  tabsEl.addEventListener("keydown", e => {
    const tabs = Array.from(tabsEl.querySelectorAll(".modal-tab:not([hidden])"));
    const idx  = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === "ArrowRight") { e.preventDefault(); tabs[(idx + 1) % tabs.length].focus(); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); tabs[(idx - 1 + tabs.length) % tabs.length].focus(); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateModalTab(tabs[idx].dataset.mtab); }
  });
}

function activateModalTab(tabKey) {
  document.querySelectorAll(".modal-tab").forEach(t => {
    const active = t.dataset.mtab === tabKey;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });

  document.querySelectorAll(".modal-tab-panel").forEach(p => {
    p.classList.toggle("is-active", p.id === `mtab-${tabKey}`);
  });

  updateTabIndicator();
}

function updateTabIndicator() {
  const indicator = document.getElementById("modalTabIndicator");
  const activeTab = document.querySelector(".modal-tab.is-active");
  const tabsEl    = document.querySelector(".modal-tabs");
  if (!indicator || !activeTab || !tabsEl) return;

  const tabsRect    = tabsEl.getBoundingClientRect();
  const activeRect  = activeTab.getBoundingClientRect();
  const scrollLeft  = tabsEl.scrollLeft;

  indicator.style.left  = (activeRect.left - tabsRect.left + scrollLeft) + "px";
  indicator.style.width = activeRect.width + "px";
}

// ============================================================
// MODAL — OPEN
// ============================================================
function openModal(id, triggerEl) {
  const p = products.find(x => x.id === id);
  if (!p) return;

  // Store opener for focus return
  lastOpenedCardEl = triggerEl || document.querySelector(`[data-open-modal="${id}"]`) || null;

  // Populate info
  document.getElementById("modalName").textContent  = p.name;
  document.getElementById("modalBrand").textContent = p.brand;
  document.getElementById("modalPrice").textContent = p.price;

  // Badge
  const badgeEl = document.getElementById("modalBadge");
  if (p.badge) {
    badgeEl.textContent  = p.badge;
    badgeEl.className    = `modal-badge ${getBadgeClass(p.badge)}`;
    badgeEl.style.display = "inline-block";
  } else {
    badgeEl.style.display = "none";
  }

  // Stock tag
  const stockTag = document.getElementById("modalStockTag");
  if (stockTag) {
    stockTag.textContent  = p.stock ? "Disponible" : "Agotado";
    stockTag.className    = `modal-stock-tag ${p.stock ? "stock--available" : "stock--out"}`;
  }

  // Image
  const modalImg = document.getElementById("modalImg");
  modalImg.src   = p.image;
  modalImg.alt   = p.name;

  // Chars table
  const stockLabel = p.stock ? "Disponible" : "Agotado";
  const stockClass = p.stock ? "stock--available" : "stock--out";
  const c = p.characteristics;
  document.getElementById("modalCharsTable").innerHTML = `
    <tr><th>Presentación</th><td>${c.presentation}</td></tr>
    <tr><th>Sabor</th><td>${c.flavor}</td></tr>
    <tr><th>Porciones</th><td>${c.servings}</td></tr>
    <tr><th>Objetivo</th><td>${c.goal}</td></tr>
    <tr><th>Stock</th><td><span class="${stockClass}">${stockLabel}</span></td></tr>
  `;

  // Tabs content
  document.getElementById("modalDescription").textContent = p.description || "";

  const howToUseEl = document.getElementById("modalHowToUse");
  const tabBtnUse  = document.getElementById("mtab-btn-use");
  if (p.howToUse) {
    howToUseEl.textContent = p.howToUse;
    if (tabBtnUse) tabBtnUse.hidden = false;
  } else {
    howToUseEl.textContent = "";
    if (tabBtnUse) tabBtnUse.hidden = true;
  }

  const goalDescEl = document.getElementById("modalGoalDesc");
  const tabBtnGoal = document.getElementById("mtab-btn-goal");
  if (p.goalDescription) {
    goalDescEl.textContent = p.goalDescription;
    if (tabBtnGoal) tabBtnGoal.hidden = false;
  } else {
    goalDescEl.textContent = "";
    if (tabBtnGoal) tabBtnGoal.hidden = true;
  }

  // Nutrition tab
  const nutrImg    = document.getElementById("modalNutritionImg");
  const tabBtnNutr = document.getElementById("mtab-btn-nutr");
  if (p.nutritionTable) {
    nutrImg.src = p.nutritionTable;
    nutrImg.alt = `Tabla nutricional — ${p.name}`;
    if (tabBtnNutr) tabBtnNutr.hidden = false;
  } else {
    nutrImg.src = "";
    if (tabBtnNutr) tabBtnNutr.hidden = true;
  }

  // Reset to first tab
  activateModalTab("desc");

  // WA link
  document.getElementById("modalWA").href = p.links.whatsapp;

  // Product page link
  const modalProductPage = document.getElementById("modalProductPage");
  if (p.slug && p.slug.trim()) {
    modalProductPage.href = `${p.slug}.html`;
    modalProductPage.setAttribute("aria-label", `Ver página completa de ${p.name}`);
    modalProductPage.style.display = "";
  } else {
    modalProductPage.style.display = "none";
  }

  // Related products
  renderModalRelated(p);

  // Sticky mobile CTA
  updateStickyCTA(p);

  // Open
  const overlay = document.getElementById("modalOverlay");
  const modal   = document.getElementById("modal");
  overlay.classList.add("modal--active");
  lockPageScroll();

  // Stagger animation
  modal.classList.remove("modal--opening");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      modal.classList.add("modal--opening");
    });
  });

  // Focus first focusable element
  setTimeout(() => {
    const focusable = getFocusableElements(modal);
    if (focusable.length) focusable[0].focus();
    updateTabIndicator();
  }, 50);

  // Trap focus
  modal._trapHandler = (e) => trapFocus(e, modal);
  modal.addEventListener("keydown", modal._trapHandler);
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  const modal   = document.getElementById("modal");
  overlay.classList.remove("modal--active");
  modal.classList.remove("modal--opening");

  // Remove focus trap
  if (modal._trapHandler) {
    modal.removeEventListener("keydown", modal._trapHandler);
    modal._trapHandler = null;
  }

  // Return focus to the card that opened the modal
  const triggerEl = lastOpenedCardEl;
  lastOpenedCardEl = null;

  // Hide sticky CTA
  hideStickyMobileCTA();

  // Unlock scroll AFTER the overlay fade-out animation (280ms transition + buffer)
  // We use transitionend as primary signal and setTimeout as fallback
  let unlocked = false;
  const doUnlock = () => {
    if (unlocked) return;
    unlocked = true;
    unlockPageScroll();
    if (triggerEl && typeof triggerEl.focus === "function") {
      triggerEl.focus({ preventScroll: true });
    }
  };

  const onTransitionEnd = (e) => {
    if (e.propertyName !== 'opacity') return;
    overlay.removeEventListener('transitionend', onTransitionEnd);
    doUnlock();
  };
  overlay.addEventListener('transitionend', onTransitionEnd);
  setTimeout(doUnlock, 350); // fallback if transitionend doesn't fire
}

// ============================================================
// MODAL — RELATED PRODUCTS
// ============================================================
function renderModalRelated(p) {
  const container = document.getElementById("modalRelated");
  const listEl    = document.getElementById("modalRelatedList");
  if (!container || !listEl) return;

  const slugs = Array.isArray(p.relatedSlugs) ? p.relatedSlugs : [];
  const related = slugs
    .map(slug => products.find(x => x.slug === slug && x.active !== false))
    .filter(Boolean)
    .slice(0, 4);

  if (related.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  listEl.innerHTML = related.map(r => `
    <div class="modal-related-card" data-open-modal="${r.id}" role="button" tabindex="0"
         aria-label="Ver ${r.name}">
      <div class="modal-related-img">
        <img src="${r.image}" alt="${r.name}" loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="modal-related-info">
        <p class="modal-related-name">${r.name}</p>
        <p class="modal-related-price">${r.price}</p>
      </div>
    </div>
  `).join("");

  listEl.querySelectorAll(".modal-related-card").forEach(card => {
    const handler = (e) => {
      if (e.type === "click" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const relId = parseInt(card.dataset.openModal, 10);
        openModal(relId, card);
      }
    };
    card.addEventListener("click", handler);
    card.addEventListener("keydown", handler);
  });
}

// ============================================================
// FEATURED CAROUSEL
// ============================================================
function initFeaturedCarousel() {
  const featured = products.filter(p => p.featured === true && p.active !== false);
  if (featured.length === 0) return;

  const section   = document.getElementById("featuredSection");
  const carousel  = document.getElementById("featuredCarousel");
  const prevBtn   = document.getElementById("featuredPrev");
  const nextBtn   = document.getElementById("featuredNext");
  if (!section || !carousel) return;

  carousel.innerHTML = featured.map(p => `
    <div class="featured-card" data-open-modal="${p.id}" role="button" tabindex="0"
         aria-label="${p.name} — ${p.price}">
      <div class="featured-card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="featured-card-body">
        <p class="featured-card-brand">${p.brand}</p>
        <p class="featured-card-name">${p.name}</p>
        <p class="featured-card-price">${p.price}</p>
      </div>
    </div>
  `).join("");

  section.style.display = "block";

  // Click/keyboard to open modal
  carousel.querySelectorAll(".featured-card").forEach(card => {
    const handler = (e) => {
      if (e.type === "click" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const id = parseInt(card.dataset.openModal, 10);
        openModal(id, card);
      }
    };
    card.addEventListener("click", handler);
    card.addEventListener("keydown", handler);
  });

  // Nav buttons
  const cardWidth = 240 + 20; // width + gap
  let userInteracted = false;

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: -cardWidth * 2, behavior: "smooth" });
      userInteracted = true;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      carousel.scrollBy({ left: cardWidth * 2, behavior: "smooth" });
      userInteracted = true;
    });
  }

  // Touch scroll stops autoplay
  carousel.addEventListener("touchstart", () => { userInteracted = true; }, { passive: true });

  // Slow autoplay (pauses on user interaction)
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion && featured.length > 2) {
    let autoPlayId = setInterval(() => {
      if (userInteracted) {
        clearInterval(autoPlayId);
        return;
      }
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 4500);

    // Pause on hover
    carousel.addEventListener("mouseenter", () => clearInterval(autoPlayId));
    carousel.addEventListener("mouseleave", () => {
      if (!userInteracted) {
        autoPlayId = setInterval(() => {
          const maxScroll = carousel.scrollWidth - carousel.clientWidth;
          if (carousel.scrollLeft >= maxScroll - 10) {
            carousel.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            carousel.scrollBy({ left: cardWidth, behavior: "smooth" });
          }
        }, 4500);
      }
    });
  }
}

// ============================================================
// HERO PRODUCT CAROUSEL
// ============================================================

// Category → card accent colors (matches design.css multi-color system)
const HERO_CAROUSEL_ACCENTS = {
  creatines:      { hex: '#1677ff', rgb: '22, 119, 255'  },
  proteins:       { hex: '#a855f7', rgb: '168, 85, 247'  },
  vitamins:       { hex: '#22d3ee', rgb: '34, 211, 238'  },
  'protein-bars': { hex: '#f5b942', rgb: '245, 185, 66'  },
  integra:        { hex: '#f5b942', rgb: '245, 185, 66'  },
  crudda:         { hex: '#f5b942', rgb: '245, 185, 66'  },
  pont:           { hex: '#f5b942', rgb: '245, 185, 66'  },
  combos:         { hex: '#ec4899', rgb: '236, 72, 153'  },
  accessories:    { hex: '#22c55e', rgb: '34, 197, 94'   },
};

function getHeroCarouselAccent(p) {
  return (
    HERO_CAROUSEL_ACCENTS[p.subcategory] ||
    HERO_CAROUSEL_ACCENTS[p.category]    ||
    HERO_CAROUSEL_ACCENTS.creatines
  );
}

// Carousel state (module-level so helpers can share it)
let heroCarouselProducts    = [];
let heroCarouselActiveIndex = 0;
let heroCarouselTimer       = null;
let heroCarouselResumeTimer = null;
const heroPrefersReduced    = window.matchMedia('(prefers-reduced-motion: reduce)');

function selectHeroCarouselProducts() {
  // Use explicit heroCarousel flags when present in products.json
  const flagged = products
    .filter(p => p.active !== false && p.heroCarousel === true)
    .sort((a, b) => (a.heroCarouselOrder || 99) - (b.heroCarouselOrder || 99));
  if (flagged.length >= 3) return flagged.slice(0, 5);

  // Fallback: one representative product per category
  const picks = [];
  const wantedSubcats = ['creatines', 'proteins', 'pont', 'vitamins', 'accessories'];
  for (const subcat of wantedSubcats) {
    const found = products.find(
      p => p.active !== false &&
           p.stock !== false &&
           (p.subcategory === subcat || p.category === subcat) &&
           !picks.includes(p)
    );
    if (found) picks.push(found);
    if (picks.length >= 5) break;
  }
  return picks.length >= 3 ? picks : products.filter(p => p.active !== false).slice(0, 5);
}

function getCarouselPosition(index, activeIndex, total) {
  if (index === activeIndex) return 'active';
  if (index === (activeIndex - 1 + total) % total) return 'previous';
  if (index === (activeIndex + 1) % total) return 'next';
  return 'hidden';
}

function buildHeroCarouselCards() {
  const stage  = document.getElementById('heroCarouselStage');
  const dotsEl = document.getElementById('heroCarouselDots');
  if (!stage || !dotsEl) return;

  stage.innerHTML  = '';
  dotsEl.innerHTML = '';

  heroCarouselProducts.forEach((p, i) => {
    const accent  = getHeroCarouselAccent(p);
    const badge   = p.badge
      ? `<span class="hero-product-card__badge">${p.badge}</span>`
      : '';
    const isEager = i < 3;

    const article = document.createElement('article');
    article.className = 'hero-product-card';
    article.dataset.productId     = p.id;
    article.dataset.carouselIndex = i;
    article.style.setProperty('--hero-card-accent',     accent.hex);
    article.style.setProperty('--hero-card-accent-rgb', accent.rgb);
    article.tabIndex = 0;
    article.setAttribute('aria-label', `${p.name} — ${p.price}`);

    article.innerHTML = `
      <div class="hero-product-card__image">
        <img
          src="${p.image}"
          alt="${p.name}"
          loading="${isEager ? 'eager' : 'lazy'}"
          onerror="this.style.display='none'"
        />
        ${badge}
      </div>
      <div class="hero-product-card__content">
        <span class="hero-product-card__brand">${p.brand}</span>
        <h3 class="hero-product-card__name">${p.name}</h3>
        <div class="hero-product-card__bottom">
          <span class="hero-product-card__price">${p.price}</span>
          <span class="hero-product-card__open" aria-hidden="true">Ver producto</span>
        </div>
      </div>
    `;

    // Click: side card → activate; active card → open modal
    article.addEventListener('click', (e) => {
      e.stopPropagation();
      const pos = getCarouselPosition(i, heroCarouselActiveIndex, heroCarouselProducts.length);
      if (pos === 'active') {
        openModal(p.id, article);
      } else {
        heroCarouselActiveIndex = i;
        renderHeroCarouselState();
        pauseHeroCarouselTemporarily();
      }
    });

    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        article.click();
      }
    });

    stage.appendChild(article);

    // Pagination dot
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.dataset.dotIndex = i;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Producto ${i + 1}: ${p.name}`);
    dot.addEventListener('click', () => {
      heroCarouselActiveIndex = i;
      renderHeroCarouselState();
      pauseHeroCarouselTemporarily();
    });
    dotsEl.appendChild(dot);
  });
}

function renderHeroCarouselState() {
  const total = heroCarouselProducts.length;
  const cards = document.querySelectorAll('.hero-product-card');
  const dots  = document.querySelectorAll('.hero-carousel-dot');

  cards.forEach((card, i) => {
    const pos = getCarouselPosition(i, heroCarouselActiveIndex, total);
    card.classList.remove('is-active', 'is-previous', 'is-next', 'is-hidden');
    card.classList.add(`is-${pos}`);
    const visible = pos !== 'hidden';
    card.tabIndex = visible ? 0 : -1;
    card.setAttribute('aria-hidden',  visible ? 'false' : 'true');
    card.setAttribute('aria-current', pos === 'active' ? 'true' : 'false');
  });

  const activeProduct = heroCarouselProducts[heroCarouselActiveIndex];
  const accent = getHeroCarouselAccent(activeProduct);
  const dotsEl = document.getElementById('heroCarouselDots');
  if (dotsEl) dotsEl.style.setProperty('--hero-active-dot-color', accent.hex);

  dots.forEach((dot, i) => {
    const isActive = i === heroCarouselActiveIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    dot.setAttribute('aria-current',  isActive ? 'true' : 'false');
  });
}

function showNextHeroProduct() {
  heroCarouselActiveIndex = (heroCarouselActiveIndex + 1) % heroCarouselProducts.length;
  renderHeroCarouselState();
}

function showPreviousHeroProduct() {
  heroCarouselActiveIndex =
    (heroCarouselActiveIndex - 1 + heroCarouselProducts.length) % heroCarouselProducts.length;
  renderHeroCarouselState();
}

function startHeroCarouselAutoplay() {
  stopHeroCarouselAutoplay();
  if (heroPrefersReduced.matches || heroCarouselProducts.length < 2) return;
  heroCarouselTimer = window.setInterval(showNextHeroProduct, 5500);
}

function stopHeroCarouselAutoplay() {
  if (heroCarouselTimer !== null) {
    window.clearInterval(heroCarouselTimer);
    heroCarouselTimer = null;
  }
}

function pauseHeroCarouselTemporarily() {
  stopHeroCarouselAutoplay();
  if (heroCarouselResumeTimer !== null) {
    window.clearTimeout(heroCarouselResumeTimer);
    heroCarouselResumeTimer = null;
  }
  heroCarouselResumeTimer = window.setTimeout(() => {
    heroCarouselResumeTimer = null;
    startHeroCarouselAutoplay();
  }, 8000);
}

function initHero() {
  heroCarouselProducts = selectHeroCarouselProducts();
  if (heroCarouselProducts.length < 1) return;

  buildHeroCarouselCards();
  renderHeroCarouselState();

  const carousel = document.getElementById('heroProductCarousel');
  const stage    = document.getElementById('heroCarouselStage');
  const prevBtn  = document.getElementById('heroCarouselPrev');
  const nextBtn  = document.getElementById('heroCarouselNext');
  if (!carousel || !stage) return;

  // Arrow controls
  if (prevBtn) prevBtn.addEventListener('click', () => { showPreviousHeroProduct(); pauseHeroCarouselTemporarily(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { showNextHeroProduct();     pauseHeroCarouselTemporarily(); });

  // Keyboard navigation (only when focus is inside the carousel)
  carousel.addEventListener('keydown', (e) => {
    if (!carousel.contains(document.activeElement)) return;
    const tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        showPreviousHeroProduct();
        pauseHeroCarouselTemporarily();
        break;
      case 'ArrowRight':
        e.preventDefault();
        showNextHeroProduct();
        pauseHeroCarouselTemporarily();
        break;
      case 'Home':
        e.preventDefault();
        heroCarouselActiveIndex = 0;
        renderHeroCarouselState();
        pauseHeroCarouselTemporarily();
        break;
      case 'End':
        e.preventDefault();
        heroCarouselActiveIndex = heroCarouselProducts.length - 1;
        renderHeroCarouselState();
        pauseHeroCarouselTemporarily();
        break;
    }
  });

  // Pause autoplay on hover / focus
  carousel.addEventListener('mouseenter', stopHeroCarouselAutoplay);
  carousel.addEventListener('mouseleave', startHeroCarouselAutoplay);
  carousel.addEventListener('focusin',    stopHeroCarouselAutoplay);
  carousel.addEventListener('focusout', (e) => {
    if (!carousel.contains(e.relatedTarget)) startHeroCarouselAutoplay();
  });

  // Touch swipe
  let touchStartX  = 0;
  let touchStartY  = 0;
  let isHorizSwipe = false;

  stage.addEventListener('touchstart', (e) => {
    touchStartX  = e.touches[0].clientX;
    touchStartY  = e.touches[0].clientY;
    isHorizSwipe = false;
    stopHeroCarouselAutoplay();
  }, { passive: true });

  stage.addEventListener('touchmove', (e) => {
    if (!isHorizSwipe) {
      const dx = Math.abs(e.touches[0].clientX - touchStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      isHorizSwipe = dx > dy && dx > 5;
    }
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    if (isHorizSwipe) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 44) {
        if (dx < 0) showNextHeroProduct();
        else         showPreviousHeroProduct();
      }
    }
    pauseHeroCarouselTemporarily();
  }, { passive: true });

  // Pause when browser tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroCarouselAutoplay();
    else                  startHeroCarouselAutoplay();
  });

  // Pause when carousel scrolls off screen
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) startHeroCarouselAutoplay();
      else                       stopHeroCarouselAutoplay();
    }
  }, { threshold: 0.15 });
  io.observe(carousel);

  // Start autoplay
  startHeroCarouselAutoplay();
}

// ============================================================
// STICKY MOBILE CTA
// ============================================================
function updateStickyCTA(product) {
  if (!window.matchMedia("(max-width: 768px)").matches) return;

  const cta       = document.getElementById("stickyCTA");
  const priceEl   = document.getElementById("stickyCTAPrice");
  const btnEl     = document.getElementById("stickyCTABtn");
  if (!cta || !priceEl || !btnEl) return;

  priceEl.textContent = product.price || "CONSULTAR PRECIO";
  btnEl.href          = product.links.whatsapp;
  btnEl.setAttribute("aria-label", `Consultar ${product.name} por WhatsApp`);

  cta.setAttribute("aria-hidden", "false");
  cta.classList.add("is-visible");
}

function hideStickyMobileCTA() {
  const cta = document.getElementById("stickyCTA");
  if (!cta) return;
  cta.classList.remove("is-visible");
  cta.setAttribute("aria-hidden", "true");
}

// ============================================================
// FLOATING WA — EXPAND ON SCROLL
// ============================================================
function initFloatingWA() {
  const wa = document.getElementById("floatingWA");
  if (!wa) return;

  let expanded = false;
  let timeout  = null;

  function expand() {
    if (expanded) return;
    expanded = true;
    wa.classList.add("floating-wa--expanded");
    timeout = setTimeout(() => {
      wa.classList.remove("floating-wa--expanded");
      expanded = false;
    }, 4000);
  }

  // Expand once after scrolling past hero
  const hero = document.getElementById("hero");
  if (!hero) return;

  const heroObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting && !expanded) {
      expand();
      heroObserver.disconnect();
    }
  }, { threshold: 0 });

  heroObserver.observe(hero);

  // WA click feedback
  wa.addEventListener("click", () => {
    const origText = wa.querySelector(".floating-wa-text");
    if (origText) {
      const orig = origText.textContent;
      origText.textContent = "Abriendo WhatsApp…";
      setTimeout(() => { origText.textContent = orig; }, 2500);
    }
  });
}

// ============================================================
// MODAL IMAGE LIGHTBOX
// ============================================================
function initModalImageLightbox() {
  const modalImg  = document.getElementById("modalImg");
  const nutrImg   = document.getElementById("modalNutritionImg");

  function openLightbox(src, alt) {
    const lightbox = document.createElement("div");
    lightbox.className = "modal-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-label", alt || "Imagen ampliada");
    lightbox.innerHTML = `<img src="${src}" alt="${alt || ''}" />`;
    lightbox.addEventListener("click", () => lightbox.remove());
    lightbox.addEventListener("keydown", e => {
      if (e.key === "Escape" || e.key === "Enter") lightbox.remove();
    });
    document.body.appendChild(lightbox);
    lightbox.tabIndex = -1;
    lightbox.focus();
  }

  if (modalImg) {
    modalImg.addEventListener("click", () => {
      if (modalImg.src) openLightbox(modalImg.src, modalImg.alt);
    });
  }

  if (nutrImg) {
    nutrImg.addEventListener("click", () => {
      if (nutrImg.src) openLightbox(nutrImg.src, nutrImg.alt);
    });
  }
}

// ============================================================
// INIT — BRAND FILTER (dynamic from loaded products)
// ============================================================
function initBrandFilter() {
  const select = document.getElementById("brandSelect");
  if (!select) return;
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  brands.forEach(brand => {
    const opt = document.createElement("option");
    opt.value = brand;
    opt.textContent = brand;
    select.appendChild(opt);
  });
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
    const overlay = document.getElementById("modalOverlay");
    if (e.key === "Escape" && overlay.classList.contains("modal--active")) closeModal();
  });

  // WA click feedback
  document.getElementById("modalWA").addEventListener("click", function() {
    const orig = this.innerHTML;
    this.innerHTML = `${WA_SVG} Abriendo WhatsApp…`;
    this.style.opacity = "0.85";
    setTimeout(() => {
      this.innerHTML = `${WA_SVG} Consultar por este producto`;
      this.style.opacity = "";
    }, 2500);
  });

  // Delegate card "Ver Detalles" clicks
  document.getElementById("catalog").addEventListener("click", e => {
    const btn = e.target.closest("[data-open-modal]");
    if (!btn) return;
    const id = parseInt(btn.dataset.openModal, 10);
    if (isNaN(id)) return;
    openModal(id, btn);
  });

  initModalTabs();
  initModalImageLightbox();
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
    const expanded = hamburger.classList.contains("is-active");
    hamburger.setAttribute("aria-expanded", expanded ? "true" : "false");
    mobileMenu.setAttribute("aria-hidden", expanded ? "false" : "true");
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("is-active");
      mobileMenu.classList.remove("mobile-menu--open");
      document.body.classList.remove("menu-open");
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });

  mobileMenu.querySelectorAll(".mobile-parent-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sub    = btn.nextElementSibling;
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

      const pillTarget = ["integra","crudda","pont"].includes(filter)
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

  document.querySelectorAll(
    ".product-section, .contact-section, .filters-bar, .testimonials-section"
  ).forEach(el => observer.observe(el));
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
  // Show skeletons immediately
  showSkeletons();

  try {
    await loadProducts();

    hideSkeletons();
    renderProducts(false); // first render without fade
    initBrandFilter();
    initFilters();
    initModal();
    initMobileMenu();
    initSmoothScroll();
    initObserver();
    initNavFilters();
    initHeaderScroll();
    initThemeToggle();
    initFeaturedCarousel();
    initHero();
    initFloatingWA();

    // Spotlight on initial cards
    initSpotlightCards();

  } catch (error) {
    console.error("The product catalog could not be initialized:", error);
    hideSkeletons();
    showCatalogError();
  }
});
