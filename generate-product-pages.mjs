/**
 * generate-product-pages.mjs
 *
 * Reads data/products.json and data/site-config.json, then generates:
 *   - productos/<slug>.html  (one per product)
 *   - sitemap.xml
 *
 * Usage:
 *   node scripts/generate-product-pages.mjs
 *
 * After updating data/products.json, re-run this script and commit the output.
 * Also keep the products array in script.js in sync (image paths, prices, stock).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

const products = JSON.parse(readFileSync(join(root, 'data/products.json'), 'utf8'));
const config   = JSON.parse(readFileSync(join(root, 'data/site-config.json'), 'utf8'));

mkdirSync(join(root, 'productos'), { recursive: true });

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
  if (p.skipProductSnippet || p.priceNumeric === null) return null;

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
      priceCurrency: config.currency,
      price: String(p.priceNumeric),
      availability: p.stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };
}

function buildPage(p) {
  const canonicalUrl = `${config.siteUrl}/productos/${p.slug}.html`;
  const imageAbsUrl  = `${config.siteUrl}/${p.image}`;
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
        <img src="../${p.nutritionTable}" alt="Tabla nutricional — ${escapeHtml(p.name)}" loading="lazy" onerror="this.closest('figure').style.display='none'">
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

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(p.name)} | Banco de Suplementos</title>
  <meta name="description" content="${escapeHtml(descShort)}">
  <link rel="canonical" href="${canonicalUrl}">

  <meta property="og:type" content="product">
  <meta property="og:title" content="${escapeHtml(p.name)}">
  <meta property="og:description" content="Consultá precio, stock y entrega en CABA por WhatsApp.">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${imageAbsUrl}">
  <meta property="og:image:alt" content="${escapeHtml(p.name)}">
  <meta property="og:locale" content="${config.locale}">
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(p.name)}">
  <meta name="twitter:image" content="${imageAbsUrl}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <style>
    .pp-wrap { max-width: 1100px; margin: 2.5rem auto; padding: 0 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
    @media (max-width: 768px) { .pp-wrap { grid-template-columns: 1fr; gap: 1.5rem; } }
    .pp-image { background: var(--c-card-bg, #1a1a1a); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; justify-content: center; }
    .pp-image img { width: 100%; height: auto; object-fit: contain; border-radius: 8px; max-height: 480px; }
    .pp-info { display: flex; flex-direction: column; gap: 0.75rem; }
    .pp-info h1 { font-family: 'Barlow Condensed', sans-serif; font-size: 2.2rem; font-weight: 800; text-transform: uppercase; line-height: 1.1; margin: 0; }
    .pp-price { font-size: 2rem; font-weight: 700; color: var(--c-accent, #00e5a0); margin: 0; }
    .pp-desc { line-height: 1.65; opacity: .85; }
    .pp-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; }
    .pp-breadcrumb { max-width: 1100px; margin: 1.5rem auto 0; padding: 0 1.5rem; font-size: 0.85rem; opacity: .6; }
    .pp-breadcrumb a { text-decoration: none; }
    .pp-breadcrumb a:hover { opacity: 1; text-decoration: underline; }
    .pp-extra-section { max-width: 1100px; margin: 3rem auto; padding: 0 1.5rem; }
    .pp-extra-section > h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 800; text-transform: uppercase; margin: 0 0 1.5rem; border-left: 4px solid var(--c-accent, #00e5a0); padding-left: 1rem; }
    .pp-extra-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
    @media (max-width: 768px) { .pp-extra-grid { grid-template-columns: 1fr; } }
    .pp-nutrition-box { background: var(--c-card-bg, #1a1a1a); border-radius: 16px; padding: 1.5rem; }
    .pp-box-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 700; text-transform: uppercase; color: var(--c-accent, #00e5a0); margin: 0 0 1rem; }
    .pp-nutrition-figure { margin: 0; }
    .pp-nutrition-figure img { width: 100%; height: auto; border-radius: 8px; object-fit: contain; }
    .pp-nutrition-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; min-height: 180px; opacity: .4; text-align: center; padding: 1rem; }
    .pp-nutrition-placeholder p { margin: 0; font-size: 0.875rem; }
    .pp-info-cards { display: flex; flex-direction: column; gap: 1.5rem; }
    .pp-info-card { background: var(--c-card-bg, #1a1a1a); border-radius: 16px; padding: 1.5rem; }
    .pp-info-card h3 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 700; text-transform: uppercase; color: var(--c-accent, #00e5a0); margin: 0 0 0.75rem; }
    .pp-info-card p { line-height: 1.7; opacity: .85; margin: 0; }
  </style>${jsonLdBlock}
</head>
<body>
  <header class="header" style="position:relative;top:0">
    <div class="header-inner">
      <a href="../index.html" class="logo-link">
        <div class="logo">
          <img src="../images/icono.png" class="logo-icon" width="36" height="36" alt="El Banco Suplementos">
          <span class="logo-text">
            <span class="logo-text-main">EL BANCO</span>
            <span class="logo-text-sub">SUPLEMENTOS</span>
          </span>
        </div>
      </a>
      <nav class="nav" aria-label="Navegación">
        <ul class="nav-list">
          <li><a href="../index.html" class="nav-link">← Volver al Catálogo</a></li>
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
    <a href="../index.html">Inicio</a> &rsaquo; <a href="../index.html#${p.subcategory === 'accessories' ? 'accessories' : p.category === 'combos' ? 'combos' : p.subcategory}">${escapeHtml(p.brand)}</a> &rsaquo; ${escapeHtml(p.name)}
  </nav>

  <main>
    <div class="pp-wrap">
      <div class="pp-image">
        <img
          src="../${p.image}"
          alt="${escapeHtml(p.name)}"
          width="800"
          height="800"
          loading="eager"
          fetchpriority="high"
        >
      </div>

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
          <a href="../index.html" class="btn btn-outline">
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
          <img src="../images/icono.png" class="logo-icon" width="30" height="30" alt="El Banco Suplementos">
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
          <li><a href="../index.html#creatines">Creatinas</a></li>
          <li><a href="../index.html#proteins">Proteínas</a></li>
          <li><a href="../index.html#vitamins">Vitaminas</a></li>
          <li><a href="../index.html#protein-bars">Barras de Proteína</a></li>
          <li><a href="../index.html#combos">Combos</a></li>
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
</body>
</html>`;
}

function buildSitemap(slugs) {
  const urls = [
    `  <url>\n    <loc>${config.siteUrl}/</loc>\n  </url>`
  ];
  for (const slug of slugs) {
    urls.push(`  <url>\n    <loc>${config.siteUrl}/productos/${slug}.html</loc>\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

const generated = [];
const skipped   = [];

for (const p of products) {
  const html = buildPage(p);
  const outPath = join(root, 'productos', `${p.slug}.html`);
  writeFileSync(outPath, html, 'utf8');
  generated.push(p.slug);
  if (p.skipProductSnippet) {
    skipped.push({ slug: p.slug, name: p.name, reason: 'price is "Consultar" — no numeric price available' });
  }
}

const sitemap = buildSitemap(generated);
writeFileSync(join(root, 'sitemap.xml'), sitemap, 'utf8');

console.log(`\nGenerated ${generated.length} product pages:`);
generated.forEach(s => console.log(`  productos/${s}.html`));

if (skipped.length) {
  console.log(`\nSkipped Product snippet (no numeric price):`);
  skipped.forEach(s => console.log(`  ${s.slug} — ${s.reason}`));
}

console.log(`\nGenerated sitemap.xml (${generated.length + 1} URLs)`);
console.log('\nDone. Remember to update [FINAL_SITE_URL] in data/site-config.json before publishing.');
