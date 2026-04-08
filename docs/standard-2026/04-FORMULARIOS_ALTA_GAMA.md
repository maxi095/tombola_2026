# 📑 Formularios de Alta Gama: Premium 2026 v4.4

Este documento cataloga los patrones de diseño y UX para pantallas de registro y edición, utilizando la biblioteca de componentes atómicos.

## 🏗️ Bloque de Construcción: `<Card />` Inteligente

Las secciones de los formularios deben encapsularse en componentes `<Card />` que gestionan su propia cabecera institucional.

### Estándar de Sección Slim:
```jsx
<Card 
  size="slim"
  title="Seguridad Acceso" 
  icon={Key} 
  description="Gestión de credenciales"
>
  <FormGrid>
    <InputField 
      label="Email" 
      className="lg:col-span-2"
      {...register("email")} 
      error={errors.email?.message} 
    />
    <Select 
      label="Rol" 
      options={roles} 
      {...register("roles")} 
    />
  </FormGrid>
</Card>
```

---

## 📐 Grillas de Alta Densidad: `<FormGrid />`

Para mantener la consistencia en el espaciado y la respuesta táctil/visual, utilizamos el componente `<FormGrid />`.

### Reglas de Jerarquía de Columnas (Desktop):
Para maximizar la densidad sin comprometer la legibilidad, seguimos este canon:

1.  **4 Columnas (Default)**: Campos cortos, numéricos o de selección rápida.
    *   *Ejemplos*: DNI, Teléfono, Cuotas, Stock, Código Postal.
2.  **2 Columnas (`lg:col-span-2`)**: Campos de texto medio o descriptivos.
    *   *Ejemplos*: Nombres, Apellidos, Email, Razón Social.
3.  **Full Row (`lg:col-span-4`)**: Campos largos o áreas de texto.
    *   *Ejemplos*: Domicilio, Observaciones, Notas.

### Implementación Técnica:
```jsx
<FormGrid>
  {/* Ocupa 1 columna por defecto (1/4 de la fila) */}
  <InputField label="DNI" />
  
  {/* Ocupa 2 columnas (1/2 de la fila) */}
  <InputField label="Email" className="lg:col-span-2" />
  
  {/* Ocupa toda la fila */}
  <InputField label="Domicilio" className="lg:col-span-4" />
</FormGrid>
```

---


## 🛠️ Átomos de Entrada

### `<InputField />`
- **Props**: `label`, `placeholder`, `type`, `register`, `error`, `icon`, `onClick`.
- **Efecto**: Si se pasa un `icon` y `onClick`, el input se convierte en una pieza interactiva (ej: ver/ocultar contraseña).

### `<Select />`
- **Variantes**: `default` (para formularios) y `minimal` (para filtros).
- **Consistencia**: Siempre incluye el icono de `ChevronDown` institucional.

---

## 🏆 Caso de Éxito: Registro de Asociados (Slim 2026)

El módulo de **Asociados** (`ClientFormPage.jsx`) es el máximo exponente de la variante **Slim**. Utiliza una sola gran `Card` con `size="slim"` para agrupar 7 niveles de información de identidad en una resolución de 1080p sin scroll.

### 📐 Orquestación de Espacio en Asociados:
- **Fila 1**: Nombres (2 col) + Apellidos (2 col).
- **Fila 2**: DNI (1 col) + Email (2 col) + Teléfono (1 col).
- **Fila 3**: Domicilio (2 col) + Localidad (2 col).
- **Fila 4**: Notas/Observaciones (4 col - Full Row).

> [!TIP]
> Al agrupar los datos de contacto junto a la identidad, se reduce la fatiga visual del usuario al completar el perfil del asociado. 🏹⚖️✨💎🚀

---

## 🏆 Caso de Éxito: Registro de Vendedores (Slim 2026)

El módulo de **Vendedores** (`SellerFormPage.jsx`) consolida el canon **Slim**, logrando una simetría funcional con el registro de asociados.

### 📐 Orquestación de Espacio en Vendedores:
- **Fila 1**: Nombres (2 col) + Apellidos (2 col).
- **Fila 2**: Nro Documento (1 col - Live Format) + Email (2 col) + Teléfono (1 col).
- **Fila 3**: Domicilio (2 col) + Localidad (2 col).
- **Fila 4**: Comisión por Ventas (1 col - Requerido).

### 🚀 Innovaciones Tácticas:
1.  **Doble Validación**: Se mantienen las reglas de `react-hook-form` pero con el diseño de `InputField` de alta fidelidad.
2.  **Breadcrumbs Activos**: Integración de migas de pan en el `PageHeader` para facilitar el retorno al listado sin pérdida de contexto.
3.  **Acciones Descriptivas**: Los botones de acción se adaptan al contexto: *"Guardar vendedor"* (Alta) o *"Guardar cambios"* (Edición).

> [!IMPORTANT]
> **Consistencia Visual**: Mantener la misma cuadrícula entre Vendedores y Asociados reduce drásticamente el tiempo de carga de datos para el operador administrativo al estandarizar la posición de los campos. 🏹⚖️✨💎🚀

---

## ✨ Live Formatting & Máscaras Dinámicas

Para una experiencia **Premium**, los campos numéricos críticos deben formatearse en tiempo real mientras el usuario escribe. No usamos máscaras rígidas de librerías externas, sino el patrón **Elite 2026: Limpia Interna / Embellece Externa**.

### 🛠️ El Patrón Institucional
Se basa en el uso de `Controller` de `react-hook-form` y la librería `formatters.js`.

#### Caso 1: Documento (DNI) con puntos
Muestra puntos (`.`) mientras el usuario escribe, pero guarda sólo los dígitos.
```jsx
<Controller
  name="document"
  control={control}
  render={({ field }) => (
    <InputField
      label="Nro Documento"
      {...field}
      value={formatNumber(field.value)} // Vista con puntos
      onChange={(e) => field.onChange(stripNonDigits(e.target.value))} // Estado limpio
    />
  )}
/>
```

#### Caso 2: Moneda (Precios) con centavos y puntos
Muestra el signo `$ ` como **prefijo estático** (fuera del valor editable) para máxima estabilidad del cursor. Soporta hasta 2 decimales con coma (institucional) o punto (teclado numérico).
```jsx
<Controller
  name="cost"
  control={control}
  render={({ field }) => (
    <InputField
      label="Monto"
      prefix="$"
      {...field}
      value={field.value ? formatCurrencyInput(field.value) : ""}
      onChange={(e) => field.onChange(cleanCurrencyInput(e.target.value))}
    />
  )}
/>
```

### 🧠 ¿Por qué este patrón?
1. **Dato Puro**: La base de datos recibe `150000` (fácil de sumar/promediar), no `$ 150.000,00`.
2. **Feedback Inmediato**: El usuario confirma visualmente que el número es correcto (evita errores de ceros de más).
3. **Cero Conflictos**: Al no usar librerías de máscaras intrusivas, no hay problemas de foco ni de cursor.

---

## ⚙️ Reglas de Oro en Formularios
1. **Sticky PageHeader**: Toda página de formulario debe tener un `<PageHeader />` fijo con botones de "Volver" y "Guardar Cambios".
2. **Nomenclatura Semántica**: 
   - Registro: `title="Registrar [Objeto]"` y `label="Crear [Objeto]"`.
   - Ediciones: `title="Editar [Objeto]"` y `label="Guardar Cambios"`.
3. **Validación Reactiva**: Usar `react-hook-form` con mensajes de error descriptivos (`errors.fieldName?.message`).
4. **Modo Edición de Claves**: En `/edit`, las contraseñas se ocultan tras un botón de "Restablecer Contraseña" para evitar cambios accidentales.
5. **Formateo Vivo**: Todo campo de DNI o Moneda **DEBE** implementar el patrón de Live Formatting descrito arriba.

---
**Actualizado:** Abril 2026 | **Scope:** Gestión Tómbola (Administrative Portal)
