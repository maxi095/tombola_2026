# Mapa de Reglas de Negocio: Sistema de Gestión de Tómbola

Este documento detalla la lógica operativa, fórmulas de cálculo y bifurcaciones de flujo del sistema, basadas en la ingeniería inversa del código fuente (2024-2025).

## 1. Módulo de Ventas y Finanzas (Core)

### 1.1 Proceso de Creación de Ventas (`createSale`)
Cuando se registra una nueva venta, el sistema ejecuta una serie de pasos críticos para garantizar la integridad de los datos:

- **Validación de Existencia**: Se verifica que la `Edition`, el `Seller`, el `Client` y el `BingoCard` existan en la base de datos.
- **Generación de Número de Venta**: Se utiliza el modelo `Counter` para obtener un `saleNumber` secuencial único (ej. 0001, 0002).
- **Cambio de Estado del Cartón**: El estado del `BingoCard` seleccionado cambia automáticamente de "Disponible" a "Vendido".
- **Generación Automática de Cuotas**: 
    - El sistema lee el array de `installments` predefinido en la `Edition`.
    - Por cada cuota configurada en la edición, se crea un documento en la colección `Quota`.
    - **Fórmula de Monto**: El monto de cada cuota se toma directamente de la definición de la edición (`installment.amount`).
    - **Estado Inicial**: Todas las cuotas nacen con `paymentDate: null` y `paymentMethod: null`.

### 1.2 Anulación de Ventas (`cancelSale`)
- **Impacto en el Cartón**: Al anular una venta, el `BingoCard` asociado vuelve a estar "Disponible".
- **Estado de la Venta**: Cambia a "Anulada". No se eliminan los registros para mantener la trazabilidad.

### 1.3 Gestión de Pagos de Vendedores (`createSellerPayment`)
Registra la entrega de dinero recolectado por los vendedores.
- **Cálculo de Totales**: Se suma `cashAmount`, `transferAmount`, `tarjetaUnicaAmount` y el total de los cheques en el array `checks`.
- **Comisiones**: Se registra el `commissionRate` (porcentaje) y el `commissionAmount` (monto absoluto) que el vendedor retiene o se le descuenta.
- **Validación**: El total recolectado debe ser mayor a cero.

## 2. Algoritmo de Optimización de Cartones (Simulated Annealing)

Ubicado en `edition.controllers.js`, es el "motor" del sistema para evitar que múltiples personas ganen simultáneamente con números muy similares.

| Parámetro | Valor / Lógica |
| :--- | :--- |
| **Población** | Se generan 816 cartones (X=816) por defecto. |
| **Composición** | Cada cartón tiene exactamente 15 números (K=15) entre 1 y 90 (M=90). |
| **Función de Costo** | Evalúa la probabilidad de empates en el primer premio y castiga la coincidencia excesiva de números entre cartones (Set Number). |
| **Enfriamiento (Cooling)** | `T *= 0.995` en cada iteración. |
| **Penalización** | Si dos cartones comparten más de 8 o 9 números, el algoritmo aumenta el "costo" drásticamente para obligar a cambiar uno de los cartones. |

## 3. Lógica de Sorteos (`draw.controllers.js`)

### 3.1 Registro de Ganadores
- El sistema permite buscar un cartón por número dentro de la edición del sorteo.
- Al encontrarlo, identifica automáticamente al cliente y al vendedor a través de la relación de la `Sale`.
- Guarda la marca de tiempo `winnerRegisteredAt`.

### 3.2 Sorteo Final (Tipo Bingo)
- **Cálculo de Aciertos**: El endpoint `getTopBingoCards` compara los `drawnNumbers` (números que van saliendo) con los números grabados en cada cartón vendido.
- **Ranking Tiempo Real**: Genera un Top 10 de cartones que están "a punto" de ganar (con más aciertos).

## 4. Seguridad y Acceso (`auth.controllers.js`)

- **Autenticación**: Basada en JWT (JSON Web Tokens) persistidos en Cookies HTTP-only.
- **Roles**:
    - `Administrador`: Acceso total (Tómbola + Actividades).
    - `Vendedor`: Acceso restringido a sus propias ventas y clientes.
    - `Director / Secretario / Estudiante`: Roles del módulo legado de gestión de actividades.

## 5. Validaciones (Zod Schemas)

| Entidad | Regla Crítica |
| :--- | :--- |
| **Sale** | `status` debe ser uno de: ['Pendiente de pago', 'Pagado', 'Cancelado']. |
| **Quota** | `amount` debe ser >= 0. `quotaNumber` debe ser un entero >= 1. |
| **Edition** | `name` es obligatorio y debe ser único. |
| **BingoCard** | `number` debe ser único dentro de la misma edición. |

> [!IMPORTANT]
> **Integridad de Datos 2026**: Cualquier modernización en la estructura de cuotas debe considerar que el proceso de "Pago" de una cuota (`updateQuota`) dispara una verificación de la venta: si todas las cuotas están pagas, la venta cambia automáticamente a estado "Pagado".
