import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSellers } from "../../context/SellerContext";
import { useSales } from "../../context/SaleContext";
import { useQuotas } from "../../context/QuotaContext";
import { useBingoCards } from "../../context/BingoCardContext";
import { useSellerPayments } from "../../context/SellerPaymentContext";
import SellerPaymentReceipt from "../../components/SellerPaymentReceipt"; 
import ReactDOMServer from "react-dom/server";

import dayjs from "dayjs";

import AssignBingoCardsModal from "../../components/AssignBingoCardsModal"; // o la ruta correcta

import { useEditionFilter } from "../../context/EditionFilterContext";


function SellerViewPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { getSeller } = useSellers();
  const { getSalesBySeller } = useSales();
  const { getQuotasBySale } = useQuotas();
  const { getSellerPaymentsBySeller, cancelSellerPayment } = useSellerPayments();

  const [seller, setSeller] = useState(null);
  const [sales, setSales] = useState([]);
  const [sellerPayments, setSellerPayments] = useState([]);
  const [quotasBySale, setQuotasBySale] = useState({});
  const [loading, setLoading] = useState(true);

    // Estados filtrados
  const [fBingoCards, setFBingoCards] = useState([]);
  const [fSales, setFSales] = useState([]);
  const [fSellerPayments, setFSellerPayments] = useState([]);
  const [fQuotasBySale, setFQuotasBySale] = useState({});

  const { getBingoCardsBySeller, removeSellerFromBingoCard } = useBingoCards();
  const [bingoCards, setBingoCards] = useState([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { selectedEdition } = useEditionFilter();
  const [filteredDetail, setFilteredDetail] = useState([]);

  const [filterBingoCard, setFilterBingoCardNumber] = useState("");

  const handleNuevaVenta = (sellerId) => {
    navigate(`/sale/new?sellerId=${sellerId}`);
  };

  useEffect(() => {
    const loadSellerData = async () => {
      try {
        const cards = await getBingoCardsBySeller(id);
        setBingoCards(cards); // actualizás el estado local

        const sellerData = await getSeller(id);
        setSeller(sellerData);

        const salesData = await getSalesBySeller(id);
        setSales(salesData);

        const paymentsData = await getSellerPaymentsBySeller(id);
        setSellerPayments(paymentsData);

        const quotasArray = await Promise.all(
          salesData.map((sale) => getQuotasBySale(sale._id))
        );

        const quotasMap = {};
        salesData.forEach((sale, index) => {
          quotasMap[sale._id] = quotasArray[index];
        });

        setQuotasBySale(quotasMap);
      } catch (error) {
        console.error("Error cargando los datos del vendedor:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSellerData();
  }, [id]);

  useEffect(() => {
    if (loading) return; // Esperamos a que termine la carga inicial

    // 1. Filtrar bingoCards
    const bc = selectedEdition
      ? bingoCards.filter(c => c.edition?._id === selectedEdition)
      : bingoCards;
    setFBingoCards(bc);

    // 2. Filtrar sales
    const sl = selectedEdition
      ? sales.filter(s => s.edition?._id === selectedEdition)
      : sales;
    setFSales(sl);

    // 3. Filtrar payments
    const pm = selectedEdition
      ? sellerPayments.filter(p => p.edition?._id === selectedEdition)
      : sellerPayments;
    setFSellerPayments(pm);

    // 4. Reconstruir mapa de cuotas sólo para las ventas filtradas
    const qm = {};
    sl.forEach(sale => {
      qm[sale._id] = quotasBySale[sale._id] || [];
    });
    setFQuotasBySale(qm);

  }, [selectedEdition, loading, bingoCards, sales, sellerPayments, quotasBySale]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab") || "general";
    setActiveTab(tab);
  }, [location.search]);


  const updateBingoCards = async () => {
    const cards = await getBingoCardsBySeller(id);
    setBingoCards(cards);  // actualiza el estado de bingoCards con los cartones actualizados
  };

  const handleBack = () => navigate(-1);

  if (loading) return <p className="text-center mt-10 text-gray-500">Cargando vendedor...</p>;
  if (!seller) return <p className="text-center mt-10 text-red-500">No se encontró el vendedor.</p>;

  const commissionRate = seller.commissionRate || 0;

  let totalPagado = 0;
for (const [saleId, quotas] of Object.entries(fQuotasBySale)) {
  // Buscar la venta correspondiente
  const sale = fSales.find(s => s._id === saleId);
  
  // Solo sumar si la venta existe y NO está anulada
  if (sale && sale.status !== "Anulada") {
    totalPagado += quotas.reduce(
      (acc, q) => acc + (q.paymentDate ? q.amount : 0),
      0
    );
  }
}

    const getAmount = (payment) => 
    (payment.cashAmount || 0) +
    (payment.transferAmount || 0) +
    (payment.tarjetaUnicaAmount || 0) +
    (payment.checkAmount || 0);

  const totalPagosVendedorActivos = fSellerPayments
    .filter((payment) => payment.status !== "Anulado")
    .reduce((acc, payment) => acc + getAmount(payment), 0);


  const totalComisiones = fSellerPayments
    .filter((payment) => payment.status !== "Anulado")
    .reduce((acc, payment) => acc + (payment.commissionAmount ?? 0), 0);

  const filteredSales = fSales.filter(sale => {
    const filterNumber =
      filterBingoCard === "" ||
      String(sale.bingoCard?.number || "") === filterBingoCard;

      const filterStatus = sale.status !== "Anulada";

    return filterNumber && filterStatus;
  });


    const handleCancel = async (paymentId) => {
      const confirm = window.confirm("¿Estás seguro de anular este pago?");
      if (confirm) {
        try {
          await cancelSellerPayment(paymentId);
          const updatedPayments = await getSellerPaymentsBySeller(id); // ← usamos el id del vendedor
          setSellerPayments(updatedPayments);
        } catch (error) {
          console.error("Error al anular el pago:", error);
        }
      }
    };

    const handleRemoveSeller = async (id) => {
      const confirm = window.confirm("¿Estás seguro de desasociar este cartón?");
      if (confirm) {
        try {
          // Llama a la función para desasociar el cartón
          await removeSellerFromBingoCard(id);
          // Actualiza los cartones después de la desasociación (puedes ajustar esto según tu necesidad)
          await updateBingoCards(); 
        } catch (error) {
          console.error("Error al desasociar el cartón:", error);
        }
      }
    };
  
    const handleDownloadReceipt = async (payment) => {
      const html2pdf = (await import("html2pdf.js")).default;

      const htmlString = ReactDOMServer.renderToString(
        <SellerPaymentReceipt payment={payment} seller={seller} />
      );
    
      const opt = {
        margin:       0.5,
        filename:     `Recibo_Pago_${payment.sellerPaymentNumber || "sin-numero"}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
    
      html2pdf().from(htmlString).set(opt).save();
    };

    return (
      <div className="page-wide">
        <h1 className="title mb-4">Detalle del vendedor {seller.person?.firstName} {seller.person?.lastName}</h1>
  
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b">
          <button
            className={`px-4 py-2 ${activeTab === "general" ? "border-b-4 border-blue-500 font-semibold" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("general");
              searchParams.set("tab", "general");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
          >
            General
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "cartones" ? "border-b-4 border-blue-500 font-semibold" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("cartones");
              searchParams.set("tab", "cartones");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
          >
            Cartones
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "ventas" ? "border-b-4 border-blue-500 font-semibold" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("ventas");
              searchParams.set("tab", "ventas");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
          >
            Ventas realizadas
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "pagos" ? "border-b-4 border-blue-500 font-semibold" : "text-gray-500"}`}
            onClick={() => {
              setActiveTab("pagos");
              searchParams.set("tab", "pagos");
              navigate(`${location.pathname}?${searchParams.toString()}`);
            }}
          >
            Pagos del vendedor
          </button>
        </div>
  
        {/* GENERAL */}
        {activeTab === "general" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow">
              <p><span className="font-semibold">Nombre:</span> {seller.person?.firstName} {seller.person?.lastName}</p>
              <p><span className="font-semibold">Documento:</span> {seller.person?.document}</p>
              <p><span className="font-semibold">Teléfono:</span> {seller.person?.phone}</p>
              <p><span className="font-semibold">Comisión actual:</span> {commissionRate}%</p>
            </div>
  
            <h3 className="title mt-10 mb-4">Resumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow">
              <p><span className="font-semibold">Total pagos vendedores:</span> ${totalPagosVendedorActivos.toFixed(2)}</p>
              <p><span className="font-semibold">Total comisiones:</span> ${totalComisiones.toFixed(2)}</p>
              <p><span className="font-semibold">Conciliación ventas:</span> ${totalPagado.toFixed(2)}</p>
            </div>
          </>
        )}

        {activeTab === "cartones" && (
          <>
            {/* Botón visible SIEMPRE */}
            <div className="flex justify-end mb-4">
              <button
                className="btn-primary"
                onClick={() => setIsAssignModalOpen(true)}
              >
                Relacionar Cartón
              </button>
            </div>

            {/* Mensaje o tabla según si hay cartones */}
            {fBingoCards.length === 0 ? (
              <p className="sub-title mt-10 mb-4">Este vendedor no tiene cartones asignados.</p>
            ) : (
              <>
                {/* Contador de registros */}
                <div className="record-count">
                  Mostrando <strong>{fBingoCards.length}</strong> cartones
                </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-cell">Edición</th>
                      <th className="table-cell">N° cartón</th>
                      <th className="table-cell">Estado</th>
                      <th className="table-cell">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fBingoCards.map((card) => (
                      <tr key={card._id} className="border-t hover:bg-gray-50">
                        <td className="table-cell">{card.edition?.name || "N/A"}</td>
                        <td className="table-cell">{card.number}</td>
                        <td className="table-cell">{card.status}</td>
                        <td className="table-cell">
                         {/* Botón de desasociar */}
                          <button
                            onClick={() => handleRemoveSeller(card._id)}
                            className="btn-anular"
                          >
                            Desasociar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}

            {/* Modal */}
            <AssignBingoCardsModal
              isOpen={isAssignModalOpen}
              onClose={() => {
                setIsAssignModalOpen(false);
                updateBingoCards(); // actualizar los cartones después de cerrar el modal
              }}
              sellerId={seller?._id}
            />
          </>
        )}

  
        {/* VENTAS REALIZADAS */}
        {activeTab === "ventas" && (
          <>
            {/* Filtros + botón */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                <div className="flex gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Buscar por N° de cartón"
                    value={filterBingoCard}
                    onChange={(e) => setFilterBingoCardNumber(e.target.value)}
                    className="form-input"
                  />
                </div>

                <button
                  onClick={() => navigate(`/sale/new?sellerId=${id}&tab=ventas`)}
                  className="btn-primary mb-3"
                >
                  Nueva venta
                </button>
              </div>

            {/* Si no hay ventas después del filtro */}
            {filteredSales.length === 0 ? (
              <p className="sub-title mt-10 mb-4">No hay ventas registradas.</p>
            ) : (
              <>
                <div className="record-count">
                  Mostrando <strong>{filteredSales.length}</strong> ventas
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead className="table-head">
                      <tr>
                        <th className="table-cell">Edición</th>
                        <th className="table-cell">Cartón</th>
                        <th className="table-cell">Asociado</th>
                        <th className="table-cell">Fecha de venta</th>
                        <th className="table-cell">Estado</th>
                        <th className="table-cell">Cuotas Pagas</th>
                        <th className="table-cell">Total Pagado</th>
                        <th className="table-cell">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSales
                        .slice()
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((sale) => {
                          const quotas = quotasBySale[sale._id] || [];
                          const pagado = quotas.reduce(
                            (acc, q) => acc + (q.paymentDate ? q.amount : 0),
                            0
                          );
                          const cuotasPagas = quotas.filter(q => q.paymentDate).length;
                          return (
                            <tr key={sale._id} className="border-t hover:bg-gray-50">
                              <td className="table-cell">{sale.edition?.name || "N/A"}</td>
                              <td className="table-cell">{sale.bingoCard?.number || "N/A"}</td>
                              <td className="table-cell">
                                {sale.client?.person?.firstName} {sale.client?.person?.lastName}
                              </td>
                              <td className="table-cell">
                                {dayjs.utc(sale.saleDate).format("DD/MM/YYYY") || "N/A"}
                              </td>
                              <td className="table-cell">
                                <span
                                  className={`status-label ${
                                    sale.status === "Anulada" ? "status-anulada" : 
                                    sale.status === "Pendiente de pago" ? "status-pendiente" : 
                                    sale.status === "Pagado" ? "status-confirmada" : "status-sin-cargo"
                                  }`}
                                >
                                  {sale.status}
                                </span>
                              </td>
                              <td className="table-cell">{cuotasPagas}</td>
                              <td className="table-cell">${pagado.toFixed(2)}</td>
                              <td className="table-cell">
                                <button
                                  onClick={() => navigate(`/sale/view/${sale._id}`)}
                                  className="btn-view"
                                >
                                  Ver detalle
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
  
        {/* PAGOS DEL VENDEDOR */}
        {activeTab === "pagos" && (
          <>
            {fSellerPayments.length === 0 ? (
              <p className="sub-title mt-10 mb-4">No hay pagos registrados para este vendedor.</p>
            ) : (
              <>
                {/* Contador de registros */}
                <div className="record-count">
                  Mostrando <strong>{fSellerPayments.length}</strong> pagos
                </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead className="table-head">
                    <tr>
                      <th className="table-cell">Nro Pago</th>
                      <th className="table-cell">Edición</th>
                      <th className="table-cell">Subtotal</th>
                      <th className="table-cell">Comisión</th>
                      <th className="table-cell">Total</th>
                      <th className="table-cell">Fecha</th>
                      <th className="table-cell">Estado</th>
                      <th className="table-cell">Notas</th>
                      <th className="table-cell">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fSellerPayments.map((payment) => (
                      <tr key={payment._id} className="border-t hover:bg-gray-50">
                        <td className="table-cell">{payment.sellerPaymentNumber || "Sin número"}</td>
                        <td className="table-cell">{payment.edition?.name || "N/A"}</td>
                        <td className="table-cell">${getAmount(payment).toFixed(2)}</td>
                        <td className="table-cell">${(payment.commissionAmount ?? 0).toFixed(2)}</td>
                        <td className="table-cell">${(getAmount(payment) - (payment.commissionAmount || 0)).toFixed(2)}</td>
                        <td className="table-cell">{dayjs(payment.date).format("DD/MM/YYYY")}</td>
                        <td className="table-cell">
                          {payment.status === "Anulado" ? (
                            <span className="text-red-600 font-semibold">
                              Anulado
                              <br />
                              <span className="text-xs">
                                por {payment.canceledBy?.person?.firstName} {payment.canceledBy?.person?.lastName} el{" "}
                                {dayjs(payment.canceledAt).format("DD/MM/YYYY")}
                              </span>
                            </span>
                          ) : (
                            "Activo"
                          )}
                        </td>
                        <td className="table-cell">{payment.observations || "-"}</td>
                        <td className="table-cell text-gray-400 italic">
                          <button
                            onClick={() => handleDownloadReceipt(payment)}
                            className="text-blue-600 underline mr-2"
                          >
                            Descargar recibo
                          </button>
                          {payment.status === "Activo" ? (
                            <button
                              onClick={() => handleCancel(payment._id)}
                              className="btn-anular"
                            >
                              Anular
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin acciones</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </>
        )}
  
        {/* Botón volver */}
        <div className="mt-6">
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
  export default SellerViewPage;
