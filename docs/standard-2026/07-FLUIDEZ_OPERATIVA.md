# ⚖️ Estándar 07: Fluidez Operativa (V9.0) ✨🚀

Este estándar define los mecanismos de adaptabilidad elástica para garantizar que el sistema sea una herramienta de alto rendimiento en cualquier resolución, priorizando siempre la visibilidad de los datos masivos.

## ⚓ Pilares de la Fluidez Operativa

### 1. Sidebar Elástico (Modo Ghost) 🛡️
El Sidebar debe permitir una transición fluida entre dos estados:
- **Expandido (260px)**: Muestra iconos + etiquetas de texto. Ideal para inducción y navegación pausada.
- **Colapsado (70px)**: Muestra solo iconos con `tooltips` (opcional). Maximiza el ancho disponible para tablas y grillas complejas. ✨💎

**Regla de Persistencia**: El estado debe gestionarse mediante `LayoutContext` y persistirse en `localStorage` bajo la clave `sidebar_collapsed_2026`. 🚀

### 2. Filtros de Acordeón (Smart-Filter) 🏹⚖️
Las barras de filtrado (`FilterBar`) no deben ser bloques estáticos que "roben" espacio vertical.
- **Header Técnico**: Debe incluir un botón de colapso (Chevron) y un indicador de "Filtros Activos".
- **Comportamiento**: Al colapsar, se deben liberar al menos 150px-180px de espacio vertical, permitiendo que la tabla principal suba ("Reflow"). ✨💎

### 3. Trazabilidad Above-the-Fold 🚀
En resoluciones HD (1366px), el objetivo es visualizar al menos **8 a 10 registros** de una tabla sin necesidad de scroll, aplicando:
- Colapso de Sidebar.
- Colapso de Filtros.
- Densidad **Elite Zero-Air** en filas.

---

## 🛠️ Implementación Técnica (Contexto)

```javascript
const { isSidebarCollapsed, toggleSidebar, isFilterExpanded, toggleFilters } = useLayout();
```

- `isSidebarCollapsed`: Controla el ancho del sidebar y el margen del contenedor principal.
- `isFilterExpanded`: Controla la altura máxima y opacidad del componente `FilterBar`.

---

> [!IMPORTANT]
> **Prioridad de Datos**: Ante la duda entre estética y visibilidad de datos, el estándar V9.0 siempre dicta **colapsar elementos decorativos** para favorecer el área de trabajo operativa. 🏹⚖️✨🚀
