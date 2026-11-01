# Slices de Implementación — 001 Arquitectura Multi-Rol + Mobile PWA

**Spec:** `./spec.md`  
**Plan:** `./plan.md`  
**Estado:** Propuesto para ejecución  
**Fecha:** Noviembre 2026  

---

### Slice 1 — Backend RBAC, Enlace Usuario-Vendedor & Protección de Padrón
- [x] **Objetivo:** Blindar la seguridad en el backend vinculando `User.seller`, creando middlewares de roles/scoping y protegiendo la base de clientes.
- **Valor observable:** Un usuario con rol `'Vendedor'` recibe `403 Forbidden` al intentar listar clientes masivamente (`GET /api/clients`), pero puede buscar puntualmente por DNI/Apellido en `GET /api/clients/search?q=...`.
- **Archivos a crear/modificar:**
  - `src/models/user.model.js` (campo aditivo `seller`, índice).
  - `src/middlewares/roleAuth.js` (nuevo middleware `requireRoles`).
  - `src/middlewares/sellerScope.js` (nuevo middleware `sellerScope`).
  - `src/controllers/client.controllers.js` (endpoint `searchClients`).
  - `src/routes/client.routes.js` (protección de rutas).
  - `src/controllers/user.controllers.js` (validación de vinculación de vendedor).
- **Depende de:** Ninguno.
- **Verificación:** Script de prueba Node.js ejecutando peticiones simuladas con tokens de Vendedor vs. Administrador.
- **Commit sugerido:** `feat(backend): rbac, seller user link and client anti-poaching security`

---

### Slice 2 — Endpoints Dedicados de Campo (`/api/vendedor/*`)
- [x] **Objetivo:** Construir la API que alimentará la aplicación móvil del vendedor para consultas, ventas rápidas y cobro de cuotas.
- **Valor observable:** Endpoints `/api/vendedor/summary`, `/api/vendedor/cards`, `/api/vendedor/quotas`, `/api/vendedor/sale` y `/api/vendedor/quota-payment` respondiendo con datos aislados por vendedor.
- **Archivos a crear/modificar:**
  - `src/controllers/vendedor.controllers.js` (nuevo).
  - `src/routes/vendedor.routes.js` (nuevo).
  - `src/app.js` (registro de ruta `/api/vendedor`).
- **Depende de:** Slice 1.
- **Verificación:** Smoke test Node.js validando que un vendedor registre una venta de un cartón asignado y cobre una cuota.
- **Commit sugerido:** `feat(backend): seller dedicated field api endpoints`

---

### Slice 3 — Gestión de Usuarios y Accesos en Panel Central (Admin UI)
- [x] **Objetivo:** Permitir al Administrador dar de alta usuarios vendedores con vinculación obligatoria desde el formulario de usuarios y desde la lista de vendedores.
- **Valor observable:** En `UserFormPage.jsx`, al seleccionar rol "Vendedor" se activa el desplegable de vendedores registrados precargando sus datos personales; en `SellerPage.jsx` se visualiza el estado del acceso móvil.
- **Archivos a crear/modificar:**
  - `client/src/pages/user/UserFormPage.jsx`.
  - `client/src/pages/seller/SellerPage.jsx`.
  - `client/src/context/UserContext.jsx`.
- **Depende de:** Slice 1.
- **Verificación:** `npm run build` en cliente y verificación visual de los formularios.
- **Commit sugerido:** `feat(client): seller user linking and mobile access management`

---

### Slice 4 — Portal Mobile PWA para Vendedores (`/vendedor/*`)
- [x] **Objetivo:** Construir la experiencia Touch-First para smartphones con barra inferior (`BottomNav`) y pantallas de venta/cobranza sin scroll horizontal.
- **Valor observable:** Al ingresar con usuario Vendedor, se accede al portal móvil `/vendedor` con sus cartones asignados, wizard de venta rápida en 30 segundos y cobro de cuotas táctil.
- **Archivos a crear/modificar:**
  - `client/src/components/mobile/BottomNav.jsx` (nuevo).
  - `client/src/components/mobile/MobileCard.jsx` (nuevo).
  - `client/src/pages/vendedor/VendedorHomePage.jsx` (nuevo).
  - `client/src/pages/vendedor/VendedorCartonesPage.jsx` (nuevo).
  - `client/src/pages/vendedor/VendedorVentaPage.jsx` (nuevo).
  - `client/src/pages/vendedor/VendedorCuotasPage.jsx` (nuevo).
  - `client/src/context/VendedorContext.jsx` (nuevo).
  - `client/src/api/vendedor.js` (nuevo).
  - `client/src/App.jsx` (lazy routing del portal móvil).
- **Depende de:** Slice 2 y Slice 3.
- **Verificación:** `npm run build` en cliente, verificación responsive en viewport $360\text{px}$ a $412\text{px}$.
- **Commit sugerido:** `feat(client): seller mobile touch-first portal and quick sales flow`

---

### Slice 5 — Portal Ejecutivo Directiva & Configuración PWA
- [x] **Objetivo:** Habilitar el portal de solo lectura para directivos y transformar la aplicación web en una PWA instalable con Service Worker e íconos del club.
- **Valor observable:** La app se puede instalar en Android/iOS con modo standalone; los directivos acceden a `/directiva` para ver KPIs de recaudación en tiempo real; login redirige según el rol.
- **Archivos a crear/modificar:**
  - `client/src/pages/directiva/DirectivaDashboardPage.jsx` (nuevo).
  - `client/vite.config.js` (integración `vite-plugin-pwa`).
  - `client/package.json` (dependencia `vite-plugin-pwa`).
  - `client/public/manifest.webmanifest` e íconos PWA.
  - `client/src/pages/LoginPage.jsx` & `client/src/App.jsx` (redirección inteligente por rol).
- **Depende de:** Slice 4.
- **Verificación:** `npm run build` generando service worker y manifest; smoke test integral de roles.
- **Commit sugerido:** `feat(client): directiva executive view and pwa mobile installation`
