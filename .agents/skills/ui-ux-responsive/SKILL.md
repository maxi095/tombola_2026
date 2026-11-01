---
name: ui-ux-responsive
description: Ingeniería de interfaz adaptativa multi-dispositivo (inspirada en frontend-ui-engineering de Addy Osmani + Standard 2026 de Gestión Tómbola). Usala para diseñar, auditar o corregir pantallas para Notebook HD 1366px (Cero Scroll Horizontal), Mobile PWA para Vendedores/Directiva, Vistas TV 100vh y Landing Pública.
---

# 🎨 UI/UX Responsive Engineering (Desktop 1366px + Mobile PWA + TV + Landing)

Esta skill aplica ingeniería de interfaz de alta precisión siguiendo [`docs/UI_UX_STANDARD.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/UI_UX_STANDARD.md) y las mejores prácticas de `frontend-ui-engineering`.

---

## 🖥️ 1. Reglas para Paneles Administrativos (Notebook HD 1366×768px)

El problema #1 en notebooks de 1366px es el desborde horizontal y el desperdicio vertical:
1. **Cero Scroll Horizontal (`overflow-x-hidden`):**
   - Ninguna tabla o grilla puede forzar scroll horizontal en la ventana ni dentro de una `<Card />`.
   - En tablas dentro de contenedores parciales (`lg:col-span-2`, modales o pestañas), evitá anchos mínimos rígidos (`min-w-[800px]`) que excedan el ancho de la columna.
   - Máximo **6 a 7 columnas visibles** simultáneamente. Consolidá datos secundarios en las celdas atómicas (`OperationCell`, `StockCell`, `UserCell`, `AmountCell`).
2. **Grillas de Formularios y Sub-ítems (ej. Cheques):**
   - Nunca coloques más de 4 inputs en una misma línea horizontal sin salto (`flex-nowrap`).
   - Para filas repetibles con 5-6 campos (como Cheques en `SellerPaymentFormPage` o `BalanceFormPage`), usá un layout en grilla fluida (`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end`) o dividí en 2 líneas limpias dentro de una sub-tarjeta compacta.
3. **Densidad Zero-Air:**
   - Listados: `<PageHeader compact={true} />` + `.elite-audit-bar` (`FilterBar variant="slim"` + `ColumnPicker`) + `<Card padding="p-0">` + `<Table />`.
   - Formularios: `<Card size="slim">` + `<FormGrid>` + `<InputField />` + `<Select />`.

---

## 📱 2. Reglas para Portal Mobile / PWA (Vendedores y Directiva en Celular)

Los vendedores usan el sistema en la calle desde pantallas de `360px` a `412px` de ancho:
1. **De Tabla a Tarjeta Accionable (`Card-List Pattern`):**
   - En pantallas móviles (`< md`), las tablas de muchas columnas son ilegibles. Usá listas de tarjetas compactas donde cada ítem muestre:
     - **Fila superior:** Número de Cartón/Operación destacado (`font-black`) + `<Badge />` de estado.
     - **Fila media:** Nombre del Asociado + Localidad/Teléfono.
     - **Fila inferior:** Progreso de cuotas / Importe + Botón de acción directa.
2. **Ergonomía Táctil (Touch Targets):**
   - Todo botón, chip de filtro o ítem seleccionable en vista móvil debe tener al menos **`44px` de altura (`min-h-[44px]`)**.
   - Inputs numéricos (DNI, N° de Cartón, Teléfono, Monto) deben incluir `inputMode="numeric"` para desplegar el teclado numérico nativo del teléfono.
3. **Navegación Móvil:**
   - Para el rol `Vendedor`, priorizar una **Bottom Navigation Bar** fija al pie con acceso en 1 toque a sus tareas frecuentes (*Mis Cartones*, *Vender*, *Cobrar Cuota*, *Rendiciones*).

---

## 📺 3. Reglas para Proyección en Vivo (TV 1080p) y Landing Pública

* **Vistas TV (`BingoCardStatusPage`, `DrawWinnersDisplayPage`):**
  - `h-screen overflow-hidden flex flex-col justify-between`.
  - Tipografía gigante con sombra de contorno, tarjetas con borde dorado neón (`#FFD700`), panel de operador oculto en el borde superior (`-translate-y-full hover:translate-y-0`) y barra fija de auspiciantes (`12vh`).
* **Landing Pública:**
  - Carga instantánea (separada por `React.lazy` del panel administrativo), estética institucional moderna del club, jerarquía visual clara de premios y buscador rápido de estado de cartón.

---

## ✅ Checklist de Verificación UI antes de entregar
- [ ] ¿Se respetaron al 100% los títulos y etiquetas de botones de `docs/UI_UX_STANDARD.md §6` (Wording)?
- [ ] ¿Se ve sin scroll horizontal en una ventana de **1366px** de ancho (con el Sidebar colapsado y expandido)?
- [ ] Si la pantalla es usada por `Vendedor` o `Directiva`, ¿es 100% operable en una pantalla de **375px** de ancho sin hacer zoom?
- [ ] ¿Se usaron `formatCurrency` / `formatCurrencyInput` en todos los montos y `<ConfirmModal />` en lugar de `window.confirm`?
