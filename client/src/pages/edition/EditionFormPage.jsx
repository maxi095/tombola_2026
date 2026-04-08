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
import { useFeedback } from "../../context/FeedbackContext";
import { formatCurrency, formatNumber, stripNonDigits, cleanCurrencyInput, formatCurrencyInput } from "../../libs/formatters";

/**
 * EditionFormPage V5.0 - Slim & Atomic 2026
 * Estandarización de componentes y optimización de espacios.
 */
export default function EditionFormPage() {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      installments: []
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

        {/* SECCIÓN 1: IDENTIDAD Y COSTOS */}
        <Card
          size="slim"
          title="Configuración del Ciclo"
          icon={Calendar}
          description="Definición de valores principales"
        >
          <FormGrid>
            <InputField
              label="Nombre de Edición"
              placeholder="ej. Tómbola 2026"
              {...register("name", { required: "Campo obligatorio" })}
              error={errors.name?.message}
            />
            <InputField
              label="Cantidad Cartones"
              type="number"
              icon={Hash}
              {...register("quantityCartons", { required: "Ingresa la cantidad" })}
              error={errors.quantityCartons?.message}
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
