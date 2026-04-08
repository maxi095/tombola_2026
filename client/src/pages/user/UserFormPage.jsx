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
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormGrid from "../../components/ui/FormGrid";
import { useFeedback } from "../../context/FeedbackContext";
import { formatNumber, stripNonDigits } from "../../libs/formatters";

/**
 * UserFormPage - Slim & Atomic 2026 v5
 * Optimización de espacios y estandarización de componentes.
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
    return <LoadingOverlay message="Sincronizando Usuario..." fullScreen />;
  }

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700">

      <PageHeader
        title={params.id ? "Editar Usuario" : "Registrar Usuario"}
        //subtitle="Monitoreo de seguridad y actualización de información personal del equipo."
        compact={true}
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

      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-20">

        {/* SECCIÓN: SEGURIDAD ACCESO */}
        <Card
          size="slim"
          title="Seguridad Acceso"
          icon={Key}
          description="Gestión de credenciales"
        >
          <FormGrid>
            <InputField
              label="Nombre de Usuario"
              placeholder="ej. usuario_nob"
              className="lg:col-span-2"
              {...register("username", { required: "Usuario requerido" })}
              error={errors.username?.message}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="personal@tombola.com"
              className="lg:col-span-2"
              {...register("email", { required: "Email requerido" })}
              error={errors.email?.message}
            />

            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Rol de Acceso</label>
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

            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Contraseña</label>
              {params.id && !isChangingPassword ? (
                <Button
                  variant="ghost"
                  className="w-full py-3.5 rounded-premium-input border border-dashed border-slate-200 bg-slate-50/30 hover:bg-white text-[11px] font-bold"
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
          </FormGrid>
        </Card>

        {/* SECCIÓN: IDENTIDAD PERSONAL */}
        <Card
          size="slim"
          title="Datos Personales"
          icon={User}
          description="Información vinculada al perfil"
        >
          <FormGrid>
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
                  placeholder=""
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
            <InputField
              label="Domicilio Particular"
              className="lg:col-span-4"
              {...register("address")}
              placeholder="Calle, Nro, Localidad"
            />
          </FormGrid>

          <div className="mt-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex gap-4 items-start">
            <div className="w-8 h-8 shrink-0 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary border border-slate-100">
              <Info size={16} />
            </div>
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed tracking-tight">
              Los datos personales son protegidos bajo la normativa vigente de seguridad informática. Cualquier modificación en los rangos de acceso será notificada a la gerencia central a través de los sistemas de auditoría interna conformes al estándar 2026.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
}
