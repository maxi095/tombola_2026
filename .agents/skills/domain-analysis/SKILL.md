---
name: domain-analysis
description: "Etapa opcional del flujo SDD, entre constitution y specify. Identifica el panorama de dominio del negocio con enfoque DDD (dominios, subdominios core/supporting/generic, bounded contexts, domain map) y lo deja documentado a nivel de proyecto en docs/domain-map.md. Usalo al iniciar SDD en un proyecto de negocio complejo o brownfield sin dominio documentado, cuando el proyecto tiene varios módulos/equipos y no está claro dónde empieza y termina cada uno, o cuando specify empieza a mezclar conceptos de distintos contextos de negocio en una misma spec. No reemplaza a specify, que resuelve UN requerimiento — domain-analysis mapea el panorama completo una sola vez (y se retoca cuando aparece un dominio nuevo). Tech-agnostic."
---

# SDD · Domain Analysis

Mapeás el panorama de negocio **antes** de que las specs individuales empiecen a pisarse entre sí. Sin este mapa, es común que dos features toquen "lo mismo" con vocabulario distinto, o que una spec mezcle reglas de dominios que en realidad no deberían acoplarse.

## Cuándo correr esta etapa

- Proyecto nuevo con dominio de negocio no trivial (más de un área funcional clara: ej. facturación + inventario + logística).
- Brownfield sin documentación de dominio, donde nadie tiene claro qué bounded context es dueño de qué concepto.
- Ya se acumularon varias specs (`docs/specs/`) y empiezan a aparecer entidades con el mismo nombre pero significados distintos, o reglas de negocio duplicadas en specs de módulos diferentes.

**Saltala** si el proyecto es chico, de un solo dominio evidente, o un CRUD/utilitario sin complejidad de negocio real — forzar un domain map ahí es ceremonia sin retorno.

Esta etapa se corre **una vez por proyecto** (no por feature) y se retoca solo cuando aparece un dominio nuevo o cambia el alcance de uno existente — a diferencia de `spec.md`/`plan.md` que son por feature.

## Principio rector

Un dominio mal identificado contamina todo lo que viene después: `specify` no sabe dónde termina el alcance de un feature, `plan` no sabe qué módulo es dueño de una entidad, y el código termina con lógica de negocio duplicada en dos lugares porque nadie vio que era el mismo concepto con otro nombre. El domain map es la respuesta a "¿de quién es este concepto?".

## Proceso

1. **Leé la constitution** (`CLAUDE.md`) y el código/specs existentes para inferir qué dominios ya están implícitos en la estructura actual (carpetas, módulos, servicios).
2. **Identificá los dominios de negocio** hablando con el usuario si el código no alcanza para inferirlos: qué áreas funcionales tiene el negocio, independientemente de cómo esté hoy el código.
3. **Clasificá cada dominio**:
   - **Core Domain**: donde está la ventaja competitiva/razón de ser del negocio. Merece la mejor inversión de diseño.
   - **Supporting Domain**: necesario para que el core funcione, específico de este negocio, pero no diferenciador.
   - **Generic Domain**: resuelto igual en cualquier negocio (auth, notificaciones, facturación genérica). Candidato a comprar/reusar en vez de construir a medida.
4. **Para cada dominio**, documentá objetivo, responsabilidades, entidades principales y relaciones con otros dominios (quién depende de quién, quién es dueño de qué dato).
5. **Definí los bounded contexts**: los límites donde un mismo término puede significar algo distinto según el contexto (ej. "Cliente" en Ventas vs. "Cliente" en Soporte). Marcá explícitamente si dos dominios comparten un concepto con distinto significado — es la fuente más común de bugs de integración.
6. **Generá el Domain Map** (diagrama Mermaid) mostrando dominios, sus relaciones y flujo de dependencia.
7. **Escribí `docs/domain-map.md`** con la estructura de abajo.

## Estructura de `docs/domain-map.md`

```markdown
# Domain Map — <Proyecto>

**Estado:** Vivo (se actualiza cuando aparece/cambia un dominio)
**Última revisión:** <fecha>

## 1. Dominios identificados

### <Nombre del dominio> — Core | Supporting | Generic
- **Objetivo:** …
- **Responsabilidades:** …
- **Entidades principales:** …
- **Depende de:** …
- **Del que dependen:** …

(repetir por dominio)

## 2. Bounded contexts y conceptos compartidos
Términos que aparecen en más de un dominio con significado distinto — quién es la fuente de verdad de cada uno.

| Término | Significado en <Dominio A> | Significado en <Dominio B> | Dueño |
|---|---|---|---|

## 3. Domain Map (diagrama)

\`\`\`mermaid
graph TD
  %% dominios como nodos, flechas de dependencia
\`\`\`

## 4. Supuestos y preguntas abiertas
Clasificaciones core/supporting/generic que el negocio todavía no confirmó, o límites de contexto dudosos.
```

## Reglas de calidad

- **No inventes dominios que el negocio no reconoce.** Si dudás si algo es un dominio separado o parte de otro, preguntá — no lo decidas por prolijidad.
- **Sin diseño técnico.** Nada de microservicios, bases de datos por dominio ni decisiones de arquitectura — eso es trabajo de `plan`. Acá solo mapeás el negocio.
- **Concisión sobre exhaustividad.** Un domain map de 4-6 dominios bien explicados vale más que 15 subdivididos artificialmente.
- **Vivo, no versionado por feature.** Este archivo no va en `docs/specs/<NNN-slug>/`; vive en `docs/` junto a la spec durable, porque describe el negocio, no un cambio puntual.

## Salida y handoff

`docs/domain-map.md`, resumen de dominios identificados y bounded contexts detectados. Esperá confirmación del usuario (especialmente en la clasificación core/supporting/generic, que suele ser una decisión estratégica, no técnica). Handoff → `specify`, que ahora puede referenciar a qué dominio pertenece cada feature nuevo.
