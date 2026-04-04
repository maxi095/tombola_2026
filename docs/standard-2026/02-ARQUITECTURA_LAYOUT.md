# 🏗️ Arquitectura de Layout: Premium 2026 v3 (Internal Scroll)

Este documento explica la estructura definitiva del "shell" de la aplicación, optimizada para dashboards complejos y cabeceras persistentes (sticky).

## 📐 Estructura de Scroll Interno (`App.jsx` + `index.css`)

A diferencia de las versiones anteriores, el estándar V3 utiliza un **Layout de Scroll Interno**. Esto significa que la ventana principal no tiene scroll; en su lugar, solo el área de contenido (`main`) permite el desplazamiento vertical.

### Componentes de la Jerarquía:

1.  **Root Container (`app-layout`)**: 
    - `height: 100vh`, `overflow: hidden`.
    - Actúa como el marco fijo de la aplicación.
2.  **Sidebar (Lateral Izquierdo)**: 
    - `fixed`, `h-full`. Anclado a la izquierda.
3.  **Main Container (`main-container`)**: 
    - `flex-1`, `flex flex-col`, `height: 100vh`, `overflow: hidden`.
    - Contiene el Header Global y el Área de Rutas.
4.  **Header Global (`BarraTareas`)**: 
    - `h-16 (64px)`, `sticky top-0`, `z-50`.
    - Se mantiene estático por encima del flujo de contenido.
5.  **Área de Contenido (`content-area`)**: 
    - `flex-1`, `overflow-y: auto`.
    - **Es el único elemento que genera scroll**.

## 📋 Ventajas del Scroll Interno

- **Predictibilidad Sticky**: Cualquier elemento dentro de una página con `sticky top-0` se anclará exactamente debajo de la barra de tareas global, sin necesidad de calcular offsets complejos de píxeles.
- **Estabilidad Visual**: El Sidebar y el Header no se mueven ni parpadean durante el scroll, eliminando el "ruido" visual y mejorando la sensación de robustez.

## 🛡️ Reglas de Z-Index v3

| Componente | Z-Index | Motivo |
| :--- | :--- | :--- |
| BarraTareas Global | `50` | Debe estar sobre todo, incluyendo las cabeceras de página. |
| Sidebar | `40` | Navegación principal siempre accesible. |
| Page Action Bar (Sticky) | `40` | Se ancla al top-0 del scrollable area. |
| Modales / Overlays | `100+` | Bloqueadores de interfaz. |

> [!IMPORTANT]
> **Offset de Sticky**: Gracias al Internal Scroll Layout, las páginas individuales NO deben usar offsets como `top-[64px]`. Deben usar `top-0`, ya que el contenedor de rutas empieza exactamente donde termina el Header Global.

---
*Actualizado el 03 de abril de 2026 - Modernización Gestión Tómbola*
