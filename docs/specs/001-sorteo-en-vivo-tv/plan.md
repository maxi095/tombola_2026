# Plan Técnico — Sorteo en Vivo (Pantalla de TV)

**Estado:** Cerrado  
**Especificación:** [spec.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/001-sorteo-en-vivo-tv/spec.md)

---

## 1. Arquitectura y Diseño Técnico
La lógica técnica requerida se implementa completamente en el Frontend del cliente, ya que el Backend ya retorna todos los datos de auditoría de pago en la respuesta del cartón:
*   `response.sold` (Indica si está vendido).
*   `response.upToDate` (Indica si está al día con sus cuotas).
*   `response.plan` (Retorna `'Pago contado'` si el 100% de las cuotas están pagas, o `'Pago en cuotas'`).

---

## 2. Modificaciones de Archivos

### Frontend (client)

#### [MODIFY] [BingoCardStatusPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/bingoCard/BingoCardStatusPage.jsx)
1.  **Estados:**
    *   Agregar `drawMode`: `'cuota'` | `'contado'` (default: `'cuota'`).
    *   Expandir `gameState` para incluir `'not-full-paid'`.
2.  **Panel de Control Oculto:**
    *   Agregar un contenedor `<div className="absolute top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md translate-y-[-100%] hover:translate-y-0 focus-within:translate-y-0 transition-transform duration-300 z-50 flex items-center justify-between px-6 border-b border-white/10">`.
    *   Este panel contendrá el selector de Edición y los botones tipo toggle para cambiar el `drawMode`.
3.  **Wording y Estados en UI:**
    *   Actualizar `gameState === 'debt'` para renderizar `"No participa — Cuotas pendientes"`.
    *   Actualizar `gameState === 'not-sold'` para renderizar `"No participa — Solicitud no vendida"`.
    *   Agregar render para `gameState === 'not-full-paid'` que muestre:
        *   Título: `"No participa — Pago de contado incompleto"`
        *   Subtítulo: `"La solicitud presenta cuotas pagas al día, pero no ha sido cancelada en su totalidad."`
        *   Icono: ⚠️ o similar con color de advertencia (naranja/amarillo).
4.  **Título de Modalidad Activa:**
    *   Mostrar la modalidad de sorteo activa en la parte superior central de la transmisión de forma prominente.
    *   **Mejora de Verificación:** Concatenar dinámicamente el nombre de la edición seleccionada (`editions.find(e => e._id === editionId).name`) al lado del título (ej: `SORTEO PAGO DE CONTADO - TÓMBOLA 2026`) para garantizar la verificación visual del operador en vivo.

