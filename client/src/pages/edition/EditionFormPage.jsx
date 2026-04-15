import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditions } from "../../context/EditionContext";
import {
  Save,
  Calendar,
  CreditCard,
  Hash,
  Info,
  Loader2,
  Trash2,
  PlusCircle
} from "lucide-react";

// Infraestructura Premium 2026
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import PageHeader from "../../components/ui/PageHeader";
import Badge from "../../components/ui/Badge";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormGrid from "../../components/ui/FormGrid";
import EmptyState from "../../components/ui/EmptyState";
import Select from "../../components/ui/Select";
import { useFeedback } from "../../context/FeedbackContext";
import { formatCurrency, formatNumber, stripNonDigits, cleanCurrencyInput, formatCurrencyInput } from "../../libs/formatters";

/**
 * EditionFormPage V5.0 - Slim & Atomic 2026
 * Estandarización de componentes y optimización de espacios.
 */
export default function EditionFormPage() {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      installments: [],
      totalBalls: 70,
      clusterSize: 5,
      clustersPerCard: 4,
      cardSets: 5
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "installments",
  });

  const { createEdition, getEdition, updateEdition } = useEditions();
  const { showToast } = useFeedback();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Observamos el plan de cuotas para la lógica de auto-generación
  const maxQuotas = useWatch({ control, name: "maxQuotas" });

  useEffect(() => {
    async function loadEdition() {
      if (params.id) {
        setLoading(true);
        try {
          const edition = await getEdition(params.id);
          if (edition) {
            setValue("name", edition.name || "");
            setValue("quantityCartons", edition.quantityCartons || 0);
            setValue("cost", edition.cost || 0);
            setValue("maxQuotas", edition.maxQuotas || 0);

            // Cargar parámetros técnicos si existen
            if (edition.totalBalls) setValue("totalBalls", edition.totalBalls);
            if (edition.clusterSize) setValue("clusterSize", edition.clusterSize);
            if (edition.clustersPerCard) setValue("clustersPerCard", edition.clustersPerCard);
            if (edition.cardSets) setValue("cardSets", edition.cardSets);

            // Formateo robusto de fechas (evitando desfases de zona horaria)
            const formattedInstallments = (edition.installments || []).map(inst => {
              let dateStr = "";
              if (inst.dueDate) {
                const dateObj = new Date(inst.dueDate);
                if (!isNaN(dateObj.getTime())) {
                  dateStr = dateObj.toISOString().split('T')[0];
                }
              }
              return { ...inst, dueDate: dateStr };
            });
            setValue("installments", formattedInstallments);
          }
        } catch (error) {
          console.error(error);
          showToast("Error al cargar la edición", "error");
        } finally {
          setLoading(false);
        }
      }
    }
    loadEdition();
  }, [params.id, getEdition, setValue, showToast]);

  // Lógica de Sincronización Automática de Cuotas
  useEffect(() => {
    const targetCount = parseInt(maxQuotas, 10);
    if (!isNaN(targetCount) && targetCount >= 0) {
      const currentCount = fields.length;

      if (targetCount > currentCount) {
        // Agregar las que falten
        const toAdd = targetCount - currentCount;
        for (let i = 0; i < toAdd; i++) {
          append({ quotaNumber: currentCount + i + 1, dueDate: "", amount: "" });
        }
      } else if (targetCount < currentCount && targetCount >= 0) {
        // Quitar las que sobren del final
        const toRemove = currentCount - targetCount;
        for (let i = 0; i < toRemove; i++) {
          remove(currentCount - 1 - i);
        }
      }
    }
  }, [maxQuotas, fields.length, append, remove]);

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    try {
      // 1. Validación de suma de montos vs costo total
      const totalAmount = data.installments.reduce((sum, inst) => sum + (parseFloat(inst.amount) || 0), 0);
      const expectedCost = parseFloat(data.cost);

      if (Math.abs(totalAmount - expectedCost) > 0.01) {
        showToast(`La suma de las cuotas (${formatCurrency(totalAmount)}) no coincide con el costo (${formatCurrency(expectedCost)})`, "error");
        setSaving(false);
        return;
      }

      // 2. Persistencia
      if (params.id) {
        await updateEdition(params.id, data);
        showToast("Edición actualizada con éxito", "success");
      } else {
        await createEdition(data);
        showToast("Edición creada correctamente", "success");
      }
      navigate("/editions");
    } catch (error) {
      showToast("Error al procesar la solicitud", "error");
    } finally {
      setSaving(false);
    }
  });

  // Observamos los valores para el resumen financiero dinámico
  const watchedInstallments = useWatch({ control, name: "installments" }) || [];
  const watchedCost = useWatch({ control, name: "cost" }) || 0;

  // Parámetros del Generador V10
  const watchedTotalBalls = Number(useWatch({ control, name: "totalBalls" })) || 70;
  const watchedClusterSize = Number(useWatch({ control, name: "clusterSize" })) || 0;
  const watchedClustersPerCard = Number(useWatch({ control, name: "clustersPerCard" })) || 0;
  const watchedCardSets = Number(useWatch({ control, name: "cardSets" })) || 5;

  // Cálculo de opciones válidas para minimizar error humano
  const clusterSizeOptions = (() => {
    const divs = [];
    // Buscamos divisores lógicos (ej. entre 2 y 20)
    for (let i = 2; i <= watchedTotalBalls; i++) {
      if (watchedTotalBalls % i === 0 && i <= 30) divs.push({ value: i, label: `${i} Bolillas` });
    }
    return divs;
  })();

  const numClusters = watchedClusterSize > 0 ? Math.floor(watchedTotalBalls / watchedClusterSize) : 0;

  const clustersPerCardOptions = (() => {
    const options = [];
    if (numClusters > 0) {
      for (let i = 1; i <= Math.min(numClusters, 15); i++) {
        options.push({ value: i, label: `${i} Clústeres` });
      }
    }
    return options;
  })();

  // Si cambia el total de bolillas, reseteamos clústeres para evitar inconsistencias
  // Solo disparamos el reset si ya hubo un valor previo para evitar limpiar los defaults al montar
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      return;
    }
    // Solo reseteamos si no estamos en modo edición (donde los valores vienen de la DB)
    if (!params.id) {
      setValue("clusterSize", "");
      setValue("clustersPerCard", "");
    }
  }, [watchedTotalBalls, setValue, params.id]); // Eliminado hasMounted de deps para que solo dependa del cambio de bolillas

  // Lógica de cálculo de cartones

  const combinations = (n, k) => {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = res * (n - i + 1) / i;
    }
    return Math.round(res);
  };

  const calculatedQuantity = combinations(numClusters, watchedClustersPerCard);

  // Sincronizamos quantityCartons con el cálculo
  useEffect(() => {
    setValue("quantityCartons", calculatedQuantity);
  }, [calculatedQuantity, setValue]);

  const currentTotal = watchedInstallments.reduce((sum, inst) => sum + (parseFloat(inst?.amount) || 0), 0);
  const isConsistent = Math.abs(currentTotal - (parseFloat(watchedCost) || 0)) < 0.01;

  if (loading) {
    return <LoadingOverlay message="Sincronizando Ciclo..." fullScreen />;
  }

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700">

      <PageHeader
        title={params.id ? "Editar Edición" : "Registrar Edición"}
        //subtitle="Configure los parámetros de tiempo, stock y valores oficiales para el nuevo sorteo."
        compact={true}
        breadcrumbs={[
          { label: "Ediciones", href: "/editions" },
          { label: params.id ? "Editar" : "Registrar", href: "#" }
        ]}
        actions={[
          {
            label: "Volver",
            variant: "ghost",
            onClick: () => navigate("/editions")
          },
          {
            label: params.id ? "Guardar cambios" : "Guardar Edición",
            icon: Save,
            loading: saving,
            onClick: onSubmit
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-20">

        {/* EXPANSIÓN VISUAL: ELITE V10 LAB */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* COLUMNA 1: CONFIGURACIÓN TÉCNICA (60%) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card
              size="slim"
              title="Configuración Técnica (Generador V10)"
              icon={Hash}
              description="Ajustes de la matriz determinista de cartones"
            >
              <div className="flex flex-col gap-8">
                {/* CONTROL DE BOLILLAS CON SLIDER PREMIUM */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2">
                      Total Bolillas en Sorteo
                      <HelpTooltip text="Define el rango numérico total de la edición. El algoritmo V10 dividirá este total en grupos (clústeres)." />
                    </label>
                    <span className="text-xl font-black text-primary font-manrope">{watchedTotalBalls}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="90"
                    step="1"
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    {...register("totalBalls", { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>15</span>
                    <span>45</span>
                    <span>70</span>
                    <span>90</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <Controller
                    name="clusterSize"
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <Select
                        label={
                          <span className="flex items-center gap-2">
                            Tamaño Clúster
                            <HelpTooltip text="Cantidad de bolillas por cada grupo (clúster). Debe ser divisor del total de bolillas." />
                          </span>
                        }
                        placeholder="Elegir..."
                        options={clusterSizeOptions}
                        {...field}
                        value={clusterSizeOptions.find(o => o.value === Number(field.value))}
                        onChange={(val) => field.onChange(val?.value)}
                        error={errors.clusterSize?.message}
                      />
                    )}
                  />

                  <Controller
                    name="clustersPerCard"
                    control={control}
                    rules={{ required: "Requerido" }}
                    render={({ field }) => (
                      <Select
                        label={
                          <span className="flex items-center gap-2">
                            Clústeres por Cartón
                            <HelpTooltip text="Cuántos grupos (clústeres) componen un solo cartón. A mayor cantidad, el cartón tendrá más números." />
                          </span>
                        }
                        placeholder="Elegir..."
                        options={clustersPerCardOptions}
                        {...field}
                        value={clustersPerCardOptions.find(o => o.value === Number(field.value))}
                        onChange={(val) => field.onChange(val?.value)}
                        error={errors.clustersPerCard?.message}
                      />
                    )}
                  />

                  <div className="flex flex-col">
                    <InputField
                      label={
                        <span className="flex items-center gap-2">
                          Cant. Sets (Juegos)
                          <HelpTooltip text="Cantidad de juegos independientes por cartón físico (típicamente de 1 a 5)." />
                        </span>
                      }
                      type="number"
                      min={1}
                      max={10}
                      {...register("cardSets", { required: true, min: 1, valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              {calculatedQuantity > 50000 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-pulse">
                  <Info size={16} />
                  <span className="text-xs font-bold">Límite excedido: Máximo 50.000 cartones permitidos.</span>
                </div>
              )}
            </Card>

            {/* SECCIÓN 1: IDENTIDAD Y COSTOS (RELOCALIZADA) */}
            <Card
              size="slim"
              title="Identidad y Costos"
              icon={Calendar}
            >
              <FormGrid>
                <InputField
                  label="Nombre de Edición"
                  placeholder="ej. Tómbola 2026"
                  {...register("name", { required: "Campo obligatorio" })}
                  error={errors.name?.message}
                />
                <Controller
                  name="cost"
                  control={control}
                  rules={{ required: "El costo es obligatorio" }}
                  render={({ field }) => (
                    <InputField
                      label="Costo Total"
                      icon={CreditCard}
                      prefix="$"
                      placeholder="0.00"
                      {...field}
                      value={field.value ? formatCurrencyInput(field.value) : ""}
                      onChange={(e) => {
                        const clean = cleanCurrencyInput(e.target.value);
                        field.onChange(clean);
                      }}
                      error={errors.cost?.message}
                    />
                  )}
                />
                <InputField
                  label="Plan de Cuotas"
                  type="number"
                  placeholder="Ej: 10"
                  {...register("maxQuotas", {
                    required: "Define el plan de pagos",
                    min: { value: 1, message: "Mínimo 1 cuota" }
                  })}
                  error={errors.maxQuotas?.message}
                />
              </FormGrid>
            </Card>
          </div>

          {/* COLUMNA 2: THE LAB (PREVISUALIZACIÓN REACTIVA) (40%) */}
          <div className="lg:col-span-5 sticky top-8">
            <V10LabPreview
              totalBalls={watchedTotalBalls}
              clusterSize={watchedClusterSize}
              clustersPerCard={watchedClustersPerCard}
              cardSets={watchedCardSets}
              combinations={calculatedQuantity}
            />
          </div>

        </div>


        {/* SECCIÓN 2: PLAN DE PAGOS DETALLADO */}
        <Card
          size="slim"
          title="Plan de Pagos"
          icon={CreditCard}
          description="Estructura automática de cuotas y vencimientos"
        >
          <div className="space-y-3">
            {fields.length === 0 ? (
              <EmptyState
                title="Define un plan de cuotas arriba"
                message="Indica la cantidad de cuotas en el campo 'Plan de Cuotas' para generar el cronograma automáticamente."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl animate-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-primary border border-slate-100">
                        #{index + 1}
                      </div>
                      <span className="text-xs font-black text-primary uppercase tracking-wider">Cuota</span>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <InputField
                        label="Vencimiento"
                        type="date"
                        {...register(`installments.${index}.dueDate`, { required: "Fecha requerida" })}
                        error={errors.installments?.[index]?.dueDate?.message}
                      />
                    </div>

                    <div className="flex-1 min-w-[180px]">
                      <Controller
                        name={`installments.${index}.amount`}
                        control={control}
                        rules={{ required: "Monto requerido" }}
                        render={({ field }) => (
                          <InputField
                            label="Monto de Cuota"
                            prefix="$"
                            placeholder="0.00"
                            {...field}
                            value={field.value ? formatCurrencyInput(field.value) : ""}
                            onChange={(e) => {
                              const clean = cleanCurrencyInput(e.target.value);
                              field.onChange(clean);
                            }}
                            error={errors.installments?.[index]?.amount?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4 items-center">
              <Info size={16} className="text-primary shrink-0" />
              <p className="text-[10px] font-medium text-slate-600 leading-tight">
                <span className="font-black text-primary mr-2 uppercase tracking-tighter">Auto-Sincronización:</span>
                Al cambiar el plan de cuotas arriba, el sistema ajustará automáticamente las fechas y montos.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col gap-2 transition-all duration-500 ${isConsistent
              ? "bg-emerald-50/50 border-emerald-100"
              : "bg-red-50/50 border-red-100"
              }`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Resumen Financiero</span>
                <Badge variant={isConsistent ? "success" : "danger"}>
                  {isConsistent ? "Consistente" : "Desviación"}
                </Badge>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[18px] font-black text-primary font-manrope">
                  {formatCurrency(currentTotal)}
                </span>
                <span className="text-[11px] font-bold text-slate-400 italic font-manrope">
                  de {formatCurrency(watchedCost)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

// --- COMPONENTES AUXILIARES DEL LAB V10 ---

function HelpTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center">
      <div
        className="p-1 -m-1 cursor-help group transition-all"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <Info
          size={14}
          className="text-slate-300 group-hover:text-primary transition-colors"
        />
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white shadow-2xl rounded-xl z-[100] animate-in fade-in zoom-in duration-200 pointer-events-none">
          <p className="text-[10px] font-bold leading-normal">{text}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

function V10LabPreview({ totalBalls, clusterSize, clustersPerCard, cardSets, combinations }) {
  const totalNumbersPerSet = clusterSize * clustersPerCard;
  const isHealthy = combinations > 0 && combinations <= 50000;

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-right-8 duration-700">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h4 className="text-[10px] font-black uppercase text-primary tracking-widest">DNA del Cartón V10</h4>
          <p className="text-xs font-bold text-slate-500">Visualización de Estructura Determinista</p>
        </div>
        <Badge variant={isHealthy ? "success" : "danger"}>Lab Active</Badge>
      </div>

      {/* REPRESENTACIÓN VISUAL DEL CARTÓN */}
      <div className="bg-slate-900/90 rounded-2xl p-4 shadow-inner relative overflow-hidden group">
        <div className="grid grid-cols-10 gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {Array.from({ length: totalBalls }).map((_, i) => {
            const num = i + 1;
            // Lógica de color por clúster (simplificada para preview)
            const cIdx = Math.floor(i / (clusterSize || 1));
            const isActive = i < (clusterSize * clustersPerCard);

            return (
              <div
                key={i}
                className={`
                  aspect-square rounded-[3px] flex items-center justify-center text-[7px] font-black transition-all duration-300
                  ${isActive
                    ? `bg-primary/80 text-white scale-100`
                    : "bg-slate-800 text-slate-700 scale-90"
                  }
                `}
                style={{
                  backgroundColor: isActive ? `hsl(${(cIdx * 60) % 360}, 70%, 50%)` : ''
                }}
              >
                {isActive ? num : ''}
              </div>
            );
          })}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />

        {/* INFO OVERLAY */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Bolillas Cargadas</span>
            <span className="text-lg font-black text-white leading-none">{totalNumbersPerSet || 0}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Balance Técnico</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: clustersPerCard }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* MÉTRICAS FINALES */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="p-3 bg-white border border-slate-100 rounded-2xl flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase">Capacidad Máxima</span>
          <span className="text-sm font-black text-slate-800">{formatNumber(combinations)} <span className="text-[10px] text-slate-400">cartones</span></span>
        </div>
        <div className="p-3 bg-white border border-slate-100 rounded-2xl flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-400 uppercase">Prob. Balance</span>
          <span className="text-sm font-black text-emerald-600">DETERMINÍSTICO <span className="text-[10px] text-emerald-400">100%</span></span>
        </div>
      </div>

      <p className="text-[10px] font-medium text-slate-500 italic text-center px-4">
        "El motor V10 garantiza que cada combinación de clústeres sea única en todo el talonario."
      </p>
    </div>
  );
}

