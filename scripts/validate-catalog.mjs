/**
 * validate-catalog.mjs
 *
 * Post-build validator. Runs after import + generate.
 * Checks JSON integrity, asset existence, generated pages, sitemap and homepage.
 *
 * Usage:
 *   node scripts/validate-catalog.mjs
 */

import fs   from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(__dir, "..");

const errors   = [];
const warnings = [];

function fail(msg)  { errors.push("  ✗  " + msg); }
function warn(msg)  { warnings.push("  ⚠  " + msg); }
function ok(msg)    { console.log("  ✓  " + msg); }

// ── 1. Validate products.json ───────────────────────────────────────────────
console.log("\n🔍 Validando products.json …");
const productsPath = path.join(ROOT, "products.json");
if (!fs.existsSync(productsPath)) {
  console.error("ERROR FATAL: products.json no existe.");
  process.exit(1);
}

let products;
try {
  products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
} catch (e) {
  console.error("ERROR FATAL: products.json no es JSON válido: " + e.message);
  process.exit(1);
}

if (!Array.isArray(products)) {
  console.error("ERROR FATAL: products.json no contiene un array.");
  process.exit(1);
}

ok(`products.json parsea correctamente (${products.length} productos totales).`);

const seenIds   = new Map();
const seenSlugs = new Map();
const activeProducts = [];
const allSlugs = new Set(products.map(p => p.slug));

for (const p of products) {
  if (p.id == null)  fail(`Producto sin id: "${p.name || '(sin nombre)'}"`);
  if (!p.slug)       fail(`Producto id=${p.id} sin slug.`);

  if (seenIds.has(p.id))     fail(`ID duplicado: ${p.id}`);
  if (seenSlugs.has(p.slug)) fail(`Slug duplicado: "${p.slug}"`);
  seenIds.set(p.id, true);
  seenSlugs.set(p.slug, true);

  if (p.active === false) continue;
  activeProducts.push(p);

  if (!p.name)        fail(`Producto activo id=${p.id} sin 'name'.`);
  if (!p.brand)       fail(`Producto activo id=${p.id} ("${p.name}") sin 'brand'.`);
  if (!p.category)    fail(`Producto activo id=${p.id} ("${p.name}") sin 'category'.`);
  if (!p.subcategory) fail(`Producto activo id=${p.id} ("${p.name}") sin 'subcategory'.`);
  if (!p.image)       fail(`Producto activo id=${p.id} ("${p.name}") sin 'image'.`);

  // relatedSlugs cross-ref
  if (Array.isArray(p.relatedSlugs)) {
    for (const rs of p.relatedSlugs) {
      if (rs === p.slug) fail(`Producto "${p.slug}": relatedSlugs se referencia a sí mismo.`);
      if (!allSlugs.has(rs)) fail(`Producto "${p.slug}": relatedSlug "${rs}" no existe.`);
    }
  }
}
ok(`IDs únicos. Slugs únicos. ${activeProducts.length} productos activos.`);

// ── 2. Validate site-config.json ────────────────────────────────────────────
console.log("\n🔍 Validando site-config.json …");
const configPath = path.join(ROOT, "site-config.json");
if (!fs.existsSync(configPath)) {
  fail("site-config.json no existe.");
} else {
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (typeof cfg !== "object" || Array.isArray(cfg)) {
      fail("site-config.json no contiene un objeto.");
    } else {
      ok("site-config.json es JSON válido.");
      if (!cfg.siteUrl) warn("site-config.json: falta 'siteUrl'.");
    }
  } catch (e) {
    fail("site-config.json no es JSON válido: " + e.message);
  }
}

// ── 3. Validate image files ──────────────────────────────────────────────────
console.log("\n🔍 Validando imágenes …");
let imgOk = 0, imgMissing = 0, nutrOk = 0, nutrMissing = 0;

for (const p of activeProducts) {
  if (p.image) {
    if (p.image.includes("../") || p.image.includes("/productos/")) {
      fail(`Producto "${p.slug}": ruta de imagen no permitida: "${p.image}"`);
    } else {
      const imgPath = path.join(ROOT, p.image);
      if (fs.existsSync(imgPath)) {
        imgOk++;
      } else {
        fail(`Producto "${p.slug}": imagen no encontrada: ${p.image}`);
        imgMissing++;
      }
    }
  }
  if (p.nutritionTable) {
    if (p.nutritionTable.includes("../") || p.nutritionTable.includes("/productos/")) {
      fail(`Producto "${p.slug}": ruta de nutritionTable no permitida.`);
    } else {
      const nutrPath = path.join(ROOT, p.nutritionTable);
      if (fs.existsSync(nutrPath)) {
        nutrOk++;
      } else {
        warn(`Producto "${p.slug}": nutritionTable no encontrada: ${p.nutritionTable}`);
        nutrMissing++;
      }
    }
  }
}
ok(`Imágenes: ${imgOk} encontradas, ${imgMissing} faltantes.`);
ok(`Tablas nutricionales: ${nutrOk} encontradas, ${nutrMissing} faltantes.`);

// ── 4. Validate generated pages ──────────────────────────────────────────────
console.log("\n🔍 Validando páginas generadas …");
const GENERATED_MARKER = "<!-- GENERATED_PRODUCT_PAGE -->";
const CSS_REQUIRED     = ["styles.css", "design.css", "pp-page.js"];
let pagesOk = 0, pagesMissing = 0;

for (const p of activeProducts) {
  const pagePath = path.join(ROOT, `${p.slug}.html`);
  if (!fs.existsSync(pagePath)) {
    fail(`Página no encontrada: ${p.slug}.html`);
    pagesMissing++;
    continue;
  }
  const content = fs.readFileSync(pagePath, "utf8");
  if (!content.includes(GENERATED_MARKER)) {
    warn(`${p.slug}.html no contiene el marcador <!-- GENERATED_PRODUCT_PAGE -->.`);
  }
  for (const asset of CSS_REQUIRED) {
    if (!content.includes(asset)) {
      warn(`${p.slug}.html no referencia a "${asset}".`);
    }
    if (content.includes(`../${asset}`)) {
      fail(`${p.slug}.html usa ruta relativa incorrecta: "../${asset}"`);
    }
  }
  if (content.includes("productos/")) {
    fail(`${p.slug}.html contiene una referencia a /productos/.`);
  }
  pagesOk++;
}
ok(`Páginas generadas: ${pagesOk} OK, ${pagesMissing} faltantes.`);

// ── 5. Validate sitemap.xml ──────────────────────────────────────────────────
console.log("\n🔍 Validando sitemap.xml …");
const sitemapPath = path.join(ROOT, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  fail("sitemap.xml no encontrado.");
} else {
  const sitemapContent = fs.readFileSync(sitemapPath, "utf8");
  if (sitemapContent.includes("/productos/")) {
    fail("sitemap.xml contiene referencias a /productos/.");
  }
  let sitemapOk = 0;
  for (const p of activeProducts) {
    if (!sitemapContent.includes(p.slug + ".html")) {
      warn(`Producto activo "${p.slug}" no aparece en sitemap.xml.`);
    } else {
      sitemapOk++;
    }
  }
  // Check inactive products are not in sitemap
  for (const p of products.filter(p => p.active === false)) {
    if (p.slug && sitemapContent.includes(p.slug + ".html")) {
      fail(`Producto INACTIVO "${p.slug}" aparece en sitemap.xml.`);
    }
  }
  ok(`sitemap.xml: ${sitemapOk} productos activos encontrados.`);
}

// ── 6. Validate homepage script.js ──────────────────────────────────────────
console.log("\n🔍 Validando script.js …");
const scriptPath = path.join(ROOT, "script.js");
if (!fs.existsSync(scriptPath)) {
  fail("script.js no encontrado.");
} else {
  const scriptContent = fs.readFileSync(scriptPath, "utf8");
  if (!scriptContent.includes("products.json")) {
    fail("script.js no carga products.json.");
  } else {
    ok("script.js carga products.json correctamente.");
  }
  if (scriptContent.includes("/productos/")) {
    fail("script.js contiene referencias a /productos/.");
  }
}

// ── Print results ────────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(50));

if (warnings.length > 0) {
  console.warn("\n⚠️  Advertencias:");
  warnings.forEach(w => console.warn(w));
}

if (errors.length > 0) {
  console.error("\n❌ Validación FALLIDA:");
  errors.forEach(e => console.error(e));
  console.error(`\n  ${errors.length} error(es) encontrados.\n`);
  process.exit(1);
}

console.log(`
✅ Validación EXITOSA
   • ${products.length} productos totales
   • ${activeProducts.length} productos activos
   • ${imgOk} imágenes verificadas
   • ${nutrOk} tablas nutricionales verificadas
   • ${pagesOk} páginas generadas verificadas
`);
