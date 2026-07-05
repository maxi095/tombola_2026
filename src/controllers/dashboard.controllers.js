import Edition from '../models/edition.model.js';
import BingoCard from '../models/bingoCard.model.js';
import Sale from '../models/sale.model.js';
import Quota from '../models/quota.model.js';
import SellerPayment from '../models/sellerPayment.model.js';
import Balance from '../models/balance.model.js';

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
    };    // ─── AGREGACIONES ADICIONALES PARA REPORTE GENERAL 📊✨ ──────────────────
    const [
      balanceGrouped,
      salesMonthly,
      salesBySellerObj,
      activeSales,
      salesByCityRaw,
      salesBySellerRaw,
      newClientsByCityRaw
    ] = await Promise.all([
      // 1. Balance por categoría (ingresos y egresos activos)
      Balance.aggregate([
        { $match: { edition: new mongoose.Types.ObjectId(editionId), status: 'Activo' } },
        {
          $group: {
            _id: { type: '$type', category: '$category' },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]),
      // 2. Historial mensual de ventas de la edición (sin anuladas)
      Sale.aggregate([
        { 
          $match: { 
            edition: new mongoose.Types.ObjectId(editionId),
            status: { $ne: "Anulada" } 
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: "$saleDate" },
              month: { $month: "$saleDate" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      // 3. Ventas por tipo de vendedor (Particular vs. Comisión Club)
      Sale.aggregate([
        { 
          $match: { 
            edition: new mongoose.Types.ObjectId(editionId),
            status: { $ne: "Anulada" } 
          } 
        },
        {
          $lookup: {
            from: "sellers",
            localField: "seller",
            foreignField: "_id",
            as: "sellerInfo"
          }
        },
        { $unwind: "$sellerInfo" },
        {
          $group: {
            _id: "$sellerInfo.isParticular",
            count: { $sum: 1 }
          }
        }
      ]),
      // 4. Obtener todas las ventas activas (no anuladas) de la edición para procesar en memoria
      Sale.find({ edition: editionId, status: { $ne: "Anulada" } }, '_id status'),
      // 5. Ventas por localidad (cruza Venta -> Cliente -> Persona -> City)
      Sale.aggregate([
        { 
          $match: { 
            edition: new mongoose.Types.ObjectId(editionId),
            status: { $ne: "Anulada" } 
          } 
        },
        {
          $lookup: {
            from: "clients",
            localField: "client",
            foreignField: "_id",
            as: "clientInfo"
          }
        },
        { $unwind: "$clientInfo" },
        {
          $lookup: {
            from: "people",
            localField: "clientInfo.person",
            foreignField: "_id",
            as: "personInfo"
          }
        },
        { $unwind: "$personInfo" },
        {
          $project: {
            cityNormalized: { 
              $trim: { 
                input: { $toUpper: { $ifNull: ["$personInfo.city", "SIN ESPECIFICAR"] } } 
              } 
            }
          }
        },
        {
          $group: {
            _id: "$cityNormalized",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // 6. Ventas por vendedor con localidad y tipo (sin anuladas)
      Sale.aggregate([
        { 
          $match: { 
            edition: new mongoose.Types.ObjectId(editionId),
            status: { $ne: "Anulada" } 
          } 
        },
        {
          $group: {
            _id: "$seller",
            cartonsCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "sellers",
            localField: "_id",
            foreignField: "_id",
            as: "sellerInfo"
          }
        },
        { $unwind: "$sellerInfo" },
        {
          $lookup: {
            from: "people",
            localField: "sellerInfo.person",
            foreignField: "_id",
            as: "personInfo"
          }
        },
        { $unwind: "$personInfo" },
        {
          $project: {
            _id: 1,
            firstName: "$personInfo.firstName",
            lastName: "$personInfo.lastName",
            city: "$personInfo.city",
            isParticular: "$sellerInfo.isParticular",
            cartonsCount: 1
          }
        },
        { $sort: { cartonsCount: -1 } }
      ]),
      // 7. Nuevos compradores agrupados por localidad (primera venta en la edición filtrada)
      Sale.aggregate([
        { $match: { status: { $ne: "Anulada" } } },
        { $sort: { saleDate: 1 } },
        {
          $group: {
            _id: "$client",
            firstSale: { $first: "$$ROOT" }
          }
        },
        { $match: { "firstSale.edition": new mongoose.Types.ObjectId(editionId) } },
        {
          $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "clientInfo"
          }
        },
        { $unwind: "$clientInfo" },
        {
          $lookup: {
            from: "people",
            localField: "clientInfo.person",
            foreignField: "_id",
            as: "personInfo"
          }
        },
        { $unwind: "$personInfo" },
        {
          $project: {
            cityNormalized: { 
              $trim: { 
                input: { $toUpper: { $ifNull: ["$personInfo.city", "SIN ESPECIFICAR"] } } 
              } 
            }
          }
        },
        {
          $group: {
            _id: "$cityNormalized",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Procesar Balance agrupado
    const incomeCategories = [];
    const expenseCategories = [];
    let totalIngresos = 0;
    let totalEgresos = 0;

    balanceGrouped.forEach(item => {
      const { type, category } = item._id;
      const amount = item.totalAmount || 0;
      if (type === 'Ingreso') {
        incomeCategories.push({ name: category, value: amount });
        totalIngresos += amount;
      } else if (type === 'Egreso') {
        expenseCategories.push({ name: category, value: amount });
        totalEgresos += amount;
      }
    });

    // Formatear meses en español
    const monthsSpanish = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const salesTrend = salesMonthly.map(item => {
      const year = item._id.year;
      const monthNum = item._id.month;
      const monthStr = monthNum.toString().padStart(2, '0');
      return {
        month: `${year}-${monthStr}`,
        monthLabel: `${monthsSpanish[monthNum - 1]} ${year}`,
        salesCount: item.count
      };
    });

    // Distribuir tipos de vendedores
    let particularSalesCount = 0;
    let clubSalesCount = 0;
    salesBySellerObj.forEach(item => {
      if (item._id === true) {
        particularSalesCount = item.count;
      } else {
        clubSalesCount = item.count;
      }
    });

    // ─── CLASIFICACIÓN DE MODALIDADES DE PAGO POR COINCIDENCIA DE FECHAS ───
    const activeSaleIds = activeSales.map(s => s._id);
    const activeQuotas = await Quota.find({ sale: { $in: activeSaleIds } }, 'sale paymentDate');

    // Agrupar cuotas por venta
    const quotasBySale = {};
    activeQuotas.forEach(q => {
      const saleIdStr = q.sale.toString();
      if (!quotasBySale[saleIdStr]) {
        quotasBySale[saleIdStr] = [];
      }
      quotasBySale[saleIdStr].push(q);
    });

    let contadoCount = 0;
    let cuotasCount = 0;
    let sinCargoCount = 0;

    activeSales.forEach(sale => {
      if (sale.status === "Entregado sin cargo") {
        sinCargoCount++;
        return;
      }

      const saleQuotas = quotasBySale[sale._id.toString()] || [];
      if (saleQuotas.length === 0) {
        cuotasCount++;
        return;
      }

      // Si todas las cuotas están pagas (paymentDate no es nulo)
      const allQuotasPaid = saleQuotas.every(q => q.paymentDate !== null && q.paymentDate !== undefined);

      // Si todas las fechas de pago coinciden en el mismo día calendario
      const firstPaymentDate = saleQuotas[0]?.paymentDate;
      const arePaymentDatesEqual = saleQuotas.every(q => 
        q.paymentDate === null || q.paymentDate === undefined ||
        (firstPaymentDate && dayjs(q.paymentDate).isSame(dayjs(firstPaymentDate), 'day'))
      );

      if (allQuotasPaid && arePaymentDatesEqual) {
        contadoCount++;
      } else {
        cuotasCount++;
      }
    });

    // Helper para formatear localidad en Capital Case
    const formatCityName = (cityStr) => {
      if (!cityStr) return "Sin Especificar";
      const trimmed = cityStr.trim();
      if (!trimmed || trimmed === "SIN ESPECIFICAR") return "Sin Especificar";
      return trimmed
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Helper para remover tildes y acentos
    const removeAccents = (str) => {
      if (!str) return "";
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Agrupar en memoria para unificar variaciones con y sin tildes (ej: Villa María vs Villa Maria)
    const cityMap = {};
    salesByCityRaw.forEach(item => {
      const rawName = item._id || "SIN ESPECIFICAR";
      const normalizedKey = removeAccents(rawName).toUpperCase().trim();
      
      if (!cityMap[normalizedKey]) {
        cityMap[normalizedKey] = {
          name: formatCityName(rawName),
          value: 0,
          hasAccent: rawName !== removeAccents(rawName)
        };
      } else if (rawName !== removeAccents(rawName) && !cityMap[normalizedKey].hasAccent) {
        // Priorizar la ortografía con tilde para una visualización correcta
        cityMap[normalizedKey].name = formatCityName(rawName);
        cityMap[normalizedKey].hasAccent = true;
      }
      cityMap[normalizedKey].value += item.count;
    });

    const salesByCity = Object.values(cityMap)
      .map(item => ({ name: item.name, value: item.value }))
      .sort((a, b) => b.value - a.value);

    const salesBySeller = salesBySellerRaw.map(item => ({
      id: item._id,
      name: `${item.firstName} ${item.lastName}`,
      city: formatCityName(item.city),
      isParticular: item.isParticular || false,
      cartonsCount: item.cartonsCount
    }));

    const newClientsMap = {};
    newClientsByCityRaw.forEach(item => {
      const rawName = item._id || "SIN ESPECIFICAR";
      const normalizedKey = removeAccents(rawName).toUpperCase().trim();
      
      if (!newClientsMap[normalizedKey]) {
        newClientsMap[normalizedKey] = {
          name: formatCityName(rawName),
          value: 0,
          hasAccent: rawName !== removeAccents(rawName)
        };
      } else if (rawName !== removeAccents(rawName) && !newClientsMap[normalizedKey].hasAccent) {
        newClientsMap[normalizedKey].name = formatCityName(rawName);
        newClientsMap[normalizedKey].hasAccent = true;
      }
      newClientsMap[normalizedKey].value += item.count;
    });

    const newClientsByCity = Object.values(newClientsMap)
      .map(item => ({ name: item.name, value: item.value }))
      .sort((a, b) => b.value - a.value);

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
      },
      balanceStats: {
        income: incomeCategories,
        expense: expenseCategories,
        totalIncome: totalIngresos,
        totalExpense: totalEgresos,
        netBalance: totalIngresos - totalEgresos
      },
      salesTrend,
      salesBySellerType: {
        particular: particularSalesCount,
        club: clubSalesCount
      },
      salesPaymentType: {
        contado: contadoCount,
        cuotas: cuotasCount,
        sinCargo: sinCargoCount
      },
      salesByCity,
      salesBySeller,
      newClientsByCity
    });

  } catch (error) {
    console.error("Error en /dashboard:", error);
    res.status(500).json({ message: "Error al cargar el dashboard", error });
  }
};
