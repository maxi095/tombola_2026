---
name: constitution
description: Etapa 0 del flujo SDD. Establece o actualiza los principios, convenciones y restricciones de un proyecto en su CLAUDE.md, para que el resto del flujo (specify, plan, slice, implement) los trate como fuente de verdad. Usalo al iniciar SDD en un proyecto sin contexto técnico documentado, o cuando el usuario quiera fijar/cambiar las reglas del proyecto.
---

# SDD · Constitution

Definís las reglas del juego del proyecto. En este flujo, **la constitution vive en el `CLAUDE.md` del proyecto** — no creás un archivo paralelo. Tu salida es un `CLAUDE.md` que las etapas siguientes leen como restricciones duras.

## Cuándo correr esta etapa

- Proyecto nuevo sin `CLAUDE.md`, o con uno que no captura convenciones técnicas.
- El usuario quiere fijar o cambiar reglas transversales (arquitectura, límites de slicing, estándares de commits, separación front/back, etc.).

Si el `CLAUDE.md` ya cubre lo necesario, **no rehagas trabajo**: confirmá que alcanza y pasá a `specify`.

## Qué debe capturar una buena constitution

Adaptá al proyecto; no fuerces secciones vacías. Cubrí lo que aplique:

1. **Contexto del proyecto** — qué es, para quién, dominio.
2. **Stack y estructura** — lenguajes, frameworks, layout del repo, monorepo/single.
3. **Arquitectura y límites** — capas, separación de responsabilidades, qué puede/no puede hacer cada parte.
4. **Convenciones de código** — naming, archivos, estilo de commits.
5. **Restricciones de proceso** — reglas de slicing (máx. archivos por cambio, blast radius), workflow de ramas/PRs, gates de testing.
6. **Servicios externos / integraciones** — cómo se mockean, variables de entorno.
7. **Fuente de verdad** — dónde viven specs, decisiones, qué documento manda ante conflicto.

## Proceso

1. **Leé el repo antes de escribir.** Inferí stack, estructura y convenciones del código existente, package manifests, configs. No inventes lo que podés observar.
2. **Detectá huecos.** Lo que no se puede inferir del código y es una decisión → preguntá. Máximo las preguntas necesarias, agrupadas.
3. **Escribí/actualizá `CLAUDE.md`.** Conciso y accionable. Cada regla debe poder verificarse. Evitá texto decorativo.
4. **Marcá la fuente de verdad** y la regla de sincronización: si una etapa futura cambia una decisión, el `CLAUDE.md` se actualiza en el mismo cambio.

## Salida

`CLAUDE.md` en la raíz del proyecto (o actualizado). Mostrá un diff/resumen de lo agregado y esperá confirmación antes de cerrar la etapa.

## Handoff

Al cerrar → `specify` para el primer requerimiento.
