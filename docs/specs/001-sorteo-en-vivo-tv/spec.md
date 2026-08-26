# Spec — Sorteo en Vivo en Pantalla de TV

**Estado:** Borrador  
**Carpeta:** `docs/specs/001-sorteo-en-vivo-tv/`

---

## 1. Problema y objetivo
La pantalla de consulta pública (`/bingoCardStatus`) se comparte en transmisiones en vivo (ej. Instagram Live) para que los vendedores y el público sigan el sorteo. 
El próximo sorteo tiene dos modalidades en el mismo día: 
1. **Sorteo por Cuotas al Día (Normal):** Participan los cartones vendidos que no tengan cuotas vencidas.
2. **Sorteo por Pago de Contado:** Participan únicamente los cartones que hayan sido pagados en su totalidad (100% cobrados).

Se necesita diferenciar visual y lógicamente el tipo de sorteo activo sin sobrecargar la interfaz (manteniéndola limpia, premium y apta para TV/transmisión en vivo), y suavizar los mensajes de error eliminando palabras chocantes como "Deuda" por términos más profesionales y adaptados al negocio.

---

## 2. Actores y permisos
*   **Presentador / Operador del Sorteo:** Puede cambiar la modalidad del sorteo activo y realizar la consulta ingresando la edición y el número de cartón.
*   **Público / Vendedores (Espectadores del Vivo):** Ven la pantalla compartida en la transmisión. No interactúan directamente, solo observan los resultados.

---

## 3. Alcance

### Incluye
*   Selector discreto para definir la modalidad de sorteo activa: **"Cuota al Día"** o **"Pago de Contado"**.
*   Evaluación lógica diferenciada según el sorteo activo al ingresar un número de cartón:
    *   **Modalidad Cuota al Día:** El cartón gana si está vendido y al día con sus cuotas (no tiene cuotas vencidas).
    *   **Modalidad Pago de Contado:** El cartón gana únicamente si está vendido y cobrado al 100% (`plan === 'Pago contado'`).
*   Reemplazo y suavizado del wording para cartones no ganadores/no participantes en la transmisión en vivo.
*   Diseño limpio "Zero-Clutter" que oculte controles de configuración de forma predeterminada para evitar contaminación visual en el Live.

### No incluye (explícito)
*   Modificaciones en las bases de datos de ventas o cuotas (el estado de pago se consulta en tiempo real desde la API existente).
*   Sorteo automático (la extracción de números se realiza de forma física o externa; esta pantalla solo valida el cartón resultante).

---

## 4. Comportamiento esperado

### A. Configuración de Modalidad (Panel de Control Oculto)
*   Para evitar que el cursor del mouse o botones de control se vean en la transmisión del sorteo, se introduce un panel de configuración colapsable (ej: cabecera que solo aparece al pasar el mouse por el borde superior, o mediante atajo de teclado).
*   Desde este panel, el operador puede seleccionar:
    1.  **Edición activa** del sorteo.
    2.  **Modalidad de Sorteo:** *"Sorteo Cuota al Día"* o *"Sorteo Pago de Contado"*.
*   La modalidad activa se muestra sutilmente en la parte superior central de la pantalla como título informativo (ej. *"MODALIDAD: PAGO DE CONTADO"* o *"MODALIDAD: CUOTAS AL DÍA"*).

### B. Validación en Sorteo "Cuota al Día" (Normal)
*   **Caso 1: Cartón al día (Ganador):** Muestra cartel de ¡GANADOR! con confeti, nombre del asociado y vendedor.
*   **Caso 2: Cartón con cuotas vencidas (No participa):** Muestra un cartel rojo de advertencia con el mensaje:  
    `"No participa — Cuotas pendientes"` (reemplaza a "Solicitud con Deuda").
*   **Caso 3: Cartón no vendido:** Muestra cartel con el mensaje:  
    `"No participa — Solicitud no vendida"`.

### C. Validación en Sorteo "Pago de Contado"
*   **Caso 1: Cartón pagado al 100% (Ganador):** Muestra cartel de ¡GANADOR! con confeti, nombre del asociado y vendedor.
*   **Caso 2: Cartón al día pero sin pago total (No participa):** Aunque el cliente no tenga cuotas vencidas, si le resta pagar alguna cuota del plan, el cartón no califica para el sorteo de contado. Muestra un cartel de advertencia con el mensaje:  
    `"No participa — Requiere pago de contado"` o `"No participa — Pago de contado incompleto"`.
*   **Caso 3: Cartón con cuotas vencidas (No participa):** Muestra:  
    `"No participa — Cuotas pendientes"`.
*   **Caso 4: Cartón no vendido:** Muestra:  
    `"No participa — Solicitud no vendida"`.

---

## 5. Reglas de negocio

1.  **[RN-MODALIDAD]** La lógica de validación de un cartón depende estrictamente de la modalidad de sorteo seleccionada en la UI en el momento de la consulta.
2.  **[RN-GANADOR-CUOTA]** En el *Sorteo Cuota al Día*, un cartón es válido si `sold === true` y `upToDate === true` (es decir, no tiene cuotas vencidas).
3.  **[RN-GANADOR-CONTADO]** En el *Sorteo Pago de Contado*, un cartón es válido si `sold === true` y `plan === 'Pago contado'` (es decir, el 100% de las cuotas están pagadas).
4.  **[RN-WORDING-TV]** Queda estrictamente prohibido el uso de la palabra "Deuda" en las pantallas de advertencia de la vista `/bingoCardStatus` para evitar incomodidad pública en el vivo.

---

## 6. Datos / entidades (conceptual)

Consumirá el endpoint actual `/api/bingocards/status?edition={id}&number={num}` que retorna:
*   `sold` (Boolean)
*   `upToDate` (Boolean): Indica si está al día con los vencimientos.
*   `plan` (String): `'Pago contado'` si todas las cuotas están pagas, de lo contrario `'Pago en cuotas'`.
*   `client` (String): Nombre del comprador.
*   `seller` (String): Nombre del vendedor.

---

## 7. Criterios de aceptación
*   `[ ]` La UI muestra un indicador claro y de alta gama del tipo de sorteo activo ("Sorteo Cuotas al Día" o "Sorteo Pago de Contado").
*   `[ ]` Los controles de selección de edición y modalidad están ocultos en un panel colapsable que no interfiere con la visualización limpia de la TV.
*   `[ ]` En el *Sorteo de Contado*, si se consulta un cartón vendido pero no cancelado en su totalidad (`plan === 'Pago en cuotas'`), se muestra la pantalla de "No participa — Requiere pago de contado" (sin fuegos artificiales ni confeti).
*   `[ ]` En cualquier modalidad, si el cartón tiene cuotas vencidas (`upToDate === false`), se muestra la pantalla de "No participa — Cuotas pendientes" en lugar de "Solicitud con Deuda".
*   `[ ]` En cualquier modalidad, si el cartón no está vendido, se muestra "No participa — Solicitud no vendida".
*   `[ ]` Se mantiene el funcionamiento de pantalla completa (Fullscreen) y el carrusel de auspiciantes en la parte inferior.

---

## 8. Clarificaciones
*(Se completarán en base a las respuestas del usuario)*

---

## 9. Dependencias y supuestos
*   Asume que el endpoint de Backend `/api/bingocards/status` calcula correctamente los campos `upToDate` y `plan` (lo cual ya está implementado en `bingoCard.controllers.js`).
