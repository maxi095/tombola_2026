import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import logo from "../assets/images/logo_nob.png";

dayjs.extend(utc);

function ReceiptContent({ payment, label, seller }) {
  const firstName = seller?.person?.firstName || payment.seller?.person?.firstName || "";
  const lastName = seller?.person?.lastName || payment.seller?.person?.lastName || "";
  const sellerName = [lastName, firstName].filter(Boolean).join(", ");
  const paymentDate = dayjs.utc(payment.date).format("DD/MM/YYYY");

  const commissionPercentage = payment.commissionRate || 0;

  const cashAmount = payment.cashAmount || 0;
  const transferAmount = payment.transferAmount || 0;
  const tarjetaUnicaAmount = payment.tarjetaUnicaAmount || 0;
  const checkAmount = payment.checkAmount || 0;
  const subtotal = cashAmount + transferAmount + checkAmount + tarjetaUnicaAmount;
  const commissionAmount = payment.commissionAmount || 0;
  const total = subtotal - commissionAmount;

  const formattedCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount || 0);

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
            Recibo de pago N° {payment.sellerPaymentNumber || "-"}
          </h1>
          <span className="text-sm italic text-gray-500 font-medium print:text-xs">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1 sm:mt-0 text-sm print:text-xs">
          <span className="font-medium text-gray-600">Fecha:</span>
          <span className="font-bold">{paymentDate}</span>
        </div>
      </header>

      {/* ── Datos generales ────────────────────────────────────────── */}
      <section className="space-y-3 mb-6 print:space-y-2 print:mb-4">
        {/* Fila 1: N° Vendedor y Comisión */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">N° de vendedor:</span>
            <span className="font-semibold">{payment.seller?.sellerNumber || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Comisión Aplicada:</span>
            <span className="font-semibold">{commissionPercentage}%</span>
          </div>
        </div>

        {/* Fila 2: Vendedor */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="font-medium text-gray-600 shrink-0">Vendedor:</span>
          <span className="font-bold text-base">{sellerName || "-"}</span>
        </div>

        {/* ── Montos ─────────────────────────────────────────────────── */}
        <div className="border-t border-gray-300 pt-3 space-y-1 w-full max-w-sm ml-auto text-sm print:text-xs mt-4">
          {cashAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Efectivo:</span>
              <span>{formattedCurrency(cashAmount)}</span>
            </div>
          )}
          {checkAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Cheque:</span>
              <span>{formattedCurrency(checkAmount)}</span>
            </div>
          )}
          {transferAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Monto en Transferencia:</span>
              <span>{formattedCurrency(transferAmount)}</span>
            </div>
          )}
          {tarjetaUnicaAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Tarjeta Única:</span>
              <span>{formattedCurrency(tarjetaUnicaAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
            <span className="font-medium text-gray-600 text-[11px] uppercase tracking-wider">Subtotal:</span>
            <span className="font-semibold">{formattedCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600 text-[11px] uppercase tracking-wider">Monto Comisión:</span>
            <span className="text-rose-600 font-medium">-{formattedCurrency(commissionAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-400 pt-1 font-bold mt-1">
            <span className="text-gray-900">NETO A RENDIR:</span>
            <span className="text-base text-emerald-700">{formattedCurrency(total)}</span>
          </div>
        </div>

        {/* ── Tabla de Cheques ─────────────────────────────────────── */}
        {payment.checks && payment.checks.length > 0 && (
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
                {payment.checks.map((check, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-2 py-1.5 font-mono">{check.checkNumber}</td>
                    <td className="px-2 py-1.5">{check.bank}</td>
                    <td className="px-2 py-1.5">{check.branch}</td>
                    <td className="px-2 py-1.5">{dayjs.utc(check.date).format("DD/MM/YYYY")}</td>
                    <td className="px-2 py-1.5 text-right font-medium">{formattedCurrency(check.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pie: Firmas ─────────────────────────────────────────────────── */}
      <footer className="mt-12 flex justify-between print:mt-12">
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-xs mt-1">Firma del Vendedor</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-xs mt-1">Firma de la Organización</p>
        </div>
      </footer>
    </div>
  );
}

export default function SellerPaymentReceipt({ payment }) {
  if (!payment) return null;

  return (
    <div className="text-black font-sans print:text-[13px] print:leading-tight">
      {/* Página 1: Copia para el vendedor */}
      <div className="p-4 print:p-2 print:min-h-[297mm] break-after-page">
        <ReceiptContent payment={payment} label="Copia para el vendedor" seller={payment.seller} />
      </div>
      {/* Página 2: Copia para administración */}
      <div className="p-4 print:p-2 print:min-h-[297mm]">
        <ReceiptContent payment={payment} label="Copia para administración" seller={payment.seller} />
      </div>
    </div>
  );
}
