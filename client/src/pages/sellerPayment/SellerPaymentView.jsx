import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSellerPayments } from "../../context/SellerPaymentContext";
import dayjs from "dayjs";

export default function SellerPaymentDetailPage() {
  const params = useParams();
  const { getSellerPaymentById, updateSellerPayment } = useSellerPayments();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commissionType, setCommissionType] = useState("Efectivo");
  const [editingCommission, setEditingCommission] = useState(false);
  
  const [observationText, setObservationText] = useState("");
  const [editingObservation, setEditingObservation] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {

      if (!params.id) return;

      try {
        const paymentData = await getSellerPaymentById(params.id);
        setPayment(paymentData);
        setCommissionType(paymentData.commissionType || "Efectivo");
        setObservationText(paymentData.observations || "");
      } catch (error) {
        console.error("Error al cargar el pago:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();
  }, [params.id, getSellerPaymentById]);

  const handleBack = () => {
    window.history.back();
  };

const handleSaveCommissionType = async () => {
try {
    const updated = await updateSellerPayment(payment._id, { commissionType });
    setPayment(updated); // actualiza vista con lo nuevo
    setEditingCommission(false);
} catch (error) {
    console.error("Error al actualizar tipo de comisión:", error);
}
};

const handleSaveObservation = async () => {
  try {
    const updated = await updateSellerPayment(payment._id, { observations: observationText });
    setPayment(updated); // actualiza vista
    setEditingObservation(false);
  } catch (error) {
    console.error("Error al actualizar observaciones:", error);
  }
};


  if (loading) return <p className="page-wide">Cargando...</p>;
  if (!payment) return <p className="page-wide">No se encontró el pago.</p>;

  const {
    edition,
    seller,
    cashAmount = 0,
    transferAmount = 0,
    tarjetaUnicaAmount = 0,
    checkAmount = 0,
    checks = [],
    commissionRate = 0,
    commissionAmount = 0,
    date,
    observations = "",
    status = "Activo",
  } = payment;

  const total = cashAmount + transferAmount + tarjetaUnicaAmount + checkAmount
  const subtotal = total - commissionAmount

  return (
    <div className="page-wide">
      <h1 className="title mb-4">Detalle de Pago de Vendedor</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 mb-8">
        <div>
          <p><span className="font-semibold">Edición:</span> {edition?.name || "N/A"}</p>
          <p><span className="font-semibold">N° vendedor:</span> {seller?.sellerNumber}</p>
          
        </div>
        <div>
          <p><span className="font-semibold">N° pago:</span> {payment?.sellerPaymentNumber}</p>
          <p><span className="font-semibold">Vendedor:</span> {seller?.person?.firstName} {seller?.person?.lastName || "N/A"}</p>
        </div>
        <div>
          <p><span className="font-semibold">Estado:</span> {status}</p>
          <p><span className="font-semibold">Fecha:</span> {dayjs.utc(date).format("DD/MM/YYYY")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-100 p-4 rounded shadow mb-6">
        <p><strong>Efectivo:</strong> ${cashAmount.toLocaleString('es-AR')}</p>
        <p><strong>Transferencia:</strong> ${transferAmount.toLocaleString('es-AR')}</p>
        <p><strong>Tarjeta Única:</strong> ${tarjetaUnicaAmount.toLocaleString('es-AR')}</p>
        <p><strong>Cheques:</strong> ${checkAmount.toLocaleString('es-AR')}</p>
      </div>

      {checks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Cheques</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2">N°</th>
                  <th className="px-4 py-2">Banco</th>
                  <th className="px-4 py-2">Plaza</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{check.checkNumber}</td>
                    <td className="px-4 py-2">{check.bank}</td>
                    <td className="px-4 py-2">{check.branch}</td>
                    <td className="px-4 py-2">{dayjs.utc(check.date).format("DD/MM/YYYY")}</td>
                    <td className="px-4 py-2">${check.amount.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 bg-gray-100 p-4 rounded shadow mb-6">
        <p><strong>Total recibo:</strong> ${total.toLocaleString('es-AR')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-100 p-4 rounded shadow mb-6">
        <div>
          <p><strong>Porcentaje Comisión:</strong> {commissionRate}%</p>
          <p><strong>Monto Comisión:</strong> ${commissionAmount.toLocaleString('es-AR')}</p>
        </div>

        {commissionAmount > 0 && (
            <div>
                <label className="font-semibold block mb-1">Tipo de pago de comisión</label>

                {!editingCommission ? (
                <div className="flex items-center justify-between">
                    <p>{commissionType}</p>
                    <button
                    onClick={() => setEditingCommission(true)}
                    className="btn-secondary text-sm"
                    >
                    Editar tipo comisión
                    </button>
                </div>
                ) : (
                <>
                    <div className="flex gap-4 mb-2">
                    <label className="inline-flex items-center">
                        <input
                        type="radio"
                        value="Efectivo"
                        checked={commissionType === "Efectivo"}
                        onChange={() => setCommissionType("Efectivo")}
                        className="mr-2"
                        />
                        Efectivo
                    </label>
                    <label className="inline-flex items-center">
                        <input
                        type="radio"
                        value="Transferencia"
                        checked={commissionType === "Transferencia"}
                        onChange={() => setCommissionType("Transferencia")}
                        className="mr-2"
                        />
                        Transferencia
                    </label>
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={handleSaveCommissionType}
                        className="btn-primary text-sm"
                    >
                        Guardar
                    </button>
                    <button
                        onClick={() => {
                        setCommissionType(payment.commissionType); // volver al original
                        setEditingCommission(false);
                        }}
                        className="btn-secondary text-sm"
                    >
                        Cancelar
                    </button>
                    </div>
                </>
                )}
            </div>
        )}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 bg-gray-100 p-4 rounded shadow mb-6">
        <p><strong>Subtotal:</strong> ${subtotal.toLocaleString('es-AR')}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <label className="font-semibold block mb-2">Observaciones</label>

        {!editingObservation ? (
          <div className="flex items-start justify-between">
            <p className="whitespace-pre-wrap">{observations || "Sin observaciones"}</p>
            <button
              onClick={() => setEditingObservation(true)}
              className="btn-secondary text-sm ml-4"
            >
              Editar observación
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded p-2 mb-2"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveObservation} className="btn-primary text-sm">
                Guardar
              </button>
              <button
                onClick={() => {
                  setObservationText(observations);
                  setEditingObservation(false);
                }}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>


      <div className="mt-6">
        <button onClick={handleBack} className="btn-view">
          Volver
        </button>
      </div>
    </div>
  );
}
