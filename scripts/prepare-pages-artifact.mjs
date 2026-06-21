/**
 * prepare-pages-artifact.mjs
 *
 * Builds a clean, deployable _site/ directory for GitHub Pages.
 * Copies only required static website assets — no node_modules, no scripts, no xlsx.
 *
 * Usage:
 *   node scripts/prepare-pages-artifact.mjs
 */

import fs   from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(__dir, "..");
const SITE  = path.join(ROOT, "_site");

// ── Asset extensions to copy from root ──────────────────────────────────────
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico", ".avif"]);

// ── Explicit files always copied ─────────────────────────────────────────────
const REQUIRED_FILES = [
  "index.html",
  "styles.css",
  "design.css",
  "script.js",
  "pp-page.js",
  "products.json",
  "site-config.json",
  "sitemap.xml",
  "robots.txt",
  "icono.png",
];

const OPTIONAL_FILES = [
  "404.html",
  "banco-suplementos-og.webp",
  "testimonials.json",
];

// ── Directories / prefixes to NEVER copy ────────────────────────────────────
const EXCLUDE_DIRS  = new Set(["node_modules", ".git", ".github", "_site", ".catalog-backups", "scripts", ".vscode"]);
const EXCLUDE_FILES = new Set([
  "package.json",
  "package-lock.json",
  ".nvmrc",
  ".gitignore",
  "GUIA_CATALOGO_EXCEL.md",
  "SEARCH_CONSOLE_SETUP.md",
  "actualizar-catalogo.cmd",
]);

// ── Helpers ──────────────────────────────────────────────────────────────────
function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function isExcluded(name) {
  if (EXCLUDE_DIRS.has(name))  return true;
  if (EXCLUDE_FILES.has(name)) return true;
  if (name.startsWith("~$"))   return true;  // Excel lock files
  if (name.endsWith(".tmp"))   return true;
  if (name.endsWith(".mjs"))   return true;
  if (name.endsWith(".cmd"))   return true;
  if (name.endsWith(".md"))    return true;
  if (name.endsWith(".xlsx"))  return true;
  if (name.endsWith(".lock"))  return true;
  return false;
}

// ── 1. Clean and recreate _site ──────────────────────────────────────────────
console.log("\n🏗️  Preparando directorio _site/ …\n");

if (fs.existsSync(SITE)) {
  fs.rmSync(SITE, { recursive: true, force: true });
  console.log("  ✓  _site/ anterior eliminado.");
}
fs.mkdirSync(SITE, { recursive: true });
console.log("  ✓  _site/ creado.\n");

// ── 2. Copy required files ───────────────────────────────────────────────────
let copiedCount = 0;
const missing = [];

console.log("📋 Copiando archivos estáticos …");

for (const file of REQUIRED_FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    missing.push(file);
    console.error(`  ✗  FALTANTE (requerido): ${file}`);
    continue;
  }
  copyFile(src, path.join(SITE, file));
  console.log(`  ✓  ${file}`);
  copiedCount++;
}

for (const file of OPTIONAL_FILES) {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    copyFile(src, path.join(SITE, file));
    console.log(`  ✓  ${file} (opcional)`);
    copiedCount++;
  }
}

// ── 3. Copy generated product pages ─────────────────────────────────────────
console.log("\n📄 Copiando páginas de productos …");
const GENERATED_MARKER = "<!-- GENERATED_PRODUCT_PAGE -->";
let pagesCopied = 0;

const rootEntries = fs.readdirSync(ROOT, { withFileTypes: true });
for (const entry of rootEntries) {
  if (!entry.isFile()) continue;
  if (!entry.name.endsWith(".html")) continue;
  if (entry.name === "index.html") continue;    // already copied above
  if (entry.name === "404.html")   continue;    // already handled above

  const src = path.join(ROOT, entry.name);
  let content;
  try {
    content = fs.readFileSync(src, "utf8");
  } catch {
    continue;
  }

  if (content.includes(GENERATED_MARKER)) {
    copyFile(src, path.join(SITE, entry.name));
    pagesCopied++;
  }
}
console.log(`  ✓  ${pagesCopied} páginas de producto copiadas.`);
copiedCount += pagesCopied;

// ── 4. Copy all image and media assets from root ─────────────────────────────
console.log("\n🖼️  Copiando imágenes y media …");
let imagesCopied = 0;

for (const entry of rootEntries) {
  if (!entry.isFile()) continue;
  const ext = path.extname(entry.name).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) continue;
  if (isExcluded(entry.name)) continue;

  const src  = path.join(ROOT, entry.name);
  const dest = path.join(SITE, entry.name);
  if (!fs.existsSync(dest)) {  // avoid re-copying icono.png etc.
    copyFile(src, dest);
    imagesCopied++;
  }
}
console.log(`  ✓  ${imagesCopied} archivos de imagen copiados.`);
copiedCount += imagesCopied;

// ── 5. Validate _site contents ────────────────────────────────────────────────
console.log("\n🔍 Verificando _site/ …");
const siteErrors = [];

const criticalFiles = ["index.html", "products.json", "styles.css", "design.css", "script.js", "sitemap.xml"];
for (const f of criticalFiles) {
  const fp = path.join(SITE, f);
  if (!fs.existsSync(fp)) {
    siteErrors.push(`_site/${f} faltante.`);
  }
}

// Verify all active product pages are in _site
try {
  const products = JSON.parse(fs.readFileSync(path.join(ROOT, "products.json"), "utf8"));
  const active   = products.filter(p => p.active !== false);
  for (const p of active) {
    const pagePath = path.join(SITE, `${p.slug}.html`);
    if (!fs.existsSync(pagePath)) {
      siteErrors.push(`_site/${p.slug}.html faltante.`);
    }
  }
  // Verify images
  for (const p of active) {
    if (p.image) {
      const imgPath = path.join(SITE, p.image);
      if (!fs.existsSync(imgPath)) {
        siteErrors.push(`_site/${p.image} faltante (producto "${p.slug}").`);
      }
    }
  }
  console.log(`  ✓  ${active.length} páginas de producto activo verificadas en _site/.`);
} catch (e) {
  siteErrors.push("No se pudo leer products.json para verificar: " + e.message);
}

// Confirm node_modules is NOT in _site
if (fs.existsSync(path.join(SITE, "node_modules"))) {
  siteErrors.push("_site/node_modules presente — NO debe estar en el deploy.");
}
if (fs.existsSync(path.join(SITE, "catalogo_productos_banco.xlsx"))) {
  siteErrors.push("_site/catalogo_productos_banco.xlsx presente — NO debe estar en el deploy.");
}

// ── Report ────────────────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(50));

if (siteErrors.length > 0 || missing.length > 0) {
  console.error("\n❌ Errores en la preparación del sitio:");
  [...missing.map(f => `  ✗  Archivo requerido faltante: ${f}`), ...siteErrors.map(e => `  ✗  ${e}`)].forEach(e => console.error(e));
  process.exit(1);
}

const siteFiles = fs.readdirSync(SITE);
console.log(`
✅ _site/ preparado correctamente
   • ${copiedCount} archivos copiados en total
   • ${siteFiles.length} archivos/directorios en _site/
   • Listo para subir a GitHub Pages
`);
