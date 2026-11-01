---
name: plan
description: Etapa 3 del Carril SDD. Convierte una spec funcional cerrada en un plan técnico de implementación (plan.md) definiendo cambios en modelos Mongoose, índices, endpoints Express/Zod y componentes React/UI.
---

# SDD · Plan

Traducís el QUÉ (`spec.md`) al CÓMO técnico en `docs/specs/<NNN-slug>/plan.md`, respetando la arquitectura real del proyecto en `AGENTS.md`, `docs/SYSTEM_BLUEPRINT.md` y `docs/UI_UX_STANDARD.md`.

## Principio Rector
Reutilizar > Crear. Antes de proponer un componente o endpoint nuevo, verificá qué existe en `src/controllers/`, `src/models/` y `client/src/components/ui/`.

## Estructura de `plan.md`

```markdown
# Plan Técnico — <Nombre del Feature>

**Spec:** ./spec.md
**Estado:** Borrador | Aprobado

## 1. Enfoque General
Estrategia técnica en 2-5 frases y cómo se integra sin romper lo existente.

## 2. Diseño por Capa
- **Base de Datos y Modelos (`src/models/`):** Cambios de esquema Mongoose e índices requeridos (`.index()`).
- **Seguridad, Roles y Validación (`src/middlewares/`, `src/schemas/`):** Permisos RBAC (`checkRole`, aislamiento por vendedor) y esquemas Zod.
- **Lógica y Endpoints (`src/controllers/`, `src/routes/`):** Rutas, contratos request/response, prevención de N+1 y paginación.
- **Frontend y UI (`client/src/`):** Páginas, contextos, componentes atómicos de `client/src/components/ui/` y adaptación al viewport (Notebook 1366px sin scroll horizontal vs. Mobile PWA).

## 3. Decisiones Técnicas y Riesgos
Decisiones tomadas, alternativas descartadas y cuidado de compatibilidad con datos productivos.

## 4. Estrategia de Verificación
Pruebas unitarias/integración (Backend), pruebas funcionales y gate `npm run build`.

## 5. Sincronización con `SYSTEM_BLUEPRINT.md`
Qué secciones de `docs/SYSTEM_BLUEPRINT.md` deberán actualizarse al finalizar el feature.
```

## Salida y Handoff
Escribí `plan.md`, resumí las decisiones clave y esperá confirmación del usuario para pasar a `slice`.
