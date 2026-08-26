---
name: document
description: Etapa 7 del flujo SDD. Produce la documentación durable del cambio para otros devs — ADRs (registros de decisiones de arquitectura), doc de módulo/feature y consolidación de las decisiones técnicas y funcionales que de otro modo se pierden al archivar. Usalo cuando el feature está implementado y testeado, antes de fundir el delta y archivar. Tech-agnostic.
---

# SDD · Document

Dejás el conocimiento del cambio **legible para otros devs y para tu yo futuro**. A lo largo del flujo se tomaron decisiones (técnicas en `plan.md §5`, funcionales en `spec.md §8`) que, si solo se archivan, quedan enterradas. Acá las consolidás en documentación durable: por qué el sistema es como es, no solo cómo es.

## Principio rector

**Documentá las decisiones y su porqué, no el detalle obvio del código.** El código ya dice *qué hace*; la doc valiosa explica *por qué se eligió así*, qué alternativas se descartaron y qué pasa si alguien las quiere cambiar. Si algo se infiere leyendo el código en 30 segundos, no lo documentes.

## Qué produce esta etapa

Adaptá al proyecto; no fuerces artefactos que no aporten:

1. **ADR (Architecture Decision Record)** — para cada decisión técnica de peso tomada en el plan. Formato corto y estándar:
   ```markdown
   # ADR-NNN: <título de la decisión>
   **Estado:** Propuesta | Aceptada | Reemplazada por ADR-XXX
   **Fecha:** YYYY-MM-DD
   ## Contexto
   Qué problema/restricción forzó la decisión.
   ## Decisión
   Qué se decidió, en una o dos frases claras.
   ## Alternativas consideradas
   Qué más se evaluó y por qué se descartó.
   ## Consecuencias
   Qué gana el sistema, qué cuesta, qué queda condicionado a futuro.
   ```
   Viven en `docs/adr/` (o donde el proyecto los tenga). Numerados y correlativos. **Una decisión, un ADR** — no mezcles varias.

2. **Doc de módulo / feature para devs** — cuando el cambio introduce o modifica algo que otro dev va a tocar: qué hace, cómo se usa, puntos de entrada, gotchas, variables de entorno. Apuntá al onboarding de quien llega nuevo.

3. **Consolidación de decisiones** — recogé las decisiones técnicas (`plan.md §5`) y funcionales (`spec.md §8`) del cambio y asegurate de que las de peso queden en un ADR o en la spec durable, no solo en la carpeta efímera que está por archivarse.

## Proceso

1. **Leé** `spec.md` (incluida §8 Clarificaciones), `plan.md` (incluida §5 Decisiones técnicas y §8 Sincronización de docs), la suite de tests y el `CLAUDE.md`.
2. **Identificá las decisiones que merecen ADR.** No toda decisión lo amerita: reservá los ADRs para las que tienen consecuencias a futuro, alternativas reales descartadas o que sorprenderían a quien lea el código. Una decisión trivial o autoexplicativa no necesita ADR.
3. **Escribí los ADRs** y la doc de módulo/feature que aplique, siguiendo las convenciones del proyecto.
4. **Verificá la sincronización pendiente** que el plan listó en §8 (CLAUDE.md, `.env.example`, READMEs, specs durables) y dejá anotado lo que la etapa Archive debe fundir.
5. **Mostrá** qué documentación se produjo y qué queda para el cierre.

## Reglas

- **Decisiones, no narración.** El ADR captura el *por qué*; evitá reescribir lo que el código o la spec ya dicen.
- **Para el lector que llega nuevo.** Escribí pensando en un dev que no estuvo en la conversación. Si necesita contexto que solo está en el chat, ese contexto va a la doc.
- **Honestidad sobre lo no resuelto.** Si una decisión quedó como "provisoria" o con deuda conocida, documentalo como tal — no lo presentes como cerrado.
- **No dupliques la fuente de verdad.** La doc durable y el `CLAUDE.md` son la verdad del sistema *hoy*; la carpeta del cambio es efímera. Apuntá a fundir, no a acumular copias.
- **Respetá la constitution.** Si el proyecto define dónde y cómo se documenta (formato de ADR, ubicación, idioma), eso manda.

## Salida y handoff

ADRs y doc de devs escritos, decisiones consolidadas, lista de sincronización pendiente para el cierre. Handoff → **Archive** (etapa 8: fundir el delta en la spec durable y archivar la carpeta del cambio).
