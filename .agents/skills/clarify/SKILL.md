---
name: clarify
description: Etapa 2 del flujo SDD. Detecta zonas subespecificadas de una spec funcional y hace hasta 5 preguntas de alto impacto para cerrarlas, codificando las respuestas de vuelta en spec.md. Usalo después de specify cuando la spec tiene marcadores [NEEDS CLARIFICATION] o ambigüedades, o antes de planificar para asegurar que no falten decisiones. Tech-agnostic.
---

# SDD · Clarify

Reducís la incertidumbre de una spec **antes** de planificar. Hacés pocas preguntas pero certeras, y dejás la spec cerrada. Cada ambigüedad no resuelta acá se vuelve retrabajo o un supuesto equivocado en el código.

## Principio rector

**Máximo 5 preguntas por ronda**, ordenadas por impacto: priorizá las que, si se responden mal, hacen reescribir el plan o el código. Una pregunta de bajo impacto desperdicia el cupo.

## Proceso

1. **Leé `spec.md`** completa, incluidos los marcadores `[NEEDS CLARIFICATION]`.
2. **Escaneá categorías de ambigüedad** y detectá huecos materiales:
   - Alcance: bordes incluido/excluido difusos.
   - Reglas de negocio: cálculos, validaciones, casos límite sin definir.
   - Actores/permisos: quién puede qué, qué pasa sin permiso.
   - Estados y transiciones: qué los dispara, qué es terminal.
   - Datos: obligatoriedad, unicidad, formatos, defaults.
   - Errores y fallas: comportamiento ante input inválido o servicio caído.
   - Integraciones: contratos, timeouts, idempotencia.
   - No-funcionales: volumen, concurrencia, auditoría, si son materiales.
3. **Elegí hasta 5 preguntas** de mayor impacto. Si hay menos de 5 huecos reales, hacé menos. No infles.
4. **Preguntá de forma accionable**: cada pregunta con opciones concretas cuando aplique (te conviene proponer la opción recomendada primero). Evitá preguntas abiertas que devuelvan otra ambigüedad.
5. **Codificá las respuestas en la spec**, no solo en el chat:
   - Quitá el marcador `[NEEDS CLARIFICATION]` correspondiente y reescribí la sección afectada.
   - Registrá la decisión en la sección **8. Clarificaciones** con formato `P{n}: <pregunta> → <respuesta/decisión>`.
6. **Repetí si hace falta.** Si tras responder surgen nuevas dudas materiales, otra ronda (≤5). Parás cuando no quedan ambigüedades que cambien plan o código.

## Reglas

- **No planifiques acá.** No propongas diseño técnico; solo cerrás el QUÉ.
- **No preguntes lo decidible.** Si la respuesta se infiere de la constitution, specs vecinas o convenciones del repo, resolvé vos y dejá constancia en Clarificaciones — no gastes una pregunta.
- **Trazabilidad.** Toda decisión queda escrita en `spec.md §8`. El chat no es la fuente de verdad.

## Salida y handoff

`spec.md` actualizada, sin marcadores pendientes materiales, con §8 poblada. Marcá el estado de la spec como **Cerrada**. Handoff → `plan`.
