import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../../context/ClientContext";
import {
  User,
  Save,
  MapPin,
  Phone,
  CreditCard,
  Mail
} from "lucide-react";

import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import FormGrid from "../../components/ui/FormGrid";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import { useFeedback } from "../../context/FeedbackContext";
import { formatNumber, stripNonDigits } from "../../libs/formatters";

/**
 * ClientFormPage V5.0 - Slim 2026
 * Formulario de asociados con alta densidad y componentes atómicos.
 */
function ClientFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const { createClient, updateClient, getClient, loading: contextLoading } = useClients();
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getClient(params.id)
        .then((client) => {
          if (client) {
            setValue("firstName", client.person.firstName);
            setValue("lastName", client.person.lastName);
            setValue("document", client.person.document);
            setValue("email", client.person.email);
            setValue("address", client.person.address);
            setValue("city", client.person.city);
            setValue("phone", client.person.phone);
            setValue("notes", client.notes);
          }
        })
        .catch((err) => console.error("Error al cargar asociado:", err))
        .finally(() => setLoading(false));
    }
  }, [params.id, getClient, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    const clientData = {
      notes: data.notes || "",
      person: {
        firstName: data.firstName,
        lastName: data.lastName,
        document: data.document,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
      },
    };

    try {
      if (params.id) {
        await updateClient(params.id, clientData);
        showToast("Asociado actualizado exitosamente", "success");
      } else {
        await createClient(clientData);
        showToast("¡Asociado registrado con éxito!", "success");
      }
      navigate("/clients");
    } catch (error) {
      showToast("Error al procesar la operación", "danger");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return <LoadingOverlay message="Sincronizando Perfil..." fullScreen />;
  }

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700">
      <PageHeader
        title={params.id ? "Editar Asociado" : "Registrar Asociado"}
        //subtitle="Gestione la información de identidad y contacto del integrante."
        compact={true}
        breadcrumbs={[
          { label: "Asociados", href: "/clients" },
          { label: params.id ? "Editar" : "Registrar", href: "#" }
        ]}
        actions={[
          {
            label: "Volver",
            variant: "ghost",
            onClick: () => navigate("/clients")
          },
          {
            label: params.id ? "Guardar cambios" : "Guardar Asociado",
            icon: Save,
            loading: saving,
            onClick: onSubmit
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-20">
        <Card
          size="slim"
          title="Datos de Identidad"
          icon={User}
          description="Información personal y de contacto"
        >
          <FormGrid>
            <InputField
              label="Nombres"
              placeholder="Ej. Juan Pedro"
              className="lg:col-span-2"
              {...register("firstName", { required: "El nombre es requerido" })}
              error={errors.firstName?.message}
            />

            <InputField
              label="Apellidos"
              placeholder="Ej. Pérez"
              className="lg:col-span-2"
              {...register("lastName", { required: "El apellido es requerido" })}
              error={errors.lastName?.message}
            />

            <Controller
              name="document"
              control={control}
              rules={{ required: "El DNI es requerido" }}
              render={({ field }) => (
                <InputField
                  label="Nro Documento"
                  placeholder="Carga solo números"
                  className="lg:col-span-1"
                  {...field}
                  value={formatNumber(field.value)}
                  onChange={(e) => field.onChange(stripNonDigits(e.target.value))}
                  error={errors.document?.message}
                  icon={CreditCard}
                />
              )}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="juan@email.com"
              className="lg:col-span-2"
              icon={Mail}
              {...register("email")}
              error={errors.email?.message}
            />

            <InputField
              label="Teléfono"
              placeholder="Ej. 341..."
              className="lg:col-span-1"
              icon={Phone}
              {...register("phone")}
            />

            <InputField
              label="Domicilio"
              placeholder="Calle y Nro."
              className="lg:col-span-2"
              icon={MapPin}
              {...register("address")}
            />

            <InputField
              label="Localidad"
              placeholder="Ciudad / Pueblo"
              className="lg:col-span-2"
              {...register("city")}
            />

            <div className="lg:col-span-4 flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Observaciones / Notas</label>
              <textarea
                {...register("notes")}
                className="w-full bg-white border border-slate-200 rounded-premium-input p-4 text-[11px] font-medium placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none h-24"
                placeholder="Información adicional relevante del asociado..."
              />
            </div>
          </FormGrid>
        </Card>
      </form>
    </div>
  );
}

export default ClientFormPage;
