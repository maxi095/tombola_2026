---
name: story-map
description: "Etapa opcional del flujo SDD, entre clarify y slice. Traduce una o varias specs cerradas en un User Story Map (Activity → Task → User Story, formato Como/Quiero/Para) agrupado por MVP/Release 2/Release 3, como puente hacia el backlog para product owners y stakeholders no técnicos. Usalo cuando el feature es grande, involucra varias specs relacionadas que conviene fasear juntas, o cuando el usuario pide explícitamente 'story map', 'user story mapping', 'backlog', 'priorizar releases' o 'qué entra en el MVP'. No reemplaza a slice, que corta técnico (archivos, dependencias de implementación) sobre UNA spec — story-map corta por valor de negocio y horizonte de entrega, y puede abarcar varias specs a la vez. Tech-agnostic."
---

# SDD · Story Map

Traducís specs ya cerradas a un mapa de historias de usuario que un product owner puede leer sin conocer la implementación: qué actividades hace el usuario, qué tareas la componen, y qué historias concretas hay que construir — todo agrupado por cuándo se entrega.

## Cuándo correr esta etapa

- El feature es grande o abarca varias specs relacionadas (`docs/specs/00X-*`) que tiene sentido priorizar juntas en un mismo backlog.
- El usuario o un stakeholder de negocio necesita ver el trabajo faseado en releases antes de que `slice` empiece a cortar tareas técnicas.
- Hay presión de negocio por decidir qué entra en el MVP vs. qué se pospone, y esa decisión todavía no está tomada de forma explícita.

**Saltala** en features chicos o de una sola spec donde `slice` ya alcanza para ordenar el trabajo — no dupliques el mismo corte dos veces con vocabularios distintos.

## Principio rector

Un story map no es una lista de tareas técnicas — es un mapa de **valor para el usuario**, ordenado horizontalmente por el flujo de actividades que la persona hace de punta a punta, y verticalmente por prioridad de entrega. Sirve para que negocio y desarrollo miren el mismo backlog y estén de acuerdo en qué es "lo mínimo que sirve".

## Proceso

1. **Leé la(s) spec(s) cerrada(s)** (`spec.md` de cada feature involucrado) — sección de actores, comportamiento esperado y criterios de aceptación son la materia prima.
2. **Identificá las Activities**: los grandes pasos que el actor recorre de punta a punta (el "backbone" horizontal del mapa). Suelen coincidir con las secciones de "Comportamiento esperado" de la spec, vistas desde la experiencia del usuario, no del sistema.
3. **Bajo cada Activity, identificá las Tasks**: los pasos concretos que la componen.
4. **Bajo cada Task, escribí las User Stories** en formato `Como [actor] / Quiero [objetivo] / Para [beneficio]`, trazadas a un criterio de aceptación de la spec — si una historia no traza a ningún criterio, o falta en la spec o sobra en el mapa.
5. **Priorizá verticalmente**: para cada historia, decidí si es necesaria para el **MVP** (lo mínimo que ya entrega valor real y punta a punta), **Release 2**, **Release 3**, o **Pendiente de definición** (si la prioridad depende de una decisión de negocio que no está tomada). Justificá cada corte con evidencia de la spec, no con preferencia propia.
6. **Escribí el mapa en la ruta que corresponda al alcance:**
   - Mapa de **un solo feature** (una spec) → `docs/specs/<NNN-slug>/story-map.md`.
   - Mapa de **iniciativa** (cruza varias specs) → `docs/story-maps/<slug-iniciativa>.md`, con un slug propio de la iniciativa (ej. `docs/story-maps/portal-autogestion.md`). **Nunca uses un `docs/story-map.md` único a nivel proyecto**: un proyecto puede tener varias iniciativas multi-spec en paralelo y un archivo compartido las pisa entre sí.

   Antes de escribir, si el archivo destino ya existe: leelo y compará su lista de **Specs de origen** con las specs de la iniciativa actual. Si coinciden (o la actual es una ampliación), **actualizá ese mapa**. Si son iniciativas distintas, elegí otro slug — no sobrescribas.

## Estructura de `story-map.md`

```markdown
# Story Map — <Nombre de la iniciativa/feature>

**Alcance:** feature | iniciativa
**Specs de origen:** (listá TODAS, una por línea, con ruta completa — esta lista es lo que permite saber si un mapa existente cubre o no la iniciativa actual)
- `docs/specs/<NNN-slug>/spec.md`
- `docs/specs/<MMM-slug>/spec.md`

**Estado:** Borrador | Validado con negocio

## Backbone (Activities → Tasks)

### Activity: <nombre>
- Task: <nombre>
- Task: <nombre>

(repetir por activity)

## Historias por Task

### Task: <nombre>
- [ ] **MVP** — Como <actor>, quiero <objetivo>, para <beneficio>. _(criterio: spec §N)_
- [ ] **Release 2** — …
- [ ] **Release 3** — …
- [ ] **Pendiente de definición** — … _(por qué está pendiente: …)_

(repetir por task)

## Resumen de alcance por release
| Release | Historias | Objetivo de negocio de esta tanda |
|---|---|---|
| MVP | N | … |
| Release 2 | N | … |
| Release 3 | N | … |

## Historias sin spec / specs sin historia
Discrepancias detectadas: historias necesarias que no trazan a ningún criterio de aceptación (falta en la spec), o criterios de la spec que no se tradujeron a ninguna historia (revisar si son necesarios o si el mapa quedó incompleto).
```

## Reglas de calidad

- **Trazabilidad obligatoria.** Toda historia debe poder señalar a qué criterio de aceptación de qué spec responde. Si no puede, no es una historia real — es una idea suelta que necesita pasar primero por `specify`/`clarify`.
- **Sin diseño técnico.** Nada de nombres de tablas, endpoints ni componentes — esto es negocio puro, igual que la spec.
- **La priorización se justifica, no se asume.** "Va en el MVP porque sin esto el flujo principal no cierra" es una justificación válida; "me parece importante" no.
- **No es un Gantt.** No estimes tiempos ni fechas salvo que el usuario los pida explícitamente — el story map ordena por valor y dependencia funcional, no por calendario.
- **Un mapa por iniciativa, sin pisadas.** Cada iniciativa multi-spec vive en su propio `docs/story-maps/<slug-iniciativa>.md`. Un mapa existente solo se reusa si sus **Specs de origen** son las de la iniciativa actual; si no, es otra iniciativa y va a otro archivo.

## Salida y handoff

`story-map.md`, resumen de historias por release y de cualquier discrepancia detectada entre historias y specs. Esperá confirmación del usuario/product owner sobre el corte MVP/Release2/Release3 — es una decisión de negocio, no técnica. Handoff → `slice`, que ahora puede priorizar el orden de corte técnico siguiendo el mismo horizonte de release ya acordado.
