@echo off
setlocal
title Actualizar Catalogo - Banco de Suplementos
color 0A

echo.
echo  ============================================================
echo   BANCO DE SUPLEMENTOS - Actualizador de Catalogo
echo  ============================================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js no esta instalado.
    echo  Instalalo desde https://nodejs.org/ y vuelve a intentarlo.
    echo.
    pause
    exit /b 1
)

if not exist "catalogo_productos_banco.xlsx" (
    echo  ERROR: No se encontro 'catalogo_productos_banco.xlsx'
    echo  Asegurate de que el archivo Excel este en la misma carpeta que este script.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  Instalando dependencias por primera vez...
    npm install
    if errorlevel 1 (
        echo  ERROR al instalar dependencias.
        pause
        exit /b 1
    )
    echo.
)

echo  Paso 1/3: Importando datos desde Excel...
node scripts/import-products-from-excel.mjs catalogo_productos_banco.xlsx
if errorlevel 1 (
    echo.
    echo  ERROR en la importacion. Corregi los errores en el Excel y vuelve a intentarlo.
    echo.
    pause
    exit /b 1
)

echo.
echo  Paso 2/3: Generando paginas de productos...
node scripts/generate-product-pages.mjs
if errorlevel 1 (
    echo.
    echo  ERROR generando paginas.
    pause
    exit /b 1
)

echo.
echo  Paso 3/3: Validando catalogo...
node scripts/validate-catalog.mjs
if errorlevel 1 (
    echo.
    echo  ERROR de validacion. Revisa los mensajes de error arriba.
    pause
    exit /b 1
)

echo.
echo  ============================================================
echo   Listo! El catalogo se actualizo correctamente.
echo   Subilo a GitHub para que los cambios se publiquen en el sitio.
echo  ============================================================
echo.
pause
