---
name: refactor-and-simplify
description: Simplificación de código, limpieza de deuda técnica y migración de componentes legacy (inspirada en code-simplification y deprecation-and-migration de Addy Osmani). Usala para limpiar controladores o vistas viejas, eliminar código muerto (zombie code) y reducir complejidad preservando el comportamiento exacto.
---

# 🧹 Refactor, Simplification & Legacy Migration

Esta skill combina los principios de **`code-simplification`** y **`deprecation-and-migration`** de Addy Osmani adaptados a **Gestión Tómbola**. Su objetivo es mejorar la salud, legibilidad y mantenibilidad del código **con cero cambio no intencional en el comportamiento del negocio**.

---

## 🧠 Principios Rectores

1. **La Valla de Chesterton (*Chesterton's Fence*):**
   - Nunca borres ni reescribas un bloque de código, cálculo o validación sin antes verificar **por qué existe y quién lo llama** en todo el repositorio (`grep` en `src/` y `client/src/`).
2. **Preservación de Comportamiento (Invariantes Contables):**
   - En un refactor, los contratos de entrada/salida, los cálculos financieros (`SellerPayment`, `Balance`, `Quota`, `Sale`) y los estados en base de datos deben seguir produciendo exactamente el mismo resultado.
3. **El Código Muerto es un Pasivo (*Zombie Code Removal*):**
   - Archivos huérfanos, modelos deprecados sin uso (ej. `Installment`), imports no utilizados, `console.log` de depuración o código comentado de hace meses deben eliminarse limpiamente (Git ya guarda el historial en el tag `v1.0-pre-sdd-cleanup`).
4. **Claridad sobre Ingenio (*Clarity over Cleverness*):**
   - Preferí funciones cortas con nombres explícitos, retornos tempranos (*guard clauses*) en lugar de `if/else` anidados de 5 niveles, y extracción de helpers reutilizables cuando una lógica se repite en varios archivos.

---

## 🔄 Proceso de Ejecución

1. **Inventario de Impacto:**
   - Buscá todas las referencias del archivo, función o componente a refactorizar.
   - Identificá las invariantes: ¿qué endpoints consume?, ¿qué estados modifica?, ¿qué props recibe?
2. **Plan de Corte Atómico:**
   - Si el refactor abarca varios archivos (ej. migrar `DrawPage.jsx`, `DrawFormPage.jsx` y `DrawViewPage.jsx` al Standard 2026), hacelo de a 1 archivo o sub-flujo verificable por vez.
3. **Ejecución Limpia:**
   - Sustituí patrones obsoletos (clases CSS manuales `.page-wide`/`.data-table`, `window.confirm`, `alert()`, `<input>` crudos) por los átomos oficiales de `client/src/components/ui/`.
   - Si eliminás un archivo o dependencia muerta, verificá que ningún `import` ni ruta en `src/app.js` o `client/src/App.jsx` apunte a él.
4. **Verificación Cero Quiebres:**
   - Ejecutá `npm run build` en `client/` y verificá que el servidor backend no tenga errores de sintaxis o imports faltantes.
   - Handoff a `review-and-ship`.
