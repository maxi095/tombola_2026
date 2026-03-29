import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { useDraws } from "../../context/DrawContext";
import { useEditions } from "../../context/EditionContext";
import { customSelectStyles } from "../../styles/reactSelectStyles";
import dayjs from "dayjs";

function DrawFormPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
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


  useEffect(() => {
  const loadData = async () => {
    await getEditions();

    if (params.id) {
      // MODO EDICIÓN
      
      const drawData = await getDraw(params.id);
      if (drawData) {
        setValue("edition", {
          value: drawData.edition._id,
          label: drawData.edition.name,
        });
        setValue("type", drawData.type);
        setValue("cardSetNumber", drawData.cardSetNumber);
        setValue("drawDate", dayjs.utc(drawData.drawDate).format("YYYY-MM-DD"));
        setValue("description", drawData.description || "");
        setValue("prizes", drawData.prizes);
      }
    }
  };

  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params.id]); // Solo depender de params.id

// useEffect separado solo para valores por defecto en creación
useEffect(() => {
  if (!params.id && editions.length > 0) {
    const newestEdition = editions[editions.length - 1];
    
    setValue("edition", {
      value: newestEdition._id,
      label: newestEdition.name,
    }, { shouldValidate: false, shouldDirty: false }); // Opciones para no triggear cambios
    
    setValue("type", "Final", { shouldValidate: false, shouldDirty: false });
    setValue("drawDate", dayjs().format("YYYY-MM-DD"), { shouldValidate: false, shouldDirty: false });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Ejecutar solo al montar el componente

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      edition: data.edition.value,
      type: data.type,
      drawDate: data.drawDate,
      description: data.description,
      prizes: data.prizes,
      cardSetNumber: data.type === "Final" ? parseInt(data.cardSetNumber) : undefined
    };

    try {
      if (params.id) {
        await updateDraw(params.id, payload);
      } else {
        await createDraw(payload);
      }
      navigate("/draws");
    } catch (error) {
      console.error("Error guardando sorteo:", error);
      alert("Error al guardar el sorteo");
    }
  });

  return (
    <div className="page-wrapper">
      <div className="form-card">
        <h2 className="title">{params.id ? "Editar Sorteo" : "Crear Sorteo"}</h2>

        <form onSubmit={onSubmit} className="form-grid">
          {/* Edición */}
          <div className="form-section">
            <label className="label">Edición</label>
            <Controller
              name="edition"
              control={control}
              rules={{ required: "La edición es obligatoria" }}
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
            {errors.edition && (
              <p className="text-red-500 text-sm">{errors.edition.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="form-section">
            <label className="label">Tipo de Sorteo</label>
            <select
              {...register("type", { required: "El tipo es obligatorio" })}
              className="form-input"
            >
              <option value="">Seleccionar...</option>
              <option value="Mensual">Mensual</option>
              <option value="Final">Final</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* 👇 NUEVO CAMPO - Solo visible si es tipo Final */}
          {watch("type") === "Final" && (
            <div className="form-section">
              <label className="label">Número de Conjunto de Cartones</label>
              <select
                {...register("cardSetNumber", { 
                  required: watch("type") === "Final" ? "El conjunto es obligatorio" : false 
                })}
                className="form-input"
              >
                <option value="">Seleccionar...</option>
                <option value="1">Conjunto 1 (Primer sorteo)</option>
                <option value="2">Conjunto 2 (Segundo sorteo)</option>
                <option value="3">Conjunto 3 (Tercer sorteo)</option>
                <option value="4">Conjunto 4 (Cuarto sorteo)</option>
                <option value="5">Conjunto 5 (Quinto sorteo)</option>
              </select>
              {errors.cardSetNumber && (
                <p className="text-red-500 text-sm">{errors.cardSetNumber.message}</p>
              )}
            </div>
          )}

          {/* Fecha */}
          <div className="form-section">
            <label className="label">Fecha del Sorteo</label>
            <input
              type="date"
              {...register("drawDate", {
                required: "La fecha es obligatoria",
              })}
              className="form-input"
            />
            {errors.drawDate && (
              <p className="text-red-500 text-sm">{errors.drawDate.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="form-section md:col-span-2">
            <label className="label">Nombre del sorteo</label>
            <textarea
              {...register("description")}
              className="form-input"
              rows="3"
              placeholder="Ej: Sorteo mensual de julio 2025"
            />
          </div>

          {/* Premios */}
          <div className="form-section md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label className="label">Premios</label>
              <button
                type="button"
                onClick={() =>
                  append({ position: fields.length + 1, description: "" })
                }
                className="btn-secondary"
              >
                + Agregar Premio
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-2">
                  <input
                    type="number"
                    {...register(`prizes.${index}.position`, {
                      required: true,
                      min: 1,
                    })}
                    className="form-input"
                    placeholder="Pos."
                  />
                </div>
                <div className="col-span-8">
                  <input
                    type="text"
                    {...register(`prizes.${index}.description`)}
                    className="form-input"
                    placeholder="Descripción del premio"
                  />
                </div>
                <div className="col-span-2">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn-cancel w-full"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary mt-4 md:col-span-2">
            Guardar Sorteo
          </button>
        </form>
      </div>
    </div>
  );
}

export default DrawFormPage;