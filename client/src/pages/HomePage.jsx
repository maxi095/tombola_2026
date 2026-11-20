import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Trophy,
  Ticket,
  ShieldCheck,
  HeartHandshake,
  CalendarDays,
  ArrowRight,
  LogIn,
  Sparkles,
  CheckCircle2,
  MapPin,
  LayoutDashboard
} from "lucide-react";
import logoNob from "../assets/images/logo_nob.png";
import logoTombola from "../assets/images/Logo-Tombola.png";
import auspiciantesImg from "../assets/images/auspiciantes.png";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const portalPath =
    user?.roles === "Vendedor"
      ? "/vendedor"
      : user?.roles === "Directiva"
      ? "/directiva"
      : "/dashboard";

  const pillars = [
    {
      icon: Trophy,
      title: "Sorteos Mensuales y Gran Final",
      description:
        "Participás durante todo el año en sorteos mensuales por cuota al día, sorteos especiales por pago de contado y el Gran Sorteo Final.",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: HeartHandshake,
      title: "Impulso al Deporte del Club",
      description:
        "Cada cartón adquirido se destina directamente a fortalecer las divisiones inferiores, disciplinas deportivas y obras de nuestra institución.",
      accent: "text-red-400 bg-red-500/10 border-red-500/20",
    },
    {
      icon: ShieldCheck,
      title: "Transparencia Certificada",
      description:
        "Sistema digitalizado de control de cartones, seguimiento de cuotas y sorteos auditados en vivo con máxima claridad para cada asociado.",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Solicitá tu Cartón",
      description:
        "Contactá a tu vendedor habitual, subcomisión o acercate a la Secretaría del Club en Laguna Larga.",
    },
    {
      number: "02",
      title: "Elegí tu Forma de Pago",
      description:
        "Abonalo de contado para acceder a sorteos exclusivos o en cómodas cuotas mensuales.",
    },
    {
      number: "03",
      title: "Participá Todo el Año",
      description:
        "Con tu cuota al día participás automáticamente en cada sorteo mensual y en la gran fiesta final.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* Navbar Sticky */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src={logoNob}
              alt="Club Atlético y Biblioteca Newell's Old Boys"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-black text-white tracking-tight font-manrope leading-none truncate">
                Tómbola <span className="text-red-500">NOB</span>
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                Laguna Larga
              </p>
            </div>
          </Link>

          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#beneficios" className="hover:text-white transition-colors">
              La Tómbola
            </a>
            <a href="#como-participar" className="hover:text-white transition-colors">
              Cómo Participar
            </a>
            <a href="#auspiciantes" className="hover:text-white transition-colors">
              Auspiciantes
            </a>
          </nav>

          <Link
            to={isAuthenticated && user ? portalPath : "/login"}
            className="min-h-[44px] px-4 sm:px-5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all shrink-0"
          >
            {isAuthenticated && user ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Mi Portal</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </>
            )}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6">
        {/* Glow decorativo rojo/dorado */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(90vw,780px)] h-[360px] bg-gradient-to-b from-red-600/20 via-red-900/10 to-transparent blur-3xl rounded-full"
        />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Columna izquierda: Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Edición Oficial 2026 • Laguna Larga</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white font-manrope tracking-tight leading-[1.05]">
              La Tómbola que hace crecer a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-300">
                nuestro Club
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Sumate a la gran tómbola del{" "}
              <strong className="text-white">
                Club Atlético y Biblioteca Newell&apos;s Old Boys
              </strong>
              . Grandes premios todos los meses, sorteos por pago de contado y el
              respaldo directo al deporte de nuestra comunidad.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#como-participar"
                className="min-h-[52px] px-7 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all"
              >
                <Ticket className="w-5 h-5" />
                <span>Cómo Participar</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to={isAuthenticated && user ? portalPath : "/login"}
                className="min-h-[52px] px-7 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] border border-slate-700 text-slate-100 font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <LogIn className="w-4 h-4 text-red-400" />
                <span>
                  {isAuthenticated && user
                    ? "Ir a mi Portal de Gestión"
                    : "Acceso Vendedores y Secretaría"}
                </span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Sorteos Mensuales
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Pago Contado o Cuotas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Gran Sorteo Final
              </span>
            </div>
          </div>

          {/* Columna derecha: Tarjeta visual institucional */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-red-600/20 via-transparent to-amber-400/20 pointer-events-none" />

              <div className="relative flex flex-col items-center text-center space-y-6">
                <img
                  src={logoTombola}
                  alt="Logo Oficial Tómbola NOB"
                  className="w-56 sm:w-64 h-auto object-contain drop-shadow-[0_12px_32px_rgba(220,38,38,0.25)]"
                />

                <div className="w-full grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 text-left">
                    <CalendarDays className="w-5 h-5 text-red-400 mb-1.5" />
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      Todo el Año
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sorteos mensuales por cuota al día
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 text-left">
                    <Trophy className="w-5 h-5 text-amber-400 mb-1.5" />
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      5 Rondas Finales
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Múltiples chances con tu cartón
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilares / Beneficios */}
      <section id="beneficios" className="py-16 px-4 sm:px-6 border-t border-white/5 bg-slate-900/30">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
              Tradición y Compromiso
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-manrope tracking-tight">
              Más que un sorteo, el motor de la institución
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-6 transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${item.accent}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-white font-manrope mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cómo Participar */}
      <section id="como-participar" className="py-16 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
              Simple y Directo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white font-manrope tracking-tight">
              ¿Cómo adquirís tu cartón?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 space-y-3"
              >
                <span className="text-3xl font-black text-red-500/30 font-manrope tabular-nums">
                  {step.number}
                </span>
                <h3 className="text-lg font-black text-white font-manrope">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auspiciantes Oficiales */}
      <section id="auspiciantes" className="py-16 px-4 sm:px-6 border-t border-white/5 bg-slate-900/40">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="space-y-1.5">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
              Nos Acompañan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-manrope tracking-tight">
              Auspiciantes Oficiales
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-white/20">
            <img
              src={auspiciantesImg}
              alt="Auspiciantes Oficiales de la Tómbola NOB"
              className="w-full max-h-40 object-contain mx-auto"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Footer Institucional */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950 py-8 px-4 sm:px-6 pb-safe">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src={logoNob} alt="Escudo NOB" className="w-8 h-8 object-contain" />
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wider">
                Club Atlético y Biblioteca Newell&apos;s Old Boys
              </p>
              <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>Laguna Larga, Córdoba — Argentina</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link
              to={isAuthenticated && user ? portalPath : "/login"}
              className="hover:text-white font-semibold transition-colors"
            >
              Portal de Gestión
            </Link>
            <span>•</span>
            <span>© {new Date().getFullYear()} Tómbola NOB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
