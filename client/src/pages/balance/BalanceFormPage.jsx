import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  FileText,
  CreditCard,
  Settings,
  DollarSign,
  ArrowLeft
} from "lucide-react";

import { useBalance } from "../../context/BalanceContext";
import { useEditionFilter } from "../../context/EditionFilterContext";
import { useEditions } from "../../context/EditionContext";

// Componentes Elite 2026
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import InputField from "../../components/ui/InputField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import FormGrid from "../../components/ui/FormGrid";
import { formatCurrency, cleanCurrencyInput, formatCurrencyInput } from "../../libs/formatters";

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
  "Comisión de Vendedor",
  "Lotería",
  "Compra de premios",
  "Premios contado",
  "Proveedor de Servicio",
  "Publicidad",
  "Otro Egreso",
];

const EMPTY_CHECK = { checkNumber: "", bank: "", branch: "", date: "", amount: "" };

export default function BalanceFormPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { createBalance } = useBalance();
  const { selectedEdition } = useEditionFilter();
  const { editions } = useEditions();

  // ─── Estado del form ────────────────────────────────────────────────────
  const [type, setType] = useState("Ingreso"); // "Ingreso" o "Egreso"
  const [form, setForm] = useState({
    edition: selectedEdition || "",
    date: dayjs().format("YYYY-MM-DD"),
    counterpart: "",
    concept: "",
    category: "",
    cashAmount: "",
    transferAmount: "",
    tarjetaUnicaAmount: "",
    observations: "",
  });
  const [checks, setChecks] = useState([]);
  const [showChecks, setShowChecks] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Sincronizar edición cuando cambia el filtro global
  useEffect(() => {
    if (selectedEdition) {
      setForm((prev) => ({ ...prev, edition: selectedEdition }));
    }
  }, [selectedEdition]);

  // Reset categoría al cambiar tipo
  useEffect(() => {
    setForm((prev) => ({ ...prev, category: "" }));
    setErrors({});
  }, [type]);

  // ─── Totales en tiempo real ─────────────────────────────────────────────
  const checkTotal = useMemo(() => checks.reduce((s, c) => s + Number(c.amount || 0), 0), [checks]);
  const grandTotal = useMemo(() =>
    Number(form.cashAmount || 0) +
    Number(form.transferAmount || 0) +
    Number(form.tarjetaUnicaAmount || 0) +
    checkTotal,
    [form.cashAmount, form.transferAmount, form.tarjetaUnicaAmount, checkTotal]);

  // ─── Tema Dinámico ─────────────────────────────────────────────────────
  const isIngreso = type === "Ingreso";
  const accentColor = isIngreso ? "bg-emerald-600" : "bg-rose-600";
  const accentHover = isIngreso ? "hover:bg-emerald-700" : "hover:bg-rose-700";
  const accentShadow = isIngreso ? "shadow-emerald-200" : "shadow-rose-200";

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si es un campo monetario, limpiamos la entrada antes de guardarla
    if (['cashAmount', 'transferAmount', 'tarjetaUnicaAmount'].includes(name)) {
      const cleanValue = cleanCurrencyInput(value);
      setForm(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const addCheck = () => setChecks((prev) => [...prev, { ...EMPTY_CHECK }]);
  const removeCheck = (i) => setChecks((prev) => prev.filter((_, idx) => idx !== i));
  const updateCheck = (index, field, value) => {
    const newChecks = [...checks];
    if (field === 'amount') {
      newChecks[index][field] = cleanCurrencyInput(value);
    } else {
      newChecks[index][field] = value;
    }
    setChecks(newChecks);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const newErrors = {};

    if (!form.edition) newErrors.edition = "Requerido";
    if (!form.counterpart.trim()) newErrors.counterpart = "Campo obligatorio";
    if (!form.concept.trim()) newErrors.concept = "Concepto requerido";
    if (!form.category) newErrors.category = "Categoría requerida";

    if (grandTotal <= 0) {
      newErrors.amounts = "Ingrese un monto";
    }

    // Validar cheques incompletos
    checks.forEach((c, i) => {
      if (!c.checkNumber || !c.bank || !c.branch || !c.date || !c.amount) {
        newErrors[`check_${i}`] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      await createBalance({
        edition: form.edition,
        type,
        date: form.date,
        counterpart: form.counterpart.trim(),
        concept: form.concept.trim(),
        category: form.category,
        cashAmount: Number(form.cashAmount || 0),
        transferAmount: Number(form.transferAmount || 0),
        tarjetaUnicaAmount: Number(form.tarjetaUnicaAmount || 0),
        checks: checks.map((c) => ({ ...c, amount: Number(c.amount) })),
        observations: form.observations.trim(),
      });
      navigate("/balance");
    } catch (err) {
      console.error(err);
      setErrors({ api: err?.response?.data?.message || "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  // Opciones para los Selects
  const editionOptions = editions?.map(ed => ({ value: ed._id, label: ed.name })) || [];
  const categoryOptions = (isIngreso ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => ({ value: c, label: c }));

  return (
    <div className="flex flex-col px-8 animate-in fade-in duration-700">
      <PageHeader
        title="Registrar Movimiento"
        //subtitle="Gestión administrativa de ingresos y egresos"
        compact={true}
        breadcrumbs={[
          { label: "Balance", href: "/balance" },
          { label: "Registrar", href: "#" }
        ]}
        actions={[
          {
            label: "Volver",
            variant: "ghost",
            icon: ArrowLeft,
            onClick: () => navigate("/balance"),
            className: "text-slate-400 hover:text-slate-700"
          },
          {
            label: saving ? "Guardando..." : "Guardar Movimiento",
            icon: Save,
            loading: saving,
            onClick: () => handleSubmit(),
            className: "shadow-xl"
          }
        ]}
      />

      <div className="w-full mt-0">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 pb-20">
          <Card className="border-slate-200/60 shadow-sm overflow-visible bg-white relative" padding="p-0" size="slim">


            {/* ── HEADER DE TARJETA ── */}
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-6 bg-slate-50/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <Settings size={20} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-primary font-manrope tracking-tight leading-none">Detalle de configuración</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Gestión administrativa de auditoría</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex bg-slate-100/50 rounded-2xl p-1 border border-slate-200/40 w-[380px] shadow-inner">
                  <button
                    type="button"
                    onClick={() => setType("Ingreso")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest
                      ${isIngreso
                        ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-[1.02]"
                        : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50"
                      }`}
                  >
                    <TrendingUp size={14} />
                    Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Egreso")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest
                      ${!isIngreso
                        ? "bg-rose-600 text-white shadow-xl shadow-rose-200 scale-[1.02]"
                        : "text-slate-400 hover:text-rose-600 hover:bg-rose-50/50"
                      }`}
                  >
                    <TrendingDown size={14} />
                    Egreso
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-2">
              <FormGrid className="items-end gap-x-6 gap-y-4">
                {/* FILA 1: Configuración Principal */}
                <Select
                  label="Edición Activa"
                  options={editionOptions}
                  value={editionOptions.find(o => o.value === form.edition)}
                  onChange={(opt) => setForm(prev => ({ ...prev, edition: opt.value }))}
                  error={errors.edition}
                />
                <InputField
                  label="Fecha de Registro"
                  type="date"
                  name="date"
                  bsize="compact"
                  value={form.date}
                  onChange={handleChange}
                  error={errors.date}
                  // Sincronización de estilo de label con Select
                  className="font-manrope"
                />
                <Select
                  label={isIngreso ? "Categoría de Ingreso" : "Categoría de Egreso"}
                  className="lg:col-span-2"
                  options={categoryOptions}
                  value={categoryOptions.find(o => o.value === form.category)}
                  onChange={(opt) => setForm(prev => ({ ...prev, category: opt.value }))}
                  error={errors.category}
                />

                {/* FILA 2: Detalles de Operación */}
                <InputField
                  label={isIngreso ? "Recibimos de" : "A la orden de"}
                  name="counterpart"
                  className="lg:col-span-2"
                  bsize="compact"
                  placeholder={isIngreso ? "Nombre del pagador..." : "Nombre del beneficiario..."}
                  value={form.counterpart}
                  onChange={handleChange}
                  autoComplete="off"
                  error={errors.counterpart}
                />
                <InputField
                  label="En concepto de"
                  name="concept"
                  className="lg:col-span-2"
                  bsize="compact"
                  placeholder="Descripción breve..."
                  value={form.concept}
                  onChange={handleChange}
                  error={errors.concept}
                />

                {/* FILA 3: Notas */}
                <div className="lg:col-span-4 space-y-1">
                  <label className="text-[11px] font-black text-muted uppercase tracking-[0.2em] ml-1">Observaciones</label>
                  <textarea
                    name="observations"
                    rows={2}
                    className={`w-full bg-white border shadow-sm rounded-xl font-bold text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary/20 placeholder:text-slate-300 transition-all outline-none px-5 py-3 text-xs ${errors.observations ? "border-red-500" : "border-slate-200/60"}`}
                    placeholder="Notas adicionales..."
                    value={form.observations}
                    onChange={handleChange}
                  />
                  {errors.observations && <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter ml-1">{errors.observations}</p>}
                </div>

                {/* FILA 4: Montos Disponibles */}
                <InputField
                  label="Efectivo"
                  type="text"
                  prefix="$"
                  name="cashAmount"
                  bsize="compact"
                  className="lg:col-span-2"
                  placeholder="0,00"
                  value={formatCurrencyInput(form.cashAmount)}
                  onChange={handleChange}
                  error={errors.amounts}
                />
                <InputField
                  label="Transferencia / Depósito"
                  type="text"
                  prefix="$"
                  name="transferAmount"
                  bsize="compact"
                  className="lg:col-span-1"
                  placeholder="0,00"
                  value={formatCurrencyInput(form.transferAmount)}
                  onChange={handleChange}
                  error={errors.amounts}
                />
                <InputField
                  label="Tarjeta Única"
                  type="text"
                  prefix="$"
                  name="tarjetaUnicaAmount"
                  bsize="compact"
                  className="lg:col-span-1"
                  placeholder="0,00"
                  value={formatCurrencyInput(form.tarjetaUnicaAmount)}
                  onChange={handleChange}
                  error={errors.amounts}
                />
              </FormGrid>

              {/* Listado de Cheques */}
              <div className="mt-6 pt-4 border-t border-slate-50/60">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Detalle de Cheques</h4>
                    {errors.checks && <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Cheques incompletos</span>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-6 px-4 text-[9px] font-black bg-slate-50 border-slate-200 hover:bg-primary hover:text-white rounded-lg transition-all uppercase tracking-widest"
                    onClick={() => { setShowChecks(true); addCheck(); }}
                    icon={Plus}
                  >
                    Cargar Cheque
                  </Button>
                </div>

                {(showChecks || checks.length > 0) && (
                  <div className="space-y-1">
                    {checks.map((c, i) => (
                      <div key={i} className={`flex items-end gap-3 p-2 rounded-2xl border transition-all group animate-in slide-in-from-left-4 duration-300 ${errors[`check_${i}`] ? "bg-red-50/30 border-red-100" : "bg-slate-50/30 border-slate-100"}`}>
                        <div className="w-24">
                          <InputField bsize="compact" label="N° Cheque" value={c.checkNumber} onChange={(e) => updateCheck(i, "checkNumber", e.target.value)} />
                        </div>
                        <div className="flex-[1.5]">
                          <InputField bsize="compact" label="Banco" value={c.bank} onChange={(e) => updateCheck(i, "bank", e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <InputField bsize="compact" label="Sucursal" value={c.branch} onChange={(e) => updateCheck(i, "branch", e.target.value)} />
                        </div>
                        <div className="w-40">
                          <InputField bsize="compact" label="Vto." type="date" value={c.date} onChange={(e) => updateCheck(i, "date", e.target.value)} />
                        </div>
                        <div className="w-44">
                          <InputField
                            bsize="compact"
                            label="Monto"
                            type="text"
                            prefix="$"
                            value={formatCurrencyInput(c.amount)}
                            onChange={(e) => updateCheck(i, "amount", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCheck(i)}
                          className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── FOOTER DE TARJETA: RESUMEN TOTAL ── */}
            <div className={`p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t-4 ${isIngreso ? "bg-emerald-50/30 border-emerald-500" : "bg-rose-50/30 border-rose-500"}`}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${isIngreso ? "bg-emerald-600 shadow-emerald-200" : "bg-rose-600 shadow-rose-200"}`}>
                  <DollarSign size={28} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Total del Movimiento</h4>
                  <p className={`text-4xl font-black tracking-tighter sm:mt-0 ${isIngreso ? "text-emerald-700" : "text-rose-700"}`}>
                    {formatCurrency(grandTotal)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </form>

        <div className="mt-4 px-4 flex justify-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-lg text-center leading-relaxed">
            Al confirmar el movimiento, los fondos se verán reflejados automáticamente en los reportes de auditoría de la edición activa.
          </p>
        </div>
      </div>
    </div>
  );
}
