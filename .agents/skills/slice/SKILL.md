---
name: slice
description: Etapa 4 del Carril SDD. Desglosa un plan técnico en cortes verticales pequeños, ordenados por dependencia, revisables y reversibles en slices.md.
---

# SDD · Slice

Cortás un `plan.md` aprobado en **slices verticales pequeños** dentro de `docs/specs/<NNN-slug>/slices.md`. Cada slice debe entregar progreso observable y verificable.

## Reglas de Corte

1. **Tamaño y Blast Radius:** Cada slice debe poder revisarse de una sola vez, tocar pocos archivos relacionados y dejar el proyecto compilando (`npm run build` en verde).
2. **Enfoque según Objetivo:**
   - Si el objetivo es una **Feature Nueva**, evitá refactors no relacionados en otros módulos.
   - Si el slice incluye **Modernización UI o Refactor planificado**, asegurate de alinear el código tocado al 100% con `docs/UI_UX_STANDARD.md` (Wording, componentes atómicos, cero scroll horizontal).
3. **Rango sano:** Entre **2 y 6 slices** por feature en este proyecto. No sobre-fragmentes en pasos vacíos.

## Estructura de cada Slice en `slices.md`

```markdown
### Slice N — <Nombre del Slice>
- [ ] **Objetivo:** qué logra (1 frase).
- **Valor observable:** qué se puede probar o ver al terminar este slice.
- **Archivos a crear/modificar:** lista exacta con rutas.
- **Depende de:** Slice X | Ninguno.
- **Verificación:** cómo se comprueba (test, prueba funcional, `npm run build`).
- **Commit sugerido:** `tipo(scope): descripción`
```

## Salida y Handoff
Escribí `slices.md`, mostrá la secuencia propuesta y esperá confirmación para iniciar `implement` en el Slice 1.
