import { useEffect, useState, useRef } from 'react';
import { useBingoCards } from '../../context/BingoCardContext';
import { useEditions } from '../../context/EditionContext';
import confetti from 'canvas-confetti';
import LogoTombola from '../../assets/images/Logo-Tombola.png';
import Auspiciantes from '../../assets/images/auspiciantes.png';

function BingoCardStatusPage() {
  const { getBingoCardStatus } = useBingoCards();
  const { getEditions, editions } = useEditions();
  const [editionId, setEditionId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'searching' | 'winner' | 'not-sold' | 'debt' | 'not-full-paid'
  const [drawMode, setDrawMode] = useState('cuota'); // 'cuota' | 'contado'
  const [sparkles, setSparkles] = useState([]);

  const inputRef = useRef(null);

  useEffect(() => {
    getEditions();
  }, [getEditions]);

  // Autoseleccionar la primera edición disponible si no hay una seleccionada
  useEffect(() => {
    if (editions.length > 0 && !editionId) {
      setEditionId(editions[0]._id);
    }
  }, [editions, editionId]);

  // Autofoco en el input de número de cartón al cargar la página o al limpiar la consulta
  useEffect(() => {
    if (gameState === 'idle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    // Generar destellos dorados en el fondo al montar
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 8 + 4}s`
    }));
    setSparkles(generated);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);
    setGameState('searching');

    try {
      const data = await getBingoCardStatus(editionId, cardNumber);
      console.log(data);
      setResult(data);
      if (!data.sold) {
        setGameState('not-sold');
      } else if (!data.upToDate) {
        setGameState('debt');
      } else if (drawMode === 'contado' && data.plan !== 'Pago contado') {
        setGameState('not-full-paid');
      } else {
        setGameState('winner');
      }
    } catch (err) {
      setError(err.message || String(err));
      setGameState('idle');
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

  // Efecto para lanzar fuegos artificiales continuos cuando hay un ganador
  useEffect(() => {
    let interval;
    if (gameState === 'winner') {
      const duration = 12 * 1000; // 12 segundos de fuegos artificiales
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      // Disparo inicial
      confetti({ ...defaults, particleCount: 80, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...defaults, particleCount: 80, origin: { x: 0.8, y: 0.5 } });

      interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState]);

  return (
    <div className="w-full h-screen overflow-hidden radial-vibrant-bg text-white flex flex-col justify-between relative select-none">
      <style>{`
        .radial-vibrant-bg {
          background: radial-gradient(circle at center, #ff7a00 0%, #b80f0a 100%);
        }

        @keyframes sparkle-blink {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5) translateY(0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.3) translateY(-15px);
          }
        }

        .animate-sparkle {
          animation: sparkle-blink linear infinite;
        }

        @keyframes gentle-pulse {
          0%, 100% {
            transform: scale(1) translateY(0);
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
          }
          50% {
            transform: scale(1.03) translateY(-6px);
            filter: drop-shadow(0 15px 20px rgba(0, 0, 0, 0.35));
          }
        }

        @keyframes anxiety-shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-2px, -1px) rotate(-1.5deg); }
          20% { transform: translate(-1px, 2px) rotate(1.5deg); }
          30% { transform: translate(3px, 1px) rotate(-0.5deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1.5deg); }
          60% { transform: translate(-3px, 1px) rotate(0.5deg); }
          70% { transform: translate(2px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1.5deg); }
          90% { transform: translate(1px, 2px) rotate(0.5deg); }
        }

        @keyframes winner-jump {
          0%, 100% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-20px) scale(1.1); }
          50% { transform: translateY(3px) scale(0.97); }
          75% { transform: translateY(-8px) scale(1.03); }
        }

        @keyframes gold-glow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.6));
          }
        }

        .logo-idle {
          animation: gentle-pulse 4s ease-in-out infinite;
        }

        .logo-searching {
          animation: anxiety-shake 0.1s linear infinite;
        }

        .logo-winner {
          animation: winner-jump 1.1s ease-in-out infinite, gold-glow 1.8s ease-in-out infinite;
        }

        .premium-winner-card {
          border: 4px solid #FFD700;
          background: linear-gradient(135deg, #1e0b36 0%, #110426 50%, #1f083d 100%);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.25);
        }

        .winner-title-glow {
          font-family: 'Manrope', sans-serif;
          font-weight: 900;
          color: #FFFFFF;
          text-shadow: 
            -2px -2px 0 #000,  
             2px -2px 0 #000,
            -2px  2px 0 #000,
             2px  2px 0 #000,
             0px  4px 8px rgba(0, 0, 0, 0.9),
             0px  0px 20px rgba(255, 215, 0, 0.8);
        }

        .cartel-winner-animate {
          animation: slide-up-fade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Capa de destellos dorados en el fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {sparkles.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-yellow-300 opacity-0 animate-sparkle"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
              boxShadow: '0 0 10px rgba(253, 224, 71, 0.8), 0 0 4px rgba(253, 224, 71, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Panel de Control Superior Oculto (Hover-Activated) */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-black/90 backdrop-blur-md translate-y-[-88%] hover:translate-y-0 focus-within:translate-y-0 transition-transform duration-300 z-50 flex items-center justify-between px-8 border-b border-yellow-400/30">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1.5">Edición</span>
            <select
              className="text-black text-sm px-3 py-2 rounded-lg border border-gray-300 font-bold focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
              value={editionId}
              onChange={e => setEditionId(e.target.value)}
            >
              <option value="">-- Seleccionar edición --</option>
              {editions.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-1.5">Modalidad del Sorteo</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDrawMode('cuota')}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                  drawMode === 'cuota'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Cuotas al Día
              </button>
              <button
                type="button"
                onClick={() => setDrawMode('contado')}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all ${
                  drawMode === 'contado'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Pago de Contado
              </button>
            </div>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-bold italic animate-pulse">
          Desliza el mouse aquí arriba para configurar ↑
        </span>
      </div>

      {/* Botón para activar pantalla completa */}
      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-yellow-400 hover:bg-yellow-300 text-black text-sm md:text-lg font-black px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-[0_4px_20px_rgba(250,204,21,0.3)] transition-all transform hover:scale-105 active:scale-95 z-50 cursor-pointer"
        >
          🖥 PANTALLA COMPLETA
        </button>
      )}

      {/* Bloque Central (logo y tarjeta) - Centrado en el espacio restante */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-4 overflow-hidden z-10">
        
        {/* Indicador de Modalidad de Sorteo Activa en el Vivo */}
        <div className="mb-4 text-center">
          <p className="text-yellow-400 font-black tracking-widest text-lg md:text-2xl uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            SORTEO {drawMode === 'cuota' ? 'CUOTAS AL DÍA' : 'PAGO DE CONTADO'} {editions.find(e => e._id === editionId) && ` - ${editions.find(e => e._id === editionId).name}`}
          </p>
          <div className="h-1 w-24 bg-yellow-400 mx-auto mt-1 rounded-full shadow-lg"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-7xl h-full">

          {/* Lado izquierdo: Contenedor del Logo con brillo radial detrás */}
          <div className="flex-1 md:flex-[0.8] flex flex-col items-center justify-center relative w-full py-4 md:py-0">
            <div className={`absolute w-72 h-72 md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] rounded-full blur-3xl opacity-30 transition-all duration-1000 ${gameState === 'winner' ? 'bg-yellow-400 opacity-60 scale-125 animate-pulse' :
              gameState === 'searching' ? 'bg-amber-500 opacity-50 animate-ping' : 'bg-yellow-500 opacity-30'
              }`}></div>

            <img
              src={LogoTombola}
              alt="Logo Tombola"
              className={`w-64 h-64 md:w-96 md:h-96 lg:w-[480px] lg:h-[480px] object-contain max-h-[40vh] md:max-h-[70vh] z-10 select-none ${gameState === 'searching' ? 'logo-searching' :
                gameState === 'winner' ? 'logo-winner' : 'logo-idle'
                }`}
            />
          </div>

          {/* Lado derecho: Formulario o tarjeta correspondiente */}
          <div className="flex-grow flex-1 md:flex-[1.2] flex flex-col justify-center items-center w-full max-w-xl md:max-w-3xl lg:max-w-4xl py-4 md:py-0">
            {/* Formulario de búsqueda (Solo si no hay resultado cargado) */}
            {!result && (
              <form
                onSubmit={handleSubmit}
                className="bg-black/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl flex flex-col justify-center gap-5 w-full shadow-2xl transition-all duration-500"
              >
                <div className="flex flex-col w-full">
                  <label className="text-base md:text-lg font-bold text-gray-200 mb-1.5 uppercase tracking-wide">Número de Solicitud</label>
                  <input
                    type="number"
                    ref={inputRef}
                    className="text-black text-lg p-3 md:p-4 rounded-xl border border-gray-300 font-semibold focus:ring-4 focus:ring-yellow-400 outline-none transition-all w-full text-center"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="Escribe el número aquí y pulsa Enter"
                    required
                  />
                </div>

                <div className="flex items-end w-full mt-2">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-300 text-black text-xl md:text-2xl font-black px-6 py-3 md:px-8 md:py-4 rounded-xl shadow-lg hover:shadow-yellow-400/20 w-full transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? 'BUSCANDO...' : 'CONSULTAR'}
                  </button>
                </div>
              </form>
            )}

            {error && (
              <div className="bg-red-950/80 border border-red-500 text-red-200 px-6 py-4 text-xl md:text-2xl font-bold rounded-2xl w-full text-center shadow-lg my-4 animate-bounce">
                ⚠️ {error}
              </div>
            )}

            {/* Cartel Violeta de Ganador */}
            {result && gameState === 'winner' && (
              <div
                className="p-5 md:p-6 rounded-[32px] premium-winner-card text-center w-full text-white transition-all duration-500 cartel-winner-animate relative overflow-hidden flex flex-col justify-between max-h-[75vh]"
              >
                {/* Destello decorativo */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-2 md:mb-3 animate-pulse winner-title-glow">
                    ¡GANADOR!
                  </h2>

                  <div className="bg-black/40 py-2.5 px-6 md:py-3.5 md:px-8 rounded-2xl inline-block mb-2.5 border border-white/10 shadow-inner w-full">
                    <p className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-widest leading-none">
                      SOLICITUD N° {result.bingoCardNumber?.toString().padStart(4, '0')}
                    </p>
                  </div>

                  <div className="space-y-2.5 md:space-y-3.5 text-left w-full border-t border-b border-white/10 py-3 my-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-[#FFD700] text-sm md:text-base lg:text-lg uppercase tracking-widest font-black flex-shrink-0">Asociado:</span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-white sm:text-right break-words max-w-full drop-shadow-sm leading-tight">
                        {result.client?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-2">
                      <span className="text-[#FFD700] text-sm md:text-base uppercase tracking-wider font-black flex-shrink-0">Vendedor:</span>
                      <span className="text-lg md:text-xl font-black text-white text-right break-words pl-2 max-w-[70%]">
                        {result.seller?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setGameState('idle');
                      setCardNumber('');
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black text-lg md:text-2xl font-black px-8 py-3.5 rounded-2xl shadow-[0_4px_25px_rgba(255,215,0,0.3)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider border-none"
                  >
                    NUEVA CONSULTA
                  </button>
                </div>
              </div>
            )}

            {/* Cartel de No Vendido */}
            {result && gameState === 'not-sold' && (
              <div
                className="p-6 md:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl text-center w-full text-white transition-all duration-500 cartel-winner-animate max-h-[75vh] flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl md:text-5xl mb-3">❌</div>
                  <h2 className="text-2xl md:text-3xl font-black text-red-400 mb-3 uppercase tracking-wider">
                    No participa
                  </h2>
                  <p className="text-base md:text-lg text-gray-300 mb-4 leading-relaxed">
                    La solicitud N° <strong className="text-white text-lg md:text-xl font-black">{result.bingoCardNumber}</strong> no ha sido registrada como vendida.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setResult(null);
                      setGameState('idle');
                      setCardNumber('');
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white text-base md:text-lg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    NUEVA CONSULTA
                  </button>
                </div>
              </div>
            )}

            {/* Cartel de Cuotas Pendientes (Antigua Deuda) */}
            {result && gameState === 'debt' && (
              <div
                className="p-6 md:p-8 rounded-3xl border border-yellow-500/50 bg-amber-950/80 backdrop-blur-md shadow-2xl text-center w-full text-white transition-all duration-500 cartel-winner-animate max-h-[75vh] flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl md:text-5xl mb-3">⚠️</div>
                  <h2 className="text-2xl md:text-3xl font-black text-yellow-500 mb-3 uppercase tracking-wider">
                    No participa
                  </h2>
                  <p className="text-base md:text-lg text-gray-200 mb-4">
                    La solicitud N° <strong className="text-white text-lg md:text-xl font-black">{result.bingoCardNumber}</strong> presenta cuotas pendientes de pago.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setResult(null);
                      setGameState('idle');
                      setCardNumber('');
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black text-base md:text-lg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    NUEVA CONSULTA
                  </button>
                </div>
              </div>
            )}

            {/* Cartel de Pago de Contado Incompleto */}
            {result && gameState === 'not-full-paid' && (
              <div
                className="p-6 md:p-8 rounded-3xl border border-orange-500/50 bg-orange-950/80 backdrop-blur-md shadow-2xl text-center w-full text-white transition-all duration-500 cartel-winner-animate max-h-[75vh] flex flex-col justify-between"
              >
                <div>
                  <div className="text-4xl md:text-5xl mb-3">⚠️</div>
                  <h2 className="text-2xl md:text-3xl font-black text-orange-400 mb-3 uppercase tracking-wider">
                    No participa
                  </h2>
                  <p className="text-base md:text-lg text-gray-200 mb-4 leading-relaxed">
                    La solicitud N° <strong className="text-white text-lg md:text-xl font-black">{result.bingoCardNumber}</strong> está al día con sus cuotas, pero no ha sido cancelada en su totalidad.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setResult(null);
                      setGameState('idle');
                      setCardNumber('');
                    }}
                    className="bg-orange-500 hover:bg-orange-400 text-black text-base md:text-lg font-bold px-6 py-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    NUEVA CONSULTA
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Barra Fija de Auspiciantes */}
      <div className="w-full h-[16vh] bg-white flex items-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] select-none border-t border-gray-200">
        {/* Tira de Logos de Auspiciantes */}
        <div className="flex-grow h-full flex items-center justify-center px-6 overflow-hidden bg-white">
          <img
            src={Auspiciantes}
            alt="Auspiciantes"
            className="h-full max-h-[95%] object-contain select-none filter drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default BingoCardStatusPage;
