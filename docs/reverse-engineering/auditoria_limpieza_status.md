# Estado de Auditoría y Limpieza: Entidades Legadas

Este archivo reporta el progreso de la eliminación de entidades "sucias" detectadas en la Fase 1.

## 🚩 Entidades Identificadas como Residuos

| Entidad | Estado | Acción Pendiente | Responsable |
| :--- | :--- | :--- | :--- |
| **academicUnit** | `ELIMINADO` | Ninguna. Archivos borrados. | Documentation_Maintainer |
| **tasks** | `ELIMINADO` | Ninguna. Archivos borrados. | Documentation_Maintainer |
| **project** | `ELIMINADO` | Ninguna. Archivos borrados. | Schema_Validator |
| **dimension** | `ELIMINADO` | Ninguna. Archivos borrados. | Quality_Performance_Bot |
| **activity** | `ELIMINADO` | Ninguna. Archivos borrados. | Business_Logic_Guardian |
| **activityProject** | `ELIMINADO` | Ninguna. Archivos borrados. | Business_Logic_Guardian |

## 🛡️ Checks de Seguridad (Zero-Breakage)
- [x] No existen referencias en los modelos core (`Edition`, `Sale`, `BingoCard`).
- [x] Las rutas han sido eliminadas en `app.js`.
- [x] Los controladores legados han sido eliminados físicamente.
- [x] El frontend ha sido desacoplado (`App.jsx`, Contextos, Páginas).

## 📅 Bitácora de Limpieza
- `2026-04-02`: Creación del reporte de estatus y mapeo inicial.
- `2026-04-03`: **Hito Alcanzado**: Módulo de **Usuarios** 100% modernizado a Estándar v4.3 (Atómico).

---

## 🏛️ Estatus de Interfaz (UI Modernization)

Este panel monitorea la transición hacia el sistema atómico **Standard 2026**.

| Módulo | Estatus | Estándar de Componentes | CSS Legado |
| :--- | :--- | :--- | :--- |
| **Login** | 🟢 Mitigado | Parcial (Inyectado) | Conectado (Vía Puente) |
| **Home/Dashboard** | 🔵 En Proceso | Parcial | Conectado (Vía Puente) |
| **Usuarios** | ✅ **Modernizado** | **100% Atómico (v4.3)** | **DESCONECTADO** |
| **Ventas / Ediciones** | 🔴 Pendiente | Ninguno (Legacy Layout) | Conectado (Crítico) |

> [!IMPORTANT]
> Los módulos marcados como **✅ Modernizado** NO deben importar archivos de `client/src/assets/css/`. Cualquier ajuste visual debe realizarse mediante componentes en `client/src/components/ui/` o `index.css`.
