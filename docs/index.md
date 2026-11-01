# 🗺️ Índice Maestro de Documentación: Gestión Tómbola (Standard 2026) 🔱

**Última actualización de proceso:** 2026-11-01  
**Tag de resguardo previo a consolidación:** `v1.0-pre-sdd-cleanup` (en Git: `git checkout v1.0-pre-sdd-cleanup -- docs/`)

Este archivo centraliza la arquitectura documental de **Gestión Tómbola**. En lugar de decenas de archivos dispersos, el proyecto opera bajo una **Arquitectura Documental en 2 Capas**: **Documentos Maestros Vivos** (cómo funciona el sistema hoy) y **Taller de Specs** (cambios grandes en curso).

---

## 📘 1. Documentos Maestros Vivos (Single Source of Truth)

| Documento | Propósito | Cuándo consultarlo o actualizarlo |
| :--- | :--- | :--- |
| **[`AGENTS.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/AGENTS.md)** | Constitución técnica, comandos, carriles de trabajo y reglas innegociables para desarrolladores y agentes de IA. | Siempre activo en el contexto del agente. |
| **[`docs/SYSTEM_BLUEPRINT.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/SYSTEM_BLUEPRINT.md)** | **Mapa integral del negocio y backend:** Dominios, modelos de MongoDB reales, estados, fórmulas contables, motor Bingo V10 y matriz de Roles (Admin, Vendedor, Directiva, Público). | Consultar antes de tocar lógica de negocio o API. Actualizar cada vez que cambia una regla, modelo o permiso. |
| **[`docs/UI_UX_STANDARD.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/UI_UX_STANDARD.md)** | **Estándar visual multi-dispositivo:** Diseño para Notebook HD (1366px *Zero-Air* y sin scroll horizontal), Mobile PWA (*Touch-First* para Vendedores/Directiva), Vistas TV (100vh), catálogo de `client/src/components/ui/` y Glosario de Wording. | Consultar antes de crear o refactorizar cualquier pantalla o componente React. |
| **[`docs/ROADMAP.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/ROADMAP.md)** | **Plan Maestro de Evolución:** Estado real de adopción en el código, prioridades de optimización (Backend/DB → Roles → Frontend/PWA → Cloud & Landing) y deuda técnica detectada. | Consultar para elegir la próxima tarea y marcar progreso al finalizar cada iteración. |

---

## 🧩 2. Suite de Skills de Ingeniería (`.agents/skills/`)

El proyecto combina **Spec-Driven Development (SDD)** con las mejores prácticas de **`addyosmani/agent-skills`**:

### Orquestación
* **[`workflow`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/workflow/SKILL.md)**: Ruteador inteligente que diagnostica el pedido y elige el carril adecuado (Feature Nueva, Refactor/UI, Performance/Seguridad o Bugfix).

### Carril SDD (Nuevas Funcionalidades y Módulos)
* **[`explore`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/explore/SKILL.md)**: Análisis exploratorio de opciones antes de comprometer una especificación.
* **[`specify`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/specify/SKILL.md)**: Redacción de especificación funcional (`docs/specs/<NNN-slug>/spec.md`).
* **[`clarify`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/clarify/SKILL.md)**: Resolución de ambigüedades críticas (máx. 5 preguntas de alto impacto).
* **[`plan`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/plan/SKILL.md)**: Diseño técnico por capas, contratos Zod/API e índices MongoDB (`plan.md`).
* **[`slice`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/slice/SKILL.md)**: Desglose en cortes verticales pequeños y reversibles (`slices.md`).
* **[`implement`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/implement/SKILL.md)**: Ejecución disciplinada un slice a la vez.

### Carriles Especializados (Mantenimiento, Refactor, Escalabilidad y UI)
* **[`ui-ux-responsive`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/ui-ux-responsive/SKILL.md)**: Ingeniería de interfaz adaptativa (Desktop 1366px sin scroll horizontal, Mobile PWA para vendedores, TV 100vh y Landing).
* **[`refactor-and-simplify`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/refactor-and-simplify/SKILL.md)**: Simplificación de código, eliminación de código muerto/legacy y migración de vistas preservando el comportamiento.
* **[`performance-and-security`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/performance-and-security/SKILL.md)**: Optimización de MongoDB (índices, paginación server-side, fin de N+1), optimización de React/Vite y blindaje RBAC multi-rol para la nube.
* **[`testing-and-debugging`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/testing-and-debugging/SKILL.md)**: Triaje sistemático de bugs (RCA) y pruebas unitarias/integración sobre reglas financieras y permisos.
* **[`review-and-ship`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/review-and-ship/SKILL.md)**: Quality Gate final (`npm run build`, auditoría multi-eje, sincronización con `SYSTEM_BLUEPRINT.md` y flujo Git `develop` → `main`).

---

## 🛠️ 3. Taller de Especificaciones (`docs/specs/`)

Las carpetas dentro de `docs/specs/` son **deltas de trabajo**. Una vez que una especificación está implementada y sus reglas de negocio fueron incorporadas a [`docs/SYSTEM_BLUEPRINT.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/SYSTEM_BLUEPRINT.md), se cierra para no duplicar la fuente de verdad:
* *Histórico ya integrado en `SYSTEM_BLUEPRINT.md`:*
  * `001-sorteo-en-vivo-tv` (Sorteo en vivo con modos Cuota al Día / Contado y wording amigable).
  * `002-pagos-vendedores` (Idempotencia de 10s, paginación y rediseño de rendiciones de vendedores).
