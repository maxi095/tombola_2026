# 🏹 Diálogos Institucionales: Elite Modal 2026

Este estándar define la arquitectura de ventanas emergentes (Modales) para garantizar foco operacional y jerarquía visual en el sistema.

## 🛡️ Motor Unificado (`ui/Modal.jsx`)

Todos los modales deben delegar su estructura al componente base `Modal.jsx`, el cual gestiona automáticamente el backdrop, las sombras, el radio de curvatura (`32px`) y las animaciones.

### 1. Variantes Semánticas
Se definen tres tonos visuales según el contexto de la acción:

- **`primary` (Opera Navy)**:
    - **Uso**: Transacciones financieras, cobros de cuotas, liquidaciones.
    - **Estilo**: Header Navy con texto blanco. Transmite autoridad y seguridad.
- **`warning` (Special Amber)**:
    - **Uso**: Acciones de cortesía, anulaciones, entregas sin cargo.
    - **Estilo**: Header Naranja/Ámbar. Indica una excepción al flujo normal.
- **`default` (Formulary Clean)**:
    - **Uso**: Registro de clientes, edición de perfiles, carga de datos.
    - **Estilo**: Cabecera blanca/gris claro. Transmite limpieza y foco en la carga.

---

## 💹 El Corazón del Dato: `ModalSummary.jsx`

Toda transacción de valor debe incluir una caja de resumen táctico inmediatamente debajo del header.

- **Componente**: `<ModalSummary items={[{ label, value, icon }]} />`
- **Regla**: El label debe ir en `text-[10px] uppercase font-black` y el valor en `text-2xl font-manrope black`. 🏹⚖️✨🚀

---

## 🖱️ Anatomía del Footer (Jerarquía de Botones)

El pie del modal debe seguir siempre este orden para reducir la carga cognitiva:

1.  **Cierre/Cancelar (Izquierda)**: Botón con `variant="ghost"` y texto en mayúsculas (`text-[10px]`).
2.  **Confirmar (Derecha)**: Botón sólido con icono semántico (`CheckCircle2`, `Save`, etc.). Debe tener el doble de peso visual que el cancelar. ✨💎

---
> [!IMPORTANT]
> **Coherencia de Radios**: Ningún modal debe usar radios menores o mayores a `rounded-[32px]`. El sistema de herencia del `ui/Modal.jsx` ya garantiza esta medida.
