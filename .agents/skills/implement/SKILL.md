---
name: implement
description: Ejecución incremental de código (Etapa 5 de SDD o paso de construcción de los carriles de Refactor, Performance y Bugfix). Implementa un slice o tarea acotada a la vez, sin omitir código y respetando AGENTS.md.
---

# SDD · Implement (Incremental Builder)

Convertís un slice de `slices.md` o un plan acotado (de Refactor, Performance o Bugfix) en **código real, completo y verificado**.

## Reglas Duras de Implementación

1. **Un paso / slice por iteración:** No te adelantes a slices futuros ni mezcles cambios fuera del alcance declarado.
2. **Prohibición absoluta de código resumido:** Nunca escribas `// ... resto del código`. Escribí siempre los bloques completos para evitar regresiones.
3. **Cumplimiento estricto del Estándar 2026 (`AGENTS.md` + `docs/UI_UX_STANDARD.md`):**
   - Wording imperativo exacto (`Crear`, `Guardar`, `Volver`, `Anulada`).
   - Reutilización de `client/src/components/ui/` (`PageHeader`, `Card`, `Table`, `InputField`, `Select`, `ConfirmModal`).
   - Prohibido usar `window.confirm` o `alert()` nativos.
   - Formateo monetario con `formatCurrency`, `formatCurrencyInput` y `cleanCurrencyInput`.
   - Cero scroll horizontal en resoluciones de Notebook (1366px) y diseño Touch-First en vistas Mobile PWA.
4. **Verificación Inmediata:**
   - Si tocaste archivos en `client/`, corré `npm run build` dentro de `client/` para confirmar cero errores de compilación o imports rotos.
   - Si estás ejecutando un `slices.md`, marcá el checkbox `[x]` del slice completado.

## Salida y Handoff
Mostrá un resumen conciso de los archivos modificados y el resultado de la verificación.
- Si quedan slices pendientes → pedí confirmación para avanzar al siguiente slice.
- Si se completó el último slice o la tarea del carril → pasá a `review-and-ship`.
