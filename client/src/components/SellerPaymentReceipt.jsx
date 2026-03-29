import dayjs from "dayjs";
import logo from "../assets/images/logo_nob.png";

function ReceiptContent({ payment, label, seller }) {
  const firstName = seller?.person?.firstName || payment.seller?.person?.firstName || "";
  const lastName = seller?.person?.lastName || payment.seller?.person?.lastName || "";
  const sellerName = [lastName, firstName].filter(Boolean).join(", ");
  const paymentDate = dayjs(payment.date).format("DD/MM/YYYY");

  const commissionPercentage = payment.commissionRate || 0;

  const cashAmount = payment.cashAmount || 0;
  const transferAmount = payment.transferAmount || 0;
  const tarjetaUnicaAmount = payment.tarjetaUnicaAmount || 0;
  const checkAmount = payment.checkAmount || 0;
  const subtotal = cashAmount + transferAmount + checkAmount + tarjetaUnicaAmount;
  const commissionAmount = payment.commissionAmount;
  const total = subtotal - commissionAmount;

  const formattedCurrency = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);

  return (
    <div className="border border-gray-300 rounded-md shadow-sm p-4 mb-6 text-sm print:mb-2 print:shadow-none print:border print:p-2">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4 print:pb-1 print:mb-2">
        <img src={logo} alt="Logo" className="h-12 print:h-10" />
        <div className="text-right">
          <h2 className="text-base font-bold uppercase print:text-sm">
            Club Atlético y Biblioteca NEWELL´S OLD BOYS
          </h2>
          <p className="text-[13px] text-black print:text-[11px]">CUIT 30-66814902-9</p>
          <p className="text-[13px] text-black print:text-[11px]">
            San Martín esq.San Juan - (5974) Laguna Larga - Córdoba
          </p>
        </div>
      </div>

      {/* Título y etiqueta */}
      <header className="text-center mb-4 print:mb-2">
        <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2 print:flex-row print:gap-2 print:text-xs">
          <h1 className="text-base font-semibold print:text-sm">
            Recibo de pago N° {payment.sellerPaymentNumber || "-"}
          </h1>
          <span className="text-black text-sm italic print:text-xs">{label}</span>
        </div>
      </header>

      {/* Datos generales */}
      <section className="space-y-2 mb-4 print:space-y-1 print:mb-2">
        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">N° de vendedor:</span>
            <span>{payment.seller?.sellerNumber || "-"}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Fecha de Pago:</span>
            <span>{paymentDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <div className="flex items-center">
            <span className="font-medium mr-2">Vendedor:</span>
            <span>{sellerName || "-"}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Comisión:</span>
            <span>{commissionPercentage} %</span>
          </div>
        </div>

        {/* Montos */}
        <div className="border-t border-gray-300 pt-1 space-y-1 w-full max-w-sm ml-auto text-sm print:text-xs">
          {cashAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Monto en Efectivo:</span>
              <span>{formattedCurrency(cashAmount)}</span>
            </div>
          )}
          {checkAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Monto en Cheque:</span>
              <span>{formattedCurrency(checkAmount)}</span>
            </div>
          )}
          {transferAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Monto en Transferencia:</span>
              <span>{formattedCurrency(transferAmount)}</span>
            </div>
          )}
          {tarjetaUnicaAmount > 0 && (
            <div className="flex justify-between">
              <span className="font-medium">Monto en Tarjeta Única:</span>
              <span>{formattedCurrency(tarjetaUnicaAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-300">
            <span className="font-medium">Subtotal:</span>
            <span>{formattedCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Monto Comisión:</span>
            <span className="text-red-600">-{formattedCurrency(commissionAmount)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 font-semibold">
            <span className="font-medium">Total:</span>
            <span>{formattedCurrency(total)}</span>
          </div>
        </div>

        {/* Tabla de Cheques */}
        {payment.checks && payment.checks.length > 0 && (
          <div className="mt-4 print:mt-2">
            <h3 className="text-sm font-semibold mb-1">Detalle de Cheques</h3>
            <table className="w-full text-sm border border-gray-300 print:text-xs">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left px-2 py-2">N° Cheque</th>
                  <th className="text-left px-2 py-2">Banco</th>
                  <th className="text-left px-2 py-2">Plaza</th>
                  <th className="text-left px-2 py-2">Fecha</th>
                  <th className="text-right px-2 py-2">Importe</th>
                </tr>
              </thead>
              <tbody>
                {payment.checks.map((check, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="px-2 py-2">{check.checkNumber}</td>
                    <td className="px-2 py-2">{check.bank}</td>
                    <td className="px-2 py-2">{check.branch}</td>
                    <td className="px-2 py-2">{dayjs(check.date).format("DD/MM/YYYY")}</td>
                    <td className="px-2 py-2 text-right">{formattedCurrency(check.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Firmas */}
      <footer className="mt-12 flex justify-between print:mt-8">
        <div className="text-center">
          <div className="border-t border-black w-32 mx-auto" />
          <p className="text-sm text-black print:text-xs">Firma del Vendedor</p>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-32 mx-auto" />
          <p className="text-sm text-black print:text-xs">Firma de la Organización</p>
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
