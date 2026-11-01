# 🦾 Constitución y Reglas Maestras: Gestión Tómbola (Standard 2026 v7.0) ✨🚀

Este archivo es la **Fuente Única de Verdad Operativa** para cualquier agente de IA o desarrollador trabajando en **Gestión Tómbola**. Unifica la constitución técnica del stack (`CLAUDE.md` absorbido aquí), el ADN estético multi-dispositivo y el flujo de ingeniería basado en **Spec-Driven Development (SDD) + Addy Osmani Agent Skills**.

> 📌 **Resguardo Histórico:** Toda la documentación previa (`docs/legacy/`, `CLAUDE.md` y specs iniciales) fue consolidada en esta arquitectura y resguardada en el historial de Git bajo el tag **`v1.0-pre-sdd-cleanup`**.

---

## 📚 1. Mapa de Consulta Obligatoria (Knowledge Loop)

Antes de planificar o escribir código, consulta el documento específico según tu tarea:
1. **[`docs/index.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/index.md)**: Índice central de navegación y estado del proyecto.
2. **[`docs/SYSTEM_BLUEPRINT.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/SYSTEM_BLUEPRINT.md)**: Reglas de negocio vivas, fórmulas contables, modelos de datos de MongoDB, estados y matriz de roles (Admin, Vendedor, Directiva, Público).
3. **[`docs/UI_UX_STANDARD.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/UI_UX_STANDARD.md)**: Reglas de diseño para **Notebook HD (1366px sin scroll horizontal)**, **Mobile PWA (Vendedores/Directiva)**, **Vistas TV (100vh)**, catálogo de componentes en `client/src/components/ui/` y Glosario de Wording.
4. **[`docs/ROADMAP.md`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/ROADMAP.md)**: Plan maestro de evolución (Optimización Backend/DB → Seguridad y Roles → Frontend/PWA → Cloud & Landing).

---

## 🛠️ 2. Stack Tecnológico y Comandos

### Backend (Raíz `/`)
* **Runtime & Framework:** Node.js (ES Modules: `"type": "module"`) + Express 4.
* **Base de Datos:** MongoDB + Mongoose 8.
* **Seguridad & Validación:** JWT en Cookies `httpOnly` (`token`), `bcryptjs`, `cors` y esquemas `Zod` (`src/schemas/`).
* **Estructura:** `src/models/`, `src/controllers/`, `src/routes/`, `src/middlewares/`, `src/schemas/`, `src/libs/`.
* **Comandos:**
  * Desarrollo: `npm run dev` (`nodemon src/index.js`)
  * Producción: `npm start`

### Frontend (`client/`)
* **Framework & Build:** React 18 + Vite 5.
* **Estilos & UI:** TailwindCSS + variables CSS nativas (`index.css`), iconos `lucide-react`, `react-select`, `react-hook-form`, `recharts`.
* **Estructura:** `client/src/components/ui/` (átomos obligatorios), `client/src/pages/`, `client/src/context/`, `client/src/api/`, `client/src/hooks/`, `client/src/libs/formatters.js`.
* **Comandos (ejecutar dentro de `client/`):**
  * Desarrollo: `npm run dev`
  * Verificación de Compilación (Quality Gate obligatorio): `npm run build`
  * Linter: `npm run lint`

---

## 🧭 3. Flujo de Ingeniería Multi-Carril (`.agents/skills/`)

No todos los cambios requieren la misma ceremonia. El orquestador [`workflow`](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/.agents/skills/workflow/SKILL.md) rutea cada solicitud por uno de los **4 carriles**:

1. **Carril A — Nueva Funcionalidad / Módulo (`SDD Completo`):**
   `explore` (opcional) → `specify` → `clarify` → `plan` → `slice` → `implement` → `review-and-ship`.
   *Genera artefactos efímeros en `docs/specs/<NNN-slug>/` que al finalizar se funden en `docs/SYSTEM_BLUEPRINT.md`.*
2. **Carril B — Refactorización y Modernización UI (`Code Simplification`):**
   `refactor-and-simplify` + `ui-ux-responsive` → `implement` → `review-and-ship`.
   *Preserva el comportamiento de negocio exacto mientras moderniza vistas o limpia deuda técnica.*
3. **Carril C — Optimización, Escalabilidad y Seguridad (`Measure & Harden`):**
   `performance-and-security` → `implement` → `review-and-ship`.
   *Foco en índices MongoDB, paginación server-side, eliminación de N+1, RBAC multi-rol y bundle size.*
4. **Carril D — Mantenimiento y Bugfixing (`Triage & RCA`):**
   `testing-and-debugging` → `implement` → `review-and-ship`.
   *Reproducir → Aislar Causa Raíz → Fix quirúrgico → Verificación.*

---

## ⚖️ 4. Leyes Innegociables de Código y UX

1. **Prohibición de Resúmenes de Código:** Queda estrictamente prohibido usar comentarios como `// ... resto del código` al editar o crear archivos. Siempre entregar bloques completos y funcionales.
2. **Integridad Semántica (Wording):**
   * **Títulos (`PageHeader`):** `Gestión de [Entidad]` (listados), `Registrar [Entidad]` (altas), `Editar [Entidad]` (modificaciones), `Detalle de [Entidad]` (vistas).
   * **Botones:** `Crear [Entidad]` (nunca "Nuevo"), `Guardar [Entidad]` / `Guardar cambios`, `Volver` (nunca "Cancelar" ni "Regresar"), `Exportar`, `Limpiar`, `Eliminar`.
   * **Estados:** Usar exclusivamente `Anulada` / `Anulado` (jamás "Cancelada"). En pantallas de sorteo en vivo (TV), jamás usar la palabra `"Deuda"`; usar `"No participa – Cuotas pendientes"` o `"No participa – Pago de contado incompleto"`.
3. **Cero Scroll Horizontal y Adaptabilidad por Dispositivo:**
   * **Paneles Administrativos (Notebook HD 1366px):** Prohibido generar scroll horizontal en la página o dentro de tarjetas. Usar `<PageHeader compact />` -> `<FilterBar variant="slim" />` -> `<Card padding="p-0">` -> `<Table />` con celdas atómicas compactas (`OperationCell`, `StockCell`, `UserCell`, `AmountCell`) y `useTableColumns` con columna `ACCIONES` fija (`isFixed: true`).
   * **Vistas Mobile / PWA (Vendedores y Directiva):** En pantallas `< md` (celulares), evitar tablas anchas; priorizar tarjetas compactas accionables (*Touch-First*, botones $\ge 44\text{px}$) y flujos de 1 o 2 toques.
   * **Pantallas de Proyección / TV:** Contenedor `h-screen overflow-hidden flex flex-col justify-between`, estética de alto contraste y barra de auspiciantes fija.
4. **Reutilización Atómica:** Prohibido usar `window.confirm` o `alert()` nativos; usar siempre `<ConfirmModal />` y `useFeedback().showToast`. Prohibido usar `<input>` o `<select>` crudos cuando aplican `<InputField />`, `<Select />` y los formateadores de `client/src/libs/formatters.js` (`formatCurrency`, `formatCurrencyInput`, `cleanCurrencyInput`).
5. **Gate de Verificación (`Zero-Breakage`):** Ninguna tarea se da por terminada sin verificar que `npm run build` en `client/` compile con cero errores y que `docs/SYSTEM_BLUEPRINT.md` / `docs/ROADMAP.md` reflejen cualquier cambio estructural.
6. **Protección Absoluta de Base de Datos Productiva (`Zero-Data-Loss` & Retrocompatibilidad):**
   * El sistema opera con datos históricos y productivos reales en MongoDB.
   * **Prohibido hacer cambios destructivos en esquemas:** Nunca renombrar, eliminar ni cambiar el tipo de campos existentes en modelos productivos (`Edition`, `BingoCard`, `Sale`, `Quota`, `SellerPayment`, `Balance`, `Client`, `Seller`, `Person`, `Draw`, `User`).
   * **Cambios 100% Aditivos:** Todo campo nuevo debe ser opcional o tener un `default` seguro para que los documentos históricos sigan leyendo y operando sin errores.
   * **Índices Seguros:** Usar índices estándar de lectura (`.index({ campo: 1 })`) y nunca agregar restricciones `unique: true` nuevas sobre colecciones con datos históricos sin verificar duplicados o usar `sparse: true` / `partialFilterExpression`.
