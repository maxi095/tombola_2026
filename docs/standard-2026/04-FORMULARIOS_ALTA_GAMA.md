# 📑 Formularios de Alta Gama: Premium 2026 v4.3

Este documento cataloga los patrones de diseño y UX para pantallas de registro y edición, utilizando la biblioteca de componentes atómicos.

## 🏗️ Bloque de Construcción: `<Card />` Inteligente

Las secciones de los formularios deben encapsularse en componentes `<Card />` que gestionan su propia cabecera institucional.

### Estándar de Sección:
```jsx
<Card 
  title="Seguridad Acceso" 
  icon={Key} 
  description="Gestión de credenciales"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
    <InputField 
      label="Email" 
      register={register("email")} 
      error={errors.email?.message} 
    />
    <Select 
      label="Rol" 
      options={roles} 
      register={register("roles")} 
    />
  </div>
</Card>
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

## ✨ Live Formatting & MÃ¡scaras DinÃ¡micas

Para una experiencia **Premium**, los campos numÃ©ricos crÃticos deben formatearse en tiempo real mientras el usuario escribe. No usamos mÃ¡scaras rÃgidas de librerÃas externas, sino el patrÃ³n **Elite 2026: Limpia Interna / Embellece Externa**.

### 🛠️ El PatrÃ³n Institucional
Se basa en el uso de `Controller` de `react-hook-form` y la librerÃa `formatters.js`.

#### Caso 1: Documento (DNI) con puntos
Muestra puntos (`.`) mientras el usuario escribe, pero guarda sÃ³lo los dÃgitos.
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
Muestra el signo `$ ` como **prefijo estÃ¡tico** (fuera del valor editable) para mÃ¡xima estabilidad del cursor. Soporta hasta 2 decimales con coma (institucional) o punto (teclado numÃ©rico).
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

### 🧠 ¿Por quÃ© este patrÃ³n?
1. **Dato Puro**: La base de datos recibe `150000` (fÃ¡cil de sumar/promediar), no `$ 150.000,00`.
2. **Feedback Inmediato**: El usuario confirma visualmente que el nÃºmero es correcto (evita errores de ceros de mÃ¡s).
3. **Cero Conflictos**: Al no usar librerÃas de mÃ¡scaras intrusivas, no hay problemas de foco ni de cursor.

---

## ⚙️ Reglas de Oro en Formularios
1. **Sticky PageHeader**: Toda pÃ¡gina de formulario debe tener un `<PageHeader />` fijo con botones de "Volver" y "Guardar Cambios".
2. **Nomenclatura SemÃ¡ntica**: 
   - Altas: `title="Alta de [Objeto]"` y `label="Crear [Objeto]"`.
   - Ediciones: `title="Editar [Objeto]"` y `label="Guardar Cambios"`.
3. **ValidaciÃ³n Reactiva**: Usar `react-hook-form` con mensajes de error descriptivos (`errors.fieldName?.message`).
4. **Modo EdiciÃ³n de Claves**: En `/edit`, las contraseÃ±as se ocultan tras un botÃ³n de "Restablecer ContraseÃ±a" para evitar cambios accidentales.
5. **Formateo Vivo**: Todo campo de DNI o Moneda **DEBE** implementar el patrÃ³n de Live Formatting descrito arriba.

---
**Actualizado:** Abril 2026 | **Scope:** GestiÃ³n TÃ³mbola (Administrative Portal)
