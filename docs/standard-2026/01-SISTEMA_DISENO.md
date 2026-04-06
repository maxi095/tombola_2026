# 🎨 Estándar 01: Sistema de Diseño (Elite DNA v5.0) ✨💎

Este documento es la fuente única de verdad para la identidad visual y los tokens técnicos de **Gestión Tómbola**. Cualquier componente nuevo debe nacer de estas leyes para mantener el estándar Premium 2026.

---

## 🌈 1. Paleta de Colores (Elite Tokens) 🏹⚖️

Los colores están centralizados para transmitir autoridad, confianza y solidez financiera.

| Categoría | Token CSS | Valor Hex | Uso Principal |
| :--- | :--- | :--- | :--- |
| **Primario** | `--primary` | `#1B3B5A` | **Navy Institucional**: Títulos, botones, Sidebar, iconos. |
| **Secundario** | `--secondary` | `#43A047` | Acentos positivos, éxitos, transacciones completadas. |
| **Terciario** | `--tertiary` | `#FFB300` | Alertas, atención, resaltado de importancia técnica. |
| **Layout** | `--bg-main` | `#F8FAFC` | **Slate 50**: Fondo general de la aplicación. |
| **Superficies** | `--bg-card` | `#FFFFFF` | Paneles, cartas y modales. |
| **Bordes** | `--border-std` | `#F1F5F9` | **Slate 100/200**: Separadores y bordes de input. |

---

## 🆎 2. Tipografía Institucional 🚀

El sistema utiliza una escala dual optimizada para lectura técnica densa y jerarquía institucional.

1.  **Manrope (Logo y Títulos)**:
    - **Uso**: `h1`, `h2`, `h3`, `h4`.
    - **Estilo**: `font-black` (900). Proyecta robustez.
2.  **Inter (Interfaz y Datos)**:
    - **Uso**: Cuerpo de texto, tablas, formularios, etiquetas.
    - **Estilo**: `font-bold` para datos, `font-medium` para metadatos.

> [!TIP]
> **Labels**: Las etiquetas de los formularios deben ser `text-[11px]`, `uppercase`, `font-black` y con `tracking-widest`. ✨💎

---

## 📐 3. Geometría y Sombras (Elite Mastery) ✨💎

### Redondeo Institucional (`rounded-premium-card`)
- **Contenedores Mayores** (Cards, Modales, FilterBar): `rounded-[32px]`.
- **Átomos Internos** (Botones, Inputs, Badges): `rounded-xl` (12px) o `rounded-2xl` (16px).

### Sombras (`shadow-premium`)
- **Base**: `shadow-[0_8px_30px_rgb(0,0,0,0.015)]`.
- **Interacción**: `shadow-xl shadow-primary/5` (en hover).

---

## 🛡️ 4. Reglas Prohibidas

- **Colores Genéricos**: Prohibido usar `text-blue-500` o `bg-red-500` nativo. Siempre usar clases corporativas o tokens del `:root`.
- **Bordes Irregulares**: Ningún componente debe salirse de la escala de 12px/16px/32px.
- **Aire Residual**: En vistas operativas de alta densidad, usar patrón **Zero-Air** (`p-0`).

---
**Actualización Letal:** Abril 2026 | **Hito:** Unificación Total del Canon Documental.
