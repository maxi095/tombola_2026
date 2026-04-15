import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import logo from "../assets/images/logo_nob.png";

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);

// ─── Contenido de una copia del documento ────────────────────────────────────
function DocumentContent({ balance, label }) {
  const isIngreso = balance.type === "Ingreso";
  const docTitle = isIngreso ? "RECIBO" : "ORDEN DE PAGO";
  const txLabel = `${isIngreso ? "I" : "E"}-${String(balance.transactionNumber).padStart(3, "0")}`;
  const date = dayjs.utc(balance.date).format("DD/MM/YYYY");

  const cashAmount = balance.cashAmount || 0;
  const transferAmount = balance.transferAmount || 0;
  const checkAmount = balance.checkAmount || 0;
  const totalAmount = balance.totalAmount || cashAmount + transferAmount + checkAmount;

  return (
    <div className="border border-gray-300 rounded-md shadow-sm p-4 mb-6 text-sm print:mb-2 print:shadow-none print:border print:p-2">

      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4 print:pb-1 print:mb-2">
        <img src={logo} alt="Logo" className="h-12 print:h-10" />
        <div className="text-right">
          <h2 className="text-base font-bold uppercase print:text-sm">
            Club Atlético y Biblioteca NEWELL´S OLD BOYS
          </h2>
          <p className="text-[13px] text-black print:text-[11px]">CUIT 30-66814902-9</p>
          <p className="text-[13px] text-black print:text-[11px]">
            San Martín esq. San Juan - (5974) Laguna Larga - Córdoba
          </p>
        </div>
      </div>

      {/* ── Título y etiqueta ────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-4 print:mb-2 border-b border-gray-100 pb-2 text-black">
        <div className="flex flex-col items-center sm:items-baseline sm:flex-row gap-1 sm:gap-3">
          <h1 className="text-base font-bold uppercase tracking-widest print:text-sm">
            {docTitle} N° {txLabel}
          </h1>
          <span className="text-sm italic text-gray-500 font-medium print:text-xs">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 sm:mt-0 text-sm print:text-xs">
          <span className="font-medium text-gray-600">Fecha:</span>
          <span className="font-bold">{date}</span>
        </div>
        {balance.status === "Anulado" && (
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600/20 font-black text-4xl uppercase tracking-[1em] pointer-events-none select-none -rotate-12 whitespace-nowrap">
            ANULADO
          </p>
        )}
      </header>

      {/* ── Datos del movimiento ────────────────────────────────────────── */}
      <section className="space-y-3 mb-6 print:space-y-2 print:mb-4">

        {/* Fila 1: Contraparte */}
        <div className="flex items-start gap-2 border-b border-gray-100 pb-2">
            <span className="font-medium text-gray-600 shrink-0">
              {isIngreso ? "Recibimos de:" : "A la orden de:"}
            </span>
            <span className="font-bold">{balance.counterpart || "-"}</span>
        </div>

        {/* Fila 2: Concepto */}
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-600 shrink-0">En concepto de:</span>
          <span className="text-gray-800">{balance.concept || "-"}</span>
        </div>

        {/* ── Montos ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-300 pt-3 space-y-1 w-full max-w-sm ml-auto text-sm print:text-xs mt-4">
          {cashAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Efectivo:</span>
              <span>{fmt(cashAmount)}</span>
            </div>
          )}
          {transferAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Transferencia:</span>
              <span>{fmt(transferAmount)}</span>
            </div>
          )}
          {checkAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Cheque:</span>
              <span>{fmt(checkAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-400 pt-1 font-bold">
            <span>TOTAL:</span>
            <span
              className={`text-base ${isIngreso ? "text-emerald-700" : "text-rose-700"}`}
            >
              {fmt(totalAmount)}
            </span>
          </div>
        </div>

        {/* ── Detalle de Cheques ─────────────────────────────────────── */}
        {balance.checks && balance.checks.length > 0 && (
          <div className="mt-4 print:mt-3">
            <h3 className="text-sm font-semibold mb-1 text-gray-700 tracking-tighter">Detalle de Cheques</h3>
            <table className="w-full text-sm border border-gray-300 print:text-xs">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left px-2 py-1.5">N° Cheque</th>
                  <th className="text-left px-2 py-1.5">Banco</th>
                  <th className="text-left px-2 py-1.5">Sucursal</th>
                  <th className="text-left px-2 py-1.5">Fecha</th>
                  <th className="text-right px-2 py-1.5">Importe</th>
                </tr>
              </thead>
              <tbody>
                {balance.checks.map((c, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="px-2 py-1.5 font-mono">{c.checkNumber}</td>
                    <td className="px-2 py-1.5">{c.bank}</td>
                    <td className="px-2 py-1.5">{c.branch}</td>
                    <td className="px-2 py-1.5">{dayjs.utc(c.date).format("DD/MM/YYYY")}</td>
                    <td className="px-2 py-1.5 text-right font-medium">{fmt(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Referencia SellerPayment (si aplica) ───────────────────── */}
        {balance.sellerPaymentRef && (
          <div className="flex items-start gap-1 text-xs text-gray-500 print:text-[10px] italic">
            <span className="font-medium shrink-0">Rendición vinculada:</span>
            <span>Pago N° {balance.sellerPaymentRef.sellerPaymentNumber}</span>
          </div>
        )}
      </section>

      <footer className="flex justify-between mt-12 print:mt-12">
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-xs mt-1">
            {isIngreso ? "Firma del Pagador" : "Firma del Beneficiario"}
          </p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-xs mt-1">
            Firma de la Organización
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Componente exportable (2 copias en 2 páginas) ───────────────────────────
export default function BalanceReceipt({ balance }) {
  if (!balance) return null;

  const isIngreso = balance.type === "Ingreso";
  const copyLabel1 = isIngreso ? "Copia para el pagador" : "Copia para el beneficiario";
  const copyLabel2 = isIngreso ? "Copia para administración" : "Copia para administración";

  return (
    <div className="text-black font-sans print:text-[13px] print:leading-tight">
      {/* Página 1 */}
      <div className="p-4 print:p-2 print:min-h-[297mm] break-after-page">
        <DocumentContent balance={balance} label={copyLabel1} />
      </div>
      {/* Página 2 */}
      <div className="p-4 print:p-2 print:min-h-[297mm]">
        <DocumentContent balance={balance} label={copyLabel2} />
      </div>
    </div>
  );
}
