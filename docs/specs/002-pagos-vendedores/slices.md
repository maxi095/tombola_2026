# Slices de Implementación — Módulo de Pagos de Vendedores

**Estado:** En Progreso (Agosto 2026)  
**Especificación:** [spec.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/002-pagos-vendedores/spec.md)  
**Plan Técnico:** [plan.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/002-pagos-vendedores/plan.md)

---

## Lista de Slices

### Slice 1 — Prevención de Doble Envío (Blindaje Frontend y Backend) y Auto-focus
- [x] **Objetivo:** Impedir por completo la creación de rendiciones duplicadas mediante restricciones en interfaz y base de datos, y enfocar el campo de vendedor de inmediato.
- **Valor / progreso observable:** Al cargar el formulario de pagos, el selector de Vendedor se enfoca automáticamente. Al presionar "Registrar Pago", el botón se deshabilita impidiendo clics adicionales. Si por fluctuaciones de red o reintentos del navegador se dispara una segunda petición al servidor, el Backend detecta el duplicado dentro del margen de 10 segundos y lo rechaza, garantizando absoluta consistencia.
- **Incluye:**
    *   Uso de `isSubmitting` en `SellerPaymentFormPage.jsx` para desactivar el botón.
    *   Propiedad `autoFocus` en el selector del Vendedor.
    *   Lógica de validación por tiempo (idempotencia) de 10 segundos en `createSellerPayment` del backend.
- **Excluye:** Modificaciones en el listado principal de pagos (paginación).
- **Archivos a modificar:** 
    *   [SellerPaymentFormPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentFormPage.jsx)
    *   [sellerPayment.controllers.js](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/src/controllers/sellerPayment.controllers.js)
- **Depende de:** Ninguno.
- **Complejidad:** Baja-Media.
- **Pruebas:** Manuales (intentar registrar dos pagos idénticos en menos de 10 segundos).
- **Commit sugerido:** `fix(seller-payment): enforce double submit prevention on frontend and backend idempotency`

---

### Slice 2 — Paginación en Memoria (Listado)
- [x] **Objetivo:** Segmentar la visualización del listado de pagos en bloques configurables por página para mejorar el rendimiento.
- **Valor / progreso observable:** El listado principal de pagos a vendedores ahora cuenta con controles premium de paginación al pie de la tabla. Se muestran solo 25 registros por página de forma predeterminada, acelerando drásticamente la carga y respuesta de la página.
- **Incluye:**
    *   Estructura de paginación en `SellerPaymentPage.jsx` (estados de página y cantidad de registros).
    *   Uso de `paginatedPayments` (segmentación `useMemo`) en el renderizado de la tabla.
    *   Footer de controles premium de paginación al pie de la Card de la tabla.
- **Excluye:** Cambios en el Backend.
- **Archivos a crear:** Ninguno.
- **Archivos a modificar:** [SellerPaymentPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentPage.jsx).
- **Depende de:** Slice 1.
- **Complejidad:** Media.
- **Pruebas:** Manuales (cambiar entre páginas, ajustar límite de registros por página, filtrar y ver que vuelva a página 1).
- **Commit sugerido:** `feat(seller-payment): add premium in-memory pagination to listing view`

---

### Slice 3 — Rediseño Premium del Formulario de Alta
- [ ] **Objetivo:** Refactorizar el formulario de creación de pago para adaptarlo al estándar visual de `AGENTS.md`.
- **Valor / progreso observable:** El formulario de creación de pago de vendedor se integra al diseño de alta gama del sistema: cuenta con `<PageHeader />` de acciones unificado en la parte superior, campos organizados simétricamente sin superposiciones y controles `<InputField />` estandarizados.
- **Incluye:**
    *   Sustitución de inputs y maquetaciones HTML obsoletas en `SellerPaymentFormPage.jsx`.
    *   Organización de secciones dentro de `<Card />`.
- **Excluye:** Pantalla de detalle de pago.
- **Archivos a modificar:** [SellerPaymentFormPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentFormPage.jsx).
- **Depende de:** Slice 1.
- **Complejidad:** Media.
- **Pruebas:** Manuales (verificar alineación, paddings, etiquetas de error y visualización general en navegador).
- **Commit sugerido:** `style(seller-payment): redesign payment form with premium design system components`

---

### Slice 4 — Rediseño Premium del Detalle de Pago
- [ ] **Objetivo:** Refactorizar la pantalla de detalle de pago para heredar los componentes UI premium y la tabla estandarizada.
- **Valor / progreso observable:** Al ingresar a ver el detalle de un pago, se muestra una interfaz limpia dividida en tarjetas temáticas (`Card`) que ordenan de forma legible la liquidación del vendedor, la grilla de cheques (usando el componente `<Table />` premium del proyecto) y los controles de edición inline para comisiones y notas.
- **Incluye:**
    *   Refactorización estética de `SellerPaymentView.jsx` aplicando `<PageHeader />`, `<Card />` y la grilla `<Table />`.
- **Excluye:** Formularios de alta.
- **Archivos a modificar:** [SellerPaymentView.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentView.jsx).
- **Depende de:** Slice 3.
- **Complejidad:** Media.
- **Pruebas:** Manuales (verificar estructura de Cards, badges de estado activo/anulado y lectura de cheques).
- **Commit sugerido:** `style(seller-payment): modernize payment detail view with cards and atomic table`
