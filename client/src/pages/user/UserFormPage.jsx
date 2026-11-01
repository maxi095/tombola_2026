import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUsers } from "../../context/UserContext";
import { useSellers } from "../../context/SellerContext";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Save,
  Key,
  User,
  Eye,
  EyeOff,
  Info,
  Smartphone
} from "lucide-react";

// Importación de la Librería de UI Premium 2026
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import PageHeader from "../../components/ui/PageHeader";
import EliteSelect from "../../components/ui/Select";
import LoadingOverlay from "../../components/ui/LoadingOverlay";
import FormGrid from "../../components/ui/FormGrid";
import { useFeedback } from "../../context/FeedbackContext";
import { formatNumber, stripNonDigits } from "../../libs/formatters";

/**
 * UserFormPage - Slim & Atomic 2026 v6 (Multi-Role Integration)
 * Soporta vinculación de vendedor obligatoria (RN-ROL-09) y autocompletado.
 */
export default function UserFormPage() {
  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm();
  const { createUser, updateUser, getUser } = useUsers();
  const { sellers, getSellers } = useSellers();
  const { showToast } = useFeedback();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const watchRoles = watch("roles");

  useEffect(() => {
    getSellers();
  }, [getSellers]);

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
            if (user.seller) {
              setValue("seller", typeof user.seller === 'object' ? user.seller._id : user.seller);
            }
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
      } else {
        // Si viene con parámetro ?sellerId=... desde la lista de vendedores
        const sellerParamId = searchParams.get("sellerId");
        if (sellerParamId) {
          setValue("roles", "Vendedor");
          setValue("seller", sellerParamId);
        }
      }
    }
    loadUser();
  }, [params.id, getUser, setValue, searchParams]);

  // Autocompletar datos personales al seleccionar un vendedor
  const handleSellerSelect = (sellerId) => {
    setValue("seller", sellerId);
    const targetSeller = sellers.find(s => s._id === sellerId);
    if (targetSeller && targetSeller.person) {
      const p = targetSeller.person;
      if (p.firstName) setValue("firstName", p.firstName);
      if (p.lastName) setValue("lastName", p.lastName);
      if (p.document) setValue("document", p.document);
      if (p.phone) setValue("phone", p.phone);
      if (p.address) setValue("address", p.address);
      if (p.email) setValue("email", p.email);

      // Sugerir nombre de usuario si está vacío
      const cleanUsername = `${(p.firstName || '').charAt(0)}${p.lastName || ''}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
      if (cleanUsername) {
        setValue("username", cleanUsername);
      }
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    setSaving(true);
    try {
      if (params.id && !isChangingPassword) {
        delete data.password;
      }

      if (data.roles === "Vendedor" && !data.seller) {
        showToast("Debe seleccionar un vendedor del club para el rol Vendedor", "warning");
        setSaving(false);
        return;
      }

      if (params.id) {
        await updateUser(params.id, data);
        showToast("Usuario actualizado con éxito", "success");
      } else {
        await createUser(data);
        showToast("Usuario registrado correctamente", "success");
      }
      navigate("/users");
    } catch (error) {
      console.error("Error al guardar:", error);
      showToast(error.response?.data?.message || "Hubo un error al procesar la solicitud", "error");
    } finally {
      setSaving(false);
    }
  });

  const sellerOptions = (sellers || []).map(s => ({
    value: s._id,
    label: `N° ${s.sellerNumber} — ${s.person?.lastName || ''}, ${s.person?.firstName || ''} (${s.isParticular ? 'Particular' : 'Club'})`
  }));

  if (loading) {
    return <LoadingOverlay message="Sincronizando Usuario..." fullScreen />;
  }

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700">
      <PageHeader
        title={params.id ? "Editar Usuario" : "Registrar Usuario"}
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
          title="Seguridad y Credenciales"
          icon={Key}
          description="Gestión de acceso y roles de usuario"
        >
          <FormGrid>
            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                Rol de Acceso
              </label>
              <Controller
                name="roles"
                control={control}
                rules={{ required: "Rol requerido" }}
                render={({ field }) => (
                  <EliteSelect
                    {...field}
                    options={[
                      { value: "Vendedor", label: "Vendedor (Acceso Móvil PWA)" },
                      { value: "Administrador", label: "Administrador (Control Total)" },
                      { value: "Directiva", label: "Directiva (Solo Lectura)" }
                    ]}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              field.value === "Vendedor"
                                ? "Vendedor (Acceso Móvil PWA)"
                                : field.value === "Directiva"
                                ? "Directiva (Solo Lectura)"
                                : "Administrador (Control Total)"
                          }
                        : null
                    }
                    onChange={(selected) => field.onChange(selected.value)}
                    isSearchable={false}
                  />
                )}
              />
              {errors.roles && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.roles.message}</p>}
            </div>

            {/* Si es Vendedor, selector obligatorio del Vendedor del club */}
            {watchRoles === "Vendedor" && (
              <div className="flex flex-col gap-2 lg:col-span-2 animate-in fade-in slide-in-from-top-1">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                  <Smartphone size={13} className="text-primary" />
                  Vendedor del Club Vinculado (Obligatorio)
                </label>
                <Controller
                  name="seller"
                  control={control}
                  rules={{ required: watchRoles === "Vendedor" ? "Debe seleccionar un vendedor" : false }}
                  render={({ field }) => (
                    <EliteSelect
                      {...field}
                      options={sellerOptions}
                      placeholder="Seleccionar vendedor para vincular..."
                      value={
                        field.value
                          ? sellerOptions.find(opt => opt.value === field.value) || null
                          : null
                      }
                      onChange={(selected) => handleSellerSelect(selected?.value)}
                      isSearchable={true}
                    />
                  )}
                />
                {errors.seller && <p className="text-[10px] font-bold text-red-500 ml-1">{errors.seller.message}</p>}
              </div>
            )}

            <InputField
              label="Nombre de Usuario"
              placeholder="ej. c_gomez"
              className="lg:col-span-2"
              {...register("username", { required: "Usuario requerido" })}
              error={errors.username?.message}
            />

            <InputField
              label="Email"
              type="email"
              placeholder="vendedor@tombola.com"
              className="lg:col-span-2"
              {...register("email", { required: "Email requerido" })}
              error={errors.email?.message}
            />

            <div className="flex flex-col gap-2 lg:col-span-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                Contraseña
              </label>
              {params.id && !isChangingPassword ? (
                <Button
                  type="button"
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
              Los usuarios con rol <strong>Vendedor</strong> operan de forma exclusiva en el portal móvil (PWA) accediendo únicamente a sus cartones y ventas asignadas. Toda modificación o alta es auditada conforme al Standard 2026.
            </p>
          </div>
        </Card>
      </form>
    </div>
  );
}
