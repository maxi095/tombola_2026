# Estrategia de Migración y Desconexión Legacy CSS

Este documento detalla la metodología utilizada para armonizar la herencia visual de la aplicación con el nuevo Design System **Premium 2026** sin comprometer la estabilidad operativa.

## 1. Diagnóstico del Estado Inicial (Legacy)

Se detectaron múltiples archivos en `client/src/assets/css/` (con `theme.css` a la cabeza) que operaban bajo una lógica de **colores hardcoded** y capas duplicadas de Tailwind.

### Riesgos Identificados:
- **Colisión de Colores**: Clases como `.btn-primary` usaban azul brillante (#2563eb), ignorando la identidad Navy Institucional.
- **Conflictos de PostCSS**: La duplicidad de directivas `@tailwind` causaba fallos de compilación con errores de `Internal Server Error`.
- **Efecto Cascada Inverso**: Al cargarse `theme.css` después de `index.css`, los estilos antiguos "aplastaban" a los modernizados.

## 2. La Estrategia: "El Puente Cromático"

En lugar de una eliminación masiva (invasiva), se implementó una **Sincronización Silenciosa** (Bridge Pattern).

### Acciones Realizadas:
1.  **Neutralización de Capas**: Se eliminaron las directivas `@tailwind` de todos los archivos secundarios para que solo `index.css` sea el "motor" único.
2.  **Inyección de ADN Navy**: Se modificó `Global.css` para centralizar la variable `--primary-color: #1B3B5A;`.
3.  **Vinculación Funcional**: Se modificó `theme.css` y `Home.css` para que referencien `var(--color-primary)` en lugar de valores fijos.

> [!TIP]
> **Resultado**: El Login y el Home se volvieron Navy instantáneamente, manteniendo su estructura antigua (radios de 4px, etc.) pero con el nuevo color de marca.

## 3. Hoja de Ruta de Desconexión (Refactoring)

La inactivación de los archivos legacy se hará **Módulo por Módulo**:

| Estado | Módulo | Acción en CSS | Componentes Usados |
| :--- | :--- | :--- | :--- |
| ✅ | **Usuarios** | Refactorizado | `<Button>`, `<Card>`, `<InputField>`, `<PageHeader>` |
| ✅ | **Home & Login** | Refactorizado | `<Button>`, `<Card>`, `<InputField>` |
| 🔄 | **Ventas / Ediciones** | Pendiente | Legacy Classes (Navy vía Puente) |

### Procedimiento para modernizar un nuevo módulo:
1.  Identificar la página y sus dependencias de `assets/css`.
2.  Reemplazar el maquetado HTML por componentes de la librería `client/src/components/ui/`.
3.  Eliminar el `import '../assets/css/...'` del componente modernizado.
4.  **Si es el último componente que lo usa**: Borrar físicamente el archivo CSS de la carpeta assets.

## 4. Blindaje de Reportes (Impresión)

Se ha decidido **NO desconectar** las reglas de `@media print` de `theme.css` hasta que se cree una librería de utilidades de impresión específica para Premium 2026. Estas reglas son críticas para la operatividad actual.

---
**Actualizado:** Abril 2026 | **Responsable:** Antigravity (AI Architect)
