import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDraws } from '../../context/DrawContext';
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

  // Lógica de Colores (Violetas)
  const getStyles = (position) => {
    if (position === 1) {
      // Violeta oscuro, borde dorado, más grande
      return {
        container: 'bg-violet-900 border-2 border-yellow-400 z-10 scale-105 shadow-2xl py-4', // py-4 para dar aire
        textTitle: 'text-yellow-400',
        textNumber: 'text-6xl',
        textName: 'text-5xl',
        emoji: 'text-6xl'
      };
    } else {
      // Violeta un poco más claro, tamaño estándar
      return {
        container: 'bg-violet-600/90 border border-violet-500 scale-100 shadow-lg py-3', // py-3 un poco más compacto
        textTitle: 'text-white',
        textNumber: 'text-5xl',
        textName: 'text-3xl',
        emoji: 'text-5xl'
      };
    }
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
                      <>
                        
                        <div className={`${prize.position === 1 ? 'text-7xl' : 'text-6xl'} font-bold text-yellow-400 leading-none`}>
                          {prize.description}
                        </div>
                      </>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer minimalista */}
      <div className="text-center py-2 border-t border-gray-800 text-gray-500 text-xs flex-shrink-0 bg-gray-900">
        Club Atlético y Biblioteca Newell's Old Boys - Laguna Larga
      </div>
    </div>
  );
}

export default DrawWinnersDisplayPage;