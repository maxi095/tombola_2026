# 🎨 UI/UX Standard 2026: Gestión Tómbola (Multi-Dispositivo)

**Estado:** Estándar Oficial Vigente  
**Última actualización:** 2026-11-01

Este documento consolida todos los manuales visuales previos (`01` al `09` de `docs/legacy/` y `GUIA_UX_UI_2026.md`) y los expande para soportar los **4 contextos de uso reales** del proyecto:
1. **Paneles Administrativos (Notebook HD 1366px):** Alta densidad (*Zero-Air*) y **Cero Scroll Horizontal**.
2. **Portal Mobile / PWA (Vendedores y Directiva en Celular):** *Touch-First*, tarjetas compactas y navegación ágil.
3. **Pantallas de Proyección / TV (1080p):** 100vh sin scroll, alto impacto visual y lectura a distancia.
4. **Landing Pública:** Moderna, rápida y orientada a la consulta de cartones y difusión del club.

---

## 🎨 1. ADN Visual, Paleta y Tipografía

### Tokens de Color (`client/src/index.css`)
* **Primario (Navy Institucional):** `#1B3B5A` (`text-primary`, `bg-primary`, `--color-primary`).
* **Secundario (Éxito / Cobrado):** `#43A047` / `emerald-600`.
* **Terciario (Alerta / Pendiente):** `#FFB300` / `amber-500`.
* **Peligro (Anulada / Vencida):** `rose-600` / `red-600`.
* **Superficies:** Fondo general `#F8FAFC` (`bg-slate-50`), tarjetas en `#FFFFFF` con borde `border-slate-200/80`.

### Dualidad Tipográfica
* **Títulos y KPIs (`Manrope`):** Peso `font-black` (800/900), `tracking-tight`. Usado en `<PageHeader />`, montos destacados y encabezados de tarjeta.
* **Datos, Tablas y Formularios (`Inter`):** Alta legibilidad numérica (`tabular-nums` en importes, fechas y números de cartón).

### Reglas de Formateo (`client/src/libs/formatters.js`)
* **Moneda en Lectura:** Usar siempre `formatCurrency(val)` (`$ 1.234,56`, locale `es-AR`).
* **Documentos y Cantidades:** Usar `formatDocument(dni)` / `formatNumber(num)` (`20.123.456`).
* **Inputs de Moneda en Formularios (Limpia Interna / Embellece Externa):**
  * El usuario ve miles con puntos mientras escribe (`formatCurrencyInput`), y al estado de React / backend viaja el número limpio (`cleanCurrencyInput`). Prohibido usar `<input type="number">` crudo para importes monetarios.

---

## 💻 2. Estándar para Notebook HD (1366×768px) — Cero Scroll Horizontal

El operador administrativo trabaja en pantallas de **1366px de ancho**. El espacio horizontal y vertical es sagrado:

### 2.1 Arquitectura de Layout y Z-Index
* **Internal Scroll Layout:** `.app-layout` y `.main-container` mantienen `height: 100vh; overflow: hidden`. Solo `.content-area` tiene `overflow-y: auto` y `overflow-x: hidden`.
* **Sidebar Elástico (Ghost Hover):** Colapsado ocupa `70px` (`structuralWidth`), expandido `220px`. Al hacer hover estando colapsado se despliega en superposición sin empujar ni achicar el área de trabajo.
* **Jerarquía Z-Index Oficial:**
  * `z-30`: `FilterBar` y barras de herramientas locales.
  * `z-[48]`: `PageHeader` sticky (`top-0`).
  * `z-50`: `BarraTareas` superior.
  * `z-[60]`: `Sidebar` elástico.
  * `z-[100]`: `Modal`, `ConfirmModal`, portales de `Select` y `Toast`.
  * `z-[200]`: `Tooltip`.

### 2.2 Reglas para Evitar el Scroll Horizontal (Anti-Overflow)
1. **Presupuesto de Columnas:** Ninguna tabla administrativa debe mostrar más de **6 a 7 columnas simultáneas** por defecto en 1366px.
2. **Agrupación en Celdas Atómicas (`Table.jsx`):** En lugar de crear dos columnas separadas (ej. `"Nombre"` y `"DNI"`, o `"Cartón"` y `"Edición"`), agrupar siempre en dos líneas dentro de una misma celda atómica:
   * `OperationCell`: Número de operación (`#00124`) + fecha/subtítulo.
   * `StockCell`: Número de cartón (`main`) + Edición (`sub`).
   * `UserCell`: Nombre completo (`name`) + DNI o localidad (`sub`), con `variant="primary"` para Asociados y `variant="secondary"` para Vendedores.
   * `AmountCell`: Importe formateado alineado a la derecha (`text-right font-bold tabular-nums`).
3. **Tablas dentro de Cards Parciales (`col-span-2`, Modales o Detalles):**
   * Cuando `<Table />` se use dentro de una columna angosta (como la tabla de cheques en `SellerPaymentView.jsx`), **no debe forzar `min-w-[800px]`**; debe adaptarse al `w-full` del contenedor para evitar barras de scroll horizontales internas.
4. **Grillas de Sub-ítems en Formularios (ej. Cheques):**
   * Prohibido apilar 5 o 6 inputs en una sola fila `flex-row` rígida que se aplasta en 1366px. Usar siempre `grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3` con anchos fluidos (`w-full`).

### 2.3 Estructura Canónica de Listados (Zero-Air)
```jsx
<PageHeader title="Gestión de ..." compact={true} stats={[...]} actions={[...]} />
<div className="elite-audit-bar">
  <FilterBar variant="slim" activeFilters={...} onClearFilters={...}>...</FilterBar>
  <ColumnPicker ... />
</div>
<Card padding="p-0">
  <Table>...</Table>
  <Pagination ... />
</Card>
```
* **Columna `ACCIONES` Blindada:** Gestionada con `useTableColumns(pageKey, initialColumns)` marcando `{ key: 'actions', label: 'ACCIONES', isFixed: true, isMandatory: true }`. Botones de acción siempre visibles (`Button variant="ghost" size="sm"` + `<Tooltip position="left">`).

---

## 📱 3. Estándar Mobile / PWA (Vendedores y Directiva en Celular)

Para las vistas destinadas a **Vendedores en la calle** y **Directiva** (`viewport < 768px`):

1. **Prohibido usar Tablas Anchas en Mobile:**
   * En resoluciones móviles (`< md`), las listas de cartones asignados, cuotas o ventas deben renderizarse como **Tarjetas Compactas Accionables (`MobileCardList`)** con la información clave en 2 filas (Arriba: N° Cartón + Badge de Estado; Abajo: Asociado + Monto/Acción rápida).
2. **Ergonomía Touch-First:**
   * Área táctil mínima de botones e inputs: **`44px` de alto (`min-h-[44px]`)**.
   * Navegación inferior fija (**Bottom Navigation Bar**) de 3 a 4 accesos directos para el Vendedor (*Mis Cartones*, *Nueva Venta*, *Cobros/Cuotas*, *Mis Rendiciones*).
3. **Inputs Nativos Amigables en Teclado Móvil:**
   * Usar `inputMode="numeric"` en campos de DNI, teléfono, número de cartón e importes para abrir directamente el teclado numérico del celular en Android/iOS.

---

## 📺 4. Estándar para Pantallas de Presentación y Sorteo Público (Vistas de TV)

Exclusivo para interfaces proyectadas en televisores (`BingoCardStatusPage.jsx`, `DrawWinnersDisplayPage.jsx`):
1. **Viewport 100vh Fijo:** Contenedor principal `h-screen overflow-hidden flex flex-col justify-between`. Prohibido el scroll vertical u horizontal.
2. **Fondos y Contraste:** Degradados radiales vibrantes con destellos (`@keyframes sparkle-blink`), tarjetas de ganador con borde dorado (`#FFD700`) y tipografías blancas/amarillas con sombra perimetral de alto contraste para lectura a más de 5 metros.
3. **Controles del Operador Ocultos:** La barra de cambio de modalidad (`Sorteo Cuota al Día` / `Sorteo Pago de Contado`) y edición permanece oculta en el borde superior (`-translate-y-full hover:translate-y-0`) para no ensuciar la transmisión en vivo.
4. **Barra de Auspiciantes:** Fija al pie (`12vh`) con fondo blanco sólido, logos en `object-contain` y pestaña diagonal naranja `AUSPICIAN:`.

---

## 🧩 5. Catálogo Oficial de Componentes Atómicos (`client/src/components/ui/`)

Queda prohibido recrear con HTML/Tailwind manual lo que ya resuelven estos componentes:

| Componente | Uso Obligatorio |
| :--- | :--- |
| `PageHeader.jsx` | Cabecera sticky de toda página administrativa (`title`, `subtitle`, `stats`, `actions`, `compact`). |
| `FilterBar.jsx` | Barra de filtros colapsable (`variant="slim"`, `activeFilters`, `onRemoveFilter`, `onClearFilters`). |
| `ColumnPicker.jsx` + `useTableColumns.js` | Selector de visibilidad/orden de columnas con persistencia en `localStorage`. |
| `Table.jsx` | `Table`, `THead`, `TBody`, `TR`, `TH`, `TD` + `OperationCell`, `StockCell`, `UserCell`, `AmountCell`. |
| `card.jsx` (`Card`) | Contenedor de secciones (`padding="p-0"` en tablas, `size="slim"` en formularios). |
| `FormGrid.jsx` | Grilla responsiva de formularios (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). |
| `InputField.jsx` | Inputs de texto/fecha/número con label, icono, prefijo y mensaje de error integrado. |
| `Select.jsx` / `MultiSelect.jsx` | Selectores basados en `react-select` con `menuPortalTarget={document.body}` (evita recortes por `overflow: hidden`). |
| `Button.jsx` | Botones con estado `loading`, icono y variantes (`primary`, `outline`, `ghost`, `danger`). |
| `Badge.jsx` | Etiquetas semánticas de estado (`success`, `warning`, `danger`, `primary`, `secondary`, `info`). |
| `Modal.jsx` / `ConfirmModal.jsx` | Diálogos modales y confirmaciones destructivas (reemplaza el 100% de `window.confirm` y `alert`). |
| `Toast.jsx` + `useFeedback` | Notificaciones flotantes reactivas (`showToast(msg, type)`). |
| `Tabs.jsx`, `Tooltip.jsx`, `EmptyState.jsx`, `LoadingOverlay.jsx`, `KPICard.jsx`, `InfoItem.jsx`, `ModalSummary.jsx` | Componentes de soporte para vistas de detalle, tableros y carga. |

---

## 🗣️ 6. Glosario de Wording Semántico

| Contexto | Wording Oficial (Obligatorio) | Prohibido Usar |
| :--- | :--- | :--- |
| **Título de Listado** | `Gestión de [Entidad Plural]` *(ej. Gestión de Ventas)* | *Lista de..., Administración de..., Panel de...* |
| **Título de Alta** | `Registrar [Entidad Singular]` *(ej. Registrar Pago de Vendedor)* | *Nuevo..., Crear..., Alta de...* |
| **Título de Edición** | `Editar [Entidad Singular]` | *Modificar..., Actualizar...* |
| **Título de Vista/Detalle** | `Detalle de [Entidad Singular]` | *Ver..., Información de...* |
| **Botón de Ir a Alta (en Listado)** | `Crear [Entidad Singular]` | *Nuevo, Agregar, + Añadir* |
| **Botón de Submit (en Formulario)** | `Guardar [Entidad]` o `Guardar cambios` | *Enviar, Aceptar, Procesar, Crear Pago* |
| **Botón de Regreso** | `Volver` | *Cancelar, Regresar, Atrás* |
| **Estado de Baja Contable** | `Anulada` / `Anulado` | *Cancelada, Cancelado, Borrada* |
| **Término de Comprador** | `Asociado` (en UI) / `Client` (en código) | *Socio, Comprador* (en etiquetas de tablas) |
| **Término de Cartón** | `Cartón` o `Solicitud` (en actas/TV) | *Boleto, Rifa, Ticket* |
