import Edition from '../models/edition.model.js';
import BingoCard from '../models/bingoCard.model.js';
import Sale from '../models/sale.model.js';
import Quota from '../models/quota.model.js';
import SellerPayment from '../models/sellerPayment.model.js';

import dayjs from 'dayjs'; 
import mongoose from 'mongoose';

export const getDashboard = async (req, res) => {
  const { editionId } = req.params;

  try {
    if (!editionId) {
      const ediciones = await Edition.find({}, '_id name');
      return res.status(200).json({
        message: "Falta el parámetro editionId, se devuelven ediciones disponibles.",
        edicionesDisponibles: ediciones,
      });
    }

    const [
        editionExists,
        totalBingoCards,
        totalBingoCardsSold,
        totalSales,
        totalSalesPaid,
        totalSalesNoCharge,
        totalSalesPending,
        totalSalesCanceled,
        totalBingoCardsAssigned, 
      ] = await Promise.all([
        Edition.findById(editionId),
        BingoCard.countDocuments({ edition: editionId }),
        BingoCard.countDocuments({ edition: editionId, status: 'Vendido' }),
        Sale.countDocuments({ edition: editionId }),
        Sale.countDocuments({ edition: editionId, status: 'Pagado' }),
        Sale.countDocuments({ edition: editionId, status: 'Entregado sin cargo' }),
        Sale.countDocuments({ edition: editionId, status: 'Pendiente de pago' }),
        Sale.countDocuments({ edition: editionId, status: 'Anulada' }),
        BingoCard.countDocuments({ 
          edition: editionId, 
          seller: { $exists: true, $ne: null }   // filtra los que tienen seller asignado
        }),
      ]);
      
      if (!editionExists) {
        return res.status(404).json({ message: "Edición no encontrada" });
      }
      
      // Paso 2: Obtener ventas y cuotas basadas en esa edición
      const salesForEdition = await Sale.find(
        { 
          edition: editionId, 
          status: { $in: ["Pendiente de pago", "Pagado"] } 
        },
        '_id'
      );
      const saleIds = salesForEdition.map(s => s._id);
      
      const [
        totalQuotas,
        totalQuotasPaid
      ] = await Promise.all([
        Quota.countDocuments({ sale: { $in: saleIds } }),
        Quota.countDocuments({ sale: { $in: saleIds }, paymentDate: { $ne: null } })
      ]);

    const totalMontoCuotasPagas = await Quota.aggregate([
        {
          $match: {
            sale: { $in: saleIds },
            paymentDate: { $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);
      
      const montoCuotasPagas = totalMontoCuotasPagas[0]?.total || 0;

    // Cuotas vencidas
    const today = dayjs().startOf('day').toDate();
    const cuotasVencidas = await Quota.countDocuments({
      sale: { $in: saleIds },
      paymentMethod: null,
      paymentDate: { $eq: null },
      dueDate: { $lt: today },
    });

    const cuotasPendientes = totalQuotas - totalQuotasPaid;

    // Pagos de vendedores asociados a esta edición
    const sellerPayments = await SellerPayment.aggregate([
        {
          $match: {
            edition: new mongoose.Types.ObjectId(editionId), // Instanciamos correctamente el ObjectId
            status: "Activo"
          }
        },
        {
          $group: {
            _id: null,
            totalCash: { $sum: '$cashAmount' },
            totalTransfer: { $sum: '$transferAmount' },
            totalCheck: { $sum: '$checkAmount' },
            totalTarjetaUnica: { $sum: '$tarjetaUnicaAmount' },
            totalCommission: { $sum: '$commissionAmount' },
            totalCommissionCash: {
              $sum: {
                $cond: [{ $eq: ['$commissionType', 'Efectivo'] }, '$commissionAmount', 0]
              }
            },
            totalCommissionTransfer: {
              $sum: {
                $cond: [{ $eq: ['$commissionType', 'Transferencia'] }, '$commissionAmount', 0]
              }
            }
          }
        }
      ]);

    const pagosVendedores = sellerPayments[0] || {
      totalCash: 0,
      totalTransfer: 0,
      totalCheck: 0,
      totalTarjetaUnica: 0,
      totalCommission: 0,
      totalCommissionCash: 0,
      totalCommissionTransfer: 0
    };

    res.json({
      edition: editionExists.name,
      edicionId: editionExists._id,
      expectedRevenueEdition: (editionExists.quantityCartons - totalSalesNoCharge) * editionExists.cost,
      bingoCards: {
        total: totalBingoCards,
        sold: totalBingoCardsSold,
        available: totalBingoCards - totalBingoCardsSold,
        totalAssigned: totalBingoCardsAssigned
      },
      sales: {
        total: totalSales,
        paid: totalSalesPaid,
        noCharge: totalSalesNoCharge,
        pending: totalSalesPending,
        canceled: totalSalesCanceled
      },
      quotas: {
        total: totalQuotas,
        paid: totalQuotasPaid,
        pending: cuotasPendientes,
        overdue: cuotasVencidas,
        totalPaidAmount: montoCuotasPagas
      },
      sellerPayments: {
        cash: pagosVendedores.totalCash,
        transfer: pagosVendedores.totalTransfer,
        check: pagosVendedores.totalCheck,
        tarjetaUnica: pagosVendedores.totalTarjetaUnica,
        total: pagosVendedores.totalCash + pagosVendedores.totalTransfer + pagosVendedores.totalCheck + pagosVendedores.totalTarjetaUnica,
        commissions: pagosVendedores.totalCommission,
        totalCommissionCash: pagosVendedores.totalCommissionCash,
        totalCommissionTransfer: pagosVendedores.totalCommissionTransfer

      }
    });

  } catch (error) {
    console.error("Error en /dashboard:", error);
    res.status(500).json({ message: "Error al cargar el dashboard", error });
  }
};
