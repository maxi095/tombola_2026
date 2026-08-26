---
name: implement
description: Etapa 5 (final) del flujo SDD. Ejecuta los slices definidos en slices.md de a uno por vez, respetando los límites de cambio, corriendo pruebas y marcando progreso. Usalo cuando existe slices.md con tareas pendientes y el usuario quiere empezar/continuar la implementación. Tech-agnostic.
---

# SDD · Implement

Convertís slices en código, **uno a la vez**, con disciplina. Cada slice termina en un estado verificable y revisable antes de pasar al siguiente.

## Principio rector

**Un slice por iteración.** No anticipes slices futuros, no agregues lo que no pide el slice actual, no refactorices de paso. La gracia del flujo es que cada paso sea chico y reversible.

## Proceso por slice

1. **Leé el slice** en `slices.md` y su contexto en `plan.md`/`spec.md`. Releé las reglas de la constitution (`CLAUDE.md`) que apliquen.
2. **Declará el alcance** antes de tocar nada: qué archivos vas a crear/modificar y por qué. Si el alcance real desborda lo que el slice definió (toca más áreas, deja de ser revisable de una sentada o reversible con un revert limpio — o excede lo que diga la constitution), **pará y proponé re-slicear**.
3. **Implementá** solo lo del slice. Seguí las convenciones del código circundante (naming, estilo, densidad de comentarios, idioms).
4. **Probá** según la estrategia del plan. Corré las pruebas relevantes y, si el proyecto lo tiene, lint/typecheck. Reportá resultados reales — si algo falla, decilo con la salida, no lo escondas.
5. **Verificá criterios de aceptación** del slice contra la spec.
6. **Sincronizá docs** si el slice cambió una decisión (CLAUDE.md, spec, .env.example…), en el mismo cambio.
7. **Marcá el checkbox** del slice en `slices.md` y mostrá un resumen: qué se hizo, archivos tocados, estado de pruebas.
8. **Checkpoint.** Esperá confirmación (o commit, si el usuario lo pide) antes del siguiente slice. Seguí las reglas de commit de la constitution; commiteá/pusheá solo si el usuario lo pide.

## Reglas duras

- **No te adelantes.** Prohibido implementar parte de un slice futuro "ya que estoy".
- **No refactors oportunistas.** Solo se permite el refactor que el slice requiere para compilar/funcionar.
- **No abstracciones especulativas.** Sin generalizar antes de tener 2 usos concretos.
- **Blast radius acotado.** Si un slice empieza a tocar muchos archivos/carpetas, es señal de que estaba mal cortado → volvé a `slice`.
- **Honestidad de estado.** "Hecho" significa implementado y verificado. Si saltaste una prueba o quedó algo a medias, decilo explícitamente.

## Cuando algo no cierra

- El slice no alcanza / falta diseño → volvé a `plan`.
- Aparece una ambigüedad funcional → volvé a `clarify`.
- El corte estaba mal → volvé a `slice`.

No fuerces un slice mal definido; corregí aguas arriba.

## Salida

Código funcionando para el slice, pruebas en verde (o estado real reportado), `slices.md` con el progreso marcado. Repetí hasta completar todos los slices.

Durante la implementación escribís los tests mínimos que cada slice necesita para verificarse. El **diseño sistemático de la suite** (unit/integration/smoke/e2e con cobertura de criterios) es trabajo de la etapa siguiente.

## Al completar el último slice (handoff)

Cuando todos los slices están hechos, **no cierres el feature todavía**. El cierre (fundir el delta + archivar) ocurre recién en la etapa Archive, después de testear y documentar.

Handoff → `test` para diseñar y desarrollar la suite de pruebas que cubra los criterios de aceptación.
