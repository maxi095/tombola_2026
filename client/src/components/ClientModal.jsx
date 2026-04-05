import { useForm, Controller } from "react-hook-form";
import { useClients } from "../context/ClientContext";
import { UserPlus, Save, Loader2, AlertCircle } from "lucide-react";

// Infraestructura Elite UI
import Modal from "./ui/Modal";
import InputField from "./ui/InputField";
import Button from "./ui/Button";
import { formatDocument, stripNonDigits } from "../libs/formatters";

/**
 * ClientModal V8.1 - Premium Data Layer
 * Gestión de registro de asociados bajo estándar Elite 2026.
 */
function ClientModal({ isOpen, onClose, onClientCreated }) {
  const { createClient, clientErrors, loading } = useClients();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      document: "",
      email: "",
      address: "",
      city: "",
      phone: "",
      notes: ""
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    // Limpiamos el documento antes de enviar a la API
    const cleanDocument = stripNonDigits(data.document);

    const clientData = {
      notes: data.notes || "",
      person: {
        firstName: data.firstName,
        lastName: data.lastName,
        document: cleanDocument,
        address: data.address,
        city: data.city,
        phone: data.phone,
        email: data.email,
      },
    };

    try {
      const newClient = await createClient(clientData);
      if (newClient) {
        onClientCreated(newClient);
        reset();
        onClose();
      }
    } catch (error) {
      console.error("Error al crear cliente:", error);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const footer = (
    <>
      <Button
        variant="ghost"
        onClick={handleClose}
        className="px-6 font-black text-[10px] uppercase tracking-widest"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="client-form"
        variant="primary"
        className="px-8 h-12 shadow-lg shadow-indigo-100 min-w-[140px]"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <>
            <Save size={18} className="mr-2" />
            Registrar
          </>
        )}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Asociado"
      subtitle="Socio / Cliente Final"
      icon={UserPlus}
      variant="default"
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <div className="flex flex-col">
        {clientErrors && clientErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col gap-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Errores de Validación</span>
            </div>
            {clientErrors.map((err, i) => (
              <div key={i} className="text-xs font-bold text-red-500 flex items-center gap-2">
                 • {err}
              </div>
            ))}
          </div>
        )}

        <form id="client-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <InputField
            label="Nombre"
            placeholder="Ej: Juan"
            {...register("firstName", { required: "El nombre es requerido" })}
            error={errors.firstName?.message}
          />
          <InputField
            label="Apellido"
            placeholder="Ej: Pérez"
            {...register("lastName", { required: "El apellido es requerido" })}
            error={errors.lastName?.message}
          />
          
          <Controller
            name="document"
            control={control}
            rules={{ required: "El N° documento es requerido" }}
            render={({ field: { onChange, value } }) => (
              <InputField
                label="N° Documento"
                placeholder="DNI / CUIT"
                value={value}
                onChange={(e) => {
                  const formatted = formatDocument(e.target.value);
                  onChange(formatted);
                }}
                error={errors.document?.message}
              />
            )}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="juan@ejemplo.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <InputField
            label="Localidad"
            placeholder="Ciudad o Pueblo"
            {...register("city")}
          />
          <InputField
            label="Teléfono"
            placeholder="Cod. Área + Número"
            {...register("phone")}
          />
          <div className="col-span-1 md:col-span-2">
            <InputField
              label="Dirección"
              placeholder="Calle, Número, Piso/Depto"
              {...register("address")}
            />
          </div>
          <div className="col-span-1 md:col-span-2">
             <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Notas Internas</label>
             <textarea
               {...register("notes")}
               className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-primary focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all outline-none min-h-[80px]"
               placeholder="Observaciones sobre el asociado..."
             />
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default ClientModal;
