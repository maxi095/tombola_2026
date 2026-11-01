---
name: workflow
description: Orquestador de Ingeniería y Spec-Driven Development (SDD + Addy Osmani Agent Skills). Usalo como punto de entrada para cualquier requerimiento: nuevas funcionalidades, refactorización, modernización UI, optimización de performance, seguridad multi-rol o resolución de bugs. Diagnostica el carril correcto (A: Feature SDD, B: Refactor/UI, C: Performance/Seguridad, D: Bugfix/Testing) y delega en la skill correspondiente.
---

# 🧭 Workflow Orchestrator (SDD + Addy Osmani Engineering Lifecycle)

Coordinás el ciclo completo de ingeniería de **Gestión Tómbola**. Tu trabajo no es forzar 8 etapas burocráticas para cualquier cambio, sino **diagnosticar en qué carril entra el pedido y aplicar la ceremonia proporcional al riesgo y tamaño**.

---

## 📚 Contexto Obligatorio del Proyecto

Antes de tomar decisiones, recordá que la verdad del proyecto vive en:
1. **`AGENTS.md`**: Constitución técnica, stack y reglas innegociables.
2. **`docs/SYSTEM_BLUEPRINT.md`**: Modelos reales de MongoDB, estados, fórmulas contables y matriz de roles.
3. **`docs/UI_UX_STANDARD.md`**: Estándar visual para Notebook HD 1366px (Cero Scroll Horizontal), Mobile PWA, TV 100vh y Wording.
4. **`docs/ROADMAP.md`**: Plan maestro de prioridades por fases.

---

## 🛣️ Los 4 Carriles de Ingeniería (Routing Matrix)

Cuando el usuario pide algo, clasificalo en uno de estos 4 carriles:

### Carril A — Nueva Funcionalidad o Módulo Complejo (Flujo SDD)
*Cuándo aplica:* Crear el portal móvil de vendedores, agregar un nuevo flujo de negocio, implementar la Landing pública o cambios que cruzan varios modelos y pantallas.
*Secuencia de Skills:*
1. `explore` *(opcional, si el enfoque está abierto)*
2. `specify` → crea `docs/specs/<NNN-slug>/spec.md`
3. `clarify` *(si hay dudas materiales en la spec)*
4. `plan` → crea `docs/specs/<NNN-slug>/plan.md`
5. `slice` → crea `docs/specs/<NNN-slug>/slices.md`
6. `implement` → ejecuta 1 slice a la vez
7. `review-and-ship` → verifica `npm run build`, funde las nuevas reglas en `docs/SYSTEM_BLUEPRINT.md` y archiva/cierra el cambio.

### Carril B — Refactorización, Deuda Técnica o Modernización UI
*Cuándo aplica:* Migrar vistas legacy (`DrawPage`, etc.) al Standard 2026, eliminar scroll horizontal en 1366px, limpiar código duplicado o remover modelos muertos (`Installment`) **sin cambiar las reglas de negocio**.
*Secuencia de Skills:*
1. `refactor-and-simplify` y/o `ui-ux-responsive` (analiza alcance, define plan corto o lista de cortes directos).
2. `implement` (ejecuta preservando el comportamiento exacto).
3. `review-and-ship` (verifica `npm run build` y actualiza `docs/ROADMAP.md`).

### Carril C — Optimización de Performance, Escalabilidad y Seguridad Cloud
*Cuándo aplica:* Agregar índices a MongoDB, eliminar consultas N+1, paginar en servidor, implementar Code Splitting (`React.lazy`), o blindar permisos por rol (`Administrador`, `Vendedor`, `Directiva`) y seguridad JWT/Zod.
*Secuencia de Skills:*
1. `performance-and-security` (mide el cuello de botella o vector de riesgo y diseña la solución).
2. `implement` (aplica las mejoras de forma atómica).
3. `review-and-ship` (verifica que nada se rompa y actualiza `SYSTEM_BLUEPRINT.md` / `ROADMAP.md`).

### Carril D — Mantenimiento, Bugfixing y Testing
*Cuándo aplica:* Corregir un bug reportado, un error de cálculo contable, un fallo de UI o escribir tests unitarios/integración sobre lógica crítica.
*Secuencia de Skills:*
1. `testing-and-debugging` (Reproducir → Aislar Causa Raíz → Diseñar fix quirúrgico y test).
2. `implement` (aplica el fix sin efectos colaterales).
3. `review-and-ship` (verifica compilación y pruebas).

---

## ⚖️ Reglas de Orquestación y Anti-Racionalización

| Excusa común del agente | Regla obligatoria |
| :--- | :--- |
| *"Es un refactor simple, pero voy a crear spec.md, plan.md y 8 slices"* | **No.** Usá el Carril B (`refactor-and-simplify`). La ceremonia debe ser proporcional al cambio. |
| *"Ya que estoy arreglando este bug, voy a reformatear 5 archivos vecinos"* | **Prohibido.** Respetá el blast radius del cambio actual. |
| *"Terminé de editar el frontend, seguro compila bien"* | **Falso.** Siempre debés pasar por el gate de `review-and-ship` (`npm run build` en `client/`). |
| *"Cambié una regla de negocio o agregué un rol, ya quedó en el código"* | **Incompleto.** Todo cambio en reglas de negocio, modelos o permisos debe actualizarse en `docs/SYSTEM_BLUEPRINT.md`. |

## Tu primer paso al activarte
1. Identificá el carril (A, B, C o D) leyendo el pedido y el estado en `docs/ROADMAP.md` o `docs/specs/`.
2. Decile al usuario en 1-2 líneas en qué carril estamos y cuál es el paso inmediato.
3. Ejecutá la skill correspondiente.
