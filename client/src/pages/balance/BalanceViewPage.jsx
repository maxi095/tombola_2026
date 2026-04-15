import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ReactDOMServer from "react-dom/server";

dayjs.extend(utc);
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Ban,
  CheckCircle,
  Link2,
  User,
  FileText,
  Calendar,
  Banknote,
  CreditCard,
  BookOpen,
  AlertCircle,
  RefreshCw,
  FileDown,
} from "lucide-react";

import { useBalance } from "../../context/BalanceContext";
import BalanceReceipt from "../../components/BalanceReceipt";

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n || 0);

function DetailRow({ icon: Icon, label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400 mt-0.5 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-slate-800 mt-0.5 ${mono ? "font-mono" : "font-medium"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function AmountRow({ label, value, accent }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${accent}`}>{fmt(value)}</span>
    </div>
  );
}

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
      margin:      0.5,
      filename:    `${docName}_${txLabel}.pdf`,
      image:       { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF:       { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().from(htmlString).set(opt).save();
  };

  if (loading) {
    return (
      <div className="page-wide flex items-center justify-center py-24 text-slate-400">
        <RefreshCw size={28} className="animate-spin mr-3" /> Cargando movimiento...
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className="page-wide flex flex-col items-center gap-4 py-24 text-slate-400">
        <AlertCircle size={36} />
        <p>{error}</p>
        <button onClick={() => navigate("/balance")} className="btn-secondary">
          Volver al Balance
        </button>
      </div>
    );
  }

  const isIngreso = balance.type === "Ingreso";
  const isAnulado = balance.status === "Anulado";
  const prefix = isIngreso ? "I" : "E";
  const txLabel = `${prefix}-${String(balance.transactionNumber).padStart(3, "0")}`;

  const accentBg     = isIngreso ? "bg-emerald-600" : "bg-rose-600";
  const accentLight  = isIngreso ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100";
  const accentText   = isIngreso ? "text-emerald-700" : "text-rose-700";
  const accentIcon   = isIngreso ? <TrendingUp size={20} /> : <TrendingDown size={20} />;

  const sellerPersonName = (u) => {
    if (!u) return "-";
    return u.person
      ? `${u.person.firstName} ${u.person.lastName}`
      : u.username || u.email || "-";
  };

  return (
    <div className="page-wide max-w-2xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="header-bar mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/balance")}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="title">Movimiento {txLabel}</h1>
              {isAnulado && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600">
                  <Ban size={11} /> Anulado
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              {balance.edition?.name || "Sin edición"}
            </p>
          </div>
        </div>

        {!isAnulado && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="btn-secondary flex items-center gap-1.5"
            >
              <FileDown size={14} />
              {balance.type === "Ingreso" ? "Descargar Recibo" : "Descargar Orden de Pago"}
            </button>
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="btn-cancel flex items-center gap-1.5"
            >
              <Ban size={14} />
              {canceling ? "Anulando..." : "Anular"}
            </button>
          </div>
        )}
        {isAnulado && (
          <button
            onClick={handleDownloadPdf}
            className="btn-secondary flex items-center gap-1.5"
          >
            <FileDown size={14} />
            {balance.type === "Ingreso" ? "Descargar Recibo" : "Descargar Orden de Pago"}
          </button>
        )}
      </div>

      {/* ── Banner de tipo ───────────────────────────────────────────────── */}
      <div
        className={`rounded-2xl border px-6 py-5 flex items-center gap-4 mb-6 ${
          isAnulado ? "bg-slate-100 border-slate-200" : `${accentLight}`
        }`}
      >
        <div
          className={`p-3 rounded-xl text-white ${isAnulado ? "bg-slate-400" : accentBg}`}
        >
          {accentIcon}
        </div>
        <div className="flex-1">
          <p className={`text-xs font-bold uppercase tracking-widest ${isAnulado ? "text-slate-400" : accentText}`}>
            {balance.type}
          </p>
          <p className={`text-3xl font-extrabold mt-0.5 ${isAnulado ? "text-slate-400 line-through" : accentText}`}>
            {fmt(balance.totalAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Categoría</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5">{balance.category}</p>
        </div>
      </div>

      {/* ── Detalle del movimiento ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-50 mb-6">
        <div className="px-6 py-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Datos del movimiento
          </h2>
        </div>
        <div className="px-6 py-2">
          <DetailRow icon={FileText} label={isIngreso ? "Recibimos de" : "A la orden de"} value={balance.counterpart} />
          <DetailRow icon={BookOpen} label="En concepto de" value={balance.concept} />
          <DetailRow icon={Calendar} label="Fecha" value={dayjs.utc(balance.date).format("DD/MM/YYYY")} />
          {balance.observations && (
            <DetailRow icon={FileText} label="Observaciones" value={balance.observations} />
          )}
          {balance.sellerPaymentRef && (
            <DetailRow
              icon={Link2}
              label="Rendición de vendedor vinculada"
              value={`Pago N° ${balance.sellerPaymentRef.sellerPaymentNumber}`}
            />
          )}
        </div>
      </div>

      {/* ── Medios de pago ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Medios de pago
          </h2>
        </div>
        <div className="px-6 py-4 space-y-1">
          <AmountRow label="💵 Efectivo" value={balance.cashAmount} accent="text-slate-700" />
          <AmountRow label="🏦 Transferencia" value={balance.transferAmount} accent="text-slate-700" />
          <AmountRow label="📝 Cheques" value={balance.checkAmount} accent="text-slate-700" />

          {balance.checks?.length > 0 && (
            <div className="mt-3 space-y-2">
              {balance.checks.map((c, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs text-slate-600">
                  <span className="font-bold text-slate-400 mr-2">Cheque #{i + 1}</span>
                  N°<span className="font-mono ml-1">{c.checkNumber}</span>
                  {" — "}{c.bank} / {c.branch}
                  {" — "}{dayjs(c.date).format("DD/MM/YYYY")}
                  {" — "}<span className="font-bold text-slate-700">{fmt(c.amount)}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`mt-4 rounded-xl px-4 py-3 flex items-center justify-between border ${isAnulado ? "bg-slate-50 border-slate-200" : accentLight}`}>
            <span className="text-sm font-semibold text-slate-500">TOTAL</span>
            <span className={`text-2xl font-extrabold ${isAnulado ? "text-slate-400 line-through" : accentText}`}>
              {fmt(balance.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Auditoría ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Auditoría
          </h2>
        </div>
        <div className="px-6 py-2">
          <DetailRow
            icon={User}
            label="Creado por"
            value={`${sellerPersonName(balance.createdBy)} · ${dayjs(balance.createdAt).format("DD/MM/YYYY HH:mm")}`}
          />
          {isAnulado && (
            <DetailRow
              icon={Ban}
              label="Anulado por"
              value={`${sellerPersonName(balance.canceledBy)} · ${dayjs(balance.canceledAt).format("DD/MM/YYYY HH:mm")}`}
            />
          )}
        </div>
      </div>

      {/* ── Error inline ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mt-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
}
