# Slices de Implementación — Sorteo en Vivo (Pantalla de TV)

**Estado:** Planeado  
**Especificación:** [spec.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/001-sorteo-en-vivo-tv/spec.md)  
**Plan Técnico:** [plan.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/001-sorteo-en-vivo-tv/plan.md)

---

## Estrategia de Corte
Dividimos la tarea en 2 slices verticales de bajo impacto:
1.  **Slice 1 (UI e Interfaz Limpia):** Creación del panel de control superior oculto (hover-activated), agregando estados para `drawMode` y la visualización de la modalidad activa.
2.  **Slice 2 (Lógica y Wording):** Implementación de la bifurcación lógica según la modalidad de sorteo activa y el suavizado de la UI/Wording para los estados no ganadores.

---

## Lista de Slices

### Slice 1 — Panel de Control Oculto e Interfaz Limpia (UI)
- [x] **Objetivo:** Implementar la barra de configuración superior oculta y los selectores de modo y edición para el operador.
- **Valor / progreso observable:** Al pasar el mouse en el extremo superior de la pantalla, aparece suavemente un panel negro traslúcido que permite seleccionar el tipo de sorteo (Cuotas al Día / Pago de Contado) y la Edición, mostrando en pantalla la modalidad activa sin contaminar visualmente el vivo.
- **Incluye:** 
    *   Variables de estado en `BingoCardStatusPage.jsx` (`drawMode`, `editionId`, `cardNumber`).
    *   Estructura HTML y clases CSS Tailwind para el panel colapsable superior (`translate-y-[-100%] hover:translate-y-0`).
    *   Indicador en texto estilizado en la parte superior central con la modalidad activa.
- **Excluye:** Cambios en la lógica de evaluación del resultado de la consulta.
- **Archivos a crear:** Ninguno.
- **Archivos a modificar:** [BingoCardStatusPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/bingoCard/BingoCardStatusPage.jsx).
- **Depende de:** Ninguno.
- **Complejidad:** Baja.
- **Pruebas:** Manuales (verificar efecto hover, selección de modo y visualización de la modalidad activa).
- **Commit sugerido:** `feat(tv-draw): add hidden control panel and active mode indicator`

---

### Slice 2 — Lógica de Validación y Wording Suave (Integración)
- [x] **Objetivo:** Implementar las validaciones por modalidad y reescribir los mensajes de advertencia de forma amigable para el vivo.
- **Valor / progreso observable:** Al consultar un cartón, se evalúa su validez según la modalidad activa. Los cartones con problemas de pago no muestran confeti y visten un mensaje profesional como "No participa — Cuotas pendientes" en lugar de "Solicitud con Deuda". Si es modalidad Contado, los cartones sin pago total muestran "No participa — Pago de contado incompleto".
- **Incluye:**
    *   Lógica bifurcada en `handleSubmit` basada en `drawMode`.
    *   Diseño y renderizado de la tarjeta para el estado `not-full-paid`.
    *   Edición de textos en las tarjetas para los estados `debt` y `not-sold`.
- **Excluye:** Modificaciones de base de datos.
- **Archivos a crear:** Ninguno.
- **Archivos a modificar:** [BingoCardStatusPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/bingoCard/BingoCardStatusPage.jsx).
- **Depende de:** Slice 1.
- **Complejidad:** Media.
- **Pruebas:** Manuales (consultar cartones con diferentes estados en ambas modalidades de sorteo).
- **Commit sugerido:** `feat(tv-draw): implement double draw logic and soft live wording`
