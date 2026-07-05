# Glosario Semántico Extenso: Gestión de Tómbola (2024-2025)

Este documento define la estructura de datos, tipos y propósitos de cada entidad operada en el sistema.

## 1. Entidades del Núcleo (Core Tómbola)

### 1.1 Modelo `Edition` (Edición)
La raíz de configuración para cada ciclo de rifa.
- `name` (String, Único): Nombre descriptivo, ej. "Tómbola 2024".
- `quantityCartons` (Number): Cantidad total de cartones a generar.
- `cost` (Number): Precio total de venta del cartón.
- `maxQuotas` (Number): Cantidad máxima de cuotas permitidas.
- `installments` (Array): Estructura de pagos predefinida.
    - `quotaNumber` (Number): Número correlativo.
    - `dueDate` (Date): Fecha de vencimiento.
    - `amount` (Number): Monto de esta cuota específica.

### 1.2 Modelo `BingoCard` (Cartón de Bingo)
Documento físico/digital individual.
- `edition` (Ref: Edition): Edición a la que pertenece.
- `number` (Number): Número único correlativo dentro de la edición.
- `status` (Enum: 'Disponible', 'Vendido'): Estado actual del cartón.
- `numbers` (Array[Number]): Conjunto de 15 números asignados (1-90). **DEP**: Ahora se usa `cardSets`.
- `cardSets` (Array): Sets de números (generalmente 5 sets por cartón).
    - `setNumber`: ID del set (1, 2, 3, 4, 5).
    - `numbers`: Array de 20 números por set.
- `seller` (Ref: Seller): Vendedor asignado actualmente.

### 1.3 Modelo `Sale` (Venta)
Registro de la transacción comercial.
- `saleNumber` (Number, Único): Generado por `Counter`. Correlativo de auditoría.
- `edition` (Ref: Edition).
- `seller` (Ref: Seller).
- `client` (Ref: Client).
- `bingoCard` (Ref: BingoCard).
- `status` (Enum: 'Pendiente de pago', 'Pagado', 'Anulada', 'Entregado sin cargo').
- `saleDate` (Date): Fecha de registro de la venta.
- `fullPaymentMethod` (Enum): 'Efectivo', 'Tarjeta', 'Transferencia', etc. (Solo si se paga total).
- `lastFullPayment` (Date): Fecha del último pago total.
- `cardPaymentDetails` (Object): Detalles si el pago fue con tarjeta (Titular, Número, Plan).

### 1.4 Modelo `Quota` (Cuota)
Instancia de pago por cada venta.
- `sale` (Ref: Sale): Venta asociada.
- `quotaNumber` (Number): Número de cuota.
- `dueDate` (Date): Vencimiento.
- `amount` (Number): Monto a cobrar.
- `paymentDate` (Date): Fecha efectiva de pago (null si no está paga).
- `paymentMethod` (String): Canal de pago (Efectivo, Tarjeta, etc.).

### 1.5 Modelo `Seller` (Vendedor) y `Client` (Cliente)
Entidades comerciales vinculadas a una Persona.
- `person` (Ref: Person): Datos personales (Nombre, DNI, etc.).
- `sellerNumber` / `clientNumber`: ID único incremental.
- `commissionRate` (Number): Solo para vendedores (0-100%).

### 1.6 Modelo `Person` (Persona)
Entidad base para evitar duplicidad de datos biográficos.
- `firstName`, `lastName`, `email`, `phone`, `address`.

## 2. Entidades de Soporte e Históricas (Legado)

### 2.1 Módulo Gestión Universitaria / Estudiantil
- **AcademicUnit**: Unidad académica (ej: Facultad de Ingeniería).
- **Dimension**: Categorización de proyectos de extensión o investigación.
- **Project**: Proyecto madre vinculado a dimensiones.
- **ActivityProject**: Actividades específicas dentro de un proyecto (con carga horaria).
- **Activity**: Registro de participación estudiantil en un proyecto de actividad.

### 2.2 Modelo `Task` (Tareas)
- `title`, `description`, `date`: CRUD sencillo de recordatorios.

## 3. Entidades de Sistema

### 3.1 Modelo `User` (Usuario)
Gestión de credenciales y perfiles de acceso.
- `username`, `email`.
- `password` (Hashed).
- `roles` (Enum: 'Administrador', 'Vendedor', 'Secretario', 'Director', 'Estudiante').
- `person` (Ref: Person): Enlace a los datos reales del usuario.

### 3.2 Modelo `Counter` (Contador)
- `model` (String): ID del modelo (ej: "Sale", "Seller").
- `seq` (Number): Último número utilizado.

> [!NOTE]
> **Integridad 2024/2025**: El sistema depende emocionalmente de la relación `User -> Person`. Si una `Person` es eliminada, el `User` pierde su identidad biográfica, pero conserva el login.
