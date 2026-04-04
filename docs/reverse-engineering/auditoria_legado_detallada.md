# Auditoría Detallada de Entidades Legadas (Residuos Técnicos)

Este informe identifica y categoriza todos los elementos del código que no pertenecen al núcleo funcional de la "Gestión de Tómbola" (2024-2025) y que son considerados "Residuos Sucios" provenientes de prototipos o proyectos anteriores.

## 1. Inventario de Archivos e Impacto

| Entidad | Modelos (`src/models`) | Controladores (`src/controllers`) | Rutas (`src/routes`) | Impacto |
| :--- | :--- | :--- | :--- | :--- |
| **academicUnit** | `academicUnit.model.js` | `academicUnit.controllers.js` | `academicUnit.routes.js` | **BAJO**. Solo ocupa almacenamiento. |
| **project** | `project.model.js` | `project.controllers.js` | `project.routes.js` | **MEDIO**. Referenciado por `activityProject`. |
| **dimension** | `dimension.models.js` | `dimension.controllers.js` | `dimension.routes.js` | **BAJO**. Requisito de `Project`. |
| **activityProject**| `activityProject.model.js` | `activityProject.controllers.js`| `activityProject.routes.js`| **ALTO**. Vinculado a `Activity`. |
| **activity** | `activity.model.js` | `activity.controllers.js` | `activity.routes.js` | **ALTO**. Módulo completo paralelo. |
| **tasks** | `tasks.model.js` | `tasks.controllers.js` | `task.routes.js` | **NULO**. Código muerto boilerplate. |

## 2. Análisis de Dependencias Parásitas

Durante la ingeniería inversa se han detectado los siguientes puntos de fricción entre el código legado y el núcleo productivo:

- **Referencia Fantasma en `activity.controllers.js`**: En el método `getActivity` (Línea 62), el controlador intenta realizar un `.populate('academicUnit')` sobre un objeto `studentId`. Sin embargo, el modelo `User` actual (2025) no contiene el campo `academicUnit`. Esto indica que existe código "roto" heredado que podría lanzar errores silenciosos (null results) en la interfaz de gestión de actividades.
- **Contexto de Usuario Compartido**: Todos los controladores legados (`Project`, `Activity`, `AcademicUnit`) utilizan la referencia `req.user.id` para filtrar o asignar propiedad. Esto significa que si se elimina un `User`, se rompe la integridad referencial de todos estos módulos históricos.
- **Roles en `User.model.js`**: El `enum` de roles incluye `Secretario`, `Director` y `Estudiante`. Estos roles son **exclusivos** del sistema de actividades legado y no tienen permisos definidos sobre las rutas de la Tómbola. Su existencia añade complejidad innecesaria a la gestión de accesos 2026.

## 3. Estado de la Interfaz (Frontend)

El frontend (`App.jsx`) mantiene activos contextos y proveedores (`ContextProviders`) para todas estas entidades. Al renderizar la aplicación, se cargan en memoria:
- `ProjectProvider`
- `ActivityProjectProvider`
- `AcademicUnitProvider`
- `TaskProvider`
- `ActivityProvider`

Esto genera un overhead innecesario en la carga inicial y complica el mantenimiento del árbol de componentes de React.

## 4. Clasificación de Integridad

- **[TO_BE_REVIEWED] – Actividades Estudiantiles (`activity`, `activityProject`)**: Aunque son "sucias" para la Tómbola, parecen ser un módulo funcional completo que alguien podría estar usando. NO eliminar sin confirmación explícita de desmantelamiento de negocio.
- **[LEGACY_RESIDUE] – `tasks`**: Es un CRUD genérico de "TODO list" que no tiene ninguna vinculación. Es el candidato #1 para ser eliminado en una limpieza incremental.
- **[DATA_INTEGRITY_ALERT] – `User` vs `Person`**: La migración inacabada de campos desde `User` hacia `Person` dejó rastros en los controladores legados que aún buscan datos directamente en `User` que ya fueron movidos.

> [!IMPORTANT]
> **Recomendación para 2026**: Dado el bajo impacto funcional (Desacoplamiento total de ventas y sorteos), estos archivos pueden ser aislados (archivados) antes de su eliminación física para asegurar que ningún reporte histórico de 2024 dependa de estas tablas de MongoDB.
