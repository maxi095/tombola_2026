---
name: specify
description: Etapa 1 del flujo SDD. Convierte un requerimiento en lenguaje natural en una especificación funcional estructurada (spec.md), enfocada en QUÉ y POR QUÉ, no en el CÓMO técnico. Usalo cuando el usuario describe un feature/historia/módulo nuevo a desarrollar y todavía no existe una spec. Tech-agnostic.
---

# SDD · Specify

Transformás un requerimiento informal en una **spec funcional** clara, verificable y libre de detalle de implementación. La spec describe el comportamiento esperado y el valor; el CÓMO técnico es trabajo de `plan`.

## Principio rector

Escribí para que **un revisor de negocio** pueda validarla y **`plan` y `slice`** puedan trabajar sobre ella sin adivinar. Si algo no se puede determinar del input ni del contexto, **NO lo inventes**: marcá `[NEEDS CLARIFICATION: pregunta concreta]`. Esos marcadores son la entrada de `clarify`.

## Proceso

1. **Leé la constitution** (`CLAUDE.md`) y specs vecinas para tono, convenciones y restricciones.
2. **¿Es una migración de GeneXus con IR ya corrida?** Si existe `reverse/<objeto>/spec-draft.md`, usalo como insumo principal en vez de arrancar de un requerimiento en lenguaje natural: traducí su contenido a la estructura de abajo, preservando la trazabilidad a `evidence-matrix.md` y convirtiendo cada `[NEEDS_VALIDATION]`/pregunta abierta del borrador en un `[NEEDS CLARIFICATION: …]` de la spec.
3. **Asigná carpeta**: `docs/specs/<NNN-slug>/` con `NNN` correlativo al último existente y `slug` kebab-case del feature. (Si el proyecto tiene convención propia de specs, adaptate a ella.)
4. **Redactá `spec.md`** con la estructura de abajo.
5. **Marcá ambigüedades** con `[NEEDS CLARIFICATION: …]` en vez de asumir. Sé honesto: es mejor 5 marcadores reales que una spec falsamente completa.

## Estructura de `spec.md`

```markdown
# Spec — <Nombre del feature>

**Estado:** Borrador | En clarificación | Cerrada
**Carpeta:** docs/specs/<NNN-slug>/

## 1. Problema y objetivo
Qué necesidad resuelve y por qué importa. 2-4 frases.

## 2. Actores y permisos
Quién interactúa y qué puede hacer cada rol.

## 3. Alcance
### Incluye
- …
### No incluye (explícito)
- …

## 4. Comportamiento esperado
Flujos en términos funcionales. Usá escenarios:
- **Flujo principal (happy path):** pasos observables.
- **Flujos alternativos / errores:** qué pasa cuando algo falla o varía.

## 5. Reglas de negocio
Reglas, validaciones, restricciones, cálculos. Numeradas para poder referenciarlas.

## 6. Datos / entidades (conceptual)
Entidades y campos relevantes a nivel dominio, sin esquema físico ni tipos de framework.

## 7. Criterios de aceptación
Lista verificable (checkboxes). Cada uno debe ser testeable y sin ambigüedad.

## 8. Clarificaciones
(Vacío al inicio — lo completa clarify.)

## 9. Dependencias y supuestos
Otros módulos, servicios externos, supuestos que de romperse cambian la spec.

## 10. No funcionales, seguridad y riesgos (solo si son materiales)
Incluí esta sección **únicamente** cuando el feature tiene requisitos reales de este tipo — no la infles por completitud. Tres sub-bloques, cada uno opcional:
- **No funcionales:** performance, escalabilidad, disponibilidad, auditoría, accesibilidad — solo los que el documento/usuario mencionó o que son evidentemente críticos para este feature.
- **Seguridad:** roles/permisos más allá del básico de §2, datos sensibles, requerimientos regulatorios mencionados.
- **Riesgos:** algo que si sale mal tiene impacto real (dato, seguridad, negocio) — no riesgos genéricos de "todo software tiene bugs".
Si nada de esto aplica al feature, omití la sección entera en vez de dejarla vacía con placeholders.
```

## Reglas de calidad

- **Sin implementación.** Nada de tablas SQL, nombres de clases, endpoints concretos, librerías. Si te descubrís escribiendo eso, va a `plan.md`.
- **Testeable.** Cada criterio de aceptación debe poder convertirse en una prueba.
- **Honestidad sobre completitud.** Marcadores `[NEEDS CLARIFICATION]` antes que supuestos silenciosos.
- **Conciso.** Sin relleno. Una spec corta y precisa vale más que una larga y vaga.

## Salida y handoff

Escribí `spec.md`, mostrá un resumen y la lista de `[NEEDS CLARIFICATION]` si los hay.
- Si hay marcadores → handoff a `clarify`.
- Si no hay → confirmá con el usuario y handoff a `plan`.
