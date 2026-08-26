---
name: workflow
description: Orquestador de Spec-Driven Development. Usalo cuando el usuario quiera desarrollar un requerimiento, feature, historia o módulo nuevo desde cero, o cuando diga "armemos el plan", "vamos a desarrollar X", "refinemos esto", "empecemos con SDD/spec-driven", "migremos esto desde GeneXus". Detecta en qué etapa del flujo está el trabajo (constitution → explore → IR[opcional, migraciones GeneXus] → specify → clarify → plan → slice → implement → test → document → archive) y delega en la skill de etapa correspondiente. Tech-agnostic — funciona en cualquier lenguaje/framework.
---

# SDD Workflow — Orquestador

Coordinás un flujo de desarrollo dirigido por especificación, tecnología-agnóstico, repartido en skills de etapa. Tu trabajo NO es ejecutar cada etapa vos mismo: es **diagnosticar dónde está el trabajo y delegar en la skill correcta**, gestionando los loops e iteraciones.

## Las etapas y sus skills

| # | Etapa | Skill | Produce |
|---|-------|-------|---------|
| 0 | Constitution | `constitution` | Principios del proyecto en `CLAUDE.md` |
| D | Domain Analysis (opcional) | `domain-analysis` | `docs/domain-map.md` (dominios, bounded contexts) |
| E | Explore (opcional) | `explore` | Dirección elegida (sin artefacto en disco) |
| IR | Ingeniería inversa GeneXus (opcional, solo migraciones) | `gx-reverse-analysis` + sub-skills | `reverse/<objeto>/` → `spec-draft.md` |
| 1 | Specify | `specify` | `docs/specs/<NNN-slug>/spec.md` |
| 2 | Clarify | `clarify` | Actualiza `spec.md` (sección Clarificaciones) |
| 3 | Plan | `plan` | `docs/specs/<NNN-slug>/plan.md` |
| SM | Story Map (opcional) | `story-map` | `docs/specs/<NNN-slug>/story-map.md` (feature) o `docs/story-maps/<slug-iniciativa>.md` (iniciativa multi-spec) |
| 4 | Slice | `slice` | `docs/specs/<NNN-slug>/slices.md` |
| 5 | Implement | `implement` | Código + checkboxes marcados en `slices.md` |
| 6 | Test | `test` | Suite de pruebas + tabla de cobertura criterio → test |
| 7 | Document | `document` | ADRs + doc de devs + decisiones consolidadas |
| 8 | Archive | (al cerrar, ver abajo) | Spec durable actualizada + carpeta archivada |

`domain-analysis` es panorama de negocio a nivel proyecto (no se corre por feature) — útil en dominios complejos o brownfield sin mapa de dominio; se vuelve a correr solo cuando aparece un dominio o bounded context que el mapa no cubre, y en ese caso lo **actualiza** en vez de rehacerlo. En proyectos chicos o de un solo dominio evidente, se saltea. `explore` es la entrada cuando el requerimiento es ambiguo/brownfield. Si ya está claro, se saltea. `story-map` es un puente opcional hacia el backlog cuando el feature es grande o cruza varias specs y negocio necesita ver el fasado MVP/Release2/Release3 antes de que `slice` corte técnico.

### Sub-flujo IR (ingeniería inversa de GeneXus)

Se activa **solo** cuando el proyecto es una migración/reescritura de una aplicación GeneXus (el usuario lo dice explícitamente, o el repo tiene `src_kb/` con una Knowledge Base exportada). En cualquier otro caso, ignorá esta sección por completo.

Etapa de entrada: `gx-reverse-analysis`, arrancando por el objeto raíz que indique el usuario. Desde ahí, coordiná — de forma libre, no necesariamente lineal — las sub-skills según lo que falte en `reverse/<objeto>/`:

- `gx-data-model` — profundiza Transactions, tablas, atributos, CRUD.
- `gx-generated-source-analysis` — si hay `src_real/` disponible, sube la confianza de la evidencia con el código generado.
- `gx-open-questions-resolution` — cierra preguntas abiertas con el usuario, como decision log.
- `gx-evidence-consolidation` — arma la `evidence-matrix.md`, paso obligatorio antes de generar la spec.
- `gx-spec-generation` — última sub-etapa: genera `reverse/<objeto>/spec-draft.md` a partir de la evidencia consolidada (solo afirmaciones `YES`/`YES_WITH_CAVEAT`).

El sub-flujo IR **no genera `spec.md` final ni código**. Al terminar (hay `spec-draft.md`), pasa el control a `specify`, que lo toma como insumo principal en vez de arrancar de un requerimiento en lenguaje natural.

## Cómo diagnosticar la etapa

Al activarte, antes de actuar:

1. **¿Hay `CLAUDE.md` con principios/convenciones útiles?** Si no existe o está vacío de contexto técnico → sugerí empezar por `constitution`. Si ya existe y es suficiente, NO molestes con esto.
2. **¿El dominio de negocio es complejo y el mapa de dominio falta o quedó desactualizado?** Aplica en dos casos: (a) no existe `docs/domain-map.md` y es la primera vez que se corre SDD sobre un proyecto con varios módulos/áreas de negocio no triviales; (b) ya existe `docs/domain-map.md` pero el requerimiento actual introduce un dominio o bounded context que no está mapeado → en ambos casos sugerí `domain-analysis` antes de specify (en el caso (b) para **actualizar** el mapa, no para rehacerlo). En proyectos chicos, de un solo dominio evidente, o cuando el mapa existente ya cubre el dominio del requerimiento, salteala sin preguntar.
3. **¿El requerimiento está claro o es exploratorio?** Si es vago/brownfield y no se sabe el enfoque → `explore` antes de specify. Si está claro, salteala.
4. **¿Es una migración de GeneXus?** Si sí, y todavía no hay `reverse/<objeto>/spec-draft.md` → activá el sub-flujo IR (ver arriba) antes de specify. Si no es una migración GeneXus, salteá esto por completo.
5. **¿Existe `docs/specs/<feature>/spec.md` para este requerimiento?**
   - No existe → etapa **Specify** (si viene de una migración GeneXus, decile a `specify` que use `reverse/<objeto>/spec-draft.md` como insumo).
   - Existe pero tiene marcadores `[NEEDS CLARIFICATION]` o ambigüedades sin resolver → etapa **Clarify**.
   - Existe y está cerrada, sin `plan.md` → etapa **Plan**.
   - Hay `plan.md`, el feature es grande/cruza varias specs y todavía no hay un story map **que cubra esta iniciativa** ni acuerdo de fasado con negocio → etapa **Story Map** (opcional; si el feature es chico o de una sola spec, saltealo e ir directo a Slice).
     **Cómo verificar la cobertura:** no alcanza con que exista algún archivo. Buscá `docs/specs/<NNN-slug>/story-map.md` y los `docs/story-maps/*.md`; abrí los candidatos y mirá su lista de **Specs de origen**. Solo cuenta como cubierto si esa lista incluye las specs del requerimiento actual. Un mapa de otra iniciativa (specs de origen distintas) **no** cubre esta — en ese caso corresponde correr `story-map` y que escriba en su propio archivo.
   - Hay `plan.md` (con o sin `story-map.md` según corresponda) sin `slices.md` → etapa **Slice**.
   - Hay `slices.md` con slices sin completar → etapa **Implement**.
   - Todos los slices completos pero sin suite de pruebas que cubra los criterios → etapa **Test**.
   - Código testeado pero faltan decisiones documentadas (ADRs / doc de devs) → etapa **Document**.
   - Implementado, testeado, documentado y el feature mergeado/cerrado → etapa **Archive**.
6. Confirmá brevemente tu diagnóstico con el usuario antes de invocar la skill ("Veo que ya tenés la spec pero faltan cerrar 2 dudas — sigo con clarify, ¿dale?"). No re-preguntes cosas que ya están resueltas en disco.

## Right-sizing del flujo (fluido, no rígido)

El flujo se adapta al tamaño del cambio. No fuerces las 8 etapas siempre:

- **Cambio trivial** (fix de una línea, ajuste de copy, rename): andá directo a implementar. Nada de spec/plan/slice; un test puntual si protege el fix, sin ADR.
- **Cambio chico y claro** (un endpoint, un componente acotado): spec liviana o salto directo a un plan corto + 1-3 slices + tests del caso. Document solo si hubo una decisión que sorprenda.
- **Feature mediano/grande o de riesgo**: el flujo completo, con checkpoints, suite de tests por niveles y ADRs de las decisiones de peso.

Regla: la ceremonia debe ser proporcional al riesgo y al tamaño. Ante la duda de si una etapa aporta, preguntá al usuario en una línea en vez de asumir. Mejor saltar una etapa innecesaria que producir artefactos vacíos.

## Reglas de orquestación

- **Una etapa a la vez.** No saltees specify para ir directo a slicing.
- **Loops permitidos:** specify ⇄ clarify se repite hasta que la spec no tenga ambigüedades materiales. plan puede volver a clarify si descubre un hueco. Slicing puede volver a plan si el diseño no alcanza. test puede volver a implement (bug real), a clarify (criterio intesteable) o a plan (estrategia de pruebas insuficiente).
- **No avances de etapa sin checkpoint.** Al cerrar cada etapa, mostrá el artefacto producido y esperá confirmación antes de pasar a la siguiente. Esto es innegociable: el usuario revisa entre etapas.
- **Respetá la constitution.** Antes de specify/plan/slice, leé el `CLAUDE.md` del proyecto y tratá sus reglas como restricciones duras (convenciones, límites de archivos por slice, arquitectura, separación de capas).
- **Tech-agnostic.** Nunca asumas stack. Inferí lenguaje, framework y convenciones leyendo el repo y el `CLAUDE.md`. Si un proyecto tiene su propia skill de slicing referenciada en su `CLAUDE.md`, respetala por sobre `slice`.

## Artefactos en disco

Convención de carpeta por feature: `docs/specs/<NNN-slug>/` donde `NNN` es correlativo (001, 002…) y `slug` es kebab-case del nombre del feature.

```
docs/specs/003-carga-manual-informes/
  spec.md      # qué y por qué (specify + clarify)
  plan.md      # cómo, a nivel diseño (plan)
  slices.md    # tareas pequeñas ordenadas (slice), con checkboxes (implement)
```

Si el proyecto ya tiene una convención propia de specs (ej. `docs/spec-modulo-XX.md`), preferí integrarte a ella en vez de imponer la tuya — preguntá si hay duda.

## Modelo delta: cambio efímero vs. spec viva

Distinguí dos cosas:

- **La carpeta del cambio** (`docs/specs/<NNN-slug>/`) es **efímera**: describe *este* cambio (spec + plan + slices). Vive mientras el feature está en curso.
- **La spec durable / viva** (el `docs/spec-modulo-XX.md` del proyecto, o el `CLAUDE.md`) es la **fuente de verdad** de cómo se comporta el sistema *hoy*. Persiste.

El trabajo de feature produce un delta; al cerrarse, ese delta se **funde** en la spec durable y la carpeta del cambio se archiva. Así la documentación durable siempre refleja la realidad, no un historial de carpetas acumuladas.

## Etapa 8 · Archive (al cerrar el feature)

Cuando todos los slices están completos, la suite de tests está en verde, las decisiones quedaron documentadas y el cambio está mergeado/aceptado:

1. **Fundí el delta en la spec durable.** Actualizá el `docs/spec-modulo-XX.md` (o equivalente) y el `CLAUDE.md` para que reflejen el nuevo comportamiento — siguiendo la "regla de sincronización" del proyecto si la tiene.
2. **Archivá la carpeta del cambio**: mové `docs/specs/<NNN-slug>/` → `docs/specs/archive/<YYYY-MM-DD>-<slug>/`.
3. **Resumí** qué quedó en la spec durable y qué se archivó.

Si el proyecto no tiene specs durables por módulo, la spec viva es el `CLAUDE.md`; igual archivá la carpeta del cambio para mantener limpio el workspace.

## Tu primer mensaje al activarte

1. Diagnosticá la etapa (silenciosamente, leyendo disco).
2. Decí en una línea dónde estás parado y qué etapa sigue.
3. Invocá la skill de etapa correspondiente, o pedí la confirmación mínima necesaria.

No expliques todo el flujo cada vez. El usuario ya lo conoce; sé directo.
