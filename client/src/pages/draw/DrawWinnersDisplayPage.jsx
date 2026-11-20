import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDraws } from '../../context/DrawContext';
import auspiciantesImg from '../../assets/images/auspiciantes.png';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.locale('es');

function DrawWinnersDisplayPage() {
  const { id } = useParams();
  const { getDraw } = useDraws();
  const [draw, setDraw] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDraw();
  }, [id]);

  const loadDraw = async () => {
    try {
      const drawData = await getDraw(id);
      setDraw(drawData);
    } catch (error) {
      console.error('Error cargando sorteo:', error);
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDraw();
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">
          Cargando sorteo...
        </div>
      </div>
    );
  }

  if (!draw) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold">
          Sorteo no encontrado
        </div>
      </div>
    );
  }

  const winners = draw.prizes
    ?.filter(prize => prize.bingoCard)
    .sort((a, b) => a.position - b.position) || [];

  // Lógica de Íconos: 1° distinto, el resto iguales
  const getPositionEmoji = (position) => {
    return position === 1 ? '🥇' : '🎖️';
  };

  // Lógica de Texto: Mantenemos los nombres correctos, pero visualmente agruparemos por estilo
  const getPositionText = (position) => {
    switch(position) {
      case 1: return 'PRIMER PREMIO';
      case 2: return 'SEGUNDO PREMIO';
      case 3: return 'TERCER PREMIO';
      case 4: return 'CUARTO PREMIO';
      case 5: return 'QUINTO PREMIO';
      default: return `PREMIO ${position}°`;
    }
  };

  const isDense = winners.length >= 5;

  // Escala adaptable a la cantidad de premios (evita recortes en 100vh con 5+ ganadores)
  const getStyles = (position) => {
    if (position === 1) {
      return {
        container: `bg-violet-900/95 border-2 border-[#FFD700] z-10 shadow-2xl ${isDense ? 'py-2.5' : 'py-4'}`,
        textTitle: 'text-[#FFD700]',
        textNumber: isDense ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl',
        textName: isDense ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl',
        textPrize: isDense ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl',
        emoji: isDense ? 'text-4xl' : 'text-6xl'
      };
    }
    return {
      container: `bg-violet-700/90 border border-violet-400/50 shadow-lg ${isDense ? 'py-1.5' : 'py-3'}`,
      textTitle: 'text-white',
      textNumber: isDense ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl',
      textName: isDense ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl',
      textPrize: isDense ? 'text-3xl md:text-4xl' : 'text-4xl md:text-6xl',
      emoji: isDense ? 'text-3xl' : 'text-5xl'
    };
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col overflow-hidden relative">
      
      {/* Botón pantalla completa (oculto si ya está full) */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="absolute top-4 right-4 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-3 py-1 rounded shadow-lg z-50 opacity-50 hover:opacity-100 transition-opacity"
        >
          🖥 Pantalla Completa
        </button>
      )}

      {/* Encabezado Compacto (h-auto para que no ocupe de más) */}
      <div className="text-center py-4 border-b-2 border-yellow-400 bg-gray-900 z-20 shadow-md flex-shrink-0">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-1 leading-tight">
          GANADORES
        </h1>
        <div className="text-xl md:text-2xl font-bold text-white leading-tight">
          {draw.edition?.name?.toUpperCase() || 'GRAN TÓMBOLA'}
        </div>
        <div className="text-lg text-gray-400">
            {dayjs.utc(draw.drawDate).format('DD [de] MMMM [de] YYYY')}
        </div>
      </div>

      {/* Contenedor Principal: Usa flex-1 para ocupar el espacio restante y justify-evenly para distribuir */}
      {winners.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-3xl text-gray-500 animate-pulse">
            Esperando ganadores...
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center px-4 md:px-12 py-2 gap-3 overflow-hidden">
          {winners.map((prize) => {
            const styles = getStyles(prize.position);
            
            return (
              <div
                key={prize._id}
                // Transition all para que el cambio de tamaño sea suave si cambia en vivo
                className={`transition-all duration-500 rounded-xl flex items-center px-4 ${styles.container}`}
              >
                {/* 1. Emoji y Título */}
                <div className="w-24 md:w-32 text-center border-r border-white/20 pr-4 flex-shrink-0">
                  <div className={`${styles.emoji} mb-1`}>
                    {getPositionEmoji(prize.position)}
                  </div>
                  <div className="text-xs md:text-sm font-bold tracking-wider opacity-90">
                    {getPositionText(prize.position)}
                  </div>
                </div>

                {/* 2. Información Central (Flexible) */}
                <div className="flex-1 grid grid-cols-10 gap-2 pl-4 items-center">
                  
                  {/* Número de Cartón */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs uppercase text-white/70 mb-0">Cartón</div>
                    <div className={`${styles.textNumber} font-black leading-none tracking-tighter`}>
                      {prize.bingoCard?.number?.toString().padStart(4, '0')}
                    </div>
                  </div>

                  {/* Asociado (Más espacio) */}
                  <div className="col-span-5 text-left border-l border-white/10 pl-4"> 
                    <div className={`${styles.textName} font-bold leading-none truncate`}>
                      {prize.sale?.client?.person?.lastName?.toUpperCase()}, {prize.sale?.client?.person?.firstName}
                    </div>
                    {/* Vendedor chiquito abajo del nombre para ahorrar espacio horizontal */}
                    <div className="text-xl text-white/60 mt-1 truncate">
                      Vendedor: {prize.sale?.seller?.person?.lastName} {prize.sale?.seller?.person?.firstName}
                    </div>
                  </div>

                  {/* Premio (Derecha) */}
                  <div className="col-span-3 text-right">
                     {prize.description && (
                        <div className={`${styles.textPrize} font-bold text-[#FFD700] leading-none truncate`}>
                          {prize.description}
                        </div>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barra fija de auspiciantes (Estándar TV 12vh) */}
      <footer className="relative h-[12vh] bg-white flex items-center justify-center px-6 flex-shrink-0 border-t-4 border-[#FFD700]">
        <div className="absolute -top-7 left-6 bg-orange-500 text-white text-xs font-black tracking-widest uppercase px-4 py-1 rounded-t-lg shadow-md">
          AUSPICIAN:
        </div>
        <img
          src={auspiciantesImg}
          alt="Auspiciantes Oficiales"
          className="max-h-[9.5vh] w-auto object-contain"
        />
      </footer>
    </div>
  );
}

export default DrawWinnersDisplayPage;