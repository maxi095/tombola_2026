import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import logo from "../assets/images/logo_nob.png";

const fmt = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n || 0);

// ─── Contenido de una copia del documento ────────────────────────────────────
function DocumentContent({ balance, label }) {
  const isIngreso = balance.type === "Ingreso";
  const docTitle  = isIngreso ? "RECIBO" : "ORDEN DE PAGO";
  const txLabel   = `${isIngreso ? "I" : "E"}-${String(balance.transactionNumber).padStart(3, "0")}`;
  const date      = dayjs.utc(balance.date).format("DD/MM/YYYY");

  const cashAmount     = balance.cashAmount     || 0;
  const transferAmount = balance.transferAmount || 0;
  const checkAmount    = balance.checkAmount    || 0;
  const totalAmount    = balance.totalAmount    || cashAmount + transferAmount + checkAmount;

  const createdByName = balance.createdBy?.person
    ? `${balance.createdBy.person.firstName} ${balance.createdBy.person.lastName}`
    : balance.createdBy?.username || "-";

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

      {/* ── Título del documento ────────────────────────────────────────── */}
      <header className="text-center mb-4 print:mb-2">
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-3 print:flex-row print:gap-3">
          <h1 className="text-base font-bold uppercase tracking-widest print:text-sm">
            {docTitle} N° {txLabel}
          </h1>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border print:text-[10px]
              ${isIngreso
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-rose-50 text-rose-700 border-rose-300"
              }`}
          >
            {label}
          </span>
        </div>
        {balance.status === "Anulado" && (
          <p className="text-red-600 font-bold text-xs mt-1 uppercase tracking-wider">
            ⚠ ANULADO
          </p>
        )}
      </header>

      {/* ── Datos del movimiento ────────────────────────────────────────── */}
      <section className="space-y-2 mb-4 print:space-y-1 print:mb-3">

        {/* Fila 1: N° / Fecha */}
        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Categoría:</span>
            <span>{balance.category || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Fecha:</span>
            <span>{date}</span>
          </div>
        </div>

        {/* Fila 2: Contraparte */}
        <div className="flex items-start gap-1">
          <span className="font-medium text-gray-600 shrink-0">
            {isIngreso ? "Recibimos de:" : "A la orden de:"}
          </span>
          <span className="font-semibold">{balance.counterpart || "-"}</span>
        </div>

        {/* Fila 3: Concepto */}
        <div className="flex items-start gap-1">
          <span className="font-medium text-gray-600 shrink-0">En concepto de:</span>
          <span>{balance.concept || "-"}</span>
        </div>

        {/* Fila 4: Edición */}
        <div className="flex items-start gap-1">
          <span className="font-medium text-gray-600 shrink-0">Edición:</span>
          <span>{balance.edition?.name || "-"}</span>
        </div>

        {/* ── Montos ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-300 pt-2 space-y-1 w-full max-w-sm ml-auto text-sm print:text-xs mt-2">
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
          <div className="mt-3 print:mt-2">
            <h3 className="text-sm font-semibold mb-1 text-gray-700">Detalle de Cheques</h3>
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
                    <td className="px-2 py-1.5">{c.checkNumber}</td>
                    <td className="px-2 py-1.5">{c.bank}</td>
                    <td className="px-2 py-1.5">{c.branch}</td>
                    <td className="px-2 py-1.5">{dayjs.utc(c.date).format("DD/MM/YYYY")}</td>
                    <td className="px-2 py-1.5 text-right">{fmt(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Observaciones (si hay) ─────────────────────────────────── */}
        {balance.observations && (
          <div className="flex items-start gap-1 mt-2 text-xs text-gray-500 print:text-[10px]">
            <span className="font-medium shrink-0">Obs.:</span>
            <span className="italic">{balance.observations}</span>
          </div>
        )}

        {/* ── Referencia SellerPayment (si aplica) ───────────────────── */}
        {balance.sellerPaymentRef && (
          <div className="flex items-start gap-1 text-xs text-gray-500 print:text-[10px]">
            <span className="font-medium shrink-0">Rendición vinculada:</span>
            <span>Pago N° {balance.sellerPaymentRef.sellerPaymentNumber}</span>
          </div>
        )}
      </section>

      {/* ── Pie: emisor + firmas ────────────────────────────────────────────── */}
      <div className="text-xs text-gray-400 mb-6 print:mb-4 print:text-[10px]">
        Emitido por: {createdByName} · {dayjs(balance.createdAt).format("DD/MM/YYYY HH:mm")}
      </div>

      <footer className="flex justify-between print:mt-6">
        <div className="text-center">
          <div className="border-t border-black w-36 mx-auto" />
          <p className="text-sm text-black print:text-xs mt-1">
            {isIngreso ? "Firma del Pagador" : "Firma Autorizada"}
          </p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-36 mx-auto" />
          <p className="text-sm text-black print:text-xs mt-1">
            {isIngreso ? "Firma de la Organización" : "Sello / Firma del Beneficiario"}
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
  const copyLabel1 = isIngreso ? "Copia para el pagador"       : "Copia para el beneficiario";
  const copyLabel2 = isIngreso ? "Copia para administración"   : "Copia para administración";

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
