import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import { useSellerPayments } from "../../context/SellerPaymentContext";
import { useSellers } from "../../context/SellerContext";
import { useEditions } from "../../context/EditionContext";

import { customSelectStyles } from "../../styles/reactSelectStyles";
import dayjs from "dayjs";
import CurrencyInput from "../../components/CurrencyInput";

function SellerPaymentFormPage() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  const { fields: checkFields, append: appendCheck, remove: removeCheck } = useFieldArray({
  control,
  name: "checks" // ← clave
});

  const watchedCash = useWatch({ control, name: "cashAmount" });
  const watchedTransfer = useWatch({ control, name: "transferAmount" });
  const watchedTarjetaUnica = useWatch({ control, name: "tarjetaUnicaAmount" });

  //const watchedCheck = useWatch({ control, name: "checkAmount" });
  const watchedChecks = useWatch({ control, name: "checks" });

  const watchedSeller = useWatch({ control, name: "sellerId" });

  const checkTotal = watchedChecks?.reduce((sum, cheque) => {
    return sum + (parseFloat(cheque.amount) || 0);
  }, 0) || 0;

  const subtotal = 
    (parseFloat(watchedCash) || 0) +
    (parseFloat(watchedTransfer) || 0) +
    (parseFloat(watchedTarjetaUnica) || 0) +
    checkTotal;

  const { createSellerPayment, getSellerPayments } = useSellerPayments();
  const { sellers, getSellers } = useSellers();
  const { editions = [], getEditions } = useEditions();
  const navigate = useNavigate();

  const selectedSeller = useMemo(() => {
    return sellers.find((s) => s._id === watchedSeller?.value);
  }, [sellers, watchedSeller]);

  const commissionPercent = selectedSeller?.commissionRate || 0;
  const commissionAmount = (subtotal * commissionPercent) / 100;
  const finalTotal = subtotal - commissionAmount;

  useEffect(() => {
    const loadData = async () => {
      await getSellers();    // Cargar vendedores
      await getEditions();   // Cargar ediciones
  
      // Si hay ediciones, precargar la última
      if (editions.length > 0) {
        const lastEdition = editions[editions.length - 1]; // Última edición
        setValue("editionId", { // Pre-cargar el valor
          value: lastEdition._id,
          label: lastEdition.name,
        });
      }
    };
  
    loadData();
  }, [setValue]);

  const onSubmit = async (data) => {
    // Aseguramos que los montos vacíos o nulos se seteen como 0
    const cashAmount = parseFloat(data.cashAmount) || 0;
    const transferAmount = parseFloat(data.transferAmount) || 0;
    const tarjetaUnicaAmount = parseFloat(data.tarjetaUnicaAmount) || 0;
    
    //const checkAmount = parseFloat(data.checkAmount) || 0;
    const checkAmount = (data.checks || []).reduce((sum, cheque) => {
      return sum + (parseFloat(cheque.amount) || 0);
    }, 0);

    // Calculamos el total y verificamos que sea mayor a 0
    const total = cashAmount + transferAmount + tarjetaUnicaAmount + checkAmount;
    const commissionAmount = (subtotal * commissionPercent) / 100;

    if (total === 0) {
      alert("Debe ingresar al menos un monto mayor a cero.");
      return;
    }

    const commissionType = data.commissionPaymentMethod || "Efectivo";

    try {
      const paymentData = {
        edition: data.editionId.value,
        seller: data.sellerId.value,
        cashAmount: cashAmount,
        transferAmount: transferAmount,
        tarjetaUnicaAmount: tarjetaUnicaAmount,
        checkAmount: checkAmount,
        checks: data.checks?.map((cheque) => ({
          checkNumber: cheque.checkNumber,
          bank: cheque.bank,
          branch: cheque.branch,
          date: cheque.date,
          amount: parseFloat(cheque.amount) || 0,
        })) || [],
        commissionRate: commissionPercent,
        commissionAmount: commissionAmount,
        commissionType: commissionType,
        date: data.date,
        observations: data.observations || "",
      };


      await createSellerPayment(paymentData);
      navigate("/sellerPayments");
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      alert(error.response?.data?.message || "Hubo un error al registrar el pago.");
    }
  };

  const sellerOptions = sellers.map((s) => ({
    value: s._id,
    label: `${s.person.lastName}, ${s.person.firstName}`,
  }));

  return (
    <div className="page-wide">
      <div className="form-card">
        <h2 className="title">Registrar Pago de Vendedor</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
          {/* Edición */}
  <div>
    <label className="label">Edición</label>
    <Controller
      name="editionId"
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          styles={customSelectStyles}
          options={editions.map((e) => ({
            value: e._id,
            label: e.name,
          }))}
        />
      )}
    />
  </div>

  {/* Vendedor */}
  <div>
    <label className="label">Vendedor</label>
    <Controller
      name="sellerId"
      control={control}
      rules={{ required: "Debe seleccionar un vendedor" }}
      render={({ field }) => (
        <Select
          {...field}
          options={sellerOptions}
          styles={customSelectStyles}
          placeholder="Seleccionar vendedor..."
          isClearable
        />
      )}
    />
    {errors.sellerId && <p className="form-error">{errors.sellerId.message}</p>}
  </div>

  {/* Efectivo */}
  <div>
    <label className="label">Monto efectivo</label>
    <input
      type="number"
      step="0.01"
      className="form-input"
      placeholder="Ej: 1000.00"
      {...register("cashAmount")}
    />
    {errors.cashAmount && <p className="form-error">{errors.cashAmount.message}</p>}
  </div>

  {/* Transferencia */}
  <div>
    <label className="label">Monto transferencia</label>
    <input
      type="number"
      step="0.01"
      className="form-input"
      placeholder="Ej: 500.00"
      {...register("transferAmount")}
    />
    {errors.transferAmount && <p className="form-error">{errors.transferAmount.message}</p>}
  </div>

  {/* Tarjeta Única */}
  <div>
    <label className="label">Monto tarjeta única</label>
    <input
      type="number"
      step="0.01"
      className="form-input"
      placeholder="Ej: 500.00"
      {...register("tarjetaUnicaAmount")}
    />
    {errors.tarjetaUnicaAmount && <p className="form-error">{errors.tarjetaUnicaAmount.message}</p>}
  </div>

  {/* Fecha */}
  <div>
    <label className="label">Fecha</label>
    <input
      type="date"
      {...register("saleDate", { required: true })}
      className="form-input"
      defaultValue={dayjs().format("YYYY-MM-DD")}
    />
  </div>

  {/* Observaciones */}
  <div className="md:col-span-2">
    <label className="label">Notas</label>
    <textarea
      rows="3"
      className="form-input"
      placeholder="Notas (opcional)"
      {...register("observations")}
    ></textarea>
  </div>

  {/* Totales */}
  <div>
    <label className="label">Subtotal</label>
    <input
      type="text"
      className="form-input bg-gray-100 text-gray-600"
      value={subtotal.toFixed(2)}
      readOnly
    />
  </div>

  {selectedSeller && (
    <>
      <div>
        <label className="label">Porcentaje Comisión</label>
        <input
          type="text"
          className="form-input bg-gray-100 text-gray-600"
          value={`${commissionPercent}%`}
          readOnly
        />
      </div>

      <div>
        <label className="label">Monto Comisión</label>
        <input
          type="text"
          className="form-input bg-gray-100 text-red-600"
          value={`-${commissionAmount.toFixed(2)}`}
          readOnly
        />
      </div>

      <div>
        <label className="label font-semibold">Total Final</label>
        <input
          type="text"
          className="form-input bg-gray-100 text-green-600 font-semibold"
          value={finalTotal.toFixed(2)}
          readOnly
        />
      </div>

      {/* 👇 Nuevo campo visible solo si hay comisión */}
      {commissionPercent > 0 && (
        <div>
          <label className="label">Comisión pagada en</label>
          <div className="flex gap-4">
            <label className="inline-flex items-center font-bold">
              <input
                type="radio"
                value="Efectivo"
                {...register("commissionPaymentMethod")}
                className="mr-2"
              />
              Efectivo
            </label>
            <label className="inline-flex items-center font-bold">
              <input
                type="radio"
                value="Transferencia"
                {...register("commissionPaymentMethod")}
                className="mr-2"
              />
              Transferencia
            </label>
          </div>
        </div>
      )}
    </>
  )}

  {/* Cheques (mantengo como estaba, puede que necesite rediseño aparte) */}
  <div className="md:col-span-2">
    <label className="label">Cheques</label>
    {checkFields.map((item, index) => (
      <div key={item.id} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end mb-2">
        <input type="text" placeholder="N°" {...register(`checks.${index}.checkNumber`)} className="form-input" />
        <input type="text" placeholder="Banco" {...register(`checks.${index}.bank`)} className="form-input" />
        <input type="text" placeholder="Plaza" {...register(`checks.${index}.branch`)} className="form-input" />
        <input type="date" {...register(`checks.${index}.date`)} className="form-input" />
        <input type="number" step="0.01" placeholder="Monto" {...register(`checks.${index}.amount`)} className="form-input" />
        <button type="button" onClick={() => removeCheck(index)} className="btn-anular mb-4">Eliminar</button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => appendCheck({ checkNumber: "", bank: "", branch: "", date: "", amount: "" })}
      className="btn-secondary mt-2"
    >
      + Agregar cheque
    </button>
  </div>

  {/* Submit */}
  <div className="md:col-span-2 text-right">
    <button type="submit" className="btn-primary mt-4">Registrar Pago</button>
  </div>
</form>
      </div>
    </div>
  );
}

export default SellerPaymentFormPage;
