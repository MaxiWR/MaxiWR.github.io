# Guía del Catálogo Excel — Banco de Suplementos

## Cómo funciona el sistema

El único archivo que editás a mano es el Excel:

```
catalogo_productos_banco.xlsx
```

Cuando guardás cambios en el Excel y ejecutás el actualizador, el sistema:

1. Lee el Excel y valida todos los datos
2. Genera `products.json` y `site-config.json` automáticamente
3. Regenera todas las páginas HTML de productos
4. Valida que todo esté correcto
5. El deploy a GitHub Pages publica los cambios al sitio en vivo

**Nunca editás `products.json` directamente.** Es un archivo generado.

---

## Actualizar el catálogo (Windows)

Después de editar y guardar el Excel, hacé doble clic en:

```
actualizar-catalogo.cmd
```

Eso corre el proceso completo y te muestra si hay errores. Si todo sale bien, subí los cambios a GitHub para publicar en el sitio.

### Alternativa desde terminal

```bash
npm run catalog:update
```

---

## Hojas del Excel

### Productos (hoja principal)

Los encabezados están en la **fila 4**. Los datos empiezan en la **fila 5**.

| Columna | Obligatorio | Descripción |
|---|---|---|
| `id` | Sí | Número entero único por producto |
| `slug` | Sí | URL del producto: solo `a-z`, `0-9` y `-` |
| `active` | Sí | `true` = visible en el sitio / `false` = oculto |
| `stock` | Sí | `true` = con stock / `false` = sin stock |
| `name` | Sí | Nombre del producto |
| `brand` | Sí | Marca |
| `category` | Sí | Ver hoja Listas |
| `subcategory` | Sí | Ver hoja Listas |
| `priceNumeric` | Sí | Precio como número sin `$` ni `.` (ej: `30000`) |
| `image` | Sí | Nombre del archivo de imagen (ej: `producto.webp`) |
| `imageSurface` | No | `light`, `transparent`, `dark` o `auto` |
| `imageScale` | No | Escala visual en el modal (ej: `1.14`) |
| `heroCarousel` | No | `true` si aparece en el carrusel del hero |
| `heroCarouselOrder` | No | Posición en el carrusel (1–5) |
| `badge` | No | Texto del badge (ej: `Más Vendido`) |
| `featured` | No | `true` = producto destacado |
| `skipProductSnippet` | No | `true` = no genera snippet de producto para SEO |
| `description` | No | Descripción del producto |
| `presentation` | No | Presentación (ej: `300g en polvo`) |
| `flavor` | No | Sabor (ej: `Chocolate`) |
| `servings` | No | Porciones (ej: `60`) |
| `goal` | No | Objetivo (ej: `Fuerza y Potencia`) |
| `howToUse` | No | Cómo usar el producto |
| `goalDescription` | No | Descripción del objetivo |
| `nutritionTable` | No | Archivo de tabla nutricional (ej: `producto-tabla.jpg`) |
| `relatedSlugs` | No | Slugs de productos relacionados, separados por coma |
| `whatsapp` | No | URL de WhatsApp para este producto |
| `instagram` | No | URL de Instagram para este producto |

### Configuracion

Parámetros del sitio. No modifiques la columna `campo`. Solo editá la columna `valor`.

### Instrucciones

Guía rápida de referencia. No afecta al sitio.

### Listas

Valores válidos para los campos controlados.

---

## Agregar un producto nuevo

1. Abrí el Excel en la hoja **Productos**
2. En la primera fila vacía después del último producto, completá:
   - `id`: el número siguiente al más alto (revisá los ids existentes)
   - `slug`: único, solo minúsculas, sin espacios ni acentos (ej: `proteina-iso-gentech-1kg`)
   - `active`: `true`
   - `stock`: `true`
   - `name`, `brand`, `category`, `subcategory`
   - `priceNumeric`: solo el número (ej: `45000`)
   - `image`: nombre del archivo de imagen que pusiste en la raíz del proyecto
3. Guardá el Excel
4. Ejecutá `actualizar-catalogo.cmd`
5. Subí los cambios a GitHub

---

## Dar de baja un producto (sin borrarlo)

Cambiá la columna `active` de `true` a `false`. El producto desaparece del sitio pero conserva todos sus datos.

---

## Cambiar un precio

Editá la columna `priceNumeric` con el nuevo valor (sin `$` ni puntos). El script formatea el precio automáticamente como `$XX.XXX`.

---

## Errores comunes

### "id duplicado"
Cada producto debe tener un id único. Buscá el id que se repite y cambiá uno.

### "slug duplicado"
Cada slug debe ser único. Revisá si ya existe un producto con ese slug.

### "slug inválido"
El slug solo puede contener letras `a-z` minúsculas, números y guiones (`-`). Sin espacios, sin acentos, sin mayúsculas.

### "imagen no encontrada"
El archivo de imagen debe estar en la carpeta raíz del proyecto con exactamente el nombre escrito en la columna `image`. Verificá la extensión (`.jpg`, `.png`, `.webp`).

### "relatedSlug inexistente"
Un slug en la columna `relatedSlugs` no coincide con ningún producto existente. Revisá que esté bien escrito.

---

## Comandos disponibles

```bash
# Pipeline completo: Excel → JSON → páginas → validación
npm run catalog:update

# Solo importar Excel a JSON
npm run catalog:import

# Solo generar páginas desde products.json
npm run catalog:generate

# Solo validar (después de generar)
npm run catalog:validate

# Construir _site/ para deploy manual
npm run pages:prepare

# Build completo (catalog:update + pages:prepare)
npm run build
```

---

## Estructura del proyecto

```
├── catalogo_productos_banco.xlsx   ← ÚNICO archivo que editás manualmente
├── products.json                   ← GENERADO (no editar)
├── site-config.json                ← GENERADO (configuración del sitio)
├── index.html                      ← Homepage (editar a mano si hace falta)
├── *.html                          ← GENERADOS (páginas de producto)
├── sitemap.xml                     ← GENERADO
├── scripts/
│   ├── import-products-from-excel.mjs   ← Lee el Excel, escribe los JSON
│   ├── generate-product-pages.mjs       ← Genera las páginas HTML
│   ├── validate-catalog.mjs             ← Valida todo antes de publicar
│   └── prepare-pages-artifact.mjs       ← Construye _site/ para deploy
├── _site/                          ← GENERADO (deploy artifact, no subir a git)
├── .catalog-backups/               ← Backups automáticos (no subir a git)
└── .github/workflows/deploy.yml   ← Deploy automático en cada push a main
```

---

## Deploy automático

Cada `git push` a la rama `main` activa GitHub Actions que:
1. Instala las dependencias (`npm ci`)
2. Corre el pipeline completo (import → generate → validate → prepare)
3. Publica `_site/` en GitHub Pages

Si hay errores de validación, el deploy se cancela y el sitio no se actualiza.
