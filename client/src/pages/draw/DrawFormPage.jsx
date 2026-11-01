import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import ReactSelect from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { useDraws } from "../../context/DrawContext";
import { useEditions } from "../../context/EditionContext";
import { useFeedback } from "../../context/FeedbackContext";
import { customSelectStyles } from "../../styles/reactSelectStyles";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Componentes Estándar 2026 🔱
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import FormGrid from "../../components/ui/FormGrid";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { Trophy, Gift, Save, X, Plus, Trash2, Calendar, Layers } from "lucide-react";

dayjs.extend(utc);

export default function DrawFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm({
    defaultValues: {
      prizes: [{ position: 1, description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "prizes",
  });

  const navigate = useNavigate();
  const params = useParams();
  const { createDraw, updateDraw, getDraw } = useDraws();
  const { editions = [], getEditions } = useEditions();
  const { showToast } = useFeedback();

  useEffect(() => {
    const loadData = async () => {
      await getEditions();

      if (params.id) {
        const drawData = await getDraw(params.id);
        if (drawData) {
          setValue("edition", {
            value: drawData.edition?._id || drawData.edition,
            label: drawData.edition?.name || "Edición Seleccionada",
          });
          setValue("type", drawData.type);
          setValue("cardSetNumber", drawData.cardSetNumber);
          setValue(
            "drawDate",
            dayjs.utc(drawData.drawDate).format("YYYY-MM-DD")
          );
          setValue("description", drawData.description || "");
          setValue("prizes", drawData.prizes);
        }
      }
    };

    loadData();
  }, [params.id, getEditions, getDraw, setValue]);

  useEffect(() => {
    if (!params.id && editions.length > 0) {
      const newestEdition = editions[editions.length - 1];
      setValue(
        "edition",
        {
          value: newestEdition._id,
          label: newestEdition.name,
        },
        { shouldValidate: false, shouldDirty: false }
      );
      setValue("type", "Final", { shouldValidate: false, shouldDirty: false });
      setValue("drawDate", dayjs().format("YYYY-MM-DD"), {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [editions, params.id, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      edition: data.edition.value,
      type: data.type,
      drawDate: data.drawDate,
      description: data.description,
      prizes: data.prizes,
      cardSetNumber:
        data.type === "Final" ? parseInt(data.cardSetNumber) : undefined,
    };

    try {
      if (params.id) {
        await updateDraw(params.id, payload);
        showToast("Sorteo actualizado exitosamente", "success");
      } else {
        await createDraw(payload);
        showToast("Sorteo creado exitosamente", "success");
      }
      navigate("/draws");
    } catch (error) {
      console.error("Error guardando sorteo:", error);
      showToast(
        error.response?.data?.message || "Error al guardar el sorteo",
        "error"
      );
    }
  });

  const isEditing = Boolean(params.id);
  const watchType = watch("type");

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen pb-12">
      <PageHeader
        title={isEditing ? "Editar Sorteo" : "Registrar Sorteo"}
        compact={true}
        breadcrumbs={[
          { label: "Sorteos", href: "/draws" },
          { label: isEditing ? "Editar" : "Registrar" },
        ]}
        actions={[
          {
            label: "Volver",
            icon: X,
            variant: "ghost",
            onClick: () => navigate("/draws"),
          },
          {
            label: isSubmitting
              ? "Guardando..."
              : isEditing
              ? "Guardar Cambios"
              : "Guardar Sorteo",
            icon: Save,
            onClick: onSubmit,
            disabled: isSubmitting,
          },
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <Card
          size="slim"
          title="Configuración del Sorteo"
          icon={Trophy}
          description="Parámetros de fecha, edición y modalidad del sorteo"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          <FormGrid cols={2}>
            {/* Edición */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-1">
                Edición <span className="text-red-500">*</span>
              </label>
              <Controller
                name="edition"
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
                    placeholder="Seleccionar edición..."
                  />
                )}
              />
              {errors.edition && (
                <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                  {errors.edition.message}
                </p>
              )}
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-1">
                Tipo de Sorteo <span className="text-red-500">*</span>
              </label>
              <select
                {...register("type", { required: "El tipo es obligatorio" })}
                className="w-full bg-white border border-slate-200/60 shadow-sm rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary/40 transition-all h-[42px]"
              >
                <option value="">Seleccionar...</option>
                <option value="Mensual">Mensual</option>
                <option value="Final">Final</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Conjunto de cartones (Solo Final) */}
            {watchType === "Final" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-1">
                  Conjunto de Cartones <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("cardSetNumber", {
                    required:
                      watchType === "Final"
                        ? "El conjunto es obligatorio"
                        : false,
                  })}
                  className="w-full bg-white border border-slate-200/60 shadow-sm rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-primary/40 transition-all h-[42px]"
                >
                  <option value="">Seleccionar conjunto...</option>
                  <option value="1">Conjunto 1 (Primer sorteo)</option>
                  <option value="2">Conjunto 2 (Segundo sorteo)</option>
                  <option value="3">Conjunto 3 (Tercer sorteo)</option>
                  <option value="4">Conjunto 4 (Cuarto sorteo)</option>
                  <option value="5">Conjunto 5 (Quinto sorteo)</option>
                </select>
                {errors.cardSetNumber && (
                  <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                    {errors.cardSetNumber.message}
                  </p>
                )}
              </div>
            )}

            {/* Fecha */}
            <div className="space-y-1.5">
              <InputField
                label="Fecha del Sorteo"
                type="date"
                bsize="compact"
                error={errors.drawDate?.message}
                {...register("drawDate", {
                  required: "La fecha es obligatoria",
                })}
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.15em] ml-1">
                Nombre o Descripción del Sorteo
              </label>
              <textarea
                {...register("description")}
                rows="2"
                placeholder="Ej: Sorteo mensual de cuotas al día - Edición 2026"
                className="w-full bg-white border border-slate-200/60 shadow-sm rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary/40 transition-all"
              />
            </div>
          </FormGrid>
        </Card>

        {/* Premios */}
        <Card
          size="slim"
          title="Premios del Sorteo"
          icon={Gift}
          description="Defina los premios en orden de extracción / posición"
          className="shadow-premium border-slate-200/60 bg-white"
        >
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100 items-end"
              >
                <div className="col-span-3 sm:col-span-2">
                  <InputField
                    label="Posición"
                    type="number"
                    min="1"
                    bsize="compact"
                    placeholder="1"
                    {...register(`prizes.${index}.position`, {
                      required: true,
                      min: 1,
                    })}
                  />
                </div>
                <div className="col-span-7 sm:col-span-9">
                  <InputField
                    label="Descripción del Premio"
                    type="text"
                    bsize="compact"
                    placeholder="Ej: Auto 0KM / Smart TV 55'' / $500.000 en efectivo"
                    {...register(`prizes.${index}.description`, {
                      required: "Requerido",
                    })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-center pb-1">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar Premio"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                append({ position: fields.length + 1, description: "" })
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-primary text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              <Plus size={14} />
              Agregar Premio
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
