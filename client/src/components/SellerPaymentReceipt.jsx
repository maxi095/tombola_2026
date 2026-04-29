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
    <div className="border border-gray-300 rounded-md shadow-sm p-4 mb-2 text-sm print:mb-0 print:shadow-none print:border print:p-1 print:pb-2">
      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-gray-400 pb-1 mb-1">
        <div className="flex items-start gap-2">
          <img src={logo} alt="Logo" className="h-12 print:h-7" />
          <div className="leading-tight">
            <h2 className="text-base font-bold uppercase print:text-[10px]">
              Club Atlético y Biblioteca NEWELL´S OLD BOYS
            </h2>
            <p className="text-[12px] print:text-[8px] text-gray-600">CUIT 30-66814902-9 | San Martín esq. San Juan - (5974) Laguna Larga - Córdoba</p>
          </div>
        </div>
        <div className="text-right leading-tight">
          <h2 className="text-base font-bold uppercase print:text-[11px] tracking-tight">
            Pago N° {payment.sellerPaymentNumber || "-"}
          </h2>
          <p className="text-[11px] print:text-[8px] font-bold text-gray-700">{paymentDate}</p>
          <span className="text-[10px] italic text-gray-500 font-medium block">{label}</span>
        </div>
      </div>

      {/* ── Datos generales ────────────────────────────────────────── */}
      <section className="print:text-[10px] print:mb-0.5">
        <div className="flex items-center border-b border-gray-100 pb-1 mb-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Vendedor:</span>
            <span className="font-bold text-[13px] print:text-[11px]">{sellerName || "-"}</span>
          </div>
          <span className="mx-2 text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">Comisión:</span>
            <span className="font-semibold">{commissionPercentage}%</span>
          </div>
        </div>

        {/* ── Montos ─────────────────────────────────────────────────── */}
        <div className="mt-0 print:mt-0.5 w-full max-w-[280px] ml-auto">
          <div className="flex flex-col gap-y-0 text-sm print:text-[9px]">
            {cashAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Efectivo:</span>
                <span className="font-medium">{formattedCurrency(cashAmount)}</span>
              </div>
            )}
            {checkAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cheque:</span>
                <span className="font-medium">{formattedCurrency(checkAmount)}</span>
              </div>
            )}
            {transferAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transferencia:</span>
                <span className="font-medium">{formattedCurrency(transferAmount)}</span>
              </div>
            )}
            {tarjetaUnicaAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tarjeta Única:</span>
                <span className="font-medium">{formattedCurrency(tarjetaUnicaAmount)}</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="font-bold text-gray-700 text-[10px] uppercase">Subtotal:</span>
              <span className="font-bold">{formattedCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-rose-600 text-[10px] uppercase">Monto Comisión:</span>
              <span className="font-bold text-rose-600">-{formattedCurrency(commissionAmount)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-400 pt-0 mt-1">
            <span className="text-gray-900 font-bold print:text-[10px] uppercase">Neto a Rendir:</span>
            <span className="text-base print:text-[13px] font-black text-emerald-700">{formattedCurrency(total)}</span>
          </div>
        </div>

        {/* ── Tabla de Cheques ─────────────────────────────────────── */}
        {payment.checks && payment.checks.length > 0 && (
          <div className="mt-2 print:mt-0.5">
            <h3 className="text-[10px] font-bold text-gray-600 uppercase border-b border-gray-200 mb-0.5">Detalle de Cheques</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] print:text-[8px]">
              {payment.checks.map((check, index) => (
                <div key={index} className="flex justify-between">
                  <span className="mr-2">
                    <span className="font-mono">{check.checkNumber}</span> | {dayjs.utc(check.date).format("DD/MM")} | {check.bank} | {check.branch}
                  </span>
                  <span className="font-medium">{formattedCurrency(check.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Espaciador físico para firmas y sellos (garantiza espacio en PDF) */}
      <div className="h-12" />

      {/* ── Pie: Firmas ─────────────────────────────────────────────────── */}
      <footer className="flex justify-between print:mt-0">
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-[9px] mt-0">Firma del Vendedor</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-40 mx-auto" />
          <p className="text-sm font-bold text-black print:text-[9px] mt-0">Firma de la Organización</p>
        </div>
      </footer>
    </div>
  );
}

export default function SellerPaymentReceipt({ payment }) {
  if (!payment) return null;

  return (
    <div className="text-black font-sans print:text-[10px] print:leading-none">
      {/* Copia para el vendedor */}
      <div className="px-4 py-1 print:p-0">
        <ReceiptContent payment={payment} label="Copia para el vendedor" seller={payment.seller} />
      </div>

      {/* Línea de corte punteada */}
      <div className="border-t border-dashed border-gray-400 mt-2 mb-4 mx-12" />

      {/* Copia para administración */}
      <div className="px-4 py-1 print:p-0">
        <ReceiptContent payment={payment} label="Copia para administración" seller={payment.seller} />
      </div>
    </div>
  );
}
