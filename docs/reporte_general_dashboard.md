# 📊 Manual del Reporte General y Módulo de Estadísticas (Fase 2 - 2026)

Este manual documenta las reglas de negocio, los algoritmos de agrupación y la arquitectura técnica de la pestaña **"General"** incorporada en el panel de control del sistema de **Gestión Tómbola**.

---

## ⚙️ 1. Reglas de Negocio Contables y Operativas

### A. Clasificación de Modalidad de Pago (Contado vs. Cuotas)
Para determinar si la venta de un cartón se clasifica como cobro de **Contado**, **Cuota**, o **Sin Cargo**, se implementó un análisis en memoria sobre las cuotas asociadas a cada venta activa:
- **Sin Cargo**: Aplica de manera inmediata para ventas con estado `"Entregado sin cargo"`.
- **Contado**: Para calificar como una venta de contado, se deben cumplir dos condiciones concurrentes:
  1. **Pago Total**: Todas las cuotas asociadas al plan de pago de la venta deben estar marcadas como cobradas (el campo `paymentDate` no puede ser nulo en ninguna cuota).
  2. **Fecha Coincidente**: Todos los cobros deben haberse registrado exactamente en el **mismo día calendario** (mismo año, mes y día, evaluado mediante `dayjs(q.paymentDate).isSame(dayjs(firstPaymentDate), 'day')`).
- **Cuotas**: Si alguna cuota sigue pendiente o los pagos se registraron en días diferentes, la venta se computa bajo la modalidad de `"Cuotas"`.
- **Exclusión**: Las ventas anuladas (`status: "Anulada"`) se descartan por completo de la estadística.

### B. Métrica de Asociados Nuevos (Nuevos Compradores)
Un comprador (asociado/cliente) es clasificado como **Nuevo Comprador** en una edición si se cumple la siguiente regla histórica:
- **Earliest Sale Criterion**: La **primera venta cronológica registrada en todo el sistema** (sin contar ventas anuladas) a nombre de ese asociado pertenece a la edición que se encuentra actualmente filtrada (`editionId`). 
- Si el asociado registra compras previas en ediciones anteriores del sistema, se considera un comprador recurrente y no altera este indicador.

### C. Unificación Ortográfica Geográfica
Dado que el campo de localidad en el registro de asociados se ingresa en texto libre (no estandarizado), el backend implementa una unificación en memoria para agrupar registros homónimos:
1. **Normalización por Acentos y Espacios**: Se remueven los diacríticos y acentos usando `.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` y se eliminan espacios redundantes mediante `$trim` en la agregación. Esto consolida registros como `"Villa María"`, `"Villa Maria"`, `"villa maria "` bajo la clave única `"VILLA MARIA"`.
2. **Priorización de Tildes para Visualización**: Al consolidar, si al menos uno de los registros agrupados cuenta con la tilde correcta, el sistema selecciona esa variante gráfica como el nombre de visualización principal (ej: `"Villa María"` sobre `"Villa Maria"`).

---

## 🛠️ 2. Arquitectura Técnica y Código

### A. Modificaciones en Modelos (Backend)
- **`Seller`** ([seller.model.js](file:///c:/proyectos_desarrollo/gestion_tombola/src/models/seller.model.js)): Se añadió el campo `isParticular` (`Boolean`, default: `false`) para diferenciar vendedores particulares frente a los comisionistas de las subcomisiones del club.

### B. Módulo de Agregación (Backend)
En [dashboard.controllers.js](file:///c:/proyectos_desarrollo/gestion_tombola/src/controllers/dashboard.controllers.js), el endpoint `/api/dashboard/:editionId` ejecuta en paralelo mediante `Promise.all` las siguientes consultas sobre la base de datos:
1. **`salesByCityRaw`**: Agregación cruzada `Sale` -> `Client` -> `Person` para contabilizar la cantidad de cartones vendidos por localidad.
2. **`salesBySellerRaw`**: Agregación cruzada `Sale` -> `Seller` -> `Person` para obtener el ranking de vendedores con su nombre, tipo y cantidad de ventas.
3. **`newClientsByCityRaw`**: Agregación que agrupa ventas por cliente ordenadas por fecha, filtra aquellas cuya primera compra histórica se realizó en la edición y agrupa los clientes resultantes por localidad.

---

## 🎨 3. Interfaz de Usuario y Experiencia Visual

El diseño se integró en la pestaña "General" de [DashboardPage.jsx](file:///c:/proyectos_desarrollo/gestion_tombola/client/src/pages/dashboard/DashboardPage.jsx) utilizando componentes atómicos del estándar de diseño del proyecto:
- **KPI Card Grid**: Muestra los ingresos, egresos y el balance neto consolidado (pintando la tarjeta de color verde si es positivo o de color rojo si es negativo).
- **Gráficos de Balance**: Gráficos de dona interactivos que representan la distribución de ingresos/egresos por categoría, tipo de vendedor y modalidad de pago.
- **Cuadrícula de Listados de Alta Densidad (3 Columnas)**:
  - **Distribución Geográfica de Ventas**: Lista con barras de progreso de color azul que ilustra el mercado por localidad.
  - **Nuevos Compradores por Localidad**: Lista con barras de progreso de color violeta y un totalizador en la cabecera indicando la cantidad acumulada de nuevos asociados captados en la edición.
  - **Rendimiento de Vendedores**: Ranking de rendimiento de vendedores con badges informativos ("Particular" en naranja vs. "Comisión Club" en celeste) y posiciones en el Top.
  - *Scroll Simétrico*: Las tres tarjetas anteriores comparten el scrollbar oculto y un límite de altura de `280px` para mantener la proporción de la cuadrícula.
- **Gráfico Mensual a Ancho Completo**: El gráfico de área de la evolución mensual de ventas se ubicó en el pie de página ocupando el 100% de la pantalla para permitir una lectura cronológica extendida muy superior.
