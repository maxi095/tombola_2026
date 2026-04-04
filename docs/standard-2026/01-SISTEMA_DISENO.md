# 🎨 Sistema de Diseño: Premium 2026 v2

Este documento define la identidad visual y los tokens técnicos del sistema "Gestión Tómbola". Cualquier cambio en la UI debe adherirse estrictamente a estos valores para mantener la coherencia institucional.

## 🌈 Paleta de Colores (Tokens CSS)

Los colores están definidos en `client/src/index.css` bajo el bloque `:root`. No usar colores hexadecimales directos en los componentes; usar las variables o clases de utilidad de Tailwind vinculadas.

| Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| `--primary` | `#1B3B5A` | Color corporativo principal, Sidebar, Botones Primarios. |
| `--secondary` | `#43A047` | Acentos positivos, éxitos, transacciones completadas. |
| `--tertiary` | `#FFB300` | Alertas, atención, resaltado de importancia técnica. |
| `--bg-main` | `#F8FAFC` | Fondo general de la aplicación (Slate 50). |
| `--text-main` | `#1B3B5A` | Títulos y texto de alto contraste. |
| `--text-muted` | `#64748B` | Textos secundarios, descripciones, placeholders. |

## 📁 Tipografía

El sistema utiliza fuentes de Google Fonts (importadas en `index.css`):

1.  **Manrope (700/800)**: Exclusiva para títulos (`h1`, `h2`, `h3`, `h4`) y logotipos. Brinda un aspecto robusto y moderno.
2.  **Inter (400/500/600/700)**: Para todo el cuerpo de texto, formularios, tablas y navegación. Optimizada para lectura técnica y densa.

```css
/* Ejemplo de aplicación */
h1 { font-family: 'Manrope', sans-serif; font-weight: 800; }
body { font-family: 'Inter', sans-serif; }
```

## 📐 Estándares de Diseño (UI Rules)

### Bordes y Sombras
- **Border Radius**: Usar mayoritariamente `rounded-xl` (12px) y `rounded-2xl` (16px). Para botones y inputs, `rounded-xl` es el estándar.
- **Shadows**: Basadas en `shadow-sm` con tintes del color primario para una apariencia de "elevación suave".

### Botones (Clases CSS)
- `.btn-primary-cl`: El estilo definitivo para acciones principales.
  - Fondo: `#1B3B5A`.
  - Hover: Brillo 1.2 y elevación leve (`translate-y-[-1px]`).

### Tablas (`.modern-table`)
- Cabeceras en `uppercase`, `slate-500`, y fuente de 0.75rem.
- Filas con padding vertical de `1.25rem` para dar "aire" a los datos.

> [!WARNING]
> **Prohibición de Colores Genéricos**: Queda prohibido el uso de rojos, verdes o azules básicos (`text-red-500`, etc.) sin consultar si existe un token superior en el manual de identidad.
