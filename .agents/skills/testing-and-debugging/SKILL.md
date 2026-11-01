---
name: testing-and-debugging
description: Diagnóstico sistemático de errores (RCA) y desarrollo de pruebas unitarias/integración (inspirada en debugging-and-error-recovery y test-driven-development de Addy Osmani). Usala cuando aparece un bug, un error de cálculo o de estado, o para proteger reglas de negocio críticas con tests automatizados.
---

# 🐛🧪 Systematic Debugging & Business Logic Testing

Esta skill combina **`debugging-and-error-recovery`** y **`test-driven-development`** de Addy Osmani para resolver fallos sin adivinar y blindar las reglas contables y de negocio de **Gestión Tómbola**.

---

## 🔍 1. Protocolo de Debugging Sistemático (Prohibido Adivinar)

Cuando el usuario reporta un bug o algo falla en consola/pantalla, seguí este orden estricto de 4 pasos:

1. **Reproducir y Observar la Evidencia Exacta:**
   - Leé el mensaje de error completo, el stack trace o el payload de red.
   - Trazá el flujo extremo a extremo: Componente React → Context/API (`client/src/api/`) → Ruta Express (`src/routes/`) → Middleware (`validateSchema` / `checkRole`) → Controlador (`src/controllers/`) → Modelo Mongoose (`src/models/`).
2. **Aislar la Causa Raíz (RCA — *Root Cause Analysis*):**
   - Identificá **dónde se origina** el dato incorrecto, no solo dónde explota en la UI.
   - *Ejemplos reales en este proyecto:*
     - ¿El backend devolvió el modelo `Edition` en vez de la instancia `edition`?
     - ¿El token JWT se firmó en `register` sin incluir la propiedad `roles`?
     - ¿Un `onClick={fn}` en React está pasando el `SyntheticEvent` como primer argumento a una función que esperaba un objeto o ID?
     - ¿Una actualización de cuota no disparó el recálculo del estado de `Sale`?
3. **Fix Quirúrgico (Mínimo Blast Radius):**
   - Corregí la causa raíz sin introducir parches sucios (*band-aids*) en la capa equivocada y sin refactorizar código no relacionado en el mismo paso.
4. **Buscar Hermanos del Bug (*Sibling Bug Check*):**
   - Si encontraste un patrón roto en un controlador o página (ej. un `window.confirm` o un error de firma de token), verificá rápidamente si el mismo error se copió en otro controlador vecino y avisale al usuario.

---

## 🧪 2. Estrategia Pragmática de Testing

No escribimos tests vacíos ni burocráticos. En **Gestión Tómbola**, los tests automatizados se concentran donde un error cuesta dinero o credibilidad en vivo:

### Prioridad 1: Reglas Financieras y Contables (Unit / Integration Backend)
- Cálculo de comisiones y subtotal en `SellerPayment` (`RN-REN-01`).
- Generación y sincronización en cascada de asientos de `Ingreso` y `Egreso` en `Balance` (`RN-REN-02`, `RN-REN-03`).
- Ventana de idempotencia de 10 segundos anti-doble envío (`RN-REN-04`).
- Cálculo del impuesto de Lotería (`6.5420%` con tolerancia $\pm \$0,02$).

### Prioridad 2: Ciclo de Vida de Ventas, Cuotas y Sorteos
- Transición automática de `Sale.status` entre `'Pendiente de pago'` y `'Pagado'` al pagar o revertir cuotas (`RN-VEN-02`).
- Liberación del `BingoCard` a `'Disponible'` al anular una venta (`RN-VEN-03`).
- Determinación de ganador válido en modalidad `'cuota'` vs `'contado'` (`RN-SOR-03`).
- Generador combinatorio **Bingo V10** (unicidad de combinaciones y cantidad exacta de números por cartón).

### Prioridad 3: Permisos y Seguridad por Rol (RBAC)
- Verificar que un token con rol `'Vendedor'` reciba `403 Forbidden` en rutas exclusivas de `'Administrador'`, y solo pueda leer/operar recursos vinculados a su propio `Seller`.
- Verificar que el rol `'Directiva'` no pueda ejecutar mutaciones (`POST`, `PUT`, `DELETE`).
