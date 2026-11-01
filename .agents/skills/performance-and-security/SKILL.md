---
name: performance-and-security
description: Optimización de rendimiento y blindaje de seguridad Cloud/Multi-Rol (inspirada en performance-optimization, security-and-hardening y api-and-interface-design de Addy Osmani). Usala para indexar MongoDB, eliminar consultas N+1, optimizar el bundle de React/Vite y asegurar permisos por rol (Admin, Vendedor, Directiva).
---

# ⚡🛡️ Performance Optimization & Cloud Security Hardening

Esta skill fusiona **`performance-optimization`**, **`security-and-hardening`** y **`api-and-interface-design`** de Addy Osmani para preparar y escalar **Gestión Tómbola** tanto en uso intensivo local como en su despliegue en la nube (MongoDB Atlas + Hosting Cloud + acceso móvil de Vendedores y Directiva).

---

## ⚡ 1. Reglas de Performance (Backend & MongoDB)

Principio rector: **Medir y acotar los datos antes de transferirlos por la red.** En la nube, la latencia entre Node.js y MongoDB Atlas multiplica por 100 el costo de las malas consultas:

1. **Indexación Obligatoria y Segura para Datos Productivos (Zero Collection Scans & Zero Data Breakage):**
   - Todo campo usado en `.find()`, `.aggregate({ $match })` o `.sort()` frecuente debe tener índice en su esquema Mongoose (`edition`, `sale`, `seller`, `client`, `bingoCard`, `status`, `dueDate`).
   - **Regla de Oro para Base Productiva:** Agregar índices de consulta no únicos (`.index({ edition: 1, status: 1 })`) es 100% seguro sobre datos históricos. **Prohibido** agregar `unique: true` nuevo sobre campos existentes que puedan tener valores `null`, vacíos o repetidos en la base histórica del cliente (como `Person.document` o `Person.email`), ya que fallaría la creación del índice en producción.
   - **Retrocompatibilidad de Esquemas:** Todo cambio en modelos Mongoose debe ser aditivo (campos nuevos siempre con `default` o no requeridos para documentos antiguos).
2. **Proyección y `.lean()` en Lecturas Masivas:**
   - En listados y reportes donde solo se leen datos para enviar por JSON (`res.json`), usar `.lean()` para evitar el costo de hidratar documentos completos de Mongoose en memoria.
   - **Exclusión de `cardSets` pesados:** Un `BingoCard` almacena 5 sets × 20 números (100 enteros). Cuando se consulte un cartón solo para saber su `number`, `status` o `seller` (ej. en listados de ventas o cuotas), usar siempre `.select('-cardSets -numbers')` o `.populate('bingoCard', 'number status')`.
3. **Prohibición de Bucles N+1 (Frontend y Backend):**
   - **Prohibido en Frontend:** Hacer `Promise.all(items.map(item => axios.get(...)))` (como pedir las cuotas de cada venta en un bucle). Si una vista necesita un resumen o actualización masiva, debe resolverse en **1 solo endpoint del backend** mediante agregación (`$lookup` / `$group`) o actualización por lote (`updateMany` / `bulkWrite`).
   - **Prohibido en Backend:** Hacer queries dentro de un bucle `for` o `.map()`. Usar `$in` o `aggregate`.
4. **Filtrado y Paginación en Servidor:**
   - Los endpoints de colecciones grandes (`Quota`, `Sale`, `BingoCard`, `SellerPayment`, `Balance`) deben aceptar `?editionId=...` en la query de MongoDB, evitando traer ediciones históricas enteras a la memoria de Node.js o del navegador.

---

## 🚀 2. Reglas de Performance (Frontend React & Vite)

1. **Code Splitting por Ruta (`React.lazy`):**
   - `App.jsx` debe cargar de forma diferida (`React.lazy` + `<Suspense>`) las páginas administrativas, las vistas pesadas con gráficos/PDF (`DashboardPage`, `html2pdf`, `xlsx`) y las vistas de TV, para que la Landing pública y el Portal Mobile de Vendedores carguen en milisegundos.
2. **Prevención de Re-renders y Cálculos en Tablas:**
   - Envolver filtrados, ordenamientos y cálculos de KPIs de tablas en `useMemo` con dependencias exactas.
   - Evitar que 15 Context Providers en `App.jsx` disparen peticiones iniciales simultáneas al montar la app si el usuario ni siquiera está autenticado o su rol no tiene permiso para esos módulos.

---

## 🛡️ 3. Seguridad Cloud y Control de Acceso Multi-Rol (RBAC)

Al exponer el sistema en internet para `Administrador`, `Vendedor`, `Directiva` y `Público`:

1. **Autorización Estricta en Backend (`checkRole` + Ownership):**
   - Ocultar un botón en React **no es seguridad**. Todo endpoint en `src/routes/` debe tener `authRequired` y `checkRole([...])`.
   - **Aislamiento de Datos del Vendedor (`IDOR Prevention`):** Cuando el usuario tiene rol `Vendedor`, el backend **nunca debe confiar** en un `sellerId` enviado desde el frontend. Debe resolver el `seller._id` a partir del `req.user.id` autenticado en el token JWT y forzar ese filtro en la query de base de datos.
   - **Rol `Directiva` (Read-Only):** Solo tiene permiso en endpoints `GET` de métricas/reportes y sorteos; cualquier intento de `POST`, `PUT` o `DELETE` debe responder `403 Forbidden`.
2. **Idempotencia e Integridad Financiera:**
   - Operaciones financieras críticas (creación de pagos, cobro de cuotas, anulación de ventas) deben estar protegidas contra doble clic en frontend (`isSubmitting` / `loading`) y contra reintentos/condiciones de carrera en backend.
3. **Validación de Entrada (`Zod`) y Secretos:**
   - Todo payload `req.body` en rutas de escritura (`POST`/`PUT`) debe pasar por `validateSchema(schema)` con Zod.
   - Ninguna credencial, URI de MongoDB Atlas o `TOKEN_SECRET` puede quedar harcodeada en el código; todo debe leerse de `process.env` con configuración de cookies segura en producción (`httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite`).
