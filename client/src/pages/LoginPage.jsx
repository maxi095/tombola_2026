import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";

/**
 * LoginPage - Premium 2026 v3 (Navy Alignment)
 * Refactorizada para usar componentes atómicos y eliminar inconsistencias visuales.
 */
function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const { signin, errors: signinErrors, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit((data) => {
    signin(data);
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-[480px]" hover={false}>
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-black text-primary tracking-tighter font-manrope">
            Iniciar Sesión
          </h1>
          <p className="text-slate-400 font-bold text-[12px] uppercase tracking-[0.2em] px-4">
            Portal Administrativo Tómbola
          </p>
        </div>

        {signinErrors.map((error, i) => (
          <div key={i} className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        ))}

        <form onSubmit={onSubmit} className="space-y-6">
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
            <Button type="submit" size="lg" className="w-full shadow-2xl" icon={Lock}>
              Ingresar al Sistema
            </Button>
          </div>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
            Copyright © 2026 Tómbola Software Team<br />
            Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
