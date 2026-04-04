# 🧩 Patrones de Componentes: Premium 2026 v4.4

Este manual instruye sobre cómo implementar los componentes atómicos dentro de los módulos. No se debe construir UI "a mano" si existe un componente que resuelva la estructura.

## 🛡️ Visualización Institucional de Datos (v6.0)

Para garantizar la legibilidad y el profesionalismo en el manejo de montos y documentos, se establece el uso obligatorio de la librería `client/src/libs/formatters.js`.

### 1. Formateo de Moneda (Currency)
Todo monto monetario (Costo Total, Cuotas, Pagos) debe mostrarse con separador de miles y dos decimales obligatorios.
- **Formato**: `$ 1.234,56` (Locale `es-AR`).
- **Uso**: `import { formatCurrency } from "../../libs/formatters";`
- **Implementación**: `<span>{formatCurrency(edition.totalCost)}</span>`

### 2. Formateo de Documentos y Números
Los números de identificación (DNI) y cantidades grandes deben llevar separador de miles sin decimales.
- **Formato**: `20.123.456`
- **Uso**: `import { formatNumber } from "../../libs/formatters";`
- **Implementación**: `<td>{formatNumber(user.person.document)}</td>`

---

## 🗂️ Tríada de Listados: FilterBar + Table + Pagination

Todo listado institucional debe orquestarse con estos tres componentes para asegurar la consistencia.

### Estructura de Listado Premium:
```jsx
<FilterBar 
  placeholder="Buscar..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  actions={<Select options={roles} value={filter} onChange={setFilter} variant="minimal" />} 
/>

<Card padding="p-0">
  <Table>
    <THead>
      <TH>Identidad</TH>
      <TH>Rol</TH>
      <TH className="text-right">Acciones</TH>
    </THead>
    <TBody>
      {items.map(item => (
        <tr key={item._id}>
          <TD>...</TD>
          <TD><Badge variant="primary">...</Badge></TD>
          <TD className="text-right">...</TD>
        </tr>
      ))}
    </TBody>
  </Table>
  <Pagination totalItems={filtered.length} />
</Card>
```

### 🏷️ Sistema de Badges Atómicos
Usar exclusivamente el componente `<Badge />`. No crear píldoras manuales con Tailwind.
- **Primary**: Navy (#1B3B5A) - Usado para Administradores o estados críticos.
- **Secondary**: Slate - Usado para Vendedores o información general.

---

## 👤 Identidad Visual (Avatares y Nombres)
Utilizar el patrón de **Avatar Fallback** con la inicial del usuario.
- **Contenedor**: `w-10 h-10 rounded-2xl bg-primary/5 text-primary`.
- **Efecto**: `group-hover:scale-110 transition-all`.

---

## 📄 Reglas de Oro en Listados
1. **Acciones Siempre Visibles**: Las operaciones como "Editar" o "Eliminar" deben mostrarse al pie de la fila, preferiblemente usando `Button variant="ghost"`.
2. **Paginación Obligatoria**: Nunca dejar que una tabla crezca indefinidamente; usar el componente `<Pagination />`.
3. **Empty States**: Siempre manejar el caso de `items.length === 0` con un mensaje institucional dentro de la tabla.

## 🗣️ Feedback Interactivo (v4.5)

El sistema debe comunicarse con el usuario de forma fluida para confirmar acciones exitosas o prevenir bajas accidentales.

### 1. Mensajes de Éxito y Error (Toasts)
Utilizar el hook `useFeedback` para lanzar notificaciones no-invasivas.
- **Uso**: `showToast("Mensaje de éxito", "success")`.
- **Efecto**: Aparece en la esquina superior derecha con un icono dinámico.

### 2. Confirmación de Procesos Críticos (Modales)
Usar el componente `<ConfirmModal />` para proteger acciones destructivas (Bajas).
- **Parámetros**: `title`, `message`, `onConfirm`, `variant="danger"`.
- **Regla**: Nunca usar `window.confirm`. El modal debe usar el estilo "Danger" para eliminaciones y "Primary" para procesos de negocio.

### 3. Exportación de Datos (Excel)
Toda tabla administrativa con datos operacionales debe ofrecer exportación a `.xlsx`.
- **Utilidad**: `exportToExcel(data, fileName, columnMap)`.
- **Ubicación**: Botón en `PageHeader` con variante `ghost` e icono `FileSpreadsheet`.
- **Regla**: Siempre exportar los datos filtrados en tiempo real (visibles en pantalla).

### 4. Formularios Inteligentes (Smart Fields)
Para mejorar la velocidad de carga de datos complejos:
- **Auto-generación**: Si un campo define una cantidad (ej: Cuotas), el formulario debe generar automáticamente las filas necesarias usando `useFieldArray`.
- **Validación de Integridad**: Siempre validar sumatorias (ej: Suma de Cuotas vs Costo Total) antes de permitir el envío, notificando mediante `showToast("error")`.

### 5. Gestión de Fechas (HTML5 Standard)
Los inputs de tipo `date` son estrictos:
- **Formateo Obligatorio**: Antes de cargar un dato de fecha en el formulario, DEBE ser convertido al formato `YYYY-MM-DD` (ej: `new Date(val).toISOString().split('T')[0]`).
- **ISO-Compliance**: Mantener la fecha en formato ISO en el estado interno para persistencia.

> [!TIP]
>  - 🛡️ **Stability Guard**: En todos los `useMemo` de filtrado, validar siempre que el array exista antes de aplicar `.filter()` o `.map()`. Ejemplo: `(data || []).filter(...)`.
>  - 📅 **HTML5 Dates**: Convertir siempre las fechas a `YYYY-MM-DD` antes de cargarlas en un `InputField` de tipo `date`.
> **Animación de Carga**: Siempre usar un esqueleto de carga o un spinner centrado si `loading` es true para evitar saltos bruscos en el diseño.

### 6. Omni-Search (Búsqueda Inteligente)
Para maximizar la densidad y reducir el número de filtros visibles:
- **Unificación**: Agrupar múltiples criterios (ej: Nro, Vendedor, Cliente) en un único `InputField` con icono `Search`.
- **Lógica**: Implementar el filtrado en un `useMemo` que busque simultáneamente en todos los niveles del objeto (ej: `card.seller.person.firstName`).

### 7. Smart Wrap (Legibilidad en Tablas)
En listados de alta densidad donde los nombres son críticos:
- **Prohibición**: Evitar el uso de `truncate` si la lectura del dato completo es operacionalmente prioritaria.
- **Implementación**: Usar `items-start` en el contenedor `flex` para alinear iconos arriba, y `leading-tight` para el texto multi-línea.
- **Control Horizontal**: Mantener siempre un `max-w` flexible para evitar que una columna empuje a las demás excesivamente.

## 🗳️ Nomenclatura Estándar de Acciones (v5.0)

Para garantizar que el sistema sea predecible, se deben seguir estas reglas de etiquetado:

### 1. En Listados (Tablas)
- **Botón Primario (Header)**: Siempre usar el verbo **"Crear"** seguido de la entidad. Ej: `Crear Usuario`, `Crear Edición`. (Variante: `primary`).
- **Botón de Exportación**: Siempre **"Exportar"**. (Variante: `ghost`, icono: `FileSpreadsheet`).
- **Botón de Limpieza**: Siempre **"Limpiar"**. (Variante: `ghost`, icono: `FilterX`).
- **Cabecera de Tabla**: La última columna siempre se llama **"ACCIONES"**.

### 2. En Formularios (Alta/Edición)
- **Botón de Envío (Alta)**: **"Guardar [Entidad]"**. Ej: `Guardar Usuario`.
- **Botón de Envío (Edición)**: **"Guardar cambios"** (en minúsculas la segunda palabra, estilo institucional).
- **Botón de Retorno**: Siempre **"Volver"**. Nunca usar "Cancelar" o "Regresar".

### 3. Acciones de Fila
- **Editar**: Para abrir el formulario de modificación.
- **Eliminar**: Para disparar el `ConfirmModal` de baja.

> [!IMPORTANT]
> **Jerarquía de Color**: El botón de **Exportar** y **Limpiar** deben ser siempre grises (`ghost` o `outline`) para no competir visualmente con el botón de **Crear** (Blue Solid), que es la acción principal de la página.

> [!TIP]
>  - 🛡️ **Stability Guard**: En todos los `useMemo` de filtrado, validar siempre que el array exista antes de aplicar `.filter()` o `.map()`. Ejemplo: `(data || []).filter(...)`.
>  - 📅 **HTML5 Dates**: Convertir siempre las fechas a `YYYY-MM-DD` antes de cargarlas en un `InputField` de tipo `date`.
>  - 🏗️ **Smart Buttons**: Implementar lógica ternaria para el botón de envío: `params.id ? "Guardar cambios" : "Guardar [Entidad]"`.

---

## 🛡️ Blindaje de Identificadores: Estabilización de Componentes (v5.5)

Para evitar colisiones en el grafo de dependencias de Vite y errores de tipo "Already declared" durante el Hot Module Replacement (HMR), se establece una distinción estricta en la nomenclatura de selectores:

### 1. EliteSelect (Componente Corporativo)
Es el componente de la librería UI propia (`client/src/components/ui/Select.jsx`) que ya incluye los estilos Premium 2026, soporte para portales (anti-clipping) y búsqueda estilizada. ⚓ 🛡️
- **Uso**: Siempre que se necesite un selector con la estética oficial del sistema.
- **Importación**: `import EliteSelect from "../../components/ui/Select";` (obligatorio renombrar así).
- **Ejemplo**:
  ```jsx
  <EliteSelect 
    label="Estado" 
    options={statusOptions} 
    value={currentStatus} 
    onChange={handleStatusChange} 
  />
  ```

### 2. ReactSelect (Librería Externa)
Se refiere al uso directo de la librería `react-select`. Solo debe usarse en formularios de extrema complejidad técnica donde se requiera integración nativa profunda con `react-hook-form` que aún no esté cubierta por `EliteSelect`. 🏹⚖️🚀
- **Uso**: Únicamente en `DrawFormPage` y `SellerPaymentFormPage`.
- **Importación**: `import ReactSelect from "react-select";` (para evitar colisión con el identificador `Select`).
- **Ejemplo**:
  ```jsx
  <ReactSelect 
    {...field} 
    styles={customSelectStyles} 
    options={options} 
  />
  ```

> [!WARNING]
> **Prohibición de Nomenclatura**: Está terminantemente prohibido importar cualquier componente con el nombre genérico `Select`. Esta restricción elimina de raíz los errores de `ReferenceError` y `Already declared` que bloquean la compilación de Vite.

---

## 🗺️ Trazabilidad Institucional (PageHeader & Breadcrumbs) (v5.6)

Para garantizar que el usuario siempre sepa dónde está y qué acción está realizando, se establece una normativa estricta para el componente `<PageHeader />`:

### 1. Nomenclatura de Títulos (H1)
- **Creación (Nuevo Item)**: Siempre usar **"Registrar [Entidad]"**.
  - *Correcto*: "Registrar Usuario", "Registrar Edición", "Registrar Venta".
  - *Incorrecto*: "Alta de Usuario", "Nuevo Usuario", "Crear Venta".
- **Edición (Modificación)**: Siempre usar **"Editar [Entidad]"**.
  - *Correcto*: "Editar Usuario", "Editar Venta".
  - *Incorrecto*: "Modificar Usuario", "Edición de Venta".

### 2. Estructura de Breadcrumbs (Migas de Pan)
Las migas de pan deben reflejar la jerarquía de navegación de forma predecible:
- **Nivel 1**: Nombre de la entidad en plural (Ej: "Usuarios", "Ventas").
- **Nivel 2 (Acción)**: 
  - **"Registrar"** para nuevas entidades.
  - **"Editar"** para modificaciones.
- **Formato**: Siempre usar **Title Case** (Ej: "Registrar" en lugar de "registrar").

### Ejemplo de Implementación Estándar:
```jsx
<PageHeader
  title={params.id ? "Editar Usuario" : "Registrar Usuario"}
  subtitle="..."
  breadcrumbs={[
    { label: "Usuarios", href: "/users" },
    { label: params.id ? "Editar" : "Registrar", href: "#" }
  ]}
/>
```
