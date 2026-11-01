---
name: specify
description: Etapa 1 del Carril SDD. Convierte un requerimiento funcional nuevo en una especificación estructurada (docs/specs/<NNN-slug>/spec.md), enfocada en QUÉ se construye, para QUÉ rol/dispositivo y POR QUÉ. Usalo para features o módulos nuevos medianos/grandes.
---

# SDD · Specify

Transformás un requerimiento de negocio en una **spec funcional** clara, verificable y alineada con el dominio de **Gestión Tómbola**. La spec describe el comportamiento esperado, actores/roles, experiencia en pantalla y reglas de negocio; el CÓMO técnico va después en `plan`.

## Proceso

1. **Leé el contexto vivo:** Consultá `AGENTS.md`, `docs/SYSTEM_BLUEPRINT.md` (para no contradecir modelos ni reglas existentes) y `docs/UI_UX_STANDARD.md` (para Wording y dispositivos objetivo: Notebook 1366px, Mobile PWA o TV).
2. **Asigná carpeta:** `docs/specs/<NNN-slug>/spec.md` (ej. `003-portal-vendedores-mobile`).
3. **Redactá `spec.md`** con la estructura oficial de abajo.
4. **Marcá ambigüedades reales** con `[NEEDS CLARIFICATION: pregunta concreta]` en lugar de adivinar reglas contables o de permisos.

## Estructura de `spec.md`

```markdown
# Spec — <Nombre del Feature>

**Estado:** Borrador | En clarificación | Cerrada
**Carpeta:** docs/specs/<NNN-slug>/

## 1. Problema y Objetivo
Qué necesidad resuelve y por qué importa (2-4 frases).

## 2. Actores, Roles y Dispositivos
Qué roles interactúan (`Administrador`, `Vendedor`, `Directiva`, `Público`) y desde qué dispositivo principal (`Notebook 1366px`, `Mobile PWA`, `TV 100vh`).

## 3. Alcance
### Incluye
- …
### No incluye (explícito)
- …

## 4. Comportamiento Esperado y Experiencia de Usuario
- **Flujo principal (Happy Path):** pasos observables y wording de acciones/estados según `docs/UI_UX_STANDARD.md`.
- **Flujos alternativos / Errores:** validaciones, permisos denegados, idempotencia.

## 5. Reglas de Negocio
Reglas, fórmulas contables y restricciones numeradas (`RN-XXX-01`).

## 6. Impacto en Entidades de Dominio
Qué entidades de `docs/SYSTEM_BLUEPRINT.md` participan o qué datos conceptuales nuevos se requieren.

## 7. Criterios de Aceptación
Lista verificable con checkboxes (`- [ ]`). Cada criterio debe poder probarse.

## 8. Clarificaciones
(Completado por la skill `clarify` si hubo dudas iniciales.)
```

## Salida y Handoff
Escribí `spec.md` y mostrá un resumen ejecutivo.
- Si hay marcadores `[NEEDS CLARIFICATION]` → handoff a `clarify`.
- Si está todo claro → esperá confirmación del usuario y handoff a `plan`.
