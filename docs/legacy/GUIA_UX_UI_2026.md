# 🛡️ Guía Maestra UX/UI: Elite 2026 (v2.0) ✨🚀

Este es el manifiesto filosófico y operativo de **Gestión Tómbola**. Su misión es garantizar que el software se sienta como una herramienta financiera de alto nivel: robusta, limpia y semánticamente perfecta.

---

## ⚖️ 1. Ley de Integridad Funcional (Scope)

**Mecánica sobre Motor**: Nuestra misión es la evolución estética y estructural (UI/UX) sin alterar la arquitectura lógica del sistema legacy.
- **Respeto al Input**: Mantener los mismos campos y nombres de variables del backend.
- **Lógica Sacrosanta**: Prohibido modificar controladores o esquemas de base de datos sin autorización.

---

## 🏷️ 2. El Poder de la Palabra (Wording) 🏹⚖️

La consistencia semántica es la base de la autoridad institucional. No improvisamos nombres de acciones.
- **Consultar SIEMPRE**: [Estándar 08: Glosario Maestro de Wording](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/08-GLOSARIO_WORDING.md).
- **Regla de Oro**: Siempre usamos **"Guardar cambios"** y **"Crear [Entidad]"**.

---

## 🏗️ 3. Ecosistema de Estándares (El Canon)

Cualquier duda técnica o visual debe resolverse consultando la pieza específica del canon:

| ADN & Estética | Estructura & Densidad | Comportamiento & Flujo |
| :--- | :--- | :--- |
| [01-Sistema de Diseño](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/01-SISTEMA_DISENO.md) | [02-Arquitectura Layout](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/02-ARQUITECTURA_LAYOUT.md) | [06-Modales Elite](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/06-MODALES_ELITE.md) |
| [03-Patrones Componentes](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/03-PATRONES_COMPONENTES.md) | [05-Vistas Alta Densidad](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/05-VISTAS_ALTA_DENSIDAD.md) | [07-Fluidez Operativa](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/07-FLUIDEZ_OPERATIVA.md) |
| [04-Formularios Alta Gama](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/04-FORMULARIOS_ALTA_GAMA.md) | [09-Canon Tablas Atómicas](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/09-CANON_TABLAS_ATOMIC.md) | [08-Glosario Wording](file:///c:/proyectos_desarrollo/gestion_tombola/docs/standard-2026/08-GLOSARIO_WORDING.md) |

---

## 🎯 4. Principios de Oro de la Interfaz

1.  **Densidad Técnica (Zero-Air)**: Priorizamos la visibilidad de datos masivos sobre el espacio artístico. En vistas de auditoría, el aire es el enemigo. 🏹⚖️
2.  **Blindaje de Acciones**: Las herramientas de gestión (Editar/Eliminar) están **siempre visibles** y forzadas al extremo derecho mediante `isFixed: true`.
3.  **Live Feedback**: El sistema debe responder instantáneamente vía `useFeedback` (Toasts) y formateo de datos en tiempo real (DNI/Moneda).

---

> [!IMPORTANT]
> **Calidad Institucional**: El código debe "leerse" como el estándar. Si un componente usa clases manuales de Tailwind para colores o radios que existen en el Standard 01, la implementación es incorrecta. 🛡️✨🚀
