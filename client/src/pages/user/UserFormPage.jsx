import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUsers } from "../../context/UserContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  Key,
  User,
  Eye,
  EyeOff,
  Info,
  Loader2,
} from "lucide-react";

// Importación de la Librería de UI Premium 2026
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import PageHeader from "../../components/ui/PageHeader";
// Se renombra a EliteSelect para evitar colisiones de identificadores con Babel/Vite
import EliteSelect from "../../components/ui/Select";
import { useFeedback } from "../../context/FeedbackContext";
import { formatNumber, stripNonDigits } from "../../libs/formatters";

/**
 * UserFormPage - Premium 2026 v4 (Componentized)
 * Una vista orquestada con componentes atómicos que eliminan la redundancia de estilos.
 */
export default function UserFormPage() {
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm();
  const { createUser, updateUser, getUser } = useUsers();
  const { showToast } = useFeedback();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (params.id) {
        setLoading(true);
        try {
          const user = await getUser(params.id);
          if (user) {
            setValue("username", user.username);
            setValue("email", user.email);
            setValue("roles", user.roles);
            if (user.person) {
              setValue("firstName", user.person.firstName);
              setValue("lastName", user.person.lastName);
              setValue("document", user.person.document);
              setValue("address", user.person.address);
              setValue("phone", user.person.phone);
            }
          }
        } catch (error) {
          console.error("Error cargando usuario:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadUser();
  }, [params.id, getUser, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    try {
      if (params.id && !isChangingPassword) {
        delete data.password;
      }
      if (params.id) {
        await updateUser(params.id, data);
        showToast("Usuario actualizado con éxito", "success");
      } else {
        await createUser(data);
        showToast("Nuevo usuario registrado correctamente", "success");
      }
      navigate("/users");
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast("Hubo un error al procesar la solicitud", "error");
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 px-12">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-xs font-black text-muted tracking-widest uppercase animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700">

      <PageHeader
        title={params.id ? "Editar Usuario" : "Registrar Usuario"}
        subtitle="Monitoreo de seguridad y actualización de información personal del equipo."
        breadcrumbs={[
          { label: "Usuarios", href: "/users" },
          { label: params.id ? "Editar" : "Registrar", href: "#" }
        ]}
        actions={[
          {
            label: "Volver",
            variant: "ghost",
            onClick: () => navigate("/users")
          },
          {
            label: params.id ? "Guardar cambios" : "Guardar Usuario",
            icon: Save,
            loading: saving,
            onClick: onSubmit
          }
        ]}
      />

      <form onSubmit={onSubmit} className="flex flex-col gap-8 pb-24">

        {/* SECCIÓN: SEGURIDAD ACCESO */}
        <Card title="Seguridad Acceso" icon={Key} description="Gestión de credenciales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <InputField
              label="Nombre de Usuario"
              placeholder="ej. usuario_nob"
              {...register("username", { required: "Usuario requerido" })}
              error={errors.username?.message}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="personal@tombola.com"
              {...register("email", { required: "Email requerido" })}
              error={errors.email?.message}
            />

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Rol</label>
              <Controller
                name="roles"
                control={control}
                rules={{ required: "Rol requerido" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    options={[
                      { value: "Vendedor", label: "Vendedor" },
                      { value: "Administrador", label: "Administrador" }
                    ]}
                    value={
                      field.value 
                        ? { value: field.value, label: field.value } 
                        : null
                    }
                    onChange={(selected) => field.onChange(selected.value)}
                    isSearchable={false}
                  />
                )}
              />
              {errors.roles && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.roles.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Contraseña</label>
              {params.id && !isChangingPassword ? (
                <Button
                  variant="ghost"
                  className="w-full py-4 rounded-premium-input border-2 border-dashed border-slate-100 bg-slate-50/50"
                  onClick={() => setIsChangingPassword(true)}
                  icon={Key}
                >
                  Restablecer Contraseña
                </Button>
              ) : (
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: !params.id && "Contraseña requerida" })}
                  error={errors.password?.message}
                  icon={showPassword ? EyeOff : Eye}
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
          </div>
        </Card>

        {/* SECCIÓN: IDENTIDAD PERSONAL */}
        <Card title="Datos personales" icon={User} description="Información personal del usuario">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <InputField
              label="Nombres"
              {...register("firstName", { required: "Campo obligatorio" })}
              error={errors.firstName?.message}
            />
            <InputField
              label="Apellidos"
              {...register("lastName", { required: "Campo obligatorio" })}
              error={errors.lastName?.message}
            />
            <Controller
              name="document"
              control={control}
              render={({ field }) => (
                <InputField
                  label="Nro Documento"
                  placeholder="Sin puntos"
                  {...field}
                  value={formatNumber(field.value)}
                  onChange={(e) => {
                    const clean = stripNonDigits(e.target.value);
                    field.onChange(clean);
                  }}
                />
              )}
            />
            <InputField label="Contacto Telefónico" {...register("phone")} />
            <div className="md:col-span-2">
              <InputField label="Domicilio Particular" {...register("address")} placeholder="Calle, Nro, Localidad" />
            </div>
          </div>

          <div className="mt-14 p-8 bg-muted/40 rounded-3xl border border-slate-100 flex gap-6 items-start">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
              <Info size={20} />
            </div>
            <p className="text-[12px] font-medium text-slate-500 leading-relaxed max-w-4xl tracking-tight">
              Los datos personales son protegidos bajo la normativa vigente de seguridad informática. Cualquier modificación en los rangos de acceso será notificada a la gerencia central a través de los sistemas de auditoría interna.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
}
