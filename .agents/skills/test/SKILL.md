---
name: test
description: Etapa 6 del flujo SDD. Diseña y desarrolla la suite de pruebas (unit, integration, smoke, e2e) derivada de los criterios de aceptación de la spec, una vez que el feature ya está implementado. Trata los tests como ciudadanos de primera clase con disciplina de pirámide y cobertura de casos límite/errores. Usalo cuando los slices están completos y querés asegurar la calidad antes de documentar y cerrar. Tech-agnostic.
---

# SDD · Test

Convertís los criterios de aceptación de la spec en una **suite de pruebas disciplinada**. El feature ya funciona (salió de `implement`); tu trabajo es asegurar que su comportamiento esté **protegido por tests al nivel correcto**, cubriendo no solo el happy path sino los errores, los bordes y las integraciones.

## Principio rector

**Cada criterio de aceptación de la spec debe trazar a al menos una prueba.** Un criterio sin test es una promesa sin garantía. Y al revés: no escribas tests que no trazan a ningún comportamiento especificado — eso es ruido que frena el cambio futuro.

## La pirámide (elegí el nivel correcto)

No todo va al mismo nivel. Poné cada caso donde da más valor por menos costo:

- **Unit** — lógica de dominio, reglas de negocio, cálculos, validaciones, casos límite. Rápidos, aislados, muchos. Es la base de la pirámide.
- **Integration** — interacción entre componentes reales: repositorio + base, servicio + servicio, controlador + capa de dominio. Verifican contratos internos y wiring.
- **E2E** — flujos completos extremo a extremo desde la interfaz/API del usuario. Pocos, los caros; reservalos para los caminos críticos de negocio.
- **Smoke** — un puñado mínimo que confirma que "el sistema arranca y lo esencial responde". Sirven como gate rápido de despliegue/CI.

Regla: **muchos unit, algunos integration, pocos e2e, un smoke mínimo.** Si te encontrás escribiendo un e2e para validar una regla de cálculo, bajalo a unit.

## Proceso

1. **Leé** `spec.md` (criterios de aceptación §7 y reglas de negocio §5), `plan.md §7` (estrategia de pruebas definida) y el código ya implementado. Releé el `CLAUDE.md` por convenciones de testing del proyecto (framework, ubicación, naming, fixtures, mocks).
2. **Derivá los casos de prueba** desde los criterios de aceptación y las reglas de negocio. Para cada uno, cubrí sistemáticamente:
   - **Happy path** — el comportamiento esperado.
   - **Caminos negativos / errores** — input inválido, permisos faltantes, servicio caído, timeouts.
   - **Bordes** — vacío, cero, máximo, duplicado, concurrencia si es material.
3. **Asigná cada caso a un nivel** de la pirámide (unit/integration/e2e/smoke) y justificá brevemente por qué ahí.
4. **Escribí los tests** siguiendo las convenciones del proyecto. Reutilizá fixtures/helpers existentes; no inventes un framework de testing paralelo.
5. **Corré la suite** completa (más lint/typecheck si el proyecto los tiene). Reportá resultados reales — verde, rojo, skipped. Si algo falla, mostrá la salida; no lo escondas.
6. **Reportá la cobertura de criterios**: una tabla criterio → test(s) que lo cubren, marcando si quedó alguno sin proteger.

## Reglas

- **Trazá a la spec, no al código.** Testeás el comportamiento especificado, no la implementación interna. Un test acoplado a detalles internos se rompe en cada refactor legítimo.
- **Sin tests vacíos ni triviales.** Nada de `assert true`, tests que no afirman nada, o mocks que se testean a sí mismos. Cada test debe poder fallar por una razón real.
- **No sobre-mockees.** En integration usá dependencias reales cuando sea barato; reservá los mocks para lo externo, lento o no determinista.
- **Honestidad de cobertura.** Si un criterio quedó sin test (porque es caro, frágil o fuera de alcance), decilo explícitamente — no infles la sensación de cobertura.
- **Respetá la constitution.** Si el `CLAUDE.md` define gates de testing, niveles mínimos o herramientas, esas reglas mandan.

## Cuando algo no cierra

- Un test revela un bug real en el feature → volvé a `implement` para arreglarlo (no parchees el test para que pase).
- Un criterio de aceptación resulta ambiguo o intesteable → volvé a `clarify`.
- La estrategia de pruebas del plan no alcanza → volvé a `plan §7`.

## Salida y handoff

Suite de pruebas en verde (o estado real reportado), con la tabla de cobertura criterio → test. Handoff → `document`.
