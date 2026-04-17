import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ReactDOMServer from "react-dom/server";

dayjs.extend(utc);

import {
  TrendingUp,
  TrendingDown,
  Ban,
  Link2,
  User,
  FileText,
  Calendar,
  BookOpen,
  AlertCircle,
  RefreshCw,
  FileDown,
  Banknote,
  Repeat2,
  ClipboardList,
  Tag,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { useBalance } from "../../context/BalanceContext";
import BalanceReceipt from "../../components/BalanceReceipt";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import InfoItem from "../../components/ui/InfoItem";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatCurrency } from "../../libs/formatters";

/**
 * BalanceViewPage v2.0 - Elite Audit 2026 💎🚀
 * Vista de detalle 360° para movimientos de balance.
 * Estándar: PageHeader con acciones, banner hero de tipo/monto,
 * componentes reutilizables (Card, InfoItem, Badge, Button, formatCurrency).
 */
export default function BalanceViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBalanceById, cancelBalance } = useBalance();

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getBalanceById(id);
        setBalance(data);
      } catch {
        setError("No se pudo cargar el movimiento.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("¿Confirmar anulación de este movimiento?")) return;
    setCanceling(true);
    try {
      const updated = await cancelBalance(id);
      setBalance(updated);
    } catch (err) {
      setError(err?.response?.data?.message || "Error al anular.");
    } finally {
      setCanceling(false);
    }
  };

  const handleDownloadPdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const isIngreso = balance.type === "Ingreso";
    const txLabel = `${isIngreso ? "I" : "E"}-${String(balance.transactionNumber).padStart(3, "0")}`;
    const docName = isIngreso ? "Recibo" : "OrdenDePago";

    const htmlString = ReactDOMServer.renderToString(
      <BalanceReceipt balance={balance} />
    );

    const opt = {
      margin: 0.5,
      filename: `${docName}_${txLabel}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(htmlString).set(opt).save();
  };

  // ── Estados de carga ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw size={36} className="animate-spin text-primary" />
        <p className="text-slate-400 font-bold animate-pulse">Cargando movimiento...</p>
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-slate-400">
        <AlertCircle size={36} />
        <p className="font-bold">{error}</p>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate("/balance")}>
          Volver al Balance
        </Button>
      </div>
    );
  }

  // ── Derivaciones semánticas ───────────────────────────────────────────────
  const isIngreso = balance.type === "Ingreso";
  const isAnulado = balance.status === "Anulado";
  const prefix = isIngreso ? "I" : "E";
  const txLabel = `${prefix}-${String(balance.transactionNumber).padStart(3, "0")}`;

  // Paleta según tipo × estado (usada en total de medios de pago)
  const heroBg = isAnulado ? "bg-slate-100 border-slate-200" : isIngreso ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200";
  const heroAmount = isAnulado ? "text-slate-400 line-through" : isIngreso ? "text-emerald-700" : "text-rose-700";
  const TypeIcon = isIngreso ? TrendingUp : TrendingDown;

  const totalVariant = isAnulado ? "secondary" : isIngreso ? "success" : "danger";

  const sellerPersonName = (u) => {
    if (!u) return "-";
    return u.person
      ? `${u.person.firstName} ${u.person.lastName}`
      : u.username || u.email || "-";
  };

  // ── Variante KPI según tipo × estado ────────────────────────────────────
  const kpiVariant = isAnulado ? "slate" : isIngreso ? "success" : "danger";

  // ── Acciones para PageHeader ──────────────────────────────────────────────
  const headerActions = [
    {
      label: "Volver",
      icon: ArrowLeft,
      variant: "ghost",
      onClick: () => navigate("/balance"),
    },
    {
      label: balance.type === "Ingreso" ? "Descargar Recibo" : "Descargar Orden de Pago",
      icon: FileDown,
      variant: "outline",
      onClick: handleDownloadPdf,
    },
    ...(!isAnulado
      ? [{
        label: canceling ? "Anulando..." : "Anular",
        icon: Ban,
        variant: "danger",
        loading: canceling,
        onClick: handleCancel,
      }]
      : []),
  ];

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700 bg-slate-50/10 min-h-screen pb-20">

      {/* ── PageHeader Elite ─────────────────────────────────────────────── */}
      <PageHeader
        title={`Movimiento ${txLabel}`}
        //subtitle={balance.edition?.name || "Sin edición"}
        compact={true}
        breadcrumbs={[
          { label: "Balance", href: "/balance" },
          { label: "Detalle" },
        ]}
        stats={[
          {
            label: balance.type,
            value: formatCurrency(balance.totalAmount),
            icon: TypeIcon,
            variant: kpiVariant,
          },
        ]}
        actions={headerActions}
      />

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* Error inline */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Badge de anulado (solo cuando aplica, sin hero card) */}
        {isAnulado && (
          <div className="flex">
            <Badge variant="danger">
              <Ban size={10} className="mr-1" /> Anulado
            </Badge>
          </div>
        )}

        {/* ── Datos del movimiento ─────────────────────────────────────── */}
        <Card
          title="Datos del Movimiento"
          icon={ClipboardList}
          size="slim"
          hover={false}
          className="border-slate-200/60 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem icon={isIngreso ? User : User} label={isIngreso ? "Recibimos de" : "A la orden de"}>
              {balance.counterpart || "—"}
            </InfoItem>

            <InfoItem icon={BookOpen} label="En concepto de">
              {balance.concept || "—"}
            </InfoItem>

            <InfoItem icon={Calendar} label="Fecha">
              {dayjs.utc(balance.date).format("DD/MM/YYYY")}
            </InfoItem>

            <InfoItem icon={Tag} label="Categoría">
              {balance.category || "—"}
            </InfoItem>

            {balance.sellerPaymentRef && (
              <InfoItem icon={Link2} label="Rendición de vendedor vinculada">
                {`Pago N° ${balance.sellerPaymentRef.sellerPaymentNumber}`}
              </InfoItem>
            )}

            {balance.observations && (
              <InfoItem icon={FileText} label="Observaciones" className="sm:col-span-2">
                {balance.observations}
              </InfoItem>
            )}
          </div>
        </Card>

        {/* ── Medios de pago ────────────────────────────────────────────── */}
        <Card
          title="Medios de Pago"
          icon={Banknote}
          size="slim"
          hover={false}
          className="border-slate-200/60 shadow-sm"
        >
          <div className="space-y-1">
            {/* Filas de medios */}
            {balance.cashAmount > 0 && (
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span></span> Efectivo
                </div>
                <span className="text-sm font-bold text-slate-700">{formatCurrency(balance.cashAmount)}</span>
              </div>
            )}
            {balance.transferAmount > 0 && (
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span></span> Transferencia
                </div>
                <span className="text-sm font-bold text-slate-700">{formatCurrency(balance.transferAmount)}</span>
              </div>
            )}
            {balance.tarjetaUnicaAmount > 0 && (
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  💳 Tarjeta Única
                </div>
                <span className="text-sm font-bold text-slate-700">{formatCurrency(balance.tarjetaUnicaAmount)}</span>
              </div>
            )}
            {balance.checkAmount > 0 && (
              <div className="flex items-center justify-between py-2.5 border-b border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span>📝</span> Cheques
                </div>
                <span className="text-sm font-bold text-slate-700">{formatCurrency(balance.checkAmount)}</span>
              </div>
            )}

            {/* Detalle de cheques */}
            {balance.checks?.length > 0 && (
              <div className="mt-3 space-y-2">
                {balance.checks.map((c, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600">
                    <span className="font-black text-slate-400 mr-2">Cheque #{i + 1}</span>
                    N°<span className="font-mono ml-1">{c.checkNumber}</span>
                    {" — "}{c.bank} / {c.branch}
                    {" — "}{dayjs(c.date).format("DD/MM/YYYY")}
                    {" — "}<span className="font-bold text-slate-700">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fila total destacada */}
            <div className={`mt-4 rounded-xl px-5 py-3.5 flex items-center justify-between border ${heroBg}`}>
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Total</span>
              <span className={`text-2xl font-black font-manrope tracking-tighter ${heroAmount}`}>
                {formatCurrency(balance.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        {/* ── Auditoría ─────────────────────────────────────────────────── */}
        <Card
          title="Auditoría"
          icon={ShieldCheck}
          size="slim"
          hover={false}
          className="border-slate-200/60 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InfoItem icon={User} label="Creado por">
              {sellerPersonName(balance.createdBy)}
            </InfoItem>
            <InfoItem icon={Calendar} label="Fecha de creación">
              {dayjs(balance.createdAt).format("DD/MM/YYYY HH:mm")}
            </InfoItem>

            {isAnulado && (
              <>
                <InfoItem icon={Ban} label="Anulado por">
                  {sellerPersonName(balance.canceledBy)}
                </InfoItem>
                <InfoItem icon={Calendar} label="Fecha de anulación">
                  {dayjs(balance.canceledAt).format("DD/MM/YYYY HH:mm")}
                </InfoItem>
              </>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
