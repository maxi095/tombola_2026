import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";

import { useBalance } from "../../context/BalanceContext";
import { useEditionFilter } from "../../context/EditionFilterContext";
import { useEditions } from "../../context/EditionContext";

// ─── Constantes ───────────────────────────────────────────────────────────────
const INCOME_CATEGORIES = [
  "Rendición de Vendedor",
  "Publicidad / Sponsoring",
  "Venta Directa",
  "Donación",
  "Otro Ingreso",
];
const EXPENSE_CATEGORIES = [
  "Sueldo / Honorario",
  "Impuesto Lotería",
  "Premio de Sorteo",
  "Proveedor de Servicio",
  "Impresión de Cartones",
  "Publicidad",
  "Otro Egreso",
];

const EMPTY_CHECK = { checkNumber: "", bank: "", branch: "", date: "", amount: "" };

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(n || 0);

export default function BalanceFormPage() {
  const navigate = useNavigate();
  const { createBalance } = useBalance();
  const { selectedEdition } = useEditionFilter();
  const { editions } = useEditions();

  // ─── Estado del form ────────────────────────────────────────────────────
  const [type, setType]   = useState("Ingreso");
  const [form, setForm]   = useState({
    edition:       selectedEdition || "",
    date:          dayjs().format("YYYY-MM-DD"),
    counterpart:   "",
    concept:       "",
    category:      "",
    cashAmount:    "",
    transferAmount: "",
    observations:  "",
  });
  const [checks, setChecks]     = useState([]);
  const [showChecks, setShowChecks] = useState(false);
  const [error, setError]       = useState("");
  const [saving, setSaving]     = useState(false);

  // Sincronizar edición cuando cambia el filtro global
  useEffect(() => {
    if (selectedEdition) {
      setForm((prev) => ({ ...prev, edition: selectedEdition }));
    }
  }, [selectedEdition]);

  // Reset categoría al cambiar tipo
  useEffect(() => {
    setForm((prev) => ({ ...prev, category: "" }));
  }, [type]);

  // ─── Totales en tiempo real ─────────────────────────────────────────────
  const checkTotal = checks.reduce((s, c) => s + Number(c.amount || 0), 0);
  const grandTotal =
    Number(form.cashAmount || 0) +
    Number(form.transferAmount || 0) +
    checkTotal;

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCheck = () => setChecks((prev) => [...prev, { ...EMPTY_CHECK }]);
  const removeCheck = (i) => setChecks((prev) => prev.filter((_, idx) => idx !== i));
  const updateCheck = (i, field, value) =>
    setChecks((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.edition) {
      setError("Debe seleccionar una edición.");
      return;
    }
    if (!form.counterpart.trim()) {
      setError(`Debe completar el campo "${type === "Ingreso" ? "Recibimos de" : "A la orden de"}".`);
      return;
    }
    if (!form.concept.trim()) {
      setError("Debe completar el concepto.");
      return;
    }
    if (!form.category) {
      setError("Debe seleccionar una categoría.");
      return;
    }
    if (grandTotal <= 0) {
      setError("Debe ingresar al menos un monto mayor a cero.");
      return;
    }

    // Validar cheques completos
    for (let i = 0; i < checks.length; i++) {
      const c = checks[i];
      if (!c.checkNumber || !c.bank || !c.branch || !c.date || !c.amount) {
        setError(`Cheque #${i + 1}: complete todos los campos.`);
        return;
      }
    }

    try {
      setSaving(true);
      await createBalance({
        edition:       form.edition,
        type,
        date:          form.date,
        counterpart:   form.counterpart.trim(),
        concept:       form.concept.trim(),
        category:      form.category,
        cashAmount:    Number(form.cashAmount || 0),
        transferAmount: Number(form.transferAmount || 0),
        checks:        checks.map((c) => ({ ...c, amount: Number(c.amount) })),
        observations:  form.observations.trim(),
      });
      navigate("/balance");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Error al guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Clases dinámicas según tipo ─────────────────────────────────────────
  const isIngreso = type === "Ingreso";
  const accentBg      = isIngreso ? "bg-emerald-600" : "bg-rose-600";
  const accentHover   = isIngreso ? "hover:bg-emerald-700" : "hover:bg-rose-700";
  const accentRing    = isIngreso ? "ring-emerald-200" : "ring-rose-200";
  const accentLight   = isIngreso ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100";
  const accentText    = isIngreso ? "text-emerald-700" : "text-rose-700";

  return (
    <div className="page-wide max-w-3xl mx-auto">
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
            <h1 className="title">Nuevo movimiento de Balance</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Registrá un ingreso o egreso para esta edición
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Toggle Ingreso / Egreso ──────────────────────────────────── */}
        <div className="flex rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setType("Ingreso")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all duration-200
              ${isIngreso
                ? "bg-emerald-600 text-white shadow-inner"
                : "bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
          >
            <TrendingUp size={18} />
            Ingreso
          </button>
          <button
            type="button"
            onClick={() => setType("Egreso")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all duration-200 border-l border-slate-200
              ${!isIngreso
                ? "bg-rose-600 text-white shadow-inner"
                : "bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-700"
              }`}
          >
            <TrendingDown size={18} />
            Egreso
          </button>
        </div>

        {/* ── Campos principales ───────────────────────────────────────── */}
        <div className={`rounded-2xl border p-6 space-y-4 ${accentLight}`}>
          {/* Edición */}
          <div className="form-group">
            <label className="form-label">Edición</label>
            <select
              className="form-input"
              name="edition"
              value={form.edition}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar edición...</option>
              {editions?.map((ed) => (
                <option key={ed._id} value={ed._id}>{ed.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contraparte */}
          <div className="form-group">
            <label className="form-label">
              {isIngreso ? "Recibimos de" : "A la orden de"}
            </label>
            <input
              type="text"
              className="form-input"
              name="counterpart"
              placeholder={isIngreso ? "Nombre o razón social del pagador" : "Beneficiario del pago"}
              value={form.counterpart}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          {/* Concepto */}
          <div className="form-group">
            <label className="form-label">En concepto de</label>
            <input
              type="text"
              className="form-input"
              name="concept"
              placeholder="Descripción del movimiento"
              value={form.concept}
              onChange={handleChange}
              required
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label className="form-label">
              {isIngreso ? "Tipo de ingreso" : "Tipo de egreso"}
            </label>
            <select
              className="form-input"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría...</option>
              {(isIngreso ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Medios de pago ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
            Medios de pago
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Efectivo</label>
              <input
                type="number"
                className="form-input"
                name="cashAmount"
                placeholder="0.00"
                min={0}
                step="0.01"
                value={form.cashAmount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transferencia</label>
              <input
                type="number"
                className="form-input"
                name="transferAmount"
                placeholder="0.00"
                min={0}
                step="0.01"
                value={form.transferAmount}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Cheques */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowChecks((v) => !v);
                if (!showChecks && checks.length === 0) addCheck();
              }}
              className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              {showChecks ? "Ocultar cheques" : `Agregar cheques${checks.length > 0 ? ` (${checks.length})` : ""}`}
            </button>

            {showChecks && (
              <div className="mt-3 space-y-3">
                {checks.map((c, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Cheque #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCheck(i)}
                        className="text-rose-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label text-xs">N° Cheque</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Número"
                          value={c.checkNumber}
                          onChange={(e) => updateCheck(i, "checkNumber", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">Banco</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Banco emisor"
                          value={c.bank}
                          onChange={(e) => updateCheck(i, "bank", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">Sucursal</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Sucursal"
                          value={c.branch}
                          onChange={(e) => updateCheck(i, "branch", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">Fecha del cheque</label>
                        <input
                          type="date"
                          className="form-input"
                          value={c.date}
                          onChange={(e) => updateCheck(i, "date", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="form-label text-xs">Monto</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.00"
                          min={0}
                          step="0.01"
                          value={c.amount}
                          onChange={(e) => updateCheck(i, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCheck}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} /> Agregar otro cheque
                </button>
              </div>
            )}
          </div>

          {/* Total en tiempo real */}
          <div
            className={`ml-auto rounded-xl px-5 py-3 flex items-center justify-between border ${
              grandTotal > 0
                ? `${accentLight} border-l-4 ${isIngreso ? "border-l-emerald-500" : "border-l-rose-500"}`
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-sm font-semibold text-slate-500">TOTAL</span>
            <span className={`text-2xl font-extrabold ${grandTotal > 0 ? accentText : "text-slate-300"}`}>
              {fmt(grandTotal)}
            </span>
          </div>
        </div>

        {/* ── Observaciones ────────────────────────────────────────────── */}
        <div className="form-group">
          <label className="form-label">Observaciones (opcional)</label>
          <textarea
            className="form-input"
            name="observations"
            rows={3}
            placeholder="Notas adicionales sobre este movimiento..."
            value={form.observations}
            onChange={handleChange}
          />
        </div>

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ── Acciones ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/balance")}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm
              ${accentBg} ${accentHover} ring-offset-1 ${accentRing}
              disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar movimiento"}
          </button>
        </div>
      </form>
    </div>
  );
}
