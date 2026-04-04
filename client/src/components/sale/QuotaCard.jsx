import { Calendar, CreditCard, RotateCcw, Zap } from "lucide-react";
import dayjs from "dayjs";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { formatCurrency } from "../../libs/formatters";

/**
 * QuotaCard - Sale Installment Management Component
 * Estándar 2026: Success Glass para pagos y estados reactivos.
 * 
 * @param {Object} props
 * @param {Object} props.quota - The quota data
 * @param {string} props.saleStatus - Overall sale status
 * @param {Function} props.onPay - Handler for payment modal
 * @param {Function} props.onCancel - Handler for payment cancellation
 */
function QuotaCard({ quota, saleStatus, onPay, onCancel }) {
  const isPaid = Boolean(quota.paymentDate);
  const isNoCharge = quota.paymentMethod === "Entregado sin cargo";

  return (
    <Card 
      key={quota._id} 
      className={`group relative overflow-hidden transition-all duration-300 py-3.5 px-3 border-l-4 ${
        isPaid 
          ? 'border-green-200 border-l-green-600 bg-gradient-to-br from-green-50/40 via-green-50/10 to-transparent' 
          : 'border-slate-100 border-l-transparent hover:border-primary/20 hover:shadow-md'
      }`}
    >
      <div className="relative z-10 flex flex-col h-full justify-between gap-3">
        {/* Nivel 1: Status & Index ✨🚀 */}
        <div className="flex items-center justify-between">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm ${
            isPaid ? 'bg-green-600 text-white shadow-green-200' : 'bg-white text-slate-400 border border-slate-100'
          }`}>
            {quota.quotaNumber}
          </div>
          <Badge variant={isNoCharge ? 'warning' : isPaid ? 'success' : 'default'} size="xs" className="font-bold tracking-tighter uppercase whitespace-nowrap">
            {isNoCharge ? 'SIN CARGO' : (isPaid ? 'PAGADO' : 'PENDIENTE')}
          </Badge>
        </div>

        {/* Nivel 2: Monto Dominante (Protección de Truncado) 🏹⚖️ */}
        <div className="flex flex-col items-center py-1">
          <span className={`text-lg font-black font-manrope leading-none transition-colors tracking-tight ${
            isPaid ? 'text-green-700' : 'text-primary'
          }`}>
            {formatCurrency(quota.amount)}
          </span>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold mt-2 opacity-70">
            <Calendar size={10} className={isPaid ? 'text-green-300' : 'text-slate-300'} />
            {dayjs.utc(quota.dueDate).format('DD MMM YY')}
          </div>
        </div>

        {/* Nivel 3: Acciones e Info Secundaria ✨💎 */}
        <div className="space-y-2">
          {isPaid && (
            <div className="flex items-center justify-center gap-1.5 text-[8px] text-green-600/70 font-semibold bg-green-500/5 py-1 px-2 rounded border border-green-500/10 transition-all duration-300 truncate">
              <Zap size={9} className="text-green-500 shrink-0" fill="currentColor" />
              <span className="uppercase tracking-tighter truncate">
                {quota.paymentMethod} • {dayjs.utc(quota.paymentDate).format('DD/MM/YY')}
              </span>
            </div>
          )}

          {saleStatus !== "Anulada" && !isNoCharge && (
            <div className="flex gap-2">
              {isPaid ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[8px] py-1 h-7 text-red-500/60 hover:text-red-700 hover:bg-red-50 border-red-50 font-bold"
                  onClick={() => onCancel(quota)}
                  icon={RotateCcw}
                >
                  Anular
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full text-[9px] py-1 h-8 uppercase tracking-widest font-black shadow-sm transition-transform active:scale-95"
                  onClick={() => onPay(quota)}
                  icon={CreditCard}
                >
                  Cobrar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default QuotaCard;
