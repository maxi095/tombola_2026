import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

/**
 * HomePage - Premium 2026 v3 (Navy Alignment)
 * Refactorizada para usar componentes atómicos y eliminar dependencia de CSS legacy.
 */
function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-10">
            <div className="space-y-6 max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter leading-tight font-manrope">
                    Sistema de Gestión de Tómbola
                </h1>
                <p className="text-slate-500 text-lg font-medium tracking-tight mb-10">
                    Plataforma administrativa institucional para la gestión de ventas, 
                    asociados y sorteos de alta seguridad.
                </p>
                <div className="pt-4">
                    <Link to="/login">
                        <Button size="lg" className="shadow-2xl">
                            Iniciar ahora
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;
