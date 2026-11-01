# 🗺️ Roadmap Maestro de Evolución: Gestión Tómbola (2026) 🚀

**Estado:** Activo  
**Última actualización:** 2026-11-01 (Elaborado tras auditoría completa de código Backend y Frontend)

Este documento ordena de manera lógica y técnica todo lo necesario para llevar a **Gestión Tómbola** desde su estado actual (sistema monopuesto corriendo en `localhost` mediante `git pull`) hacia una **plataforma Cloud Multi-Rol, de alta performance, con soporte Mobile PWA y Landing Pública**.

---

## 📊 Diagnóstico Real delPunto de Partida (Noviembre 2026)

* **Lo que ya está sólido:**
  * Motor combinatorio **Bingo Generator Pro V10** (70 bolillas, estratos combinatorios + auditoría Monte Carlo).
  * Los **11 listados principales** (`SalePage`, `BingoCardPage`, `QuotasPage`, `ExpiredQuotasPage`, `SellerPage`, `SellerPaymentPage`, `BalancePage`, `ClientPage`, `EditionPage`, `UserPage`, `SaleTarjetaUnicaPage`) ya están migrados al Canon Atomic (`PageHeader` + `FilterBar` + `Table` + `useTableColumns`).
  * Pantallas de TV (`BingoCardStatusPage`, `DrawWinnersDisplayPage`) completas con las reglas de Sorteo en Vivo (`001-sorteo-en-vivo-tv`).
  * Rendición de Vendedores (`002-pagos-vendedores`) ya tiene implementados los 4 slices base en código (idempotencia de 10s, paginación, formulario y vista), restando solo ajustes finos de scroll horizontal/inputs.

* **Lo que frena la performance y la subida a la nube (Deuda Técnica Crítica detectada):**
  1. **Base de Datos sin Índices:** 11 de los 12 modelos de Mongoose no tienen índices definidos en claves foráneas (`edition`, `sale`, `seller`, `client`, `bingoCard`, `status`, `dueDate`).
  2. **Queries Masivas en Memoria y Problemas N+1:** Endpoints como `getBingoCardsWithSales` y `getSales` traen colecciones históricas enteras a memoria; `SellerViewPage` dispara 1 request HTTP por cada venta del vendedor (`Promise.all` N+1); `SaleViewPage` dispara 6 a 8 `PUT /api/quota/:id` en paralelo al cobrar de contado.
  3. **Bundle Frontend Monolítico:** `App.jsx` carga de forma síncrona las 27 páginas y anida 15 Context Providers en la raíz sin `React.lazy`.
  4. **Módulo de Sorteos Admin en CSS Viejo:** `DrawPage.jsx`, `DrawFormPage.jsx` y `DrawViewPage.jsx` siguen con maquetación legacy (`.page-wide`, `.data-table`, `window.confirm`, `alert`).

---

## 🛠️ Plan de Ejecución por Fases (De los Cimientos a la Nube)

### Fase 1: Saneamiento Rápido, Fixes Críticos y Flujo Git (Corto Plazo Inmediato)
*Objetivo: Dejar el código actual 100% limpio de bugs conocidos, sin código muerto y con rama de desarrollo separada de producción.*

- [x] **1.1 Resguardo y Consolidación Documental:** Crear tag `v1.0-pre-sdd-cleanup`, unificar `AGENTS.md`, `SYSTEM_BLUEPRINT.md`, `UI_UX_STANDARD.md`, `ROADMAP.md` y suite de skills SDD + Addy Osmani.
- [x] **1.2 Estrategia de Ramas Git (`develop` vs `main`):** Crear la rama `develop` para usarla como entorno de trabajo/staging, dejando `main` en su estado productivo actual hasta validar cada entrega.
- [x] **1.3 Corrección de Bugs Puntuales Detectados en Auditoría:**
  - `src/controllers/edition.controllers.js`: Corregir `updateEdition` que devuelve el modelo `Edition` en lugar del documento actualizado `edition`.
  - `src/controllers/auth.controllers.js`: Incluir `roles: userSaved.roles` al firmar el JWT en `register`.
  - `client/src/pages/draw/DrawViewPage.jsx`: Corregir `onClick={handleDownloadActa}` a `() => handleDownloadActa(draw)`.
- [x] **1.4 Eliminación de Código Legacy y Dependencias Basura:**
  - Eliminar el modelo/controlador/ruta obsoleta `Installment` (`installment.model.js`, `installment.controllers.js`, `installment.routes.js`, `installment.schema.js`, `client/src/api/installment.js`, `client/src/context/installmentContext.jsx`) y `client/src/ProtectedRoute.jsx` duplicado.
  - Limpiar del `package.json` raíz (Backend) los paquetes de frontend instalados por error (`react-modal`, `react-select`, `html2pdf.js`, `xlsx`, `js`).

---

### Fase 2: Optimización de Performance Backend y Base de Datos (Pre-Cloud)
*Objetivo: Que el sistema vuele tanto en local como cuando la base de datos esté en MongoDB Atlas en la nube.*

- [x] **2.1 Indexación Estratégica y Segura en MongoDB (`src/models/`):**
  - `BingoCard`: Índices de lectura en `{ edition: 1, number: 1 }`, `{ edition: 1, status: 1 }`, `{ edition: 1, seller: 1 }` y `{ seller: 1 }`.
  - `Sale`: Índices en `{ edition: 1, status: 1 }`, `{ seller: 1, edition: 1 }`, `{ client: 1 }`, `{ bingoCard: 1, status: 1 }` y `{ saleDate: -1 }`.
  - `Quota`: Índices en `{ sale: 1, quotaNumber: 1 }`, `{ paymentDate: 1, dueDate: 1 }` y `{ dueDate: 1 }`.
  - `SellerPayment` y `Balance`: Índices en `{ edition: 1, status: 1 }`, `{ seller: 1, edition: 1, createdAt: -1 }` y `{ sellerPaymentRef: 1 }`.
  - `Person`: Índices en `{ document: 1 }`, `{ lastName: 1, firstName: 1 }` y `{ city: 1 }` (no-únicos, 100% compatibles con datos históricos).
- [x] **2.2 Eliminación de N+1 y Endpoints Batch:**
  - Crear endpoint atómico en backend para Pago Contado / Bonificación Sin Cargo / Revertir Sin Cargo de una Venta (`PUT /api/sale/:id/batch-payment`) en lugar de disparar 8 requests `PUT /api/quota/:id` en paralelo desde `SaleViewPage.jsx`.
  - Eliminar el bucle N+1 de `getQuotasBySale` en `SellerViewPage.jsx` devolviendo `paidAmount` directamente desde `getSalesBySeller`.
- [x] **2.3 Optimización de Consultas Pesadas y Filtro por Edición Server-Side:**
  - Optimizar `getBingoCardsWithSales`, `getBingoCards`, `getSales`, `getQuotasV2` y `getExpiredQuotas` usando proyecciones (`.select('-cardSets -numbers')` cuando no se necesiten los 100 números del cartón), `.lean()`, cruce en $O(N)$ con `Map` y filtrado directo por `edition` y `updatedDate` en MongoDB.
  - Eliminar las descargas masivas innecesarias al iniciar la app (`getQuotas` completo en `QuotaContext` y el contexto duplicado muerto `PersonContext`).
- [x] **2.4 Auditoría Exhaustiva de Backend, Blindaje e Integridad Cloud:**
  - Compresión HTTP Gzip/Brotli (`compression`) activada en Express (reducción de 75-85% en payloads de red).
  - Sanitización y middleware global de excepciones en `app.js`.
  - Conexión DB y secretos desacoplados con soporte de variables de entorno (`MONGODB_URI`, `TOKEN_SECRET`) y enmascaramiento en logs.
  - Autenticación dual (Cookie + Header `Authorization: Bearer <token>`).
  - Blindaje contra venta duplicada en `createSale` y protección contra borrado accidental en `deleteEdition`.
  - Bajas lógicas controladas en `deleteSeller` y `deleteClient` (`status: 'Inactivo'`) eliminando cuelgues del servidor.
  - Corrección de cálculo de estado de cartón en vivo (`quotaUpToDate`).
  - Optimización en sorteo de TV (`getTopBingoCards`) en una sola consulta indexada con `.lean()`.
  - Roles RBAC habilitados (`Directiva`, `Vendedor`) en endpoints de consulta clave.
- [ ] **2.5 Suite Base de Tests Unitarios / Integración (Backend):**
  - Configurar Vitest en backend para testear: (a) cálculo y asiento doble de `SellerPayment` -> `Balance`, (b) cambio reactivo de estado de `Sale` al pagar `Quota`, y (c) reglas de ganador en sorteo (`cuota` vs `contado`).

---

### Fase 3: Optimización UI/UX (1366px Cero Scroll Horizontal) y Modernización Restante
*Objetivo: Pulir al 100% la experiencia en Notebook HD y acelerar la carga inicial del Frontend.*

- [ ] **3.1 Eliminación de Scroll Horizontal y Pulido de Espacios (1366px):**
  - Ajustar `Table.jsx` para que `min-w-[800px]` sea opcional/condicional y no rompa tarjetas anidadas como en `SellerPaymentView.jsx`.
  - Refactorizar la fila de carga de cheques en `SellerPaymentFormPage.jsx` y `BalanceFormPage.jsx` a una grilla fluida que no comprima los inputs en 1366px, e integrar `Select.jsx` y `formatCurrencyInput`.
  - Reparar el componente reutilizable `Pagination.jsx` para unificar la paginación de todas las tablas.
- [ ] **3.2 Migración del Módulo de Sorteos Admin al Standard 2026:**
  - Modernizar `DrawPage.jsx`, `DrawFormPage.jsx` y `DrawViewPage.jsx` (reemplazar CSS legacy, `window.confirm` y `alert()` por `PageHeader`, `Card`, `Table`, `ConfirmModal` y `showToast`).
  - Reemplazar los últimos `window.confirm` remanentes en `SaleViewPage.jsx`, `SellerViewPage.jsx` y `BalanceViewPage.jsx`.
- [ ] **3.3 Code Splitting y Optimización de Bundle Frontend (`App.jsx`):**
  - Implementar `React.lazy()` y `<Suspense fallback={<LoadingOverlay />}>` en `client/src/App.jsx` para dividir el bundle por ruta/rol.

---

### Fase 4: Arquitectura Multi-Rol (Admin, Vendedor, Directiva) + Mobile PWA
*Objetivo: Habilitar el uso del sistema desde celulares para Vendedores y Directiva con seguridad de nivel Cloud.*

- [ ] **4.1 RBAC Backend y Frontend (`Administrador`, `Vendedor`, `Directiva`):**
  - Agregar el rol `'Directiva'` en `user.model.js`.
  - Crear middlewares de autorización granular y aislamiento de datos por vendedor (`ownSellerOnly` para que un vendedor solo vea y opere sus propios cartones, ventas y cuotas).
- [ ] **4.2 Portal Mobile para Vendedores (Diseño Touch-First):**
  - Vistas móviles adaptadas con tarjetas compactas (sin tablas anchas) y barra de navegación inferior: *Mis Cartones Asignados*, *Registrar Venta Rápida*, *Estado de Cuotas de Mis Clientes* y *Mis Rendiciones*.
- [ ] **4.3 Vista Ejecutiva para Directiva:**
  - Acceso de solo lectura optimizado para celular/tablet al `DashboardPage`, estado de sorteos y avance de la edición.
- [ ] **4.4 Configuración PWA (`vite-plugin-pwa`):**
  - Agregar `manifest.webmanifest`, íconos del club y Service Worker para que Vendedores y Directiva puedan instalar la aplicación en la pantalla de inicio de sus celulares Android/iOS.

---

### Fase 5: Landing Pública Moderna + Despliegue en la Nube (Staging & Producción)
*Objetivo: Independencia total de la terminal local del cliente y presencia pública profesional del club.*

- [ ] **5.1 Landing Page Pública Moderna (`/`):**
  - Diseño institucional de alto impacto con información de la edición vigente, grilla de premios, fechas de sorteos, consulta pública de cartón / estado de sorteos y acceso directo al login de asociados/vendedores.
- [ ] **5.2 Preparación Cloud y Despliegue (`Staging` y `Producción`):**
  - Configurar variables de entorno de producción (`.env.example`, CORS dinámico, cookies `secure`/`sameSite` para HTTPS, conexión a **MongoDB Atlas**).
  - Migrar la base de datos local actual del cliente a MongoDB Atlas con backups automáticos.
  - Configurar pipeline de despliegue automático: rama `develop` → **Ambiente de Pruebas (Staging)**; rama `main` → **Ambiente de Producción** con dominio propio.
