# Plan Técnico — 001 Arquitectura Multi-Rol + Mobile PWA

**Spec:** `./spec.md`  
**Estado:** Aprobado  
**Fecha:** Noviembre 2026  
**Autor:** Antigravity (Pair Programming con Desarrollador)  

---

## 1. Enfoque General

La estrategia técnica implementa un **Portal Mobile Touch-First** para Vendedores y un **Portal Ejecutivo de Solo Lectura** para Directiva, blindando la seguridad mediante autorización RBAC y aislamiento de datos (`sellerScope`) en el backend. 

La arquitectura es **100% aditiva y retrocompatible**:
1. Los endpoints administrativos actuales y las pantallas de escritorio (Notebook 1366px) permanecen intactos.
2. Los vendedores acceden a un router dedicado (`/vendedor/*`) gobernado por una barra de navegación inferior (`BottomNav`) y tarjetas táctiles sin scroll horizontal.
3. Se incorpora `vite-plugin-pwa` para que la aplicación sea instalable en teléfonos Android e iOS como una app nativa con íconos del Club Atlético Newell's Old Boys.

---

## 2. Diseño por Capa

### 2.1 Base de Datos y Modelos Mongoose (`src/models/`)

#### 1. Modelo `User` (`src/models/user.model.js`):
* **Campo aditivo:**
  ```javascript
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    default: null
  }
  ```
* **Roles válidos:** `['Administrador', 'Vendedor', 'Directiva']`.
* **Índice seguro:**
  ```javascript
  userSchema.index({ seller: 1 }, { sparse: true });
  ```
* **Regla de integridad:** Validación en pre-save o en controlador: si `roles.includes('Vendedor')`, `seller` es obligatorio y debe existir en la colección `Seller`.

---

### 2.2 Seguridad, Middlewares y Validación (`src/middlewares/`)

#### 1. Middleware de Roles (`src/middlewares/roleAuth.js`):
* `requireRoles = (...allowedRoles) => (req, res, next) => { ... }`:
  * Inspecciona `req.user.roles`.
  * Si el usuario no posee al menos uno de los roles autorizados, retorna `403 Forbidden` (`{ message: "Acceso denegado: rol no autorizado" }`).

#### 2. Middleware de Aislamiento (`src/middlewares/sellerScope.js`):
* Si `req.user.roles.includes('Vendedor')`:
  * Extrae `req.user.seller`. Si no existe o es nulo, rechaza con `403 Forbidden`.
  * Inyecta `req.sellerId = req.user.seller`.
* Si es `Administrador`:
  * Inyecta `req.sellerId = null` (sin restricciones).

#### 3. Middleware de Directiva (Solo Lectura):
* Si el rol es `'Directiva'`, cualquier petición cuyo método no sea `GET` (`POST`, `PUT`, `DELETE`, `PATCH`) es interceptada con `403 Forbidden`.

---

### 2.3 Lógica de Negocio y Endpoints API (`src/controllers/` y `src/routes/`)

#### A. Módulo Vendedor (`src/routes/vendedor.routes.js` y `src/controllers/vendedor.controllers.js`):
* **`GET /api/vendedor/summary`:**
  * Retorna métricas personales del vendedor autenticado:
    * `assignedCards`: Total de cartones asignados.
    * `soldCards`: Cartones con venta activa.
    * `availableCards`: Cartones disponibles para vender.
    * `collectedPending`: Dinero total de cuotas cobradas en la calle por este vendedor aún no liquidadas en secretaría.
    * `commissionEarned`: Comisión acumulada estimada.
* **`GET /api/vendedor/cards`:**
  * Retorna los cartones asignados a `req.sellerId` de la edición activa (`status: 'Disponible' | 'Vendido'`), con proyección ligera `.lean()`.
* **`GET /api/vendedor/quotas`:**
  * Retorna las cuotas asociadas a las ventas del vendedor autenticado (`sale.seller === req.sellerId`).
  * Incluye cuotas pendientes y vencidas, con datos mínimos del asociado para facilitar el cobro en la calle.
* **`POST /api/vendedor/sale`:**
  * Registra venta rápida de un cartón:
    * Valida que el cartón pertenezca a `req.sellerId` y esté `'Disponible'`.
    * Vincula el cliente (existente o recién creado).
    * Crea la `Sale` y genera las `Quota`.
* **`POST /api/vendedor/quota-payment`:**
  * Registra cobro de cuota:
    * Valida que la cuota pertenezca a una venta de `req.sellerId`.
    * Actualiza `paymentDate = new Date()` y `paymentMethod = req.body.paymentMethod || 'Efectivo'`.
    * Verifica automáticamente si la venta pasó a estar 100% saldada (`RN-VEN-02`).

#### B. Protección de Asociados (`src/controllers/client.controllers.js`):
* **`GET /api/clients/search?q=...`:**
  * Accesible para Vendedores y Administradores.
  * Exige parámetro `q` con longitud $\ge 3$.
  * Ejecuta búsqueda por DNI o coincidencia de Nombre/Apellido con `.limit(5)` y `.lean()`.
* **`GET /api/clients`:**
  * Protegido estrictamente con `requireRoles('Administrador')`. Si un vendedor intenta consultar este endpoint, recibe `403 Forbidden`.

#### C. Gestión de Usuarios y Vinculación (`src/controllers/user.controllers.js`):
* Al crear o editar un usuario con rol `'Vendedor'`, se valida y guarda la referencia `seller: ObjectId`.
* Se expone en el payload del usuario autenticado (`req.user`) la propiedad `seller` para su consumo inmediato en el Frontend.

---

### 2.4 Frontend y Experiencia de Usuario (`client/src/`)

#### A. Ruteo y Guards de Navegación (`client/src/App.jsx`):
* Redirección inteligente post-login según rol:
  * `Administrador` $\rightarrow$ `/` (Dashboard de escritorio)
  * `Vendedor` $\rightarrow$ `/vendedor` (Portal Mobile)
  * `Directiva` $\rightarrow$ `/directiva` (Portal Ejecutivo)
* Actualización de `<ProtectedRoute />` para soportar `allowedRoles={['Vendedor']}`.

#### B. Portal Vendedor Touch-First (`client/src/pages/vendedor/`):
* **`VendedorHomePage.jsx`:**
  * Saludo personalizado, resumen financiero (*Cartones libres*, *Dinero a rendir*, *Comisión*), y accesos rápidos "Nueva Venta" y "Cobrar Cuotas".
* **`VendedorVentaPage.jsx`:**
  * Wizard táctil en 2 pasos:
    1. Selector de cartón disponible (chips grandes táctiles $\ge 48\text{px}$).
    2. Buscador de asociado por DNI/Apellido con autocompletado rápido, o botón `+ Asociado Rápido` (Nombre, Apellido, DNI, Celular).
    3. Selección de forma de pago (Contado o Cuotas) y botón touch de confirmación.
* **`VendedorCuotasPage.jsx`:**
  * Listado de cuotas pendientes ordenadas por asociado.
  * Tarjetas compactas (*MobileCard*) con botón táctil directo `Cobrar` (Efectivo/Transferencia).
* **`VendedorCartonesPage.jsx`:**
  * Grilla de cartones asignados con filtros rápidos (*Todos*, *Disponibles*, *Vendidos*).
* **`BottomNav.jsx` (`client/src/components/mobile/BottomNav.jsx`):**
  * Barra fija inferior con 4 accesos: 🎟️ *Cartones*, ✍️ *Vender*, 💳 *Cuotas*, 📊 *Rendición*.

#### C. Portal Directiva (`client/src/pages/directiva/`):
* **`DirectivaDashboardPage.jsx`:**
  * Vista ejecutiva optimizada para tablets y smartphones con KPIs agregados (recaudación total, dinero en la calle, porcentaje de colocación de la edición) en modo solo lectura.

#### D. Soporte PWA (`vite-plugin-pwa`):
* Instalación de `vite-plugin-pwa`.
* Configuración en `vite.config.js`:
  * `manifest.webmanifest`: nombre *"Tómbola NOB"*, `short_name: "Tómbola"`, `theme_color: "#0f172a"`, `background_color: "#ffffff"`, `display: "standalone"`.
  * Íconos institucionales en `public/icons/`.
  * Service worker configurado para caching de assets (HTML, CSS, JS, imágenes del club).

---

## 3. Decisiones Técnicas y Control de Riesgos

| Riesgo Técnico / Operativo | Decisión Técnica de Mitigación |
| :--- | :--- |
| **Fuga masiva de la base de datos de socios.** | Bloqueo absoluto de `GET /api/clients` y exportaciones a nivel de middleware HTTP para el rol Vendedor. El buscador solo devuelve 5 coincidencias puntuales. |
| **Venta de cartones ajenos o no asignados.** | El backend valida en `createSale` que el `bingoCard.seller` coincida exactamente con el `sellerId` del vendedor autenticado. |
| **Corrupción de datos históricos al agregar `User.seller`.** | Campo 100% aditivo y opcional en el esquema (`default: null`). Los usuarios administradores creados previamente siguen funcionando sin ninguna alteración. |
| **Ventas o cobros duplicados por falta de señal.** | Conectividad activa requerida en el cliente. Si la petición falla por timeout de red, se muestra feedback de reintento sin registrar la transacción a ciegas. |

---

## 4. Estrategia de Verificación y Quality Gate

1. **Backend Verification:**
   * Smoke test con script Node.js verificando:
     * Restricción de rol (un vendedor recibiendo 403 al intentar `GET /api/clients`).
     * Creación de usuario vendedor vinculado a un `seller`.
     * Registro de venta rápida y cobro de cuota.
2. **Frontend Build Verification:**
   * Ejecución de `npm run build` en `client/` asegurando que todos los chunks diferidos (`React.lazy`), la PWA y los nuevos componentes compilen con **0 errores**.
3. **Responsive Verification:**
   * Verificación visual de cero scroll horizontal en viewports móviles estándar ($360\text{px}$, $390\text{px}$, $412\text{px}$) y mantenimiento intacto del panel administrativo en $1366\text{px}$.

---

## 5. Sincronización Documental

Al finalizar la implementación, se actualizarán los siguientes documentos:
* `docs/SYSTEM_BLUEPRINT.md`: Registrar la relación `User.seller`, el middleware `requireRoles`, `sellerScope` y los nuevos endpoints `/api/vendedor/*`.
* `docs/ROADMAP.md`: Marcar como completada la **Fase 4** (4.1, 4.2, 4.3 y 4.4).
