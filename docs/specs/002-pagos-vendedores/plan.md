# Plan Técnico — Optimización y Corrección del Módulo de Pagos de Vendedores

**Estado:** Planeado  
**Especificación:** [spec.md](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/docs/specs/002-pagos-vendedores/spec.md)

---

## Archivos a Modificar

### 1. Backend (server)

#### [MODIFY] [sellerPayment.controllers.js](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/src/controllers/sellerPayment.controllers.js)
*   **Bloqueo de Idempotencia (Anti-Duplicidad):**
    *   Al inicio de `createSellerPayment` (después de parsear y sumar los montos), agregar una consulta de búsqueda para detectar si el mismo vendedor registró un pago idéntico en los últimos 10 segundos:
        ```javascript
        const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
        const duplicate = await SellerPayment.findOne({
          seller,
          edition,
          cashAmount: Number(cashAmount),
          transferAmount: Number(transferAmount),
          tarjetaUnicaAmount: Number(tarjetaUnicaAmount),
          checkAmount: Number(checkAmount),
          createdAt: { $gte: tenSecondsAgo }
        });

        if (duplicate) {
          return res.status(409).json({ 
            message: "Ya se registró un pago idéntico para este vendedor en los últimos 10 segundos." 
          });
        }
        ```

*   **Sincronización de Balance en Modificación:**
    *   En `updateSellerPayment`, si se recibe una actualización para `commissionType` y el pago tiene comisión (`commissionAmount > 0`), se debe buscar el movimiento del Balance correspondiente a la comisión de este pago (`sellerPaymentRef: id, type: 'Egreso', category: 'Comisión de Vendedor'`) y re-distribuir el importe entre efectivo y transferencia bancaria de forma sincrónica para que los saldos cuadren.

---

### 2. Frontend (client)

#### [MODIFY] [SellerPaymentFormPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentFormPage.jsx)
*   **Doble Envío:**
    *   Extraer `isSubmitting` del hook `useForm` de React Hook Form:
        ```javascript
        const { register, handleSubmit, control, setValue, watch, getValues, formState: { errors, isSubmitting } } = useForm();
        ```
    *   Vincular `isSubmitting` al botón de submit para inhabilitarlo y cambiar su texto:
        ```javascript
        <button 
          type="submit" 
          className="btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Registrar Pago"}
        </button>
        ```
*   **Auto-focus:**
    *   Agregar la propiedad `autoFocus` al componente `ReactSelect` del Vendedor (`sellerId`) para posicionar el cursor al cargar la pantalla.

#### [MODIFY] [SellerPaymentPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentPage.jsx)
*   **Estados de Paginación:**
    *   Declarar `currentPage` (inicia en 1) e `itemsPerPage` (inicia en 25):
        ```javascript
        const [currentPage, setCurrentPage] = useState(1);
        const [itemsPerPage, setItemsPerPage] = useState(25);
        ```
*   **Lógica de Segmentación:**
    *   Calcular total de páginas y segmentar mediante un selector `useMemo`:
        ```javascript
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const paginatedPayments = useMemo(() => {
          const start = (currentPage - 1) * itemsPerPage;
          return filtered.slice(start, start + itemsPerPage);
        }, [filtered, currentPage, itemsPerPage]);
        ```
    *   Reemplazar render de `filtered.map` por `paginatedPayments.map` en el cuerpo de la tabla.
*   **Restablecer Página:**
    *   Monitorear filtros y edición para restablecer la página a 1:
        ```javascript
        useEffect(() => {
          setCurrentPage(1);
        }, [filters, selectedEdition]);
        ```
*   **UI de Paginación:**
    *   Maquetar el footer de navegación al final de la tarjeta de pagos usando la misma estructura premium de `QuotasPage.jsx`.

#### [MODIFY] [SellerPaymentFormPage.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentFormPage.jsx) (Estetización)
1.  **Cabecera Premium:**
    *   Importar y usar `<PageHeader />` y configurar los botones del formulario ("Volver", "Registrar Pago") dentro de las acciones de la cabecera.
2.  **Estructura en Tarjetas:**
    *   Encerrar el formulario en componentes `<Card />` de tipo slim.
3.  **Campos Estandarizados:**
    *   Reemplazar todos los `<input className="form-input" ... />` por el componente `<InputField />`, vinculando adecuadamente el registro y los mensajes de error.
    *   Utilizar `<FormGrid />` o grillas de CSS consistentes para organizar los campos.

#### [MODIFY] [SellerPaymentView.jsx](file:///d:/proyectos%20web%2030-07-2026/sobre%20la%20carpeta%20descargas/gestion_tombola/client/src/pages/sellerPayment/SellerPaymentView.jsx) (Estetización)
1.  **Cabecera y Volver:**
    *   Importar y usar `<PageHeader />` con botón de "Volver" estandarizado.
2.  **Organización en Cards:**
    *   *Datos de Auditoría / Identificación:* Cabecera en Card con Edición, Vendedor, N° Pago, Fecha y Badge de estado (Activo en verde, Anulado en rojo).
    *   *Resumen Financiero:* Mostrar Efectivo, Transferencia, Tarjeta Única y Cheques en tarjetas KPI compactas o en una sección visualmente limpia de Card.
    *   *Cheques:* Renderizar la grilla de cheques usando el componente `<Table />`, `<THead />`, `<TBody />`, `<TR />`, `<TD />` del estándar UI del proyecto.
    *   *Comisión:* Caja de comisión con Badge indicando el tipo de cobro (Efectivo/Transferencia).
    *   *Observaciones:* Caja de notas estilizada.

