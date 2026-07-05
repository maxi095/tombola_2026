# 📖 Estándar 08: Glosario Maestro de Wording (Elite 2026) ✨💎

Este documento es la **Fuente Única de Verdad** para la nomenclatura de la interfaz. Queda prohibido el uso de sinónimos o traducciones alternativas que no figuren en esta tabla. 🏹⚖️✨💎🚀

---

## 🏗️ 1. Títulos de Pantalla (`PageHeader`)

| Contexto | Formato Obligatorio | Ejemplo |
| :--- | :--- | :--- |
| **Listado Principal** | `Gestión de [Entidad]` | *Gestión de Usuarios*, *Gestión de Ventas* |
| **Alta de Datos** | `Registrar [Entidad]` | *Registrar Usuario*, *Registrar Vendedor* |
| **Modificación** | `Editar [Entidad]` | *Editar Usuario*, *Editar Comisión* |
| **Visualización** | `Detalle de [Entidad]` | *Detalle de Venta*, *Detalle de Cartón* |

---

## 🔘 2. Botones de Acción (Call to Action)

| Acción | Etiqueta Estricta | Icono Lucide Recomendado |
| :--- | :--- | :--- |
| **Crear nuevo registro** | `Crear [Entidad]` | `Plus` |
| **Confirmar Alta/Edición** | `Guardar cambios` | `Save` o `CheckCircle2` |
| **Cerrar sin cambios** | `Volver` | `ArrowLeft` |
| **Descarga de Datos** | `Exportar` | `FileSpreadsheet` |
| **Eliminación** | `Eliminar` | `Trash2` |
| **Búsqueda** | `Buscar` | `Search` |
| **Limpieza de Filtros** | `Limpiar` | `RotateCcw` |

---

## 🛡️ 3. Estados de Negocio (Badges)

Los estados deben ser consistentes entre el Backend (Mongoose) y la UI (Badges).

| Entidad | Estado Tradicional | Significado |
| :--- | :--- | :--- |
| **Venta** | `Pendiente de pago` | Transacción iniciada sin cobro. |
| **Venta** | `Pagado` | Transacción completada al 100%. |
| **Venta** | `Anulada` | **(No usar "Cancelada")** Registro invalidado. |
| **Venta** | `Entregado sin cargo` | Venta de cortesía o bonificada. |
| **Cartón** | `Disponible` | Listo para la venta. |
| **Cartón** | `Vendido` | Asignado a una venta activa. |

---

## 🏹 4. Micro-Copy Institucional

- **Placeholders**: `Buscar [X], [Y] o [Z]...` (Siempre descriptivo).
- **Tooltips**: Siempre en minúsculas con la primera en mayúsculas (Ej: *Ver detalle de la venta*).
- **Toast Feedback**: 
    - Éxito: `[Entidad] registrado/a con éxito`.
    - Error: `Error al procesar la solicitud`.

---

> [!IMPORTANT]
> **Regla de Oro**: Si el usuario pide un botón "Nuevo", la IA DEBE proponer **"Crear"**. El término "Nuevo" queda deprecado para acciones, usándose solo para estados de datos (ej: *Nueva Edición* en el título de la página de alta). 🏹⚖️✨🚀
