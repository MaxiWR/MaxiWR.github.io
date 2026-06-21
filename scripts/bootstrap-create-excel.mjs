/**
 * bootstrap-create-excel.mjs
 *
 * ONE-TIME script: creates catalogo_productos_banco.xlsx from the current
 * products.json and site-config.json. Run once to establish the Excel workbook.
 * After this, always edit the Excel and run `npm run catalog:update`.
 *
 * Usage:
 *   node scripts/bootstrap-create-excel.mjs
 */

import fs      from "node:fs";
import path    from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(__dir, "..");

// ── Load source data ─────────────────────────────────────────────────────────
const products   = JSON.parse(fs.readFileSync(path.join(ROOT, "products.json"), "utf8"));
const siteConfig = JSON.parse(fs.readFileSync(path.join(ROOT, "site-config.json"), "utf8"));

// ── Sheet: Productos ─────────────────────────────────────────────────────────
// Headers on row 4 (0-indexed: row index 3), data from row 5 (index 4).
// We add 3 padding rows before headers for title / legend.

const PRODUCTOS_HEADERS = [
  "id", "slug", "active", "stock",
  "name", "brand", "category", "subcategory", "priceNumeric",
  "image", "imageSurface", "imageScale",
  "heroCarousel", "heroCarouselOrder", "badge", "featured", "skipProductSnippet",
  "description", "presentation", "flavor", "servings", "goal",
  "howToUse", "goalDescription", "nutritionTable",
  "relatedSlugs", "whatsapp", "instagram"
];

const productRows = products.map(p => {
  const c = p.characteristics || {};
  return {
    id:                 p.id,
    slug:               p.slug               ?? "",
    active:             p.active             !== false ? "true" : "false",
    stock:              p.stock              !== false ? "true" : "false",
    name:               p.name               ?? "",
    brand:              p.brand              ?? "",
    category:           p.category           ?? "",
    subcategory:        p.subcategory        ?? "",
    priceNumeric:       p.priceNumeric       ?? "",
    image:              p.image              ?? "",
    imageSurface:       p.imageSurface       ?? "",
    imageScale:         p.imageScale         ?? "",
    heroCarousel:       p.heroCarousel       ? "true" : "",
    heroCarouselOrder:  p.heroCarouselOrder  ?? "",
    badge:              p.badge              ?? "",
    featured:           p.featured           ? "true" : "",
    skipProductSnippet: p.skipProductSnippet ? "true" : "",
    description:        p.description        ?? "",
    presentation:       c.presentation       ?? "",
    flavor:             c.flavor             ?? "",
    servings:           c.servings           ?? "",
    goal:               c.goal               ?? "",
    howToUse:           p.howToUse           ?? "",
    goalDescription:    p.goalDescription    ?? "",
    nutritionTable:     (p.nutritionTable && p.nutritionTable !== null) ? p.nutritionTable : "",
    relatedSlugs:       Array.isArray(p.relatedSlugs) ? p.relatedSlugs.join(", ") : "",
    whatsapp:           p.links?.whatsapp    ?? "",
    instagram:          p.links?.instagram   ?? "",
  };
});

// Build worksheet data (array of arrays)
const wsData = [
  ["CATÁLOGO BANCO DE SUPLEMENTOS — No editar este archivo con otras herramientas"],
  ["Editá los productos en esta hoja y ejecutá 'actualizar-catalogo.cmd' para publicar los cambios."],
  ["IMPORTANTE: no cambiés el orden de las columnas ni elimines la fila de encabezados (fila 4)."],
  PRODUCTOS_HEADERS,  // Row 4 = headers (index 3)
  ...productRows.map(row => PRODUCTOS_HEADERS.map(h => row[h] ?? "")),
];

const wsProductos = XLSX.utils.aoa_to_sheet(wsData);

// Set column widths for readability
const colWidths = [
  { wch: 6  }, // id
  { wch: 35 }, // slug
  { wch: 7  }, // active
  { wch: 7  }, // stock
  { wch: 40 }, // name
  { wch: 20 }, // brand
  { wch: 16 }, // category
  { wch: 18 }, // subcategory
  { wch: 14 }, // priceNumeric
  { wch: 38 }, // image
  { wch: 14 }, // imageSurface
  { wch: 12 }, // imageScale
  { wch: 14 }, // heroCarousel
  { wch: 17 }, // heroCarouselOrder
  { wch: 16 }, // badge
  { wch: 10 }, // featured
  { wch: 18 }, // skipProductSnippet
  { wch: 80 }, // description
  { wch: 25 }, // presentation
  { wch: 18 }, // flavor
  { wch: 10 }, // servings
  { wch: 28 }, // goal
  { wch: 90 }, // howToUse
  { wch: 90 }, // goalDescription
  { wch: 38 }, // nutritionTable
  { wch: 55 }, // relatedSlugs
  { wch: 90 }, // whatsapp
  { wch: 50 }, // instagram
];
wsProductos["!cols"] = colWidths;

// Freeze first row (title row stays, freeze at row 5 so headers are always visible)
wsProductos["!freeze"] = { xSplit: 0, ySplit: 4 };

// ── Sheet: Configuracion ─────────────────────────────────────────────────────
// Headers on row 3 (index 2), data from row 4 (index 3)

const CONFIG_HEADERS = ["campo", "valor", "descripcion"];
const configEntries = [
  { campo: "siteUrl",         valor: siteConfig.siteUrl         ?? "",  descripcion: "URL base del sitio (no modificar si dice [FINAL_SITE_URL])" },
  { campo: "siteName",        valor: siteConfig.siteName        ?? "",  descripcion: "Nombre del sitio para SEO y Open Graph" },
  { campo: "locale",          valor: siteConfig.locale          ?? "",  descripcion: "Locale para metadatos (ej: es_AR)" },
  { campo: "language",        valor: siteConfig.language        ?? "",  descripcion: "Idioma HTML (ej: es-AR)" },
  { campo: "currency",        valor: siteConfig.currency        ?? "",  descripcion: "Moneda (ej: ARS)" },
  { campo: "defaultOgImage",  valor: siteConfig.defaultOgImage  ?? "",  descripcion: "Imagen por defecto para compartir en redes sociales" },
  { campo: "instagram",       valor: siteConfig.instagram       ?? "",  descripcion: "URL del perfil de Instagram" },
  { campo: "whatsappGeneral", valor: siteConfig.whatsappGeneral ?? "",  descripcion: "URL de WhatsApp general del negocio" },
];

const wsConfigData = [
  ["CONFIGURACIÓN DEL SITIO — Editá los valores en la columna 'valor'"],
  ["No modifiques la columna 'campo'. No elimines ni reordenés filas."],
  CONFIG_HEADERS,  // Row 3 = headers (index 2)
  ...configEntries.map(e => [e.campo, e.valor, e.descripcion]),
];

const wsConfig = XLSX.utils.aoa_to_sheet(wsConfigData);
wsConfig["!cols"] = [{ wch: 22 }, { wch: 90 }, { wch: 55 }];

// ── Sheet: Instrucciones ─────────────────────────────────────────────────────
const wsInstrData = [
  ["GUÍA RÁPIDA — CATÁLOGO BANCO DE SUPLEMENTOS"],
  [""],
  ["CÓMO AGREGAR UN NUEVO PRODUCTO:"],
  ["  1. Completá una nueva fila en la hoja 'Productos' (podés copiar y pegar una fila existente)."],
  ["  2. Asigná un 'id' único (número entero no usado por ningún otro producto)."],
  ["  3. Creá un 'slug' único: solo letras minúsculas, números y guiones (ej: creatina-nova-500g)."],
  ["  4. Completá todos los campos obligatorios: name, brand, category, subcategory, image, priceNumeric."],
  ["  5. Guardá el Excel."],
  ["  6. Ejecutá 'actualizar-catalogo.cmd' en Windows (doble clic) o 'npm run catalog:update' en terminal."],
  [""],
  ["CÓMO DESACTIVAR UN PRODUCTO (sin borrarlo):"],
  ["  - Cambiá la columna 'active' de 'true' a 'false'."],
  ["  - El producto dejará de aparecer en el sitio pero sus datos se conservan."],
  [""],
  ["CÓMO ACTUALIZAR PRECIOS:"],
  ["  - Editá la columna 'priceNumeric' con el nuevo valor numérico (sin $ ni puntos)."],
  ["  - Ejemplo: 35000 para $35.000. El script formatea el precio automáticamente."],
  [""],
  ["CAMPOS OBLIGATORIOS (productos activos):"],
  ["  id, slug, name, brand, category, subcategory, image, priceNumeric"],
  [""],
  ["CAMPOS OPCIONALES:"],
  ["  imageSurface: light | transparent | dark | auto (deja vacío si no sabés)"],
  ["  imageScale: número decimal como 1.14 (escala de la imagen en el modal)"],
  ["  heroCarousel: true (muestra el producto en el carrusel del hero)"],
  ["  heroCarouselOrder: 1-5 (orden en el carrusel del hero)"],
  ["  badge: texto del badge (ej: Más Vendido, Disponible, Combo)"],
  ["  featured: true (producto destacado)"],
  ["  skipProductSnippet: true (no genera snippet de producto en SEO)"],
  ["  relatedSlugs: slugs separados por coma (ej: creatina-star-300g, shaker-ena-plus)"],
  ["  nutritionTable: nombre del archivo de tabla nutricional (ej: producto-tabla.jpg)"],
  [""],
  ["CATEGORÍAS VÁLIDAS (ver hoja Listas):"],
  ["  supplements, protein-bars, combos, accessories"],
  [""],
  ["ERRORES COMUNES:"],
  ["  ✗ IDs duplicados → asegurate de que cada producto tenga un id único"],
  ["  ✗ Slugs duplicados → cada slug debe ser único en toda la tabla"],
  ["  ✗ Slug inválido → solo letras a-z minúsculas, números y guiones (sin espacios, sin acentos)"],
  ["  ✗ relatedSlugs con slug inexistente → verificá que los slugs referenciados existan"],
  ["  ✗ Imagen no encontrada → el archivo debe estar en la carpeta raíz del proyecto"],
];

const wsInstr = XLSX.utils.aoa_to_sheet(wsInstrData);
wsInstr["!cols"] = [{ wch: 100 }];

// ── Sheet: Listas ─────────────────────────────────────────────────────────────
const wsListasData = [
  ["VALORES VÁLIDOS PARA CAMPOS CONTROLADOS"],
  [""],
  ["category",        "", "subcategory",         "", "imageSurface",  "", "active/stock/heroCarousel/featured/skipProductSnippet"],
  ["supplements",     "", "creatines",            "", "light",         "", "true"],
  ["protein-bars",    "", "proteins",             "", "transparent",   "", "false"],
  ["combos",          "", "vitamins",             "", "dark",          "", ""],
  ["accessories",     "", "protein-bars",         "", "auto",          "", ""],
  ["",                "", "integra",              "", "(dejar vacío)", "", ""],
  ["",                "", "crudda",               "", "",              "", ""],
  ["",                "", "pont",                 "", "",              "", ""],
  ["",                "", "combos",               "", "",              "", ""],
  ["",                "", "accessories",          "", "",              "", ""],
];

const wsListas = XLSX.utils.aoa_to_sheet(wsListasData);
wsListas["!cols"] = [
  { wch: 20 }, { wch: 2 }, { wch: 20 }, { wch: 2 }, { wch: 16 }, { wch: 2 }, { wch: 50 }
];

// ── Build workbook ────────────────────────────────────────────────────────────
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsProductos, "Productos");
XLSX.utils.book_append_sheet(wb, wsConfig,    "Configuracion");
XLSX.utils.book_append_sheet(wb, wsInstr,     "Instrucciones");
XLSX.utils.book_append_sheet(wb, wsListas,    "Listas");

// ── Write to disk ─────────────────────────────────────────────────────────────
const outPath = path.join(ROOT, "catalogo_productos_banco.xlsx");

if (fs.existsSync(outPath)) {
  console.log(`\n⚠️  El archivo ya existe: ${path.basename(outPath)}`);
  console.log("   Si querés sobreescribirlo, borralo manualmente y volvé a ejecutar este script.");
  process.exit(0);
}

const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(outPath, xlsxBuffer);
console.log(`\n✅ Workbook creado: ${outPath}`);
console.log(`   • ${products.length} productos volcados en la hoja 'Productos'`);
console.log(`   • ${configEntries.length} parámetros de configuración en la hoja 'Configuracion'`);
console.log(`   • Hojas adicionales: Instrucciones, Listas\n`);
console.log("   Próximos pasos:");
console.log("   1. Abrí el Excel y revisá que los datos estén correctos.");
console.log("   2. Ejecutá 'npm run catalog:update' para validar el pipeline completo.");
console.log("   3. Desde ahora, el Excel es la única fuente de datos a editar manualmente.\n");
