import { Calendar, CreditCard, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatCurrency } from "../../libs/formatters";

/**
 * QuotaCard - Sale Installment Management Component
 * Estándar 2026: Zero-Air Restoration V8.1 (Success Glass Identity).
 * 
 * @param {Object} props
 * @param {Object} props.quota - The quota data
 * @param {string} props.saleStatus - Overall sale status
 * @param {Function} props.onPay - Handler for payment modal
 * @param {Function} props.onCancel - Handler for payment cancellation
 * @param {boolean} props.isNext - Highlight next pending quota
 */
function QuotaCard({ quota, saleStatus, onPay, onCancel, isNext }) {
  
  // Robust payment detection
  // We check for both: backend status (Pagado/Pagada) and paymentDate
  const isPaid = quota.status?.toLowerCase().includes('pagad') || Boolean(quota.paymentDate) || (quota.payments && quota.payments.length > 0);
  const isCanceled = quota.status === 'Anulada';

  const getStatusStyles = () => {
    if (isPaid) return 'border-emerald-500 bg-emerald-50/20 shadow-emerald-50/40';
    if (isCanceled) return 'border-red-500 bg-red-50/10 opacity-60';
    if (isNext) return 'border-primary bg-white shadow-premium';
    return 'border-slate-100 bg-white';
  };

  return (
    <Card 
      padding="p-0"
      hover={false}
      className={`
        relative overflow-hidden transition-all duration-300 border-l-4 py-2.5 px-4 shadow-sm
        ${isNext && !isPaid ? 'ring-2 ring-primary/20 ring-offset-2' : ''}
        ${getStatusStyles()}
      `}
    >
      {/* NIVEL 1: HEADER COMPACTO (N° + ESTADO + CRONOLOGÍA) ✨🚀 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="flat" size="xs" className="font-black h-5 w-5 flex items-center justify-center rounded-sm bg-slate-100 text-slate-600 border-none">
            {quota.quotaNumber || quota.number}
          </Badge>
          <Badge 
            variant={isPaid ? 'success' : 'outline'} 
            size="xs" 
            className="font-black uppercase py-0 px-1.5 text-[8px] h-4"
          >
            {isPaid ? 'PAGADO' : 'PENDIENTE'}
          </Badge>
        </div>
        
        {/* CRONOLOGÍA FUSIONADA V8.1 ✨💎 */}
        {isPaid && (
          <div className="flex items-center gap-1 text-emerald-600">
            <span className="text-[9px] font-black font-manrope">
              {dayjs.utc(quota.paymentDate || (quota.payments && quota.payments[0]?.paymentDate)).format('DD/MM/YY')}
            </span>
          </div>
        )}
      </div>

      {/* NIVEL 2: MONTO + VENCIMIENTO (FOCO OPERATIVO) 🏹⚖️ */}
      <div className="flex flex-col items-center justify-center mb-3">
        <span className={`text-xl font-black font-manrope tracking-tight leading-none ${isPaid ? 'text-emerald-700' : 'text-slate-800'}`}>
          {formatCurrency(quota.amount)}
        </span>
        <div className="flex items-center gap-1 mt-1.5 text-slate-400">
          <Calendar size={10} strokeWidth={2.5} className="opacity-60" />
          <span className="text-[10.5px] font-black uppercase tracking-wider font-manrope">
            {dayjs.utc(quota.dueDate).format('DD MMM YY')}
          </span>
        </div>
      </div>

      {/* NIVEL 3: ACCIONES (RESTORATION 2026) 🚀 */}
      <div className="mt-auto">
        {saleStatus !== 'Anulada' && (
          <>
            {!isPaid ? (
              <Button 
                variant="primary"
                onClick={() => onPay(quota)}
                className="w-full h-8 font-black text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-95 py-0"
                icon={CreditCard}
              >
                Cobrar
              </Button>
            ) : (
              <Button 
                variant="error-light"
                onClick={() => onCancel(quota)}
                className="w-full h-8 font-black text-[8px] uppercase tracking-widest opacity-80 hover:opacity-100 transition-all border border-red-50 py-0"
                icon={RotateCcw}
              >
                Anular
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export default QuotaCard;
