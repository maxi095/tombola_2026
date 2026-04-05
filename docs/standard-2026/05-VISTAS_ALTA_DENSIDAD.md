# 🏹 Vistas de Alta Densidad: Elite 2026 v8.1

Este estándar define la arquitectura para paneles de gestión masiva donde la visibilidad "Above the Fold" (sin scroll) es la prioridad operacional absoluta.

## 🛡️ Patrón Zero-Air (Safe Density Control)

Para herramientas de cobranza, ventas o auditoría, se debe anular el padding por defecto de los contenedores institucionales para tener control quirúrgico del espacio.

### 1. Implementación en `Card`
Todo contenedor de datos técnicos debe usar la prop `padding="p-0"` para neutralizar el aire residual del componente base.
- **Uso**: `<Card padding="p-0" className="py-2 px-4 shadow-sm" />`
- **Regla**: El espaciado vertical debe ser manejado manualmente mediante `py` en el `className` para asegurar una altura de bloque mínima (ej. ~40px para barras de datos).

### 2. Higiene de Gaps
Reducir los espacios entre niveles de información (Header, Ficha, Listado) para agrupar la "Tríada Operativa" en un solo bloque visual.
- **Estándar**: `gap-2` entre niveles principales de la página. 🏹⚖️

---

## 📄 Ficha Técnica "Slim Line" (v7.7)

La visualización de metadatos (Cartón, Edición, Cliente) debe seguir el patrón de **Stack Comprimido**.

### Estructura de Ítem (V-Stack):
- **Label**: `text-[7px]` / `font-black` / `uppercase` / `leading-none` / `mb-1`.
- **Value**: `text-sm` / `font-black` / `leading-none`.
- **Organización**: Grid de alta densidad (ej. `grid-cols-2 lg:grid-cols-6`) con `divide-x` para separadores minimalistas. 🚀

---

## 🗳️ Tablero Maestro (Layout 2026)

Toda vista de detalle operativa debe orquestarse en tres niveles jerárquicos:

1.  **Nivel 1 (PageHeader)**: Título dinámico + KPIs integrados en el área de subtítulo para ahorrar espacio vertical.
2.  **Nivel 2 (Slim Ficha)**: Cinta técnica de datos inline o stack comprimido con patrón **Zero-Air**. ✨💎
3.  **Nivel 3 (Dynamic Grid)**: Plan de pagos o listado principal distribuido en **5 columnas** (`grid-cols-5`) para maximizar el aprovechamiento de monitores de escritorio. 🏹⚖️✨🚀

---

## 📅 Patrón QuotaCard V8.1 (Success Glass)

El componente de gestión de pagos es el referente de alta densidad del sistema.

### Características de Éxito:
- **Success Glass**: Cuotas pagadas usan `border-emerald-500` con gradiente `bg-emerald-50/20`.
- **Fusión de Cronología**: La fecha de cobro se muestra en el header de la tarjeta junto al estado, eliminando bloques de texto inferiores. ✨🚀
- **Vencimiento Dominante**: Fuente en `text-[10.5px]` con interlineado colapsado para máxima legibilidad táctica.

---
> [!IMPORTANT]
> **Jerarquía de Espacio**: En una resolución de 1366px, el usuario DEBE poder ver al menos 2 filas completas de cuotas sin realizar scroll, gracias a la compresión del Nivel 1 y 2.
