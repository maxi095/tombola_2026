# Spec — 001 Arquitectura Multi-Rol (Admin, Vendedor, Directiva) + Mobile PWA

**Estado:** Cerrada (Aprobada para planificación)  
**Carpeta:** `docs/specs/001-multi-rol-pwa-mobile/`  
**Fecha:** Noviembre 2026  
**Autor:** Antigravity (Pair Programming con Desarrollador)  

---

## 1. Problema y Objetivo

Actualmente el sistema está optimizado para la administración centralizada desde computadoras de escritorio o notebooks (1366px). Sin embargo, la cobranza y venta de la tómbola ocurre en la calle: los vendedores visitan asociados, cobran cuotas y necesitan vender cartones desde sus teléfonos móviles. A su vez, los directivos del club necesitan consultar la recaudación global en tiempo real sin riesgo de alterar registros contables.

El objetivo de este módulo es habilitar un **Portal Mobile Touch-First** para Vendedores, un **Portal Ejecutivo de Solo Lectura** para Directiva, e instalar la aplicación como **PWA (Progressive Web App)** en los dispositivos móviles, asegurando:
1. **Aislamiento riguroso de datos sensibles** (protección anti-fuga del padrón de asociados).
2. **Enfoque Pragmático y Ágil (V1):** La app del vendedor es **exclusivamente aditiva y simple** (vende, cobra, consulta). Todas las anulaciones, correcciones complejas y cancelaciones quedan centralizadas en la Administración con total flexibilidad operativa, evitando trabas burocráticas o bloqueos de sistema ante situaciones atípicas de la vida real.
3. **Control Centralizado de Accesos:** No existe auto-registro público. El Administrador del club es el único habilitado para crear y vincular usuarios móviles a las fichas de vendedores existentes.
4. **Consistencia transaccional:** Operaciones online con datos móviles para evitar ventas o cobros duplicados.

---

## 2. Actores, Roles y Dispositivos

| Rol | Dispositivo Principal | Alcance Operativo |
| :--- | :--- | :--- |
| **Administrador** | Notebook HD (1366px) / Desktop | Control total del sistema: gestión de ediciones, asignación de cartones, ventas, cobranzas, liquidaciones de vendedores, asientos contables de tesorería, sorteos, **alta y asignación de accesos de usuarios**, y ajustes/anulaciones manuales con criterio humano. |
| **Vendedor** | Mobile PWA (Smartphone Touch-First) | Operación de campo ágil: consulta estricta de sus cartones asignados, registro rápido de ventas, cobro de cuotas a sus clientes y visualización de dinero cobrado a rendir. **Solo operaciones aditivas; no anula ni cancela**. Obligatoriamente vinculado a su ficha de `Seller`. |
| **Directiva** | Mobile PWA / Tablet / Notebook | Visión gerencial de alto nivel: KPIs de recaudación global, porcentaje de venta, estado de morosidad, ranking de ventas y estado general de la edición. **Solo lectura**. |
| **Público** | Celular / Desktop | Acceso exclusivo a la Landing Page institucional informativa (presentación de la edición, fotos de premios, historia del club). **No incluye consulta de sorteos ni acceso a datos internos de la tómbola**. |

---

## 3. Alcance

### Incluye (Alcance V1 — Pragmático y Fluido)
1. **Modelo de Seguridad & Scoping (Backend):**
   * Vinculación en `User` con referencia `seller: ObjectId` (opcional en el esquema, obligatoria si `role === 'Vendedor'`).
   * Middleware de autorización por rol (`requireRole(['Administrador', 'Vendedor', 'Directiva'])`).
   * Middleware de aislamiento (`sellerScope`): inyecta automáticamente `{ seller: req.user.sellerId }` en las consultas de cartones, ventas, cuotas y pagos.
   * **Buscador seguro de asociados para vendedores:** Endpoint `GET /api/clients/search?q=...` con límite de 5 resultados y mínimo 3 caracteres de búsqueda. Prohibición total de acceso a `GET /api/clients` y exportaciones masivas para el vendedor.
   * Endpoint de alta rápida de asociados desde el flujo de venta (`POST /api/clients`).
2. **Gestión y Vinculación de Accesos por el Administrador:**
   * **Alta desde Usuarios (`UserFormPage.jsx`):** Al seleccionar rol `'Vendedor'`, se activa un selector de vendedores registrados (`Seller`), autocompletando datos personales y exigiendo la vinculación.
   * **Alta rápida desde Vendedores (`SellerPage.jsx`):** Botón o indicador en cada vendedor para crear o gestionar su acceso móvil (generar credenciales o resetear contraseña olvidada).
   * **Rol Directiva:** Creación de usuario sin ficha de vendedor asociada, con acceso restringido a lectura.
3. **Portal Mobile para Vendedores (Frontend):**
   * Detección de rol tras login y redirección automática al portal `/vendedor`.
   * Barra de navegación inferior móvil fija (`BottomNav`):
     * 🎟️ **Mis Cartones:** Tarjetas visuales únicamente de los cartones asignados por administración a ese vendedor (disponibles vs vendidos).
     * ✍️ **Nueva Venta:** Wizard móvil de 2 pasos (elegir cartón disponible propio -> buscar asociado por DNI/apellido o alta rápida -> confirmar contado/cuotas).
     * 💳 **Cobro de Cuotas:** Listado de cuotas pendientes de sus propios clientes con cobro en 1 toque.
     * 📊 **Mis Rendiciones:** Tablero con dinero cobrado en la calle pendiente de entregar en secretaría, historial de rendiciones oficiales y comisiones acumuladas.
   * **Flujo 100% Aditivo:** La interfaz del vendedor no incluye botones de "Anular Venta", "Desmarcar Cuota" ni "Cancelar Pago". Si comete un error, el vendedor avisa a secretaría para que el Administrador realice el ajuste.
4. **Portal Ejecutivo para Directiva (Frontend):**
   * Redirección automática tras login al portal `/directiva`.
   * Dashboard KPI adaptado a smartphone: recaudación total, dinero en calle, cartones vendidos vs stock general.
   * Bloqueo total de botones de edición, anulación o creación en la UI.
5. **Infraestructura PWA:**
   * Configuración de `vite-plugin-pwa` con `manifest.webmanifest`, íconos oficiales del Club Newell's Old Boys y modo `standalone`.
   * Caching de assets estáticos (HTML/CSS/JS/imágenes) para arranque instantáneo de la app en el móvil.

### No incluye (explícito en V1)
* **Sincronización Offline Bidireccional:** Queda descartada por seguridad transaccional (evitar ventas dobles o cobros cruzados). Se requiere conexión a internet móvil (4G/WiFi) activa para confirmar ventas y cobros.
* **Auto-registro público:** Prohibido el registro abierto de usuarios para evitar cuentas espurias en la base de datos del club.
* **Mecanismos de Sello Rígido / Bloqueos Automáticos en Cascada:** Para no generar fricciones operativas ni trabar ajustes de casos atípicos en secretaría, en V1 el Administrador mantiene su capacidad actual de modificar cuotas o anular ventas con su criterio humano.
* Pasarelas automáticas de pago online (MercadoPago / Stripe).
* Consulta pública de sorteos o base de datos en la Landing pública.

---

## 4. Comportamiento Esperado y Experiencia de Usuario

### 4.1 Flujo del Vendedor (Mobile Touch-First)
1. **Acceso:** Login desde el celular con credenciales otorgadas por el club. Si el rol es `'Vendedor'`, se abre directamente `/vendedor`.
2. **Home Vendedor (`/vendedor`):**
   * Métrica clara:
     * *Cartones disponibles:* N.
     * *Dinero cobrado pendiente de rendir al club:* $ X.
     * *Comisión acumulada a favor:* $ Y.
   * Botones de acción rápida Touch $\ge 48\text{px}$: "Nueva Venta" y "Cobrar Cuotas".
3. **Registro de Venta Rápida (`/vendedor/vender`):**
   * **Paso 1:** Seleccionar cartón disponible propio.
   * **Paso 2:** Seleccionar Asociado (buscar por DNI/Apellido o botón `+ Registrar Asociado`).
   * **Paso 3:** Modalidad de pago (Contado o Cuotas) y botón táctil `Confirmar Venta`.
4. **Cobro de Cuotas en la Calle (`/vendedor/cuotas`):**
   * Listado agrupado por asociado de sus ventas.
   * Al hacer clic en `Cobrar`, se registra la cuota como pagada (Efectivo/Transferencia).
   * La cuota impacta en la base central y suma al indicador *"Dinero pendiente de rendición"*.
5. **Ajustes y Correcciones:**
   * Si un vendedor cobra por error o un cliente devuelve un cartón, el vendedor se comunica con la Secretaría del club. El Administrador realiza el ajuste en el sistema central de escritorio con total libertad y criterio contable.

### 4.2 Flujo de la Directiva (Mobile / Tablet)
1. **Acceso:** Login con credenciales de rol `'Directiva'`.
2. **Dashboard Ejecutivo (`/directiva`):**
   * Tarjetas ejecutivas con totales consolidados de la edición activa.
   * Gráficos simplificados de recaudación por forma de pago.
   * Solo lectura: sin botones de mutación ni accesos administrativos.

### 4.3 Alta y Gestión de Usuarios por el Administrador
1. **Doble camino de creación:**
   * **Camino 1 (`UserFormPage.jsx`):** El Administrador selecciona `Rol: Vendedor`, lo que despliega el selector obligatorio *"Vendedor del Club"*. Al elegir al vendedor, se precargan sus datos personales y el Admin solo define usuario y clave.
   * **Camino 2 (`SellerPage.jsx`):** En la fila del vendedor, un botón rápido *"Crear Acceso"* permite generarle usuario en un modal rápido sin abandonar la pantalla de vendedores.
2. **Recuperación de Contraseña:**
   * Si el vendedor olvida su contraseña en la calle, el Administrador tiene en su panel un botón directo *"Restablecer Contraseña"* para generarle una clave temporal o redefinirla en el acto.

---

## 5. Reglas de Negocio (Standard 2026 V1)

* **`RN-ROL-01` (Aislamiento de Cartones):** Un usuario con rol `'Vendedor'` solo puede ver y vender los cartones asignados por administración a su `sellerId`.
* **`RN-ROL-02` (Protección Anti-Fuga de Padrón):** El vendedor **no tiene acceso al padrón masivo de asociados** ni a exportaciones a Excel. Solo puede buscar puntualmente por DNI o Apellido ($\ge 3$ caracteres, límite 5 resultados) o dar de alta al asociado en el acto de la venta.
* **`RN-ROL-03` (Aislamiento de Cobranzas):** Un vendedor solo puede ver y registrar cobros de cuotas pertenecientes a ventas originadas por él mismo (`quota.sale.seller === req.user.sellerId`).
* **`RN-ROL-04` (Operación Aditiva del Vendedor):** El rol `'Vendedor'` **no tiene facultades para anular ventas ni anular cuotas**. Toda corrección o baja se solicita a la Secretaría del club.
* **`RN-ROL-05` (Flexibilidad Administrativa Central):** El Administrador conserva todas las facultades actuales para ajustar cuotas, desmarcar pagos o anular ventas desde el panel de escritorio, permitiendo resolver casos atípicos o acuerdos comerciales reales sin bloqueos de software.
* **`RN-ROL-06` (Solo Lectura Directiva):** Los usuarios con rol `'Directiva'` tienen acceso denegado a cualquier método HTTP que no sea `GET`. Cualquier petición `POST`, `PUT` o `DELETE` devolverá `403 Forbidden`.
* **`RN-ROL-07` (Requisito de Conectividad Activa):** El registro de ventas y cobros exige conexión a internet activa (4G/WiFi). Si no hay señal, la app muestra un aviso no bloqueante para reintentar al recuperar cobertura.
* **`RN-ROL-08` (Retrocompatibilidad Absoluta):** La propiedad `seller` en `User` es opcional (`default: null`). La operación para vendedores tradicionales que no usan la app permanece 100% inalterada.
* **`RN-ROL-09` (Vinculación Obligatoria de Vendedor):** No puede existir un usuario con rol `'Vendedor'` sin su referencia a `Seller`. La creación o edición de un usuario vendedor exige la asignación de su ficha correspondiente. Para los roles `'Administrador'` y `'Directiva'`, `seller` es `null`.

---

## 6. Impacto en Entidades de Dominio

* **`User` (`src/models/user.model.js`):**
  * Campo opcional: `seller: { type: Schema.Types.ObjectId, ref: 'Seller', default: null }`.
  * Roles permitidos: `'Administrador'`, `'Vendedor'`, `'Directiva'`.
* **Middlewares Nuevos:**
  * `src/middlewares/roleAuth.js`: Valida roles permitidos (`requireRole(['...'])`).
  * `src/middlewares/sellerScope.js`: Inyecta el filtro `sellerId` en consultas de vendedores.
* **Endpoints de API Nuevos / Protegidos:**
  * `GET /api/clients/search?q=...`: Búsqueda puntual y limitada para vendedores.
  * `GET /api/vendedor/summary`: Resumen de métricas personales del vendedor (cartones libres, cobros pendientes de rendición, comisiones).
  * `GET /api/vendedor/cards`: Cartones asignados al vendedor autenticado.
  * `GET /api/vendedor/quotas`: Cuotas pendientes de los clientes del vendedor autenticado.

---

## 7. Criterios de Aceptación

### Backend & Seguridad
- [ ] El modelo `User` vincula obligatoriamente `seller` cuando el rol es `'Vendedor'`.
- [ ] No se permite la creación de un usuario con rol `'Vendedor'` con `seller: null`.
- [ ] Un usuario con rol `'Vendedor'` que intenta consultar `GET /api/clients` recibe un error `403 Forbidden`.
- [ ] La búsqueda puntual `GET /api/clients/search?q=...` retorna únicamente coincidencias relevantes (máximo 5) y rechaza búsquedas con menos de 3 caracteres.
- [ ] Las consultas de cartones y cuotas para un vendedor retornan estrictamente los registros asignados a su `sellerId`.
- [ ] Los usuarios con rol `'Directiva'` no pueden ejecutar ninguna mutación (`POST`, `PUT`, `DELETE`).

### Frontend & UI Mobile
- [ ] Login redirige automáticamente a `/` (Admin), `/vendedor` (Vendedor) o `/directiva` (Directiva) según el rol.
- [ ] `UserFormPage.jsx` muestra el selector de vendedor vinculado al elegir `Rol: Vendedor` y autocompleta datos.
- [ ] La interfaz de Vendedor no muestra scroll horizontal en pantallas de celulares ($\ge 360\text{px}$).
- [ ] Botones táctiles principales con tamaño $\ge 48\text{px}$ para fácil uso con el pulgar.
- [ ] La barra de navegación inferior (`BottomNav`) permite cambiar de pestaña fluidamente sin recargas.
- [ ] Se puede registrar una venta completa desde el celular en menos de 30 segundos.
- [ ] La aplicación se puede instalar en la pantalla de inicio del celular mediante PWA con ícono del club y pantalla completa (`standalone`).
- [ ] `npm run build` compila con cero errores.
