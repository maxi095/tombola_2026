import ReactModal from "react-modal";
import { useForm } from "react-hook-form";
import { useClients } from "../context/ClientContext";
import { X, UserPlus, Save, Loader2, AlertCircle } from "lucide-react";

// Infraestructura Premium 2026
import InputField from "./ui/InputField";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

ReactModal.setAppElement("#root");

function ClientModal({ isOpen, onClose, onClientCreated }) {
  const { createClient, clientErrors, loading } = useClients();

  const {
    register,
    handleSubmit,
    reset,
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

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998]"
    >
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-primary tracking-tight leading-none">Nuevo Asociado</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Socio / Cliente Final</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {clientErrors && clientErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex flex-col gap-2">
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

          <form id="client-form" onSubmit={onSubmit} className="grid grid-cols-2 gap-x-6 gap-y-4">
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
            <InputField
              label="N° Documento"
              placeholder="DNI / CUIT"
              {...register("document", { required: "El N° documento es requerido" })}
              error={errors.document?.message}
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
            <div className="col-span-2">
              <InputField
                label="Dirección"
                placeholder="Calle, Número, Piso/Depto"
                {...register("address")}
              />
            </div>
            <div className="col-span-2">
               <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Notas Internas</label>
               <textarea
                 {...register("notes")}
                 className="w-full rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-bold text-primary focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 transition-all outline-none min-h-[80px]"
                 placeholder="Observaciones sobre el asociado..."
               />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="client-form"
            variant="primary"
            className="px-8 rounded-2xl h-12 shadow-lg shadow-indigo-100 min-w-[140px]"
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
        </div>
      </div>
    </ReactModal>
  );
}

export default ClientModal;
