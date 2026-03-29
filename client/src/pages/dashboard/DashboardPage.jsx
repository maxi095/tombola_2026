import { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";

import { useEditionFilter } from "../../context/EditionFilterContext";


export default function DashboardCartones() {
  const [editionId, setEditionId] = useState(null);
  const { dashboardData, loading, error, getDashboard } = useDashboard();
  const { selectedEdition } = useEditionFilter();

  const [showRecaudoDetalle, setShowRecaudoDetalle] = useState(false);
  const [showComisionesDetalle, setShowComisionesDetalle] = useState(false);

 
  // Cargar datos del dashboard según edición
  useEffect(() => {
    if (editionId) {
      console.log("Solicitando datos del dashboard para edición:", editionId);
      getDashboard(editionId);
    }
  }, [editionId, getDashboard]);

  useEffect(() => {
  if (selectedEdition) {
    setEditionId(selectedEdition);
  }
}, [selectedEdition]);


  if (loading && !dashboardData) return <p className="p-6">Cargando estadísticas...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  const {
    edition,
    expectedRevenueEdition,
    bingoCards,
    sales,
    quotas,
    sellerPayments
  } = dashboardData || {};

  const cartonesVendidos = bingoCards?.sold || 0;
  const cartonesTotales = bingoCards?.total || 0;
  const cartonesAsignados = bingoCards?.totalAssigned || 0;
  const cartonesPagados = sales?.paid || 0;
  const cartonesSinCargo = sales?.noCharge || 0;
  const cartonesPendientePago = sales?.pending || 0;
  const cuotasVencidas = quotas?.overdue || 0;
  const cuotasPagas = quotas?.paid || 0;
  const dineroCuotasPagas = quotas?.totalPaidAmount || 0;

  const dineroRecaudadoEfectivo = sellerPayments?.cash || 0;
  const dineroRecaudadoTransferencia = sellerPayments?.transfer || 0;
  const dineroRecaudadoCheque = sellerPayments?.check || 0;
  const dineroRecaudadoTarjetaUnica = sellerPayments?.tarjetaUnica || 0;
  const dineroRecaudado = sellerPayments?.total || 0;
  const dineroEsperado = expectedRevenueEdition || 0;
  const comisiones = sellerPayments?.commissions || 0;
  const comisionesEfectivo = sellerPayments?.totalCommissionCash || 0;
  const comisionesTransferencia = sellerPayments?.totalCommissionTransfer || 0;





  return (
    <div className="p-6 max-w-6xl mx-auto">
  <h1 className="text-3xl font-bold mb-6">Dashboard edición: {edition}</h1>

  {editionId && (
    <>
      <section className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Cartones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <KPI title="Total cartones" value={cartonesTotales} color="gray" />
            <KPI title="Asignados" value={cartonesAsignados} color="blue" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KPI
              title="Vendidos"
              value={`${cartonesVendidos} / ${cartonesTotales}`}
              progress={cartonesTotales ? cartonesVendidos / cartonesTotales : 0}
              color="blue"
            />
            <KPI
              title="Pagados"
              value={cartonesPagados}
              color="green"
            />
            <KPI
              title="Entregados sin cargo"
              value={cartonesSinCargo}
              color="yellow"
            />
            <KPI
              title="Pendiente de pago"
              value={cartonesPendientePago}
              color="red"
            />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-1 text-gray-700">Resumen de pagos</h3>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            {/* KPI que se puede expandir */}
            <div onClick={() => setShowRecaudoDetalle(prev => !prev)} className="cursor-pointer">
              <KPI
                title="Recaudado"
                value={`$${dineroRecaudado.toLocaleString()} / ${dineroEsperado.toLocaleString()}`}
                progress={dineroEsperado ? dineroRecaudado / dineroEsperado : 0}
                color="indigo"
              />
            </div>
            {showRecaudoDetalle && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <KPI title="Efectivo" value={`$${dineroRecaudadoEfectivo.toLocaleString()}`} color="green" />
                <KPI title="Transferencia" value={`$${dineroRecaudadoTransferencia.toLocaleString()}`} color="blue" />
                <KPI title="Cheque" value={`$${dineroRecaudadoCheque.toLocaleString()}`} color="gray" />
                <KPI title="Tarjeta única" value={`$${dineroRecaudadoTarjetaUnica.toLocaleString()}`} color="gray" />
              </div>
            )}       
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
            {/* KPI clickeable */}
            <div onClick={() => setShowComisionesDetalle(prev => !prev)} className="cursor-pointer">
              <KPI
                title="Comisiones pagadas"
                value={`$${comisiones.toLocaleString()}`}
                color="yellow"
              />
            </div>
            {/* Detalle expandible */}
            {showComisionesDetalle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <KPI
                  title="Comisión en efectivo"
                  value={`$${comisionesEfectivo.toLocaleString()}`}
                  color="green"
                />
                <KPI
                  title="Comisión por transferencia"
                  value={`$${comisionesTransferencia.toLocaleString()}`}
                  color="blue"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Cuotas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPI title="Total recaudado por cuotas" value={`$${dineroCuotasPagas.toLocaleString()}`} color="green" />
            <KPI title="Cuotas pagas" value={cuotasPagas} color="green" />
            <KPI title="Cuotas vencidas" value={cuotasVencidas} color="red" />
          </div>
        </div>
      </section>
    </>
  )}
</div>
  );

  // Componente KPI
  function KPI({ title, value, progress, color = "gray" }) {
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      indigo: "bg-indigo-500",
      yellow: "bg-yellow-400",
      gray: "bg-gray-400",
    };

    return (
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
        <p className="text-xl font-bold mb-2">{value}</p>
        {progress !== undefined && (
          <div className="w-full bg-gray-200 rounded h-3">
            <div
              className={`h-3 rounded ${colorClasses[color]}`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }
}
