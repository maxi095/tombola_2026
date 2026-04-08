import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useSellers } from "../../context/SellerContext";
import {
  User,
  Save,
  X,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Percent,
  AlertCircle,
  Loader2
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import FormGrid from "../../components/ui/FormGrid";
import { formatDocument, stripNonDigits } from "../../libs/formatters";
import { useFeedback } from "../../context/FeedbackContext";

/**
 * SellerFormPage v10.5 - Elite 2026 Sync ✨💎🚀
 * Formulario de alta y edición de vendedores 100% sincronizado con el canon de Asociados.
 */
function SellerFormPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      commissionRate: ""
    }
  });

  const { createSeller, updateSeller, getSeller, sellerErrors } = useSellers();
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useFeedback();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getSeller(params.id)
        .then((seller) => {
          if (seller) {
            setValue("firstName", seller.person?.firstName || "");
            setValue("lastName", seller.person?.lastName || "");
            setValue("document", formatDocument(seller.person?.document) || "");
            setValue("email", seller.person?.email || "");
            setValue("address", seller.person?.address || "");
            setValue("city", seller.person?.city || "");
            setValue("phone", seller.person?.phone || "");
            setValue("commissionRate", seller.commissionRate ?? "");
          }
        })
        .catch((err) => {
          console.error("Error al cargar el vendedor:", err);
          showToast("Error al cargar los datos del vendedor", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, getSeller, setValue, showToast]);

  const onSubmit = handleSubmit(async (data) => {
    const sellerData = {
      status: "Activo",
      commissionRate: data.commissionRate,
      person: {
        firstName: data.firstName,
        lastName: data.lastName,
        document: stripNonDigits(data.document),
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
      },
    };

    try {
      if (params.id) {
        await updateSeller(params.id, sellerData);
        showToast("Cambios guardados correctamente", "success");
      } else {
        await createSeller(sellerData);
        showToast("Vendedor registrado exitosamente", "success");
      }
      navigate("/sellers");
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      showToast("Error al procesar el formulario", "error");
    }
  });

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700 bg-slate-50/10 min-h-screen pb-12">
      <PageHeader
        title={params.id ? "Editar Vendedor" : "Registrar Vendedor"}
        icon={User}
        compact={true}
        breadcrumbs={[
          { label: "Vendedores", path: "/sellers" },
          { label: params.id ? "Editar" : "Registrar" }
        ]}
        actions={[
          {
            label: "Volver",
            icon: X,
            variant: "ghost",
            onClick: () => navigate("/sellers")
          },
          {
            label: params.id ? "Guardar cambios" : "Guardar vendedor",
            icon: Save,
            onClick: onSubmit,
            disabled: isSubmitting
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-20">
        <Card 
          size="slim"
          title="Datos de Identidad" 
          icon={User} 
          description="Información personal y de contacto"
          className="shadow-sm border-slate-200/60 overflow-visible bg-white relative"
        >
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[32px]">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          )}

          <FormGrid cols={4}>
            {/* FILA 1: Identidad Principal */}
            <InputField
              label="Nombres"
              placeholder="Ej: Juan Pedro"
              className="lg:col-span-2"
              {...register("firstName", { required: "Campo obligatorio" })}
              error={errors.firstName?.message}
            />
            <InputField
              label="Apellidos"
              placeholder="Ej: Pérez García"
              className="lg:col-span-2"
              {...register("lastName", { required: "Campo obligatorio" })}
              error={errors.lastName?.message}
            />

            {/* FILA 2: Validación y Contacto */}
            <Controller
              name="document"
              control={control}
              rules={{ required: "DNI Requerido" }}
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <InputField
                  label="Nro Documento"
                  placeholder="Carga solo números"
                  icon={CreditCard}
                  className="lg:col-span-1"
                  value={value}
                  onChange={(e) => onChange(formatDocument(e.target.value))}
                  error={error?.message}
                />
              )}
            />
            <InputField
              label="Email"
              placeholder="juan@email.com"
              icon={Mail}
              className="lg:col-span-2"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <InputField
              label="Teléfono"
              placeholder="Ej. 341..."
              icon={Phone}
              className="lg:col-span-1"
              {...register("phone")}
              error={errors.phone?.message}
            />

            {/* FILA 3: Ubicación */}
            <InputField
              label="Domicilio"
              placeholder="Calle y Nro."
              icon={MapPin}
              className="lg:col-span-2"
              {...register("address")}
              error={errors.address?.message}
            />
            <InputField
              label="Localidad"
              placeholder="Ciudad / Pueblo"
              className="lg:col-span-2"
              {...register("city")}
              error={errors.city?.message}
            />

            {/* FILA 4: Configuración Comercial */}
            <InputField
              label="Comisión por Ventas (%)"
              placeholder="Ej: 15"
              icon={Percent}
              className="lg:col-span-1"
              type="number"
              {...register("commissionRate", { 
                required: "Campo obligatorio",
                min: { value: 0, message: "Mínimo 0%" },
                max: { value: 100, message: "Máximo 100%" }
              })}
              error={errors.commissionRate?.message}
            />
          </FormGrid>

          {/* Panel de Errores de API 🚨 */}
          {sellerErrors && sellerErrors.length > 0 && (
            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col gap-2">
              {sellerErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-red-600 text-xs font-bold">
                  <AlertCircle size={14} />
                  {err}
                </div>
              ))}
            </div>
          )}
        </Card>
      </form>
    </div>
  );
}

export default SellerFormPage;
