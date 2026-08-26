import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSellerPayments } from "../../context/SellerPaymentContext";
import { useFeedback } from "../../context/FeedbackContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Infraestructura Premium 2026 🔱
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  AmountCell,
  OperationCell,
  UserCell
} from "../../components/ui/Table";
import {
  Wallet,
  CreditCard,
  X,
  Calendar,
  Clipboard,
  MessageSquare,
  Edit2,
  Save,
  CheckCircle,
  TrendingUp,
  Percent
} from "lucide-react";

dayjs.extend(utc);

export default function SellerPaymentDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { getSellerPaymentById, updateSellerPayment } = useSellerPayments();
  const { showToast } = useFeedback();
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

  const handleSaveCommissionType = async () => {
    try {
      const updated = await updateSellerPayment(payment._id, { commissionType });
      setPayment(updated);
      setEditingCommission(false);
      showToast("Tipo de comisión actualizado con éxito", "success");
    } catch (error) {
      console.error("Error al actualizar tipo de comisión:", error);
      showToast("Error al actualizar tipo de comisión", "error");
    }
  };

  const handleSaveObservation = async () => {
    try {
      const updated = await updateSellerPayment(payment._id, { observations: observationText });
      setPayment(updated);
      setEditingObservation(false);
      showToast("Observaciones actualizadas con éxito", "success");
    } catch (error) {
      console.error("Error al actualizar observaciones:", error);
      showToast("Error al actualizar observaciones", "error");
    }
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center gap-6 bg-slate-50/50 min-h-screen">
        <p className="text-[11px] font-black text-muted tracking-widest uppercase animate-pulse">Cargando detalle del pago...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="py-40 flex flex-col items-center gap-6 bg-slate-50/50 min-h-screen">
        <p className="text-[11px] font-black text-red-500 tracking-widest uppercase">No se encontró el registro de pago.</p>
        <Button onClick={() => navigate("/sellerPayments")}>Volver a la Lista</Button>
      </div>
    );
  }

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

  const total = cashAmount + transferAmount + tarjetaUnicaAmount + checkAmount;
  const netTotal = total - commissionAmount;

  return (
    <div className="flex flex-col px-12 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen pb-12">
      <PageHeader
        title={`Pago de Vendedor #${payment.sellerPaymentNumber || "N/A"}`}
        compact={true}
        breadcrumbs={[
          { label: "Pagos de Vendedores", href: "/sellerPayments" },
          { label: "Detalle" }
        ]}
        actions={[
          {
            label: "Volver",
            icon: X,
            variant: "ghost",
            onClick: () => navigate("/sellerPayments")
          }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
        
        {/* COLUMNA IZQUIERDA: RESUMEN Y DETALLES GENERALES (2 Cols de ancho en desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* CARD 1: DETALLES DE AUDITORÍA */}
          <Card
            size="slim"
            title="Datos del Registro"
            icon={Clipboard}
            description="Información general y estado contable"
            className="shadow-premium border-slate-200/60 bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Edición Activa</span>
                  <span className="text-sm font-bold text-primary uppercase">{edition?.name || "Global"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vendedor</span>
                  <UserCell
                    name={`${seller?.person?.lastName}, ${seller?.person?.firstName}`}
                    variant="secondary"
                    className="p-0 border-0 bg-transparent"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fecha de Rendición</span>
                    <span className="text-sm font-bold text-slate-700">{dayjs.utc(date).format("DD/MM/YYYY")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado</span>
                    <Badge variant={status === "Activo" ? "success" : "danger"}>
                      {status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registrado Por</span>
                  <span className="text-xs font-bold text-slate-600">
                    {payment.createdBy?.person
                      ? `${payment.createdBy.person.lastName}, ${payment.createdBy.person.firstName}`
                      : "Sistema"}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 2: CHEQUES */}
          <Card
            size="slim"
            title="Cheques de Terceros"
            icon={CreditCard}
            description="Cheques detallados en esta rendición"
            className="shadow-premium border-slate-200/60 bg-white"
          >
            {checks.length === 0 ? (
              <div className="py-10 text-center text-slate-300 italic text-xs uppercase tracking-wider font-bold">
                No se registraron cheques en este pago.
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <Table>
                  <THead>
                    <TH>N° Cheque</TH>
                    <TH>Banco Emisor</TH>
                    <TH>Plaza</TH>
                    <TH>Fecha Cobro</TH>
                    <TH className="text-right">Importe</TH>
                  </THead>
                  <TBody>
                    {checks.map((check, i) => (
                      <TR key={i}>
                        <TD className="text-xs font-black text-primary">{check.checkNumber}</TD>
                        <TD className="text-xs font-bold text-slate-600">{check.bank}</TD>
                        <TD className="text-xs font-semibold text-slate-500">{check.branch}</TD>
                        <TD className="text-xs font-semibold text-slate-500">
                          {dayjs.utc(check.date).format("DD/MM/YYYY")}
                        </TD>
                        <AmountCell value={check.amount} />
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </Card>
        </div>

        {/* COLUMNA DERECHA: LIQUIDACIÓN Y OBSERVACIONES */}
        <div className="flex flex-col gap-6">
          
          {/* CARD 3: LIQUIDACIÓN FINANCIERA */}
          <Card
            size="slim"
            title="Liquidación"
            icon={Wallet}
            description="Resumen de fondos recibidos"
            className="shadow-premium border-slate-200/60 bg-white"
          >
            <div className="flex flex-col gap-4 p-2">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Efectivo</span>
                <span className="text-sm font-black text-primary">${cashAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Transferencia</span>
                <span className="text-sm font-black text-primary">${transferAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tarjeta Única</span>
                <span className="text-sm font-black text-primary">${tarjetaUnicaAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cheques</span>
                <span className="text-sm font-black text-primary">${checkAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-slate-50 px-4 rounded-xl mt-2">
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Subtotal Rendido</span>
                <span className="text-base font-black text-primary">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* COMISIONES Y NETO */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Comisión ({commissionRate}%)</span>
                  <span className="text-sm font-black text-red-600">-${commissionAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {commissionAmount > 0 && (
                  <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex flex-col gap-2.5">
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">Tipo de Pago Comisión</span>
                    {!editingCommission ? (
                      <div className="flex items-center justify-between">
                        <Badge variant={commissionType === "Efectivo" ? "success" : "info"} className="text-xs">
                          {commissionType}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => setEditingCommission(true)}
                          className="h-8 px-2.5 text-[10px]"
                        >
                          Editar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4">
                          <label className="inline-flex items-center text-xs font-bold text-slate-600 uppercase cursor-pointer">
                            <input
                              type="radio"
                              value="Efectivo"
                              checked={commissionType === "Efectivo"}
                              onChange={() => setCommissionType("Efectivo")}
                              className="mr-2 accent-primary"
                            />
                            Efectivo
                          </label>
                          <label className="inline-flex items-center text-xs font-bold text-slate-600 uppercase cursor-pointer">
                            <input
                              type="radio"
                              value="Transferencia"
                              checked={commissionType === "Transferencia"}
                              onChange={() => setCommissionType("Transferencia")}
                              className="mr-2 accent-primary"
                            />
                            Transferencia
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Save}
                            onClick={handleSaveCommissionType}
                            className="h-8 text-[10px] px-3"
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCommissionType(payment.commissionType || "Efectivo");
                              setEditingCommission(false);
                            }}
                            className="h-8 text-[10px] px-3"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-xl mt-2 border border-green-100/30">
                  <span className="text-xs font-black text-green-800 uppercase tracking-wider">Total Neto a Caja</span>
                  <span className="text-base font-black text-green-700">${netTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

            </div>
          </Card>

          {/* CARD 4: OBSERVACIONES */}
          <Card
            size="slim"
            title="Observaciones"
            icon={MessageSquare}
            description="Notas y comentarios del operador"
            className="shadow-premium border-slate-200/60 bg-white"
          >
            <div className="p-2">
              {!editingObservation ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl whitespace-pre-wrap leading-relaxed">
                    {observations || "Sin observaciones registradas."}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => setEditingObservation(true)}
                    className="self-end text-[10px] h-8"
                  >
                    Editar Observación
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={observationText}
                    onChange={(e) => setObservationText(e.target.value)}
                    rows={4}
                    placeholder="Escriba aquí notas aclaratorias sobre este pago..."
                    className="w-full bg-white border border-slate-200/60 shadow-sm rounded-premium-input px-4 py-3 text-xs font-semibold text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary/20 placeholder:text-slate-300 transition-all outline-none duration-300"
                  />
                  <div className="flex gap-2 self-end">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Save}
                      onClick={handleSaveObservation}
                      className="h-8 text-[10px] px-3"
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setObservationText(observations);
                        setEditingObservation(false);
                      }}
                      className="h-8 text-[10px] px-3"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
