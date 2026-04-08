# 🛡️ Estándar 09: Canon de Tablas Atómicas (v19.6) ✨🚀

Este estándar define la visualización obligatoria para todas las columnas de datos en listados de alta densidad (`Table.jsx`). Su objetivo es la **legibilidad instantánea** y la **jerarquía de información** mediante componentes atómicos. 🏹⚖️✨💎🚀

---

## 🏗️ 1. Columna: NRO VENTA (Operación)

Identifica el número de registro de la transacción. Debe resaltar sobre el resto por ser la clave primaria de búsqueda visual.

- **Componente**: `OperationCell`
- **Prefijo Obligatorio**: `"OPERACIÓN"`
- **Formato**:
```javascript
<OperationCell key={col.id} number={sale.saleNumber} />
```
- **Evolución 2026**: Se ha simplificado el diseño eliminando el label superior ("OPERACIÓN") para ganar 12px de espacio vertical por fila, permitiendo una mayor densidad de registros en pantalla. ✨

---

## 🎟️ 2. Columna: CARTÓN / EDICIÓN (Stock)

Presenta la entidad física del cartón y su contexto temporal (Edición).

- **Componente**: `StockCell`
- **Prefijo Nro**: `"Cartón #"` (Diferente al Nro Venta por semántica de inventario).
- **Sub-nivel**: Nombre de la Edición o "S/E" en su defecto.
- **Formato**:
```javascript
<StockCell 
  key={col.id} 
  main={`Cartón #${item.bingoCard?.number || item.number}`} 
  sub={item.edition?.name || "Global"} 
/>
```
- **Estética**: El número del cartón debe ser prominente, la edición en tono neutro (`slate-400`). 📐

---

## 👤 3. Columna: VENDEDOR (Identity)

Muestra quién tiene la responsabilidad del activo o quién realizó la venta.

- **Componente**: `UserCell`
- **Variante**: `variant="secondary"` (Gris institucional).
- **Sub-nivel**: Username (ej: `@vendedor1`) o "Stock en mano" según el contexto.
- **Formato**:
```javascript
<UserCell 
  key={col.id} 
  name={seller.fullName} 
  sub={seller.username ? `@${seller.username}` : "Vendedor Final"} 
/>
```
- **Estética**: Nombre en mayúsculas sostenidas, icono de usuario siempre presente. 🛡️

---

## 🤝 4. Columna: ASOCIADO / LOCALIDAD (Associate)

Doble nivel de información para identificar al comprador y su ubicación logística.

- **Componente**: `UserCell`
- **Variante**: `variant="primary"` (Azul Elite) o `secondary` según jerarquía de la página.
- **Sub-nivel**: Localidad (City) con icono de ubicación.
- **Formato**:
```javascript
<UserCell 
  key={col.id}
  name={client.fullName} 
  sub={client.city || "Sin localidad"} 
/>
```
- **Estética**: Nombre prominente en el primer nivel, localidad en segundo nivel con tipografía ligera. 🏹⚖️

---

## 📅 5. Columna: FECHA (Chronology)

Información temporal de la operación o actualización.

- **Formato**: `DD/MM/YYYY` (con hora si es auditoría crítica).
- **Estilo CSS**: `text-xs font-black text-slate-500`
- **Formato**:
```javascript
<TD key={col.id} className="text-xs font-black text-slate-500">
  {dayjs(item.date).format('DD/MM/YYYY')}
</TD>
```
- **Estética**: Unificada en un solo nivel, color gris medio para no competir con el contenido atómico. ✨

---

> [!IMPORTANT]
> **Consistencia Mandatory**: Si una página de listado (ej: `QuotasPage`, `SalePage`, `BingoCardPage`) no sigue estos 5 pilares, se considera **Legacy** y debe ser refactorizada antes de cualquier entrega a producción. 🛡️✨🚀
