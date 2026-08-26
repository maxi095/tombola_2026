import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";

import { useSellerPayments } from "../../context/SellerPaymentContext";
import { useSellers } from "../../context/SellerContext";
import { useEditions } from "../../context/EditionContext";
import { useFeedback } from "../../context/FeedbackContext";

import { customSelectStyles } from "../../styles/reactSelectStyles";
import dayjs from "dayjs";

// Infraestructura Premium 2026 🔱
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import FormGrid from "../../components/ui/FormGrid";
import {
  Wallet,
  CreditCard,
  X,
  Save,
  Calendar,
  Clipboard,
  Trash2,
  Plus
} from "lucide-react";

function SellerPaymentFormPage() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      cashAmount: "",
      transferAmount: "",
      tarjetaUnicaAmount: "",
      checks: [],
      observations: "",
      commissionPaymentMethod: "Efectivo"
    }
  });

  const { fields: checkFields, append: appendCheck, remove: removeCheck } = useFieldArray({
    control,
    name: "checks"
  });

  const watchedCash = useWatch({ control, name: "cashAmount" });
  const watchedTransfer = useWatch({ control, name: "transferAmount" });
  const watchedTarjetaUnica = useWatch({ control, name: "tarjetaUnicaAmount" });
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
  const { showToast } = useFeedback();
  const navigate = useNavigate();

  const selectedSeller = useMemo(() => {
    return sellers.find((s) => s._id === watchedSeller?.value);
  }, [sellers, watchedSeller]);

  const commissionPercent = selectedSeller?.commissionRate || 0;
  const commissionAmount = (subtotal * commissionPercent) / 100;
  const finalTotal = subtotal - commissionAmount;

  useEffect(() => {
    const loadData = async () => {
      await getSellers();
      await getEditions();
    };
    loadData();
  }, [getSellers, getEditions]);

  // Pre-cargar la última edición al cargar las ediciones
  useEffect(() => {
    if (editions.length > 0) {
      const lastEdition = editions[editions.length - 1];
      setValue("editionId", {
        value: lastEdition._id,
        label: lastEdition.name,
      });
    }
  }, [editions, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const cashAmount = parseFloat(data.cashAmount) || 0;
    const transferAmount = parseFloat(data.transferAmount) || 0;
    const tarjetaUnicaAmount = parseFloat(data.tarjetaUnicaAmount) || 0;
    
    const checkAmount = (data.checks || []).reduce((sum, cheque) => {
      return sum + (parseFloat(cheque.amount) || 0);
    }, 0);

    const total = cashAmount + transferAmount + tarjetaUnicaAmount + checkAmount;
    const currentCommission = (total * commissionPercent) / 100;

    if (total === 0) {
      showToast("Debe ingresar al menos un monto mayor a cero.", "warning");
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
        commissionAmount: currentCommission,
        commissionType: commissionType,
        date: data.saleDate || dayjs().format("YYYY-MM-DD"),
        observations: data.observations || "",
      };

      await createSellerPayment(paymentData);
      showToast("Pago registrado exitosamente", "success");
      navigate("/sellerPayments");
    } catch (error) {
      console.error("Error al registrar el pago:", error);
      showToast(error.response?.data?.message || "Hubo un error al registrar el pago.", "error");
    }
  });

  const sellerOptions = sellers.map((s) => ({
    value: s._id,
    label: `${s.person.lastName}, ${s.person.firstName}`,
  }));

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen pb-12">
      <PageHeader
        title="Registrar Pago de Vendedor"
        compact={true}
        breadcrumbs={[
          { label: "Pagos de Vendedores", href: "/sellerPayments" },
          { label: "Registrar" }
        ]}
        actions={[
          {
            label: "Volver",
            icon: X,
            variant: "ghost",
            onClick: () => navigate("/sellerPayments")
          },
          {
            label: isSubmitting ? "Creando..." : "Crear Pago",
            icon: Save,
            onClick: onSubmit,
            disabled: isSubmitting
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-20">
        
        {/* CARD 1: INFORMACIÓN GENERAL */}
        <Card
          size="slim"
          title="Información General"
          icon={Clipboard}
          description="Edición, vendedor y fecha de la rendición"
          className="shadow-premium border-slate-200/60 overflow-visible bg-white"
        >
          <FormGrid>
            {/* Edición */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter">
                Edición
              </label>
              <Controller
                name="editionId"
                control={control}
                rules={{ required: "La edición es obligatoria" }}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    styles={customSelectStyles}
                    options={editions.map((e) => ({
                      value: e._id,
                      label: e.name,
                    }))}
                  />
                )}
              />
              {errors.editionId && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.editionId.message}</p>}
            </div>

            {/* Vendedor */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter">
                Vendedor
              </label>
              <Controller
                name="sellerId"
                control={control}
                rules={{ required: "Debe seleccionar un vendedor" }}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    options={sellerOptions}
                    styles={customSelectStyles}
                    placeholder="Seleccionar..."
                    isClearable
                    autoFocus
                  />
                )}
              />
              {errors.sellerId && <p className="text-[10px] font-bold text-red-500 ml-2">{errors.sellerId.message}</p>}
            </div>

            {/* Fecha */}
            <InputField
              label="Fecha de Rendición"
              type="date"
              error={errors.saleDate?.message}
              {...register("saleDate", { required: "La fecha es obligatoria" })}
              defaultValue={dayjs().format("YYYY-MM-DD")}
            />
          </FormGrid>

          {/* Observaciones */}
          <div className="mt-6 space-y-2.5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter">
              Notas / Observaciones
            </label>
            <textarea
              rows="2"
              className="w-full bg-white border border-slate-200/60 shadow-sm rounded-premium-input px-6 py-4 text-sm font-semibold text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary/20 placeholder:text-slate-300 transition-all outline-none duration-300"
              placeholder="Notas aclaratorias sobre esta entrega de dinero (opcional)..."
              {...register("observations")}
            ></textarea>
          </div>
        </Card>

        {/* CARD 2: DESGLOSE DE FONDOS */}
        <Card
          size="slim"
          title="Detalle de Fondos y Liquidación"
          icon={Wallet}
          description="Montos entregados y retención de comisiones"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          <FormGrid>
            {/* Efectivo */}
            <InputField
              label="Monto Efectivo"
              type="number"
              step="0.01"
              prefix="$"
              placeholder="0.00"
              error={errors.cashAmount?.message}
              {...register("cashAmount")}
            />

            {/* Transferencia */}
            <InputField
              label="Monto Transferencia"
              type="number"
              step="0.01"
              prefix="$"
              placeholder="0.00"
              error={errors.transferAmount?.message}
              {...register("transferAmount")}
            />

            {/* Tarjeta Única */}
            <InputField
              label="Monto Tarjeta Única"
              type="number"
              step="0.01"
              prefix="$"
              placeholder="0.00"
              error={errors.tarjetaUnicaAmount?.message}
              {...register("tarjetaUnicaAmount")}
            />

            {/* Subtotal Calculado */}
            <InputField
              label="Subtotal Rendido"
              type="text"
              prefix="$"
              value={subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              readOnly
              className="opacity-95"
            />
          </FormGrid>

          {selectedSeller && (
            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-6">
              <FormGrid>
                {/* Porcentaje de Comisión */}
                <InputField
                  label="Porcentaje Comisión"
                  type="text"
                  value={`${commissionPercent}%`}
                  readOnly
                  className="opacity-90"
                />

                {/* Monto Comisión */}
                <InputField
                  label="Descuento Comisión"
                  type="text"
                  prefix="-$"
                  value={commissionAmount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  readOnly
                  className="opacity-90 text-red-600"
                />

                {/* Total Neto */}
                <InputField
                  label="Total Neto a Caja"
                  type="text"
                  prefix="$"
                  value={finalTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  readOnly
                  className="text-green-600 font-bold"
                />

                {/* Forma de retiro de comisión */}
                {commissionPercent > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-2 font-inter">
                      Comisión pagada en
                    </label>
                    <div className="flex gap-6 pt-3 pl-2">
                      <label className="inline-flex items-center text-xs font-black text-slate-500 uppercase tracking-wider cursor-pointer">
                        <input
                          type="radio"
                          value="Efectivo"
                          {...register("commissionPaymentMethod")}
                          className="mr-2.5 accent-primary h-4 w-4"
                        />
                        Efectivo
                      </label>
                      <label className="inline-flex items-center text-xs font-black text-slate-500 uppercase tracking-wider cursor-pointer">
                        <input
                          type="radio"
                          value="Transferencia"
                          {...register("commissionPaymentMethod")}
                          className="mr-2.5 accent-primary h-4 w-4"
                        />
                        Transferencia
                      </label>
                    </div>
                  </div>
                )}
              </FormGrid>
            </div>
          )}
        </Card>

        {/* CARD 3: CHEQUES */}
        <Card
          size="slim"
          title="Cheques de Terceros"
          icon={CreditCard}
          description="Registro de cheques entregados (opcional)"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          {checkFields.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              No hay cheques agregados en esta rendición.
            </div>
          ) : (
            <div className="space-y-4">
              {checkFields.map((item, index) => (
                <div key={item.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-end relative">
                  <InputField
                    label="N° Cheque"
                    placeholder="Número..."
                    bsize="compact"
                    className="flex-1 w-full"
                    {...register(`checks.${index}.checkNumber`, { required: "Obligatorio" })}
                  />
                  <InputField
                    label="Banco Emisor"
                    placeholder="Banco..."
                    bsize="compact"
                    className="flex-1 w-full"
                    {...register(`checks.${index}.bank`, { required: "Obligatorio" })}
                  />
                  <InputField
                    label="Plaza / Sucursal"
                    placeholder="Plaza..."
                    bsize="compact"
                    className="flex-1 w-full"
                    {...register(`checks.${index}.branch`, { required: "Obligatorio" })}
                  />
                  <InputField
                    label="Fecha Cobro"
                    type="date"
                    bsize="compact"
                    className="flex-1 w-full"
                    {...register(`checks.${index}.date`, { required: "Obligatorio" })}
                  />
                  <InputField
                    label="Importe"
                    type="number"
                    step="0.01"
                    prefix="$"
                    placeholder="Monto"
                    bsize="compact"
                    className="flex-1 w-full"
                    {...register(`checks.${index}.amount`, { required: "Obligatorio" })}
                  />
                  <button
                    type="button"
                    onClick={() => removeCheck(index)}
                    className="text-red-400 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all mb-0.5 shrink-0 self-center md:self-end"
                    title="Eliminar Cheque"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 text-left">
            <button
              type="button"
              onClick={() => appendCheck({ checkNumber: "", bank: "", branch: "", date: "", amount: "" })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-primary text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              Agregar cheque
            </button>
          </div>
        </Card>

      </form>
    </div>
  );
}

export default SellerPaymentFormPage;
