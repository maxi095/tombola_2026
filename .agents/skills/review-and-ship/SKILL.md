---
name: review-and-ship
description: Quality Gate final, revisión de código multi-eje, sincronización documental y flujo Git (inspirada en code-review-and-quality, documentation-and-adrs y git-workflow-and-versioning de Addy Osmani). Usala al cerrar cualquier tarea o feature para verificar compilación, estándares, actualizar SYSTEM_BLUEPRINT.md / ROADMAP.md y preparar el commit/deploy.
---

# ✅🚢 Review, Quality Gate & Ship

Esta skill es el **paso final obligatorio** de los 4 carriles de ingeniería de **Gestión Tómbola**. Asegura que ningún cambio quede a medias, rompa el build o desactualice la documentación viva.

---

## 🔍 1. Auditoría Multi-Eje (Quality Gate Checklist)

Antes de dar por terminada una tarea, verificá estos 4 ejes:

1. **Compilación y Sintaxis (`Zero-Breakage`):**
   - Si se modificó el Frontend (`client/`), ejecutá obligatoriamente `npm run build` dentro de `client/` y confirmá que termine con `exit code 0`.
   - Verificá que no hayan quedado imports huérfanos, variables sin definir ni bloques resumidos (`// ...`).
2. **Integridad de Negocio y Seguridad:**
   - ¿Se respetaron los estados oficiales (`'Anulada'`, `'Pendiente de pago'`, `'Pagado'`, `'Activo'`, `'Anulado'`)?
   - Si se creó o tocó una ruta en `src/routes/`, ¿tiene los middlewares `authRequired` y `checkRole` adecuados?
3. **Estándar UI/UX 2026 (`docs/UI_UX_STANDARD.md`):**
   - ¿El Wording de títulos y botones cumple el glosario oficial (`Gestión de...`, `Registrar...`, `Crear...`, `Guardar...`, `Volver`)?
   - ¿La vista evita el scroll horizontal en resoluciones de Notebook (1366px) y es amigable en Mobile si aplica a Vendedores/Directiva?
   - ¿Los importes usan `formatCurrency` / `formatCurrencyInput` y las bajas usan `<ConfirmModal />`?
4. **Limpieza:**
   - ¿Quedaron `console.log` de depuración o archivos temporales que deban quitarse?

---

## 📘 2. Regla de Sincronización Documental (Fuente de Verdad Viva)

La documentación de **Gestión Tómbola** nunca debe desfasarse del código:
1. **`docs/SYSTEM_BLUEPRINT.md`:** Si el cambio agregó o modificó un modelo, campo, estado, regla de negocio, fórmula contable o permiso de rol, **actualizá `docs/SYSTEM_BLUEPRINT.md` en el mismo paso**.
2. **`docs/UI_UX_STANDARD.md`:** Si se creó o modificó un componente atómico en `client/src/components/ui/` o una regla de layout, reflejalo allí.
3. **`docs/ROADMAP.md`:** Marcá con `[x]` los ítems del Roadmap que hayan quedado resueltos con este trabajo.
4. **Cierre de Specs Efímeras (`docs/specs/<NNN-slug>/`):**
   - Cuando todos los slices de una spec en `docs/specs/<NNN-slug>/` están completos `[x]` y sus reglas de negocio ya fueron fundidas en `docs/SYSTEM_BLUEPRINT.md`, informale al usuario y archivá o limpiá la carpeta efímera según prefiera.

---

## 🌿 3. Flujo Git y Versionado (`develop` → `main`)

1. **Ramas de Trabajo:**
   - **`develop`:** Rama de integración continua y entorno de pruebas (*Staging*). Todo trabajo diario, refactor, optimización o feature se desarrolla y prueba primero sobre `develop`.
   - **`main`:** Rama exclusiva de **Producción**. Solo recibe merges limpios y verificados desde `develop` cuando están listos para el cliente / servidor productivo.
2. **Commits Atómicos (Conventional Commits):**
   - Sugerí o ejecutá (cuando el usuario lo pida) commits claros y atómicos con formato:
     - `feat(scope): descripción` (nueva funcionalidad)
     - `fix(scope): descripción` (corrección de bug)
     - `perf(scope): descripción` (optimización de queries, índices, bundle)
     - `refactor(scope): descripción` (modernización UI o limpieza de código sin cambio funcional)
     - `docs(scope): descripción` (actualización de Blueprint / Roadmap / Skills)
