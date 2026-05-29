import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { formatLoteríaLetras } from "../libs/numberToWords";

dayjs.extend(utc);

const formatCurrencyLotería = (amount, decimals = 2) => {
  const value = parseFloat(amount) || 0;
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const mesesLargo = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function LotteryBalanceReceipt({ balance }) {
  if (!balance) return null;

  const totalRendered = balance.totalRenderedAmount || 0;
  const taxPercentage = balance.taxPercentage || 6.542;
  const impuestoAPagar = balance.totalAmount || 0;

  // Fechas formateadas
  const pDateObj = dayjs.utc(balance.taxPaymentDate || balance.date);
  const paymentDay = String(pDateObj.date()).padStart(2, "0");
  const paymentMonthName = mesesLargo[pDateObj.month()];
  const paymentYear = pDateObj.year();
  const paymentDateStr = pDateObj.format("DD/MM/YYYY");

  const dDateObj = dayjs.utc(balance.declarationDate || balance.date);
  const declarationDateStr = dDateObj.format("DD/MM/YYYY");
  const decMonthName = mesesLargo[dDateObj.month()];
  const decYear = dDateObj.year();
  const mesDeStr = `${decMonthName}-${decYear}`;

  // Edición
  const editionName = balance.edition?.name || "GRAN TOMBOLA MILLONARIA";

  // Estilo común para hojas membretadas (margen superior de 160px similar a DrawActa)
  const pageStyle = {
    padding: "200px 60px 60px 60px",
    boxSizing: "border-box",
    color: "#000",
    fontFamily: "Arial, sans-serif",
  };

  return (
    <div className="text-black bg-white max-w-[800px] mx-auto">
      {/* ── PÁGINA 1: RENDICIÓN MENSUAL ── */}
      <div
        style={{ ...pageStyle, pageBreakAfter: "always", breakAfter: "page" }}
        className="flex flex-col space-y-8"
      >
        {/* Título */}
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-wide uppercase border-b-2 border-black pb-2 inline-block px-8">
            Rendición Mensual para Lotería de Córdoba
          </h1>
        </div>

        {/* Cuadro de Datos */}
        <div className="w-full overflow-hidden border border-black text-sm leading-normal">
          <div className="grid grid-cols-4">
            <div className="col-span-1 border-r border-b border-black p-2 bg-slate-50/30"></div>
            <div className="col-span-1 border-r border-b border-black p-2 font-bold text-center flex items-center justify-center uppercase tracking-wider text-xs">
              Del Mes De:
            </div>
            <div className="col-span-1 border-r border-b border-black p-2 font-bold text-center text-base uppercase">
              {mesDeStr}
            </div>
            <div className="col-span-1 p-2 text-center text-[10px] font-semibold flex flex-col justify-center leading-tight">
              <span>Fecha del pago del impuesto</span>
            </div>
          </div>

          <div className="grid grid-cols-4 border-b border-black">
            <div className="col-span-1 border-r border-black p-2 font-bold uppercase tracking-wider text-xs flex items-center">
              Total Rendido
            </div>
            <div className="col-span-2 border-r border-black p-2 text-center text-base font-bold">
              $ {formatCurrencyLotería(totalRendered, 2)}
            </div>
            <div className="col-span-1 p-2 text-center font-mono font-bold text-sm flex items-center justify-center">
              {paymentDateStr}
            </div>
          </div>

          <div className="grid grid-cols-4">
            <div className="col-span-1 border-r border-b border-black p-2 font-bold uppercase tracking-wider text-xs flex items-center">
              Porcentaje de Impuesto
            </div>
            <div className="col-span-2 border-r border-b border-black p-2 text-center text-base font-bold font-mono">
              {formatCurrencyLotería(taxPercentage, 4)}%
            </div>
            <div className="col-span-1 p-2 text-center text-[10px] font-semibold flex flex-col justify-center leading-tight">
              <span>Fecha del cierre del mes a rendir</span>
            </div>
          </div>

          <div className="grid grid-cols-4">
            <div className="col-span-1 border-r border-black p-2 font-bold uppercase tracking-wider text-xs flex items-center">
              Impuesto a Pagar
            </div>
            <div className="col-span-2 border-r border-black p-2 text-center text-base font-black">
              $ {formatCurrencyLotería(impuestoAPagar, 4)}
            </div>
            <div className="col-span-1 p-2 text-center font-mono font-bold text-sm flex items-center justify-center">
              {declarationDateStr}
            </div>
          </div>
        </div>

        {/* Importes en letras */}
        <div className="space-y-4 pt-4 pl-2 text-sm">
          <div>
            <p className="font-bold text-black">Total Rendido:</p>
            <p className="italic pl-4 text-black font-medium">
              {formatLoteríaLetras(totalRendered, false)}
            </p>
          </div>
          <div>
            <p className="font-bold text-black">Total Impuesto:</p>
            <p className="italic pl-4 text-black font-medium">
              {formatLoteríaLetras(impuestoAPagar, true)}
            </p>
          </div>
        </div>
      </div>

      {/* ── PÁGINA 2: DECLARACIÓN JURADA ── */}
      <div
        style={pageStyle}
        className="flex flex-col space-y-6"
      >
        {/* Cabecera institucional */}
        <div className="space-y-1">
          <p className="font-bold text-base tracking-wide">Lotería de la Provincia de Córdoba S.E.</p>
          <div className="flex justify-between items-center text-xs pt-1">
            <p className="font-medium">S ____________________ / ____________________ D</p>
          </div>
        </div>

        {/* Cuerpo de la Carta (con tamaño de fuente y espaciados reducidos) */}
        <div className="text-justify text-sm print:text-[14px] leading-relaxed space-y-4 pt-2">
          <p>
            En la localidad de <strong>Laguna Larga</strong>, a los:{" "}
            <strong>{paymentDay}</strong> días del mes de: <strong>{paymentMonthName}</strong> de{" "}
            <strong>{paymentYear}</strong> el{" "}
            <strong>CLUB ATLÉTICO Y BIBLIOTECA NEWELL'S OLD BOYS DE LAGUNA LARGA</strong>,
            representado en este acto por el Sr. <strong>GUSTAVO FRANCISCO FERRARIO</strong>,
            D.N.I. Nº <strong>22.301.030</strong>, presidente respectivamente, en función de su
            cargo y a los fines de dar cumplimiento a lo exigido por vosotros, manifestamos en
            carácter de declaración jurada que a la fecha de: <strong>{declarationDateStr}</strong> lo
            recaudado en virtud de la:
          </p>

          <p className="text-center font-bold text-sm my-2 uppercase tracking-wider">
            "GRAN TÓMBOLA MILLONARIA LAGUNENSE {editionName}"
          </p>

          <p>
            en solicitudes de adhesión tanto en pago de contado como en cuotas la suma de:{" "}
            <strong>${formatCurrencyLotería(totalRendered, 2)}</strong>
            <br />
            <span className="italic text-black pl-4 block">
              {formatLoteríaLetras(totalRendered, false)}
            </span>
          </p>

          <p>
            En virtud de lo percibido se deduce que el monto correspondiente al siete (
            <strong>{formatCurrencyLotería(taxPercentage, 4)}%</strong>) por ciento establecido
            por reglamentación que esta institución debe abonar asciende a la suma de:{" "}
            <strong>${formatCurrencyLotería(impuestoAPagar, 2)}</strong>
            <br />
            <span className="italic text-black pl-4 block">
              {formatLoteríaLetras(impuestoAPagar, true)}
            </span>
          </p>

          <p>
            sirviendo el presente como el más eficaz de los recibos. El pago se realizará el día:{" "}
            <strong>{paymentDateStr}</strong> mediante sistema de depósito bancario a la cuenta Nº{" "}
            <strong>9136371/5</strong>, Banco de la Provincia de Córdoba S.E., acompañándose
            adjunto a esta declaración jurada copia del mismo.
          </p>

          <p>
            Sin otro particular aprovechamos la ocasión para saludarlos muy atentamente.
          </p>
        </div>
      </div>
    </div>
  );
}
