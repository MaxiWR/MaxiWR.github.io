/**
 * import-products-from-excel.mjs
 *
 * Reads catalogo_productos_banco.xlsx and writes:
 *   products.json     — array of product objects
 *   site-config.json  — site configuration key/value pairs
 *
 * Usage:
 *   node scripts/import-products-from-excel.mjs [workbook.xlsx]
 *
 * The workbook is the ONLY manually edited product-data source.
 * Never edit products.json directly — run this script after editing Excel.
 */

import fs      from "node:fs";
import path    from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dir       = path.dirname(fileURLToPath(import.meta.url));
const ROOT        = path.resolve(__dir, "..");
const BACKUP_DIR  = path.join(ROOT, ".catalog-backups");
const MAX_BACKUPS = 10;

// ── CLI argument ────────────────────────────────────────────────────────────
const workbookArg  = process.argv[2] || "catalogo_productos_banco.xlsx";
const workbookPath = path.isAbsolute(workbookArg)
  ? workbookArg
  : path.join(ROOT, workbookArg);

if (!fs.existsSync(workbookPath)) {
  console.error(`\nERROR: No se encontró el archivo Excel: ${workbookPath}`);
  console.error("  Asegurate de que el archivo 'catalogo_productos_banco.xlsx' esté en la raíz del proyecto.\n");
  process.exit(1);
}

console.log(`\n📂 Leyendo workbook: ${path.basename(workbookPath)}`);

// ── Load workbook (buffer-based — compatible with ESM) ──────────────────────
const workbookBuffer = fs.readFileSync(workbookPath);
const workbook = XLSX.read(workbookBuffer, {
  type:      "buffer",
  cellDates: false,
  raw:       false
});

// ── Validate required sheet ─────────────────────────────────────────────────
if (!workbook.SheetNames.includes("Productos")) {
  console.error("\nERROR: El workbook no contiene la hoja 'Productos'.");
  console.error("  Sheets disponibles: " + workbook.SheetNames.join(", "));
  process.exit(1);
}

console.log("  Sheets: " + workbook.SheetNames.join(", "));

// ── Boolean parser ──────────────────────────────────────────────────────────
function parseBoolean(value, defaultValue = false) {
  if (value === true || value === false) return value;
  const n = String(value ?? "").trim().toLowerCase();
  if (["true", "verdadero", "sí", "si", "1", "yes"].includes(n)) return true;
  if (["false", "falso", "no", "0"].includes(n)) return false;
  return defaultValue;
}

// ── Price formatter (Argentine style) ──────────────────────────────────────
function formatPriceARS(numeric) {
  // 30000 → "$30.000"
  return "$" + Math.round(numeric).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

function parsePrice(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return null;
  const cleaned = String(raw).replace(/[$\s]/g, "").replace(/\./g, "").replace(/,/g, ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// ── Read Productos sheet ────────────────────────────────────────────────────
// Headers are on Excel row 4 (0-indexed: range = 3)
const productSheet = workbook.Sheets["Productos"];
const rawRows = XLSX.utils.sheet_to_json(productSheet, {
  range:  3,
  defval: "",
  raw:    false
});

const VALID_SLUG     = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_IMAGE_SF = new Set(["light", "transparent", "dark", "auto", ""]);

const allErrors   = [];
const allWarnings = [];

// ── Row number helper (Excel row = data index + 5 because headers are on row 4)
function excelRow(rowIndex) { return rowIndex + 5; }

// ── Parse products ──────────────────────────────────────────────────────────
const seenIds   = new Map(); // id → rowIndex
const seenSlugs = new Map(); // slug → rowIndex

const products = [];

for (let i = 0; i < rawRows.length; i++) {
  const row = rawRows[i];
  const xRow = excelRow(i);

  // Skip completely empty rows
  const allValues = Object.values(row).map(v => String(v ?? "").trim());
  if (allValues.every(v => v === "" || v === "0")) continue;

  // ── id ────────────────────────────────────────────────────────
  const rawId = String(row.id ?? "").trim();
  if (!rawId || rawId === "") {
    // Skip template / example rows silently
    continue;
  }
  const id = parseInt(rawId, 10);
  if (isNaN(id) || id <= 0) {
    allErrors.push(`Fila ${xRow} — 'id' inválido: "${rawId}". Debe ser un entero positivo.`);
    continue;
  }
  if (seenIds.has(id)) {
    allErrors.push(`Fila ${xRow} — 'id' duplicado: ${id} (ya usado en fila ${excelRow(seenIds.get(id))}).`);
  }
  seenIds.set(id, i);

  // ── slug ──────────────────────────────────────────────────────
  const slug = String(row.slug ?? "").trim().toLowerCase();
  if (!slug) {
    allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'slug'.`);
  } else if (!VALID_SLUG.test(slug)) {
    allErrors.push(`Fila ${xRow} — id=${id}: 'slug' inválido: "${slug}". Solo letras a-z, números y guiones.`);
  } else if (seenSlugs.has(slug)) {
    allErrors.push(`Fila ${xRow} — 'slug' duplicado: "${slug}" (ya usado en fila ${excelRow(seenSlugs.get(slug))}).`);
  }
  seenSlugs.set(slug, i);

  // ── active / stock ────────────────────────────────────────────
  const active = parseBoolean(row.active, true);
  const stock  = parseBoolean(row.stock,  true);

  // ── Required text fields ──────────────────────────────────────
  const name        = String(row.name        ?? "").trim();
  const brand       = String(row.brand       ?? "").trim();
  const category    = String(row.category    ?? "").trim();
  const subcategory = String(row.subcategory ?? "").trim();
  const image       = String(row.image       ?? "").trim();
  const waUrl       = String(row.whatsapp    ?? "").trim();

  if (active) {
    if (!name)        allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'name'.`);
    if (!brand)       allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'brand'.`);
    if (!category)    allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'category'.`);
    if (!subcategory) allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'subcategory'.`);
    if (!image)       allErrors.push(`Fila ${xRow} — id=${id}: falta el campo 'image'.`);
    if (!waUrl)       allWarnings.push(`Fila ${xRow} — id=${id}: falta el campo 'whatsapp'.`);
  }

  // ── Price ─────────────────────────────────────────────────────
  const rawPriceNum = String(row.priceNumeric ?? "").trim();
  const priceNumeric = rawPriceNum !== "" ? parsePrice(rawPriceNum) : null;
  if (rawPriceNum !== "" && priceNumeric === null) {
    allErrors.push(`Fila ${xRow} — id=${id}: 'priceNumeric' inválido: "${rawPriceNum}".`);
  }
  const price = priceNumeric !== null ? formatPriceARS(priceNumeric) : "Consultar";

  // ── Optional numeric fields ───────────────────────────────────
  const rawScale = String(row.imageScale ?? "").trim();
  let imageScale = undefined;
  if (rawScale !== "") {
    const n = parseFloat(rawScale.replace(",", "."));
    if (!isNaN(n) && n > 0) imageScale = n;
    else allErrors.push(`Fila ${xRow} — id=${id}: 'imageScale' inválido: "${rawScale}".`);
  }

  const rawHeroOrder = String(row.heroCarouselOrder ?? "").trim();
  let heroCarouselOrder = undefined;
  if (rawHeroOrder !== "") {
    const n = parseInt(rawHeroOrder, 10);
    if (!isNaN(n) && n > 0) heroCarouselOrder = n;
    else allErrors.push(`Fila ${xRow} — id=${id}: 'heroCarouselOrder' inválido: "${rawHeroOrder}".`);
  }

  // ── imageSurface ──────────────────────────────────────────────
  const imageSurface = String(row.imageSurface ?? "").trim().toLowerCase();
  if (imageSurface && !VALID_IMAGE_SF.has(imageSurface)) {
    allWarnings.push(`Fila ${xRow} — id=${id}: 'imageSurface' desconocido: "${imageSurface}". Se ignorará.`);
  }

  // ── relatedSlugs ──────────────────────────────────────────────
  const rawRelated = String(row.relatedSlugs ?? "").trim();
  const relatedSlugs = rawRelated
    ? rawRelated.split(",").map(s => s.trim()).filter(Boolean)
    : undefined;

  // ── Optional text fields ──────────────────────────────────────
  const description    = String(row.description    ?? "").trim();
  const howToUse       = String(row.howToUse       ?? "").trim();
  const goalDescription= String(row.goalDescription?? "").trim();
  const nutritionTable = String(row.nutritionTable  ?? "").trim();
  const badge          = String(row.badge           ?? "").trim();
  const instagram      = String(row.instagram       ?? "").trim();

  // ── Characteristics ───────────────────────────────────────────
  const presentation = String(row.presentation ?? "").trim();
  const flavor       = String(row.flavor       ?? "").trim();
  const servings     = String(row.servings     ?? "").trim();
  const goal         = String(row.goal         ?? "").trim();

  // ── Boolean flags ─────────────────────────────────────────────
  const featured           = parseBoolean(row.featured,           false);
  const heroCarousel       = parseBoolean(row.heroCarousel,       false);
  const skipProductSnippet = parseBoolean(row.skipProductSnippet, false);

  // ── Build product object (omit empty optional fields) ─────────
  const product = { id, slug };
  if (name)        product.name        = name;
  if (brand)       product.brand       = brand;
  if (category)    product.category    = category;
  if (subcategory) product.subcategory = subcategory;

  product.price = price;
  if (priceNumeric !== null) product.priceNumeric = priceNumeric;

  if (image)          product.image    = image;
  if (imageSurface && VALID_IMAGE_SF.has(imageSurface) && imageSurface !== "")
                      product.imageSurface = imageSurface;
  if (imageScale !== undefined) product.imageScale = imageScale;

  product.stock  = stock;
  product.active = active;

  if (heroCarousel)      product.heroCarousel = heroCarousel;
  if (heroCarouselOrder) product.heroCarouselOrder = heroCarouselOrder;
  if (badge)             product.badge    = badge;
  if (featured)          product.featured = featured;
  if (skipProductSnippet)product.skipProductSnippet = true;

  if (relatedSlugs && relatedSlugs.length > 0) product.relatedSlugs = relatedSlugs;

  if (description)     product.description     = description;
  if (presentation || flavor || servings || goal) {
    product.characteristics = {
      ...(presentation ? { presentation } : {}),
      ...(flavor       ? { flavor }       : {}),
      ...(servings     ? { servings }     : {}),
      ...(goal         ? { goal }         : {}),
    };
  }
  if (howToUse)        product.howToUse        = howToUse;
  if (goalDescription) product.goalDescription = goalDescription;
  if (nutritionTable)  product.nutritionTable  = nutritionTable;

  // ── Links ─────────────────────────────────────────────────────
  const links = {};
  if (waUrl)       links.whatsapp = waUrl;
  if (instagram)   links.instagram = instagram;
  if (Object.keys(links).length > 0) product.links = links;

  products.push(product);
}

// ── Cross-reference: relatedSlugs must exist ────────────────────────────────
const allSlugs = new Set(products.map(p => p.slug));
for (let i = 0; i < products.length; i++) {
  const p    = products[i];
  const xRow = excelRow(i);
  if (!p.relatedSlugs) continue;
  for (const rs of p.relatedSlugs) {
    if (rs === p.slug) {
      allErrors.push(`Fila ${xRow} — id=${p.id}: 'relatedSlugs' contiene el propio slug del producto: "${rs}".`);
    } else if (!allSlugs.has(rs)) {
      allErrors.push(`Fila ${xRow} — id=${p.id}: 'relatedSlugs' contiene un slug inexistente: "${rs}".`);
    }
  }
  const uniqueRelated = new Set(p.relatedSlugs);
  if (uniqueRelated.size < p.relatedSlugs.length) {
    allErrors.push(`Fila ${xRow} — id=${p.id}: 'relatedSlugs' tiene slugs duplicados.`);
  }
}

// ── Print warnings ──────────────────────────────────────────────────────────
if (allWarnings.length > 0) {
  console.warn("\n⚠️  Advertencias:");
  allWarnings.forEach(w => console.warn("  ⚠  " + w));
}

// ── Fail on errors — do NOT overwrite JSON ──────────────────────────────────
if (allErrors.length > 0) {
  console.error("\n❌ Errores de validación encontrados. products.json NO fue modificado:\n");
  allErrors.forEach(e => console.error("  ✗  " + e));
  console.error(`\n  Total: ${allErrors.length} error(es). Corregí el Excel y volvé a intentar.\n`);
  process.exit(1);
}

console.log(`\n✅ ${products.length} productos leídos (${products.filter(p => p.active).length} activos).`);

// ── Read Configuracion sheet ────────────────────────────────────────────────
let siteConfig = null;
if (workbook.SheetNames.includes("Configuracion")) {
  const configSheet = workbook.Sheets["Configuracion"];
  const configRows  = XLSX.utils.sheet_to_json(configSheet, {
    range:  2,
    defval: "",
    raw:    false
  });
  if (configRows.length > 0) {
    siteConfig = {};
    for (const row of configRows) {
      const campo = String(row.campo ?? row.Campo ?? "").trim();
      const valor = String(row.valor ?? row.Valor ?? "").trim();
      if (campo) siteConfig[campo] = valor;
    }
    if (Object.keys(siteConfig).length === 0) siteConfig = null;
  }
} else {
  console.warn("  ⚠  Hoja 'Configuracion' no encontrada. Se preservará el site-config.json existente.");
}

// ── Backup existing files ───────────────────────────────────────────────────
function makeBackup(filePath) {
  if (!fs.existsSync(filePath)) return;
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts   = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
  const base = path.basename(filePath, ".json");
  const dest = path.join(BACKUP_DIR, `${base}-${ts}.json`);
  fs.copyFileSync(filePath, dest);

  // Keep only the latest MAX_BACKUPS per base name
  const existing = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith(base + "-") && f.endsWith(".json"))
    .sort()
    .reverse();
  for (const old of existing.slice(MAX_BACKUPS)) {
    fs.unlinkSync(path.join(BACKUP_DIR, old));
  }
}

// ── Atomic write helper ─────────────────────────────────────────────────────
function atomicWriteJson(filePath, data) {
  const tmp = filePath + ".tmp";
  const json = JSON.stringify(data, null, 2) + "\n";

  // Write to temp file
  fs.writeFileSync(tmp, json, "utf8");

  // Re-parse to confirm validity
  JSON.parse(fs.readFileSync(tmp, "utf8"));

  // Backup existing
  makeBackup(filePath);

  // Replace
  fs.renameSync(tmp, filePath);
}

// ── Write products.json ──────────────────────────────────────────────────────
const productsPath = path.join(ROOT, "products.json");
try {
  atomicWriteJson(productsPath, products);
  console.log("  ✓  products.json escrito correctamente.");
} catch (err) {
  // Clean up temp file if it exists
  try { fs.unlinkSync(productsPath + ".tmp"); } catch {}
  console.error("ERROR escribiendo products.json: " + err.message);
  process.exit(1);
}

// ── Write site-config.json ───────────────────────────────────────────────────
if (siteConfig) {
  const configPath = path.join(ROOT, "site-config.json");
  try {
    atomicWriteJson(configPath, siteConfig);
    console.log("  ✓  site-config.json escrito correctamente.");
  } catch (err) {
    try { fs.unlinkSync(configPath + ".tmp"); } catch {}
    console.error("ERROR escribiendo site-config.json: " + err.message);
    process.exit(1);
  }
} else {
  console.log("  ℹ  site-config.json preservado (sin cambios desde Excel).");
}

console.log("\n🎉 Importación completada. Ejecutá 'npm run catalog:generate' para regenerar las páginas.\n");
