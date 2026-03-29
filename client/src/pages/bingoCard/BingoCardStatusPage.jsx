import { useEffect, useState } from 'react';
import { useBingoCards } from '../../context/BingoCardContext';
import { useEditions } from '../../context/EditionContext';

function BingoCardStatusPage() {
  const { getBingoCardStatus } = useBingoCards();
  const { getEditions, editions } = useEditions();
  const [editionId, setEditionId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


  useEffect(() => {
    getEditions();
  }, [getEditions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    setLoading(true);

    try {
      const data = await getBingoCardStatus(editionId, cardNumber);
      console.log(data);
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
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
  

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-10 relative overflow-auto">

  {/* Botón para activar pantalla completa */}
  {!isFullscreen && (
    <button
      onClick={enterFullscreen}
      className="absolute top-6 right-6 bg-yellow-400 hover:bg-yellow-300 text-black text-xl font-bold px-5 py-3 rounded-xl shadow-lg z-50"
    >
      🖥 Pantalla completa
    </button>
  )}

  <h1 className="text-6xl font-bold text-green-400 mb-10 text-center">
    Estado del Cartón
  </h1>

  <form
    onSubmit={handleSubmit}
    className="flex flex-wrap justify-center gap-6 w-full max-w-6xl mb-10"
  >
    <div className="flex flex-col w-full md:w-1/3">
      <label className="text-3xl mb-2">Edición</label>
      <select
        className="text-black text-2xl p-3 rounded-lg"
        value={editionId}
        onChange={e => setEditionId(e.target.value)}
        required
      >
        <option value="">-- Seleccionar edición --</option>
        {editions.map(e => (
          <option key={e._id} value={e._id}>{e.name}</option>
        ))}
      </select>
    </div>

    <div className="flex flex-col w-full md:w-1/3">
      <label className="text-3xl mb-2">Número de Cartón</label>
      <input
        type="number"
        className="text-black text-2xl p-3 rounded-lg"
        value={cardNumber}
        onChange={e => setCardNumber(e.target.value)}
        placeholder="Ej: 123"
        required
      />
    </div>

    <div className="flex items-end w-full md:w-auto">
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white text-3xl font-bold px-6 py-4 rounded-lg shadow-lg w-full"
        disabled={loading}
      >
        {loading ? 'Consultando...' : 'Consultar'}
      </button>
    </div>
  </form>

  {error && (
    <div className="bg-red-600 px-6 py-4 text-3xl font-bold rounded-lg max-w-4xl text-center">
      ⚠️ {error}
    </div>
  )}

  {result && (
    <div
      className={`mt-10 p-10 rounded-3xl shadow-2xl text-center w-full max-w-6xl text-white text-4xl font-bold transition-all duration-500 ${
        !result.sold
          ? 'bg-gray-700'
          : !result.upToDate
          ? 'bg-red-600'
          : 'bg-green-600'
      }`}
    >
      {!result.sold ? (
        <p>❌ El cartón {result.bingoCardNumber} no ha sido vendido.</p>
      ) : !result.upToDate ? (
        <p>⚠️ El cartón {result.bingoCardNumber} tiene deuda.</p>
      ) : (
        <>
          <p className="text-5xl mb-8">• Cartón N° {result.bingoCardNumber} •</p>
          <p className="mb-6">Asociado N°: {result.clientNumber}</p>
          <p className="mb-6 text-5xl">Asociado: {result.client}</p>
          <p className="mb-6">Vendedor: {result.seller}</p>

          {/* Mostrar el plan */}
          <p className="mb-6">Plan: {result.plan}</p>

          {/* Si el plan es CUOTA, mostrar si está al día 
          {result.plan === 'CUOTA' && (
            <p className={`mt-4 ${result.quotaUpToDate ? 'text-white' : 'text-red-600'}`}>
              {result.quotaUpToDate ? 'Cuota al día' : 'Cuota vencida'}
            </p>
          )}
            */}
        </>
      )}
    </div>
  )}
</div>

  );
}

export default BingoCardStatusPage;
