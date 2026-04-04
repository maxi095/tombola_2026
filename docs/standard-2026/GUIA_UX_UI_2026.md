# Guía de Estándares UX/UI - Modernización 2026 (v1.0)

Este documento establece las reglas semánticas y visuales para el desarrollo de nuevos módulos, asegurando la consistencia del ecosistema **Premium 2026**.

---

## 1. Ley de Integridad Funcional (Scope de Modernización)

**IMPORTANTE**: El objetivo de este proceso es la evolución de la Interfaz (UI) y la Experiencia de Usuario (UX). Bajo ningún concepto se debe alterar la arquitectura lógica del sistema legacy.

- **Respeto al Input**: Si un formulario legacy presenta `X` cantidad de campos, la versión Premium DEBE mantener exactamente los mismos `X` campos, respetando su nombre de variable y propósito.
- **Lógica Sacrosanta**: No se deben modificar controladores, validaciones de backend o flujos de persistencia (API/Contexto) a menos que sea estrictamente necesario para la compatibilidad con los nuevos componentes (ej. memorización de funciones).
- **Consistencia de Datos**: La modernización es una "capa estética y estructural" superior que no debe impactar en el modelo de datos.

---

## 2. El Patrón de Referencia: Módulo Usuarios (v4.5)

La forma en que nombramos las acciones define la profesionalidad del sistema.

### 🏷️ Títulos de Pantalla (`PageHeader`)
Se debe usar una nomenclatura jerárquica y clara:
- **Listados**: Siempre usar el prefijo `Gestión de...`. (Ej: *Gestión de Usuarios*, *Gestión de Ventas*).
- **Altas**: Siempre usar el prefijo `Alta de...`. (Ej: *Alta de Usuario*).
- **Edición**: Siempre usar el prefijo `Editar...`. (Ej: *Editar Usuario*).

### 🔘 Botones y Acciones
Evitar términos genéricos. Ser específico con el objeto:
- **Creación**: `Nuevo [Objeto]` (Ej: *Nuevo Usuario*).
- **Confirmación final**: `Crear [Objeto]` o `Guardar Cambios`.
- **Navegación**: `Volver` (no "Atrás").

---

## 2. Estándar de Listados (Grillas)

Todo listado en el sistema debe cumplir con la **Ley de Tres**: Filtro, Tabla y Paginación.

### 🔍 Filtros (`FilterBar`)
1. **Búsqueda por Texto**: Obligatoria. El placeholder debe ser descriptivo: `Buscar [Campo1], [Campo2] o [Campo3]...`.
2. **Filtros de Categoría**: Todo listado debe tener al menos un selector de estado o rango (ej: *Filtrar por Rol*).
3. **Ubicación**: Siempre alineado a la izquierda, debajo del header.

### 📊 Tabla e Integridad (`Table`)
- **Encabezados**: Siempre en Mayúsculas, `font-black`, y con tracking expandido (`tracking-[0.2em]`).
- **Columna de Acciones**: Siempre debe llamarse `Acciones` (evitar "Operaciones" o "Opciones").
- **Visibilidad**: Las acciones (Editar/Eliminar) deben estar **siempre visibles** (con opacidad reducida o estilo ghost) para evitar la "incertidumbre del click".
- **Empty State**: Si no hay datos, mostrar un mensaje centrado: `No se encontraron [Objetos] bajo este filtro`.

---

## 3. Arquitectura de Formularios (`Card`)

Los formularios se dividen en "Dimensiones de Información".

### 📦 Agrupación por Secciones
- Usar componentes `<Card />` con los atributos `title`, `icon` y `description`.
- **Títulos de Sección**: Breves y directos (Ej: *Seguridad Acceso*, *Datos Personales*).
- **Descripción**: Una sola frase que explique la intención de la sección.

---

## 5. Densidad Técnica y Eficiencia de Espacio (v4.4)

Para herramientas de gestión masiva, la visibilidad "Above the Fold" es prioritaria sobre el espacio en blanco estético.

### 📐 Reglas de Oro de Altura
- **PageHeader**: Padding vertical máximo de `py-5`. Título principal en `text-3xl` para optimizar el área de trabajo inicial.
- **Card Padding**: El estándar de aire interno es `p-10` (escritorio) y `p-8` (móvil). Evitar exceder estas medidas en formularios.
- **Header de Card**: Iconos de `24px` en contenedores de `w-12 h-12`. El margen inferior de la cabecera debe ser de `mb-10` con `pb-8`.
- **Grid Gaps**: Usar `gap-y-6` para separar campos. Esto mantiene la legibilidad sin dispersar la información.

---

## 4. Design Tokens (Visual Audit)

- **Color Primario**: Navy Institucional `#1B3B5A` (usado para títulos, botones primarios y estados activos).
- **Tipografía**:
  - **Títulos**: `font-manrope` / `font-black`.
  - **Etiquetas/Labels**: `uppercase` / `font-black` / `text-[11px]`.
  - **Cuerpo**: `font-bold` para datos importantes, `font-medium` para secundarios.
- **Espaciado Vertical**:
  - `px-12` para contenedores de página.
  - `gap-10` entre piezas de información mayores.

---
**Actualizado:** Abril 2026 | **Hito:** Optimización de Productividad Validada.
