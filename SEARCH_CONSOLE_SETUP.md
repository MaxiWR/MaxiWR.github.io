# Google Search Console — Pasos de verificación

Complete estos pasos **después** de publicar el sitio en la URL de producción final.

---

## Paso 1 — Determinar la URL de producción

Hay dos opciones:

### Opción A: Dominio personalizado
```
https://www.bancodesuplementos.com.ar
```

### Opción B: URL de GitHub Pages (sin dominio personalizado)
```
https://USERNAME.github.io/NOMBRE-DEL-REPOSITORIO
```

Reemplazá `USERNAME` con tu usuario de GitHub y `NOMBRE-DEL-REPOSITORIO` con el nombre exacto del repositorio.

---

## Paso 2 — Actualizar `[FINAL_SITE_URL]` en todos los archivos

Una vez que conocés la URL de producción, reemplazá `[FINAL_SITE_URL]` en:

- `data/site-config.json` → campo `siteUrl`
- `index.html` → canonical, OG tags, structured data (buscar `[FINAL_SITE_URL]`)
- `robots.txt` → línea Sitemap

Luego regenerá las páginas de producto:
```bash
node scripts/generate-product-pages.mjs
```

Esto actualizará automáticamente `productos/*.html` y `sitemap.xml` con las URLs correctas.

---

## Paso 3 — Crear la imagen OG

La imagen de Open Graph no existe todavía. Creá una imagen de **1200 × 630 px** en formato WebP:

```
images/banco-suplementos-og.webp
```

Requisitos:
- Branding legible (nombre, logo)
- Sin texto importante cerca de los bordes extremos
- Tamaño de archivo razonable (< 200 KB idealmente)

Para convertir una imagen existente a WebP con calidad 82:
```bash
cwebp -q 82 imagen.png -o banco-suplementos-og.webp
# o con ImageMagick:
magick imagen.png -quality 82 banco-suplementos-og.webp
```

---

## Paso 4 — Publicar el sitio

Hacé push del repositorio a GitHub Pages con todos los cambios:
- `index.html` actualizado
- `productos/*.html` generados
- `sitemap.xml` actualizado
- `robots.txt`
- Imágenes renombradas

---

## Paso 5 — Verificar en Google Search Console

1. Abrí [Google Search Console](https://search.google.com/search-console/).
2. Hacé clic en **Agregar propiedad**.
3. Elegí el tipo de propiedad:
   - **Prefijo de URL** (para URL de GitHub Pages): ingresá la URL completa de producción.
   - **Dominio** (si usás dominio personalizado): verificación por DNS es más robusta.

4. Para verificación por **etiqueta HTML** (recomendada para GitHub Pages):
   - Seleccioná el método "Etiqueta HTML".
   - Google te dará un tag como:
     ```html
     <meta name="google-site-verification" content="TOKEN_REAL_AQUI">
     ```
   - Abrí `index.html` y reemplazá el placeholder:
     ```html
     <!-- Antes -->
     <meta name="google-site-verification" content="REPLACE_WITH_REAL_SEARCH_CONSOLE_TOKEN">
     <!-- Después -->
     <meta name="google-site-verification" content="TOKEN_REAL_AQUI">
     ```
   - Hacé push y desplegá el sitio.
   - Confirmá que el tag aparece en el HTML fuente de la página en vivo.
   - Hacé clic en **Verificar** en Search Console.

5. Para verificación por **DNS** (si tenés dominio personalizado):
   - Seleccioná "Proveedor de dominio".
   - Seguí las instrucciones para agregar el registro TXT en tu DNS.
   - Puede demorar hasta 24 h en propagarse.

---

## Paso 6 — Enviar el sitemap

1. En Search Console, en el panel izquierdo: **Índice → Sitemaps**.
2. Ingresá la URL completa:
   ```
   [FINAL_SITE_URL]/sitemap.xml
   ```
3. Hacé clic en **Enviar**.
4. Verificá que el estado sea "Éxito" y que el número de URLs descubiertas sea 25.

---

## Paso 7 — Inspeccionar URLs clave

Con la herramienta **Inspección de URL** en Search Console:

1. Inspeccioná la homepage:
   ```
   [FINAL_SITE_URL]/
   ```
2. Inspeccioná 2–3 páginas de producto, por ejemplo:
   ```
   [FINAL_SITE_URL]/productos/creatina-star-300g.html
   [FINAL_SITE_URL]/productos/whey-gentech-500g-chocolate.html
   [FINAL_SITE_URL]/productos/barrita-pont.html
   ```
3. Para cada URL: hacé clic en **Solicitar indexación** solo si la URL está correcta y el contenido en vivo es el esperado.

---

## Paso 8 — Probar datos estructurados

Usá la herramienta oficial de Google:
[Rich Results Test](https://search.google.com/test/rich-results)

Probá estas páginas de producto (con precio numérico real):
- `productos/creatina-star-300g.html`
- `productos/whey-gentech-500g-chocolate.html`
- `productos/shaker-ena-plus.html`

La página `productos/combo-proteina-creatina-gentech.html` **no tiene** snippet de Producto porque el precio es "Consultar" — esto es correcto e intencional.

---

## Paso 9 — Monitoreo continuo

En Search Console revisá periódicamente:
- **Rendimiento**: impresiones, clics, posición promedio.
- **Cobertura**: URLs indexadas vs. con errores.
- **Mejoras**: estado de los datos estructurados.
- **Experiencia**: Core Web Vitals (LCP, FID, CLS).

---

## Notas importantes

- No afirmes que Search Console está configurado hasta completar la verificación real.
- El dominio personalizado requiere configuración adicional en el DNS y en el repositorio (`CNAME` file en GitHub Pages).
- Las páginas de producto con precio "Consultar" (actualmente solo `combo-proteina-creatina-gentech`) no califican para snippet de Producto. Actualizá `data/products.json` con un `priceNumeric` real y regenerá cuando el precio esté definido.
