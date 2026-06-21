/**
 * generate-product-pages.mjs
 *
 * Reads products.json and site-config.json from the repository root, then:
 *   - Deletes previously generated root-level product pages (marked GENERATED_PRODUCT_PAGE)
 *   - Removes the legacy productos/ directory if it exists
 *   - Generates <slug>.html directly in the repository root for every active product
 *   - Regenerates sitemap.xml
 *
 * Usage:
 *   node scripts/generate-product-pages.mjs
 *
 * To add or update a product: edit products.json, run this script, commit.
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
  existsSync,
  rmSync
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

// ── Load data ─────────────────────────────────────────────────
const allProducts = JSON.parse(readFileSync(join(root, 'products.json'), 'utf8'));
const config      = JSON.parse(readFileSync(join(root, 'site-config.json'), 'utf8'));

if (!config.siteUrl) {
  console.error('ERROR: siteUrl is missing from site-config.json.');
  process.exit(1);
}

if (config.siteUrl === '[FINAL_SITE_URL]') {
  console.warn('\nWARNING: siteUrl in site-config.json is still "[FINAL_SITE_URL]". Update it before publishing.\n');
}

// ── Active products only ──────────────────────────────────────
const products = allProducts.filter(p => p.active !== false);

// ── Slug validation ───────────────────────────────────────────
const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const RESERVED_SLUGS = new Set([
  'index', 'script', 'styles', 'products', 'sitemap',
  'robots', '404', 'site-config'
]);

const seenSlugs = new Set();
const seenIds   = new Set();
const errors    = [];

for (const p of products) {
  if (p.id == null) {
    errors.push(`Product "${p.name || '(no name)'}" is missing an id.`);
  } else if (seenIds.has(p.id)) {
    errors.push(`Duplicate id=${p.id} — each product must have a unique id.`);
  } else {
    seenIds.add(p.id);
  }
  if (!p.slug) {
    errors.push(`Product id=${p.id} "${p.name || '(no name)'}" is missing a slug.`);
    continue;
  }
  if (!VALID_SLUG.test(p.slug)) {
    errors.push(
      `Invalid slug "${p.slug}" for product id=${p.id}. ` +
      'Use only lowercase ASCII letters, numbers, and hyphens (no leading/trailing hyphens).'
    );
  }
  if (RESERVED_SLUGS.has(p.slug)) {
    errors.push(`Slug "${p.slug}" is reserved and cannot be used (product id=${p.id}).`);
  }
  if (seenSlugs.has(p.slug)) {
    errors.push(`Duplicate slug "${p.slug}" — each active product must have a unique slug.`);
  }
  if (!p.name) {
    errors.push(`Product slug="${p.slug}" id=${p.id} is missing a name.`);
  }
  seenSlugs.add(p.slug);
}

if (errors.length) {
  console.error('\nValidation errors in products.json:\n' + errors.map(e => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// ── URL helper ────────────────────────────────────────────────
function joinUrl(base, pathname) {
  return `${base.replace(/\/+$/, '')}/${pathname.replace(/^\/+/, '')}`;
}

// ── Cleanup: old generated root pages ─────────────────────────
const GENERATED_MARKER = '<!-- GENERATED_PRODUCT_PAGE -->';

const rootEntries = readdirSync(root, { withFileTypes: true });
for (const entry of rootEntries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  if (entry.name === 'index.html') continue;
  const filePath = join(root, entry.name);
  try {
    const content = readFileSync(filePath, 'utf8');
    if (content.includes(GENERATED_MARKER)) {
      unlinkSync(filePath);
      console.log(`  Removed old generated page: ${entry.name}`);
    }
  } catch {
    // skip files that cannot be read
  }
}

// ── Cleanup: legacy productos/ directory ──────────────────────
const productosDir = join(root, 'productos');
if (existsSync(productosDir)) {
  rmSync(productosDir, { recursive: true, force: true });
  console.log('  Removed legacy directory: productos/');
}

// ── HTML helpers ──────────────────────────────────────────────
const WA_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

const BADGE_CLASS = {
  'Más Vendido': 'badge--gold',
  'Nuevo':       'badge--blue',
  'Promo':       'badge--red',
  'Disponible':  'badge--green',
  'Combo':       'badge--gold'
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildJsonLd(p, canonicalUrl, imageAbsUrl) {
  if (p.skipProductSnippet || p.priceNumeric === null || p.priceNumeric === undefined) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: p.name,
    image: [imageAbsUrl],
    description: p.description,
    brand: { '@type': 'Brand', name: p.brand },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: config.currency || 'ARS',
      price: String(p.priceNumeric),
      availability: p.stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };
}

function getProductTheme(p) {
  if (p.category === 'combos') return 'combos';
  switch (p.subcategory) {
    case 'creatines':                          return 'creatines';
    case 'proteins':                           return 'proteins';
    case 'vitamins':                           return 'vitamins';
    case 'integra': case 'crudda':
    case 'pont':    case 'wik':               return 'protein-bars';
    case 'accessories':                        return 'accessories';
    default:                                   return 'default';
  }
}

function buildImageStageHtml(p) {
  const scale    = p.pageImageScale    ?? 1;
  const position = p.pageImagePosition ?? 'center';

  const vars = [
    scale    !== 1        ? `--product-image-scale: ${scale}`       : '',
    position !== 'center' ? `--product-image-position: ${position}` : ''
  ].filter(Boolean).join('; ');

  const styleAttr = vars ? ` style="${vars}"` : '';

  const imgEl = `<img
          class="pp-product-image"
          src="${p.image}"
          alt="${escapeHtml(p.name)}"
          width="800"
          height="800"
          loading="eager"
          fetchpriority="high"
          onerror="this.style.opacity='0.4'"
        >`;

  return `<div class="pp-image-col">
      <div class="pp-image-stage" id="ppImageStage">
        <button
          class="pp-image-surface"
          type="button"
          aria-label="Ampliar imagen de ${escapeHtml(p.name)}"${styleAttr}
        >
          ${imgEl}
        </button>
      </div>
    </div>`;
}

function buildPage(p) {
  const canonicalUrl = joinUrl(config.siteUrl, `${p.slug}.html`);
  const imageAbsUrl  = joinUrl(config.siteUrl, p.image);
  const theme        = getProductTheme(p);
  const badgeClass   = BADGE_CLASS[p.badge] || '';
  const stockLabel   = p.stock ? 'Disponible' : 'Agotado';
  const stockClass   = p.stock ? 'stock--available' : 'stock--out';
  const jsonLd       = buildJsonLd(p, canonicalUrl, imageAbsUrl);

  const badgeHtml = p.badge
    ? `<span class="card-badge ${badgeClass}">${escapeHtml(p.badge)}</span>\n        `
    : '';

  const jsonLdBlock = jsonLd
    ? `\n  <script type="application/ld+json">\n  ${JSON.stringify(jsonLd, null, 2)}\n  </script>`
    : '';

  const descShort = p.description.length > 155
    ? p.description.slice(0, 152) + '...'
    : p.description;

  const nutritionHtml = p.nutritionTable
    ? `<figure class="pp-nutrition-figure">
        <img src="${p.nutritionTable}" alt="Tabla nutricional — ${escapeHtml(p.name)}" loading="lazy" onerror="this.closest('figure').style.display='none'">
      </figure>`
    : `<div class="pp-nutrition-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
        <p>Tabla nutricional disponible próximamente</p>
      </div>`;

  const howToUseHtml = p.howToUse
    ? `<div class="pp-info-card">
        <h3>¿Cómo tomarlo?</h3>
        <p>${escapeHtml(p.howToUse)}</p>
      </div>`
    : '';

  const goalDescHtml = p.goalDescription
    ? `<div class="pp-info-card">
        <h3>¿Para qué objetivo?</h3>
        <p>${escapeHtml(p.goalDescription)}</p>
      </div>`
    : '';

  const subcatAnchor = p.subcategory === 'accessories' ? 'accessories'
    : p.category === 'combos' ? 'combos'
    : p.subcategory;

  return `<!DOCTYPE html>
<!-- GENERATED_PRODUCT_PAGE -->
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.name)} | BANCO DE SUPLEMENTOS</title>
  <link rel="icon" type="image/png" href="icono.png">
  <meta name="description" content="${escapeHtml(descShort)}">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(p.name)}">
  <meta property="og:description" content="Consultá precio, stock y entrega en CABA por WhatsApp.">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${imageAbsUrl}">
  <meta property="og:image:alt" content="${escapeHtml(p.name)}">
  <meta property="og:locale" content="${config.locale || 'es_AR'}">
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(p.name)}">
  <meta name="twitter:image" content="${imageAbsUrl}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="design.css">${jsonLdBlock}
</head>
<body class="product-page" data-product-theme="${theme}">
  <header class="header" style="position:relative;top:0">
    <div class="header-inner">
      <a href="index.html" class="logo-link">
        <div class="logo">
          <img src="icono.png" class="logo-icon" width="36" height="36" alt="El Banco Suplementos">
          <span class="logo-text">
            <span class="logo-text-main">EL BANCO</span>
            <span class="logo-text-sub">SUPLEMENTOS</span>
          </span>
        </div>
      </a>
      <nav class="nav" aria-label="Navegación">
        <ul class="nav-list">
          <li><a href="index.html" class="nav-link">← Volver al Catálogo</a></li>
        </ul>
      </nav>
      <div class="header-socials">
        <a href="${config.whatsappGeneral}" target="_blank" rel="noopener noreferrer"
           class="social-btn social-btn--wa" aria-label="WhatsApp">
          ${WA_SVG}
          <span class="social-btn-label">WhatsApp</span>
        </a>
      </div>
    </div>
  </header>

  <nav aria-label="Miga de pan" class="pp-breadcrumb">
    <a href="index.html">Inicio</a> &rsaquo; <a href="index.html#${subcatAnchor}">${escapeHtml(p.brand)}</a> &rsaquo; ${escapeHtml(p.name)}
  </nav>

  <main>
    <div class="pp-wrap">
      ${buildImageStageHtml(p)}

      <div class="pp-info">
        ${badgeHtml}<p class="card-brand">${escapeHtml(p.brand)}</p>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="pp-price">${escapeHtml(p.price)}</p>
        <p class="pp-desc">${escapeHtml(p.description)}</p>

        <table class="modal-chars-table" aria-label="Características del producto">
          <tr><th>Presentación</th><td>${escapeHtml(p.characteristics.presentation)}</td></tr>
          <tr><th>Sabor</th><td>${escapeHtml(p.characteristics.flavor)}</td></tr>
          <tr><th>Porciones</th><td>${escapeHtml(p.characteristics.servings)}</td></tr>
          <tr><th>Objetivo</th><td>${escapeHtml(p.characteristics.goal)}</td></tr>
          <tr><th>Stock</th><td><span class="${stockClass}">${stockLabel}</span></td></tr>
        </table>

        <div class="pp-actions">
          <a href="${p.links.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
            ${WA_SVG}
            Consultar por WhatsApp
          </a>
          <a href="index.html" class="btn btn-outline">
            Ver catálogo completo
          </a>
        </div>
      </div>
    </div>
  </main>

  <section class="pp-extra-section">
    <h2>Información del Producto</h2>
    <div class="pp-extra-grid">
      <div class="pp-nutrition-box">
        <p class="pp-box-title">Tabla Nutricional</p>
        ${nutritionHtml}
      </div>
      <div class="pp-info-cards">
        ${howToUseHtml}
        ${goalDescHtml}
      </div>
    </div>
  </section>

  <section class="contact-section" style="margin-top:3rem">
    <div class="contact-inner">
      <span class="section-label">Contacto</span>
      <h2 class="contact-title">¿Querés consultar stock y precios?</h2>
      <p class="contact-text">Contactanos por WhatsApp o seguinos en Instagram para ver novedades, promos y combos.</p>
      <div class="contact-buttons">
        <a href="${p.links.whatsapp}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
          ${WA_SVG} WhatsApp
        </a>
        <a href="${config.instagram}" target="_blank" rel="noopener noreferrer" class="btn btn-instagram">
          Instagram
        </a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="logo">
          <img src="icono.png" class="logo-icon" width="30" height="30" alt="El Banco Suplementos">
          <span class="logo-text">
            <span class="logo-text-main">EL BANCO</span>
            <span class="logo-text-sub">SUPLEMENTOS</span>
          </span>
        </div>
        <p class="footer-tagline">Suplementos premium.<br>Resultados serios.</p>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Catálogo</h4>
        <ul class="footer-list">
          <li><a href="index.html#creatines">Creatinas</a></li>
          <li><a href="index.html#proteins">Proteínas</a></li>
          <li><a href="index.html#vitamins">Vitaminas</a></li>
          <li><a href="index.html#protein-bars">Barras de Proteína</a></li>
          <li><a href="index.html#combos">Combos</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4 class="footer-heading">Encontranos</h4>
        <ul class="footer-list">
          <li><a href="${config.whatsappGeneral}" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          <li><a href="${config.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-legal">Catálogo informativo. La disponibilidad y los precios pueden variar.</p>
      <p class="footer-copy">&copy; 2026 El Banco Suplementos</p>
    </div>
  </footer>

  <!-- Sticky Mobile CTA -->
  <div class="pp-sticky-cta" aria-label="Consultar precio por WhatsApp">
    <div class="pp-sticky-info">
      <span class="pp-sticky-label">Precio</span>
      <span class="pp-sticky-price">${escapeHtml(p.price)}</span>
    </div>
    <a href="${p.links.whatsapp}" target="_blank" rel="noopener noreferrer"
       class="btn btn-whatsapp pp-sticky-btn">
      ${WA_SVG} Consultar
    </a>
  </div>

  <!-- Image lightbox -->
  <div class="pp-lightbox" id="ppLightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Imagen de ${escapeHtml(p.name)}">
    <button class="pp-lightbox-close" id="ppLightboxClose" aria-label="Cerrar imagen">&#x2715;</button>
    <div class="pp-lightbox-surface">
      <img class="pp-lightbox-img" id="ppLightboxImg" src="" alt="">
    </div>
  </div>

  <script src="pp-page.js"></script>
</body>
</html>`;
}

function buildSitemap(slugs) {
  const base = config.siteUrl.replace(/\/+$/, '');
  const urls = [
    `  <url>\n    <loc>${base}/</loc>\n  </url>`
  ];
  for (const slug of slugs) {
    urls.push(`  <url>\n    <loc>${base}/${slug}.html</loc>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// ── Generate pages ────────────────────────────────────────────
const generated = [];
const skipped   = [];

console.log('\nGenerating product pages...');

for (const p of products) {
  const html    = buildPage(p);
  const outPath = join(root, `${p.slug}.html`);
  writeFileSync(outPath, html, 'utf8');
  generated.push(p.slug);
  if (p.skipProductSnippet) {
    skipped.push({ slug: p.slug, name: p.name, reason: 'price is "Consultar" — no numeric price available' });
  }
  console.log(`  ✓ ${p.slug}.html`);
}

// ── Post-generation validation ────────────────────────────────
const productosPattern = /productos\//;
const postErrors       = [];

for (const slug of generated) {
  const content = readFileSync(join(root, `${slug}.html`), 'utf8');
  if (productosPattern.test(content)) {
    postErrors.push(`${slug}.html still contains a /productos/ reference.`);
  }
}

for (const p of products) {
  if (!existsSync(join(root, `${p.slug}.html`))) {
    postErrors.push(`Missing generated page for active product: ${p.slug}.html`);
  }
}

if (postErrors.length) {
  console.error('\nPost-generation validation errors:\n' + postErrors.map(e => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// ── Regenerate sitemap ────────────────────────────────────────
const sitemap = buildSitemap(generated);
writeFileSync(join(root, 'sitemap.xml'), sitemap, 'utf8');

// ── Summary ───────────────────────────────────────────────────
console.log(`\nGenerated ${generated.length} product pages at repository root.`);

if (skipped.length) {
  console.log('\nSkipped Product snippet (no numeric price):');
  skipped.forEach(s => console.log(`  ${s.slug} — ${s.reason}`));
}

const inactiveCount = allProducts.length - products.length;
if (inactiveCount > 0) {
  console.log(`\nSkipped ${inactiveCount} inactive product(s).`);
}

console.log(`\nGenerated sitemap.xml (${generated.length + 1} URLs)`);
console.log('Validation passed: no /productos/ references found.');

if (config.siteUrl === '[FINAL_SITE_URL]') {
  console.log('\nREMINDER: Update siteUrl in site-config.json before publishing.');
}

console.log('\nDone.');
