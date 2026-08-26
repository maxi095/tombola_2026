---
name: plan
description: Etapa 3 del flujo SDD. Convierte una spec funcional cerrada en un plan técnico de implementación (plan.md) — diseño, decisiones de arquitectura, contratos, cambios de datos, puntos de integración — sin todavía romperlo en tareas. Usalo cuando existe spec.md cerrada y falta el plan técnico. Tech-agnostic — deriva el stack del proyecto, no lo impone.
---

# SDD · Plan

Traducís el QUÉ (spec) al CÓMO técnico. Producís un `plan.md` que `slice` pueda cortar en tareas pequeñas sin tener que rediseñar. No escribís código de producción todavía.

## Principio rector

El plan se **deriva del proyecto**, no de tus preferencias. Leé el código existente y la constitution, y reutilizá patrones, capas y convenciones que ya están. Introducí abstracciones nuevas solo si la spec lo exige; nada especulativo.

## Proceso

1. **Leé** `spec.md` (cerrada), `CLAUDE.md` y el código relevante existente. Si la spec tiene ambigüedades materiales abiertas, volvé a `clarify` antes de planificar.
2. **Mapeá la spec al sistema real**: qué módulos/archivos existentes tocan, qué falta crear, cómo fluye el dato extremo a extremo.
3. **Resolvé las decisiones técnicas** y dejalas registradas (con su porqué y alternativas descartadas).
4. **Escribí `plan.md`** con la estructura de abajo.
5. **No excedas el diseño necesario.** Si una parte de la spec no requiere diseño, no inventes uno.

## Estructura de `plan.md`

```markdown
# Plan técnico — <Nombre del feature>

**Spec:** ./spec.md
**Estado:** Borrador | Aprobado

## 1. Enfoque general
2-5 frases: la estrategia técnica y por qué encaja con el proyecto.

## 2. Contexto del código existente
Qué módulos/archivos/patrones ya existen y se reutilizan. Qué se ajusta vs. qué se crea.

## 3. Diseño por capa
(Adaptá a la arquitectura real del proyecto.)
- **Datos / persistencia:** entidades, migraciones, índices, cambios de esquema.
- **Lógica / dominio:** servicios, reglas, validaciones.
- **Interfaz / API / UI:** endpoints, contratos, componentes, rutas.
- **Integraciones:** servicios externos, contratos, manejo de fallas/timeouts.

## 4. Contratos
Formas de datos clave (request/response, eventos, payloads) a nivel de campos. Suficiente para implementar sin re-decidir.

## 5. Decisiones técnicas
| # | Decisión | Por qué | Alternativas descartadas |
|---|----------|---------|--------------------------|

## 5b. Diagramas (solo si el feature introduce un cambio de arquitectura no trivial)
Omití esta sección si el feature es una extensión simple de algo existente y no cambia la forma del sistema. Cuando aplique, usá Mermaid y elegí solo los diagramas que aporten (no fuerces los cuatro si uno solo ya explica el cambio):
- **Context:** el sistema y con quién interactúa (usuarios, sistemas externos) — útil si el feature agrega una integración o actor nuevo.
- **Container/Component:** las piezas que se agregan o modifican y cómo se conectan — útil si hay más de un componente nuevo interactuando.
- **Data flow:** cómo viaja el dato en el flujo principal — útil si el feature mueve datos entre varios pasos/sistemas.

Si hubo más de una forma razonable de resolver el diseño (no solo detalles menores), documentá las alternativas evaluadas con sus pros/contras antes de la tabla de decisiones — ayuda a quien revise a entender por qué no se eligió la otra.

## 6. Impacto y riesgos
Qué se puede romper, dependencias ocultas, migraciones de datos, compatibilidad.

## 7. Estrategia de pruebas
Qué se testea y a qué nivel (unidad, integración, e2e), por área.

## 8. Sincronización de docs
Qué hay que actualizar al implementar (CLAUDE.md, specs, .env.example, etc.).
```

## Reglas

- **Reutilizar > crear.** Preferí extender lo existente antes que introducir nuevas estructuras.
- **Sin sobre-ingeniería.** Nada de repos genéricos, capas de abstracción, feature flags o frameworks internos salvo que la spec lo pida explícitamente.
- **Respetá la constitution.** Separación de capas, convenciones y límites de proceso son restricciones duras.
- **Trazá a la spec.** Cada pieza del plan debe servir a un criterio de aceptación. Si algo no traza a la spec, sobra o falta en la spec.

## Salida y handoff

Escribí `plan.md`, mostrá un resumen de decisiones y riesgos, esperá confirmación. Handoff → `slice`.
