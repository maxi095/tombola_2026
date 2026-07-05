import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

/**
 * RegisterPage - Modernized to Standard 2026 Atomic UX.
 * Integrates clean forms and eliminates legacy layout files.
 */
function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isAuthenticated, errors: registerErrors } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = onSubmitValues => {
    signup(onSubmitValues);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-[480px]" hover={false}>
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black text-primary tracking-tighter font-manrope">
            Registrarse
          </h1>
          <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.2em] px-4">
            Crear Cuenta Portal Tómbola
          </p>
        </div>

        {Array.isArray(registerErrors) && registerErrors.map((error, i) => (
          <div key={i} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        ))}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label="Usuario"
            type="text"
            placeholder="Introduce tu usuario"
            {...register("username", { required: "Usuario es requerido" })}
            error={errors.username?.message}
            icon={User}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="ejemplo@mail.com"
            {...register("email", { required: "Email es requerido" })}
            error={errors.email?.message}
            icon={Mail}
          />

          <InputField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password", { required: "Contraseña es requerida" })}
            error={errors.password?.message}
            icon={showPassword ? EyeOff : Eye}
            onClick={() => setShowPassword(!showPassword)}
          />

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full shadow-2xl" icon={UserPlus}>
              Crear Cuenta
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline font-manrope">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default RegisterPage;