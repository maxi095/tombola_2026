import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';

// Cargar variables de entorno
dotenv.config();

// Obtener rutas relativas en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar modelos
import Edition from '../src/models/edition.model.js';
import BingoCard from '../src/models/bingoCard.model.js';
import Sale from '../src/models/sale.model.js';
import Quota from '../src/models/quota.model.js';
import SellerPayment from '../src/models/sellerPayment.model.js';
import Balance from '../src/models/balance.model.js';
import Client from '../src/models/client.model.js';
import Person from '../src/models/person.model.js';
import Seller from '../src/models/seller.model.js';

// Conexión a la base de datos
const mongoURI = 'mongodb://localhost/tomboladb';

async function main() {
  console.log('⚡ Conectando a MongoDB en:', mongoURI);
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Conexión establecida con la base de datos.');

    // 1. Obtener todas las ediciones
    const editions = await Edition.find({}).sort({ dateCreated: -1 });
    console.log(`📦 Se encontraron ${editions.length} ediciones registradas.`);

    if (editions.length === 0) {
      console.log('❌ No hay ediciones registradas en la base de datos. Abortando.');
      process.exit(0);
    }

    const compiledData = [];

    // 2. Procesar cada edición
    for (const editionExists of editions) {
      const editionId = editionExists._id;
      const editionName = editionExists.name;
      console.log(`🔍 Procesando datos para la edición: "${editionName}" (${editionId})...`);

      // Ejecutar consultas principales
      const [
        totalBingoCards,
        totalBingoCardsSold,
        totalSales,
        totalSalesPaid,
        totalSalesNoCharge,
        totalSalesPending,
        totalSalesCanceled,
        totalBingoCardsAssigned,
      ] = await Promise.all([
        BingoCard.countDocuments({ edition: editionId }),
        BingoCard.countDocuments({ edition: editionId, status: 'Vendido' }),
        Sale.countDocuments({ edition: editionId }),
        Sale.countDocuments({ edition: editionId, status: 'Pagado' }),
        Sale.countDocuments({ edition: editionId, status: 'Entregado sin cargo' }),
        Sale.countDocuments({ edition: editionId, status: 'Pendiente de pago' }),
        Sale.countDocuments({ edition: editionId, status: 'Anulada' }),
        BingoCard.countDocuments({ 
          edition: editionId, 
          seller: { $exists: true, $ne: null }
        }),
      ]);

      // Obtener ventas válidas para las cuotas
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

      // Pagos de vendedores
      const sellerPaymentsAggregate = await SellerPayment.aggregate([
        {
          $match: {
            edition: new mongoose.Types.ObjectId(editionId),
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

      const pagosVendedores = sellerPaymentsAggregate[0] || {
        totalCash: 0,
        totalTransfer: 0,
        totalCheck: 0,
        totalTarjetaUnica: 0,
        totalCommission: 0,
        totalCommissionCash: 0,
        totalCommissionTransfer: 0
      };

      // Agregaciones adicionales
      const [
        balanceGrouped,
        salesMonthly,
        salesBySellerObj,
        activeSales,
        salesByCityRaw,
        salesBySellerRaw,
        newClientsByCityRaw
      ] = await Promise.all([
        // Balance
        Balance.aggregate([
          { $match: { edition: new mongoose.Types.ObjectId(editionId), status: 'Activo' } },
          {
            $group: {
              _id: { type: '$type', category: '$category' },
              totalAmount: { $sum: '$totalAmount' }
            }
          }
        ]),
        // Historial mensual de ventas
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
        // Canal (Particular vs Club)
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
        // Ventas activas en memoria
        Sale.find({ edition: editionId, status: { $ne: "Anulada" } }, '_id status'),
        // Localidades de ventas
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
        // Ventas por vendedor
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
        // Nuevos compradores
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

      // Procesar balance
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

      // Vendedores tipo
      let particularSalesCount = 0;
      let clubSalesCount = 0;
      salesBySellerObj.forEach(item => {
        if (item._id === true) {
          particularSalesCount += item.count;
        } else {
          clubSalesCount += item.count;
        }
      });

      // Modalidades de pago
      const activeSaleIds = activeSales.map(s => s._id);
      const activeQuotas = await Quota.find({ sale: { $in: activeSaleIds } }, 'sale paymentDate');

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

        const allQuotasPaid = saleQuotas.every(q => q.paymentDate !== null && q.paymentDate !== undefined);
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

      const removeAccents = (str) => {
        if (!str) return "";
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };

      // Unificar ciudades
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

      // Calcular montos esperados
      const expectedRevenue = (editionExists.quantityCartons - totalSalesNoCharge) * editionExists.cost;
      const soldPercent = totalBingoCards ? Math.round((totalBingoCardsSold / totalBingoCards) * 100) : 0;
      const totalRecaudado = pagosVendedores.totalCash + pagosVendedores.totalTransfer + pagosVendedores.totalCheck + pagosVendedores.totalTarjetaUnica;
      const collectionPercent = expectedRevenue ? Math.round((totalRecaudado / expectedRevenue) * 100) : 0;

      // Consolidar
      compiledData.push({
        id: editionId.toString(),
        name: editionName,
        expectedRevenueEdition: expectedRevenue,
        soldPercent,
        collectionPercent,
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
          total: totalRecaudado,
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
    }

    // 3. Generar el HTML
    const reportHtmlPath = path.join(__dirname, '../client/src/pages/dashboard/ReporteTombola.html');
    const htmlTemplate = getHtmlTemplate(compiledData);
    fs.writeFileSync(reportHtmlPath, htmlTemplate, 'utf8');
    console.log(`\n🎉 ¡Reporte generado exitosamente en:`);
    console.log(`👉 ${reportHtmlPath}`);

  } catch (error) {
    console.error('❌ Error durante la generación del reporte:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB.');
  }
}

// Plantilla HTML Dinámica e Interactiva
function getHtmlTemplate(data) {
  const dataString = JSON.stringify(data);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Dashboard General - Tómbola</title>
  <!-- Google Fonts: Inter & Manrope -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            manrope: ['Manrope', 'sans-serif']
          },
          colors: {
            primary: '#6366f1',
            success: '#10b981',
            danger: '#f43f5e',
            warning: '#f59e0b',
            slateCard: 'rgba(30, 41, 59, 0.45)'
          }
        }
      }
    }
  </script>

  <style>
    /* Estilos Premium */
    body {
      background-color: #0f172a; /* Slate 900 */
      color: #f8fafc; /* Slate 50 */
      background-image: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 45%);
      background-attachment: fixed;
    }
    
    .glass-card {
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .glass-card:hover {
      border-color: rgba(99, 102, 241, 0.25);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      transform: translateY(-2px);
    }

    /* Ocultar barra de scroll de forma elegante */
    .no-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .no-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .no-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    .no-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Animación de entrada */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(15px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Media Print para PDF perfectos */
    @media print {
      body {
        background: #ffffff !important;
        color: #0f172a !important;
        background-image: none !important;
      }
      .no-print {
        display: none !important;
      }
      .glass-card {
        background: #ffffff !important;
        border: 1px solid #e2e8f0 !important;
        box-shadow: none !important;
        color: #0f172a !important;
        transform: none !important;
      }
      .text-slate-400, .text-slate-500 {
        color: #475569 !important;
      }
      .text-slate-300 {
        color: #1e293b !important;
      }
      .bg-slate-800, .bg-slate-900, .bg-slate-950, .bg-slate-50 {
        background: #f1f5f9 !important;
        color: #0f172a !important;
      }
      .border-slate-700, .border-slate-800 {
        border-color: #cbd5e1 !important;
      }
      h1, h2, h3, h4, span, p {
        color: #0f172a !important;
      }
      .print-col-span-2 {
        grid-column: span 2 / span 2 !important;
      }
      .print-grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
      .print-break-after {
        page-break-after: always;
      }
    }
  </style>
</head>
<body class="min-h-screen px-4 md:px-12 py-8 font-sans antialiased text-slate-100">

  <!-- CAPA DE CONTROL DE EDICIONES (NO IMPRIMIBLE) -->
  <header class="no-print mb-8 animate-fade-in-up flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
    <div class="flex items-center gap-4">
      <div class="bg-indigo-600/20 text-indigo-400 p-3 rounded-2xl border border-indigo-500/20">
        <i data-lucide="trophy" class="w-8 h-8"></i>
      </div>
      <div>
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-manrope">Consolidado Corporativo</span>
        <h1 class="text-3xl font-black tracking-tight font-manrope">Reporte de Control Tombola</h1>
      </div>
    </div>
    
    <div class="flex flex-wrap items-center gap-3">
      <!-- Selector de Edición -->
      <div class="flex items-center gap-2">
        <label for="editionSelector" class="text-xs font-bold text-slate-400 uppercase tracking-wider">Edición:</label>
        <select id="editionSelector" class="bg-slate-800 border border-slate-700 text-slate-100 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors">
          <!-- Opciones dinámicas -->
        </select>
      </div>

      <!-- Botón de Pantalla Completa / Presentación -->
      <button onclick="toggleFullScreen()" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-2">
        <i data-lucide="maximize" class="w-4 h-4"></i>
        <span>Presentación</span>
      </button>
    </div>
  </header>

  <!-- CONTENIDO DEL INFORME (IMPRIMIBLE Y DINÁMICO) -->
  <main class="flex flex-col gap-8 animate-fade-in-up">
    
    <!-- CABECERA DEL REPORTE (IMPRESIÓN) -->
    <div class="hidden print:flex justify-between items-center border-b pb-4 border-slate-300 mb-6">
      <div>
        <h1 class="text-2xl font-black font-manrope text-slate-900">Estado de Control Corporativo - Tómbola</h1>
        <p id="printSubtitle" class="text-xs font-bold text-slate-500"></p>
      </div>
      <div class="text-right">
        <p class="text-xs font-bold text-slate-500">Fecha del Reporte: <span id="reportDate"></span></p>
      </div>
    </div>

    <!-- KPIs CABECERA (KPI GENERAL DE VENTAS Y RECAUDACIÓN) -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- KPI 1: Porcentaje de Ventas -->
      <div class="glass-card rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
        <div class="flex flex-col gap-1 z-10">
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Eficiencia de Ventas</span>
          <span id="kpiSoldPercent" class="text-4xl font-black font-manrope tracking-tighter text-indigo-400">-</span>
          <span id="kpiSoldDetails" class="text-[10px] text-slate-400 font-semibold mt-1"></span>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <i data-lucide="pie-chart" class="w-6 h-6"></i>
        </div>
      </div>

      <!-- KPI 2: Recaudación Directa -->
      <div class="glass-card rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
        <div class="flex flex-col gap-1 z-10">
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Recaudación Realizada</span>
          <span id="kpiCollectedAmount" class="text-4xl font-black font-manrope tracking-tighter text-emerald-400">-</span>
          <span id="kpiCollectedPercent" class="text-[10px] text-slate-400 font-semibold mt-1"></span>
        </div>
        <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <i data-lucide="trending-up" class="w-6 h-6"></i>
        </div>
      </div>

      <!-- KPI 3: Falta Recaudar -->
      <div id="kpiPendingCard" class="glass-card rounded-3xl p-6 relative overflow-hidden flex items-center justify-between">
        <div class="flex flex-col gap-1 z-10">
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Falta Recaudar</span>
          <span id="kpiPendingAmount" class="text-4xl font-black font-manrope tracking-tighter text-amber-400">-</span>
          <span id="kpiPendingDetails" class="text-[10px] text-slate-400 font-semibold mt-1">Diferencia de Objetivo - Recaudado</span>
        </div>
        <div id="kpiPendingIcon" class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <i data-lucide="banknote" class="w-6 h-6"></i>
        </div>
      </div>
    </section>

    <!-- ESTADO FINANCIERO: INGRESOS, EGRESOS Y BALANCE NETO -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Ingresos Totales -->
      <div class="glass-card rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-emerald-500">
        <div>
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Ingresos Totales (Balance)</span>
          <h3 id="balanceTotalIncome" class="text-3xl font-black font-manrope mt-1 text-slate-100">-</h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-505 flex items-center justify-center">
          <i data-lucide="trending-up" class="w-5 h-5"></i>
        </div>
      </div>

      <!-- Egresos Totales -->
      <div class="glass-card rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-rose-500">
        <div>
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Egresos Totales (Balance)</span>
          <h3 id="balanceTotalExpense" class="text-3xl font-black font-manrope mt-1 text-slate-100">-</h3>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-505 flex items-center justify-center">
          <i data-lucide="trending-down" class="w-5 h-5"></i>
        </div>
      </div>

      <!-- Balance Neto -->
      <div id="netBalanceCard" class="glass-card rounded-3xl p-6 flex items-center justify-between">
        <div>
          <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Balance Neto (Caja)</span>
          <h3 id="balanceNet" class="text-3xl font-black font-manrope mt-1">-</h3>
        </div>
        <div id="netBalanceIcon" class="w-10 h-10 rounded-xl flex items-center justify-center">
          <i id="netBalanceLucide" data-lucide="wallet" class="w-5 h-5"></i>
        </div>
      </div>
    </section>

    <!-- FOTOGRAFÍA 1 DE GRÁFICOS: DISTRIBUCIÓN DE BALANCE -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 print-break-after">
      <!-- Ingresos por Categoría -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="piggy-bank" class="text-emerald-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Ingresos por Categoría</h3>
        </div>
        <div class="h-[240px] flex items-center justify-center relative">
          <canvas id="chartIncomeCategories"></canvas>
          <div id="emptyIncomeState" class="hidden text-slate-500 text-xs font-semibold text-center absolute">
            No hay ingresos registrados para esta edición.
          </div>
        </div>
        <!-- Leyenda personalizada de tabla -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 pt-4 border-t border-slate-800/50" id="legendIncomeCategories">
          <!-- Se inyecta por JS -->
        </div>
      </div>

      <!-- Egresos por Categoría -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="receipt" class="text-rose-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Egresos por Categoría</h3>
        </div>
        <div class="h-[240px] flex items-center justify-center relative">
          <canvas id="chartExpenseCategories"></canvas>
          <div id="emptyExpenseState" class="hidden text-slate-500 text-xs font-semibold text-center absolute">
            No hay egresos registrados para esta edición.
          </div>
        </div>
        <!-- Leyenda personalizada de tabla -->
        <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 pt-4 border-t border-slate-800/50" id="legendExpenseCategories">
          <!-- Se inyecta por JS -->
        </div>
      </div>
    </section>

    <!-- FOTOGRAFÍA 2: MODALIDAD DE PAGO Y CANALES DE VENTA -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 print-break-after">
      <!-- Canales de Venta -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="briefcase" class="text-amber-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Canales de Venta (Particular vs. Club)</h3>
        </div>
        <div class="h-[220px] flex items-center justify-center">
          <canvas id="chartSalesBySellerType"></canvas>
        </div>
        <div class="flex justify-around mt-4 pt-4 border-t border-slate-800/50" id="legendSalesBySellerType">
          <!-- Se inyecta por JS -->
        </div>
      </div>

      <!-- Modalidad de Pago -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="credit-card" class="text-indigo-400 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Modalidad de Pago (Contado vs. Cuotas)</h3>
        </div>
        <div class="h-[220px] flex items-center justify-center">
          <canvas id="chartSalesPaymentType"></canvas>
        </div>
        <div class="flex justify-around mt-4 pt-4 border-t border-slate-800/50" id="legendSalesPaymentType">
          <!-- Se inyecta por JS -->
        </div>
      </div>
    </section>

    <!-- EVOLUCIÓN MENSUAL DE VENTAS -->
    <section class="glass-card rounded-3xl p-6 flex flex-col print-break-after">
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <i data-lucide="calendar" class="text-indigo-500 w-5 h-5"></i>
        <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Evolución Mensual de Ventas</h3>
      </div>
      <div class="h-[280px] w-full relative">
        <canvas id="chartSalesTrend"></canvas>
        <div id="emptyTrendState" class="hidden text-slate-500 text-xs font-semibold text-center absolute inset-0 flex items-center justify-center">
          No hay ventas cronológicas registradas en esta edición.
        </div>
      </div>
    </section>

    <!-- TABLAS DE GEOGRAFÍA Y RANKING DE VENDEDORES -->
    <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Distribución Geográfica de Ventas -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="map-pin" class="text-blue-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Distribución Geográfica</h3>
        </div>
        <div id="listSalesByCity" class="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
          <!-- Se inyecta por JS -->
        </div>
      </div>

      <!-- Nuevos Compradores por Localidad -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="user-plus" class="text-purple-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Nuevos Compradores</h3>
        </div>
        <!-- Indicador de Total Nuevos -->
        <div class="mb-2.5 mx-1 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
          <span>Total Nuevos</span>
          <span id="totalNewClientsLabel" class="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full text-[10px] font-black font-manrope">
            - asociados
          </span>
        </div>
        <div id="listNewClientsByCity" class="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
          <!-- Se inyecta por JS -->
        </div>
      </div>

      <!-- Rendimiento de Vendedores (Top) -->
      <div class="glass-card rounded-3xl p-6 flex flex-col">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <i data-lucide="award" class="text-amber-500 w-5 h-5"></i>
          <h3 class="font-black font-manrope text-sm uppercase tracking-wider text-slate-200">Ranking de Vendedores</h3>
        </div>
        <div id="listSalesBySeller" class="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
          <!-- Se inyecta por JS -->
        </div>
      </div>

    </section>

  </main>

  <footer class="no-print mt-16 border-t border-slate-800 pt-6 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
    <p>Tombola 2026 Elite System &bull; Reporte Corporativo Directiva</p>
  </footer>

  <!-- DATOS INYECTADOS DE MONGODB -->
  <script>
    const editionsData = ${dataString};
    let currentCharts = {};
  </script>

  <!-- CONTROL DE INTERFAZ E INTERACTIVIDAD -->
  <script>
    // Inicializar iconos
    lucide.createIcons();

    // Fecha actual para el reporte impreso
    const formatCurrentDate = () => {
      const now = new Date();
      return now.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' hs';
    };
    document.getElementById('reportDate').innerText = formatCurrentDate();

    // Formateador de moneda en ARS
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
      }).format(amount);
    };

    // Cargar Selector de Ediciones
    const selector = document.getElementById('editionSelector');
    editionsData.forEach((ed, idx) => {
      const option = document.createElement('option');
      option.value = ed.id;
      option.innerText = ed.name;
      if (idx === 0) option.selected = true;
      selector.appendChild(option);
    });

    // Escuchar cambios de edición
    selector.addEventListener('change', (e) => {
      updateDashboardData(e.target.value);
    });

    // Carga inicial
    if (editionsData.length > 0) {
      updateDashboardData(editionsData[0].id);
    }

    function updateDashboardData(editionId) {
      const ed = editionsData.find(e => e.id === editionId);
      if (!ed) return;

      // Actualizar subtítulo de impresión
      document.getElementById('printSubtitle').innerText = "Edición: " + ed.name;

      // --- 1. ACTUALIZAR KPIs ---
      document.getElementById('kpiSoldPercent').innerText = ed.soldPercent + '%';
      document.getElementById('kpiSoldDetails').innerText = ed.bingoCards.sold + ' vendidos de ' + ed.bingoCards.total + ' cartones';
      
      document.getElementById('kpiCollectedAmount').innerText = formatCurrency(ed.sellerPayments.total);
      document.getElementById('kpiCollectedPercent').innerText = ed.collectionPercent + '% del objetivo (' + formatCurrency(ed.expectedRevenueEdition) + ')';

      const pendingToCollect = ed.expectedRevenueEdition - ed.sellerPayments.total;
      const pendingAmountEl = document.getElementById('kpiPendingAmount');
      pendingAmountEl.innerText = formatCurrency(pendingToCollect);
      document.getElementById('kpiPendingDetails').innerText = 'De un total objetivo de ' + formatCurrency(ed.expectedRevenueEdition);
      
      const pendingCard = document.getElementById('kpiPendingCard');
      const pendingIcon = document.getElementById('kpiPendingIcon');
      
      if (pendingToCollect > 0) {
        pendingCard.className = "glass-card rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-amber-500/20 shadow-lg shadow-amber-950/5";
        pendingIcon.className = "w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30";
        pendingAmountEl.className = "text-4xl font-black font-manrope tracking-tighter text-amber-400";
      } else {
        pendingCard.className = "glass-card rounded-3xl p-6 relative overflow-hidden flex items-center justify-between border border-emerald-500/20 shadow-lg shadow-emerald-950/5";
        pendingIcon.className = "w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30";
        pendingAmountEl.className = "text-4xl font-black font-manrope tracking-tighter text-emerald-400";
        document.getElementById('kpiPendingDetails').innerText = '¡Objetivo de recaudación alcanzado!';
      }

      // --- 2. ESTADOS FINANCIEROS (BALANCE) ---
      document.getElementById('balanceTotalIncome').innerText = formatCurrency(ed.balanceStats.totalIncome);
      document.getElementById('balanceTotalExpense').innerText = formatCurrency(ed.balanceStats.totalExpense);
      
      const netVal = ed.balanceStats.netBalance;
      const netLabel = document.getElementById('balanceNet');
      const netCard = document.getElementById('netBalanceCard');
      const netIcon = document.getElementById('netBalanceIcon');
      netLabel.innerText = formatCurrency(netVal);
      if (netVal >= 0) {
        netLabel.className = "text-3xl font-black font-manrope mt-1 text-emerald-400";
        netCard.className = "glass-card rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-500/5 to-teal-500/5";
        netIcon.className = "w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center";
      } else {
        netLabel.className = "text-3xl font-black font-manrope mt-1 text-rose-400";
        netCard.className = "glass-card rounded-3xl p-6 flex items-center justify-between border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-500/5 to-amber-500/5";
        netIcon.className = "w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center";
      }

      // Destruir gráficos anteriores para evitar solapamientos
      Object.values(currentCharts).forEach(chart => {
        if (chart) chart.destroy();
      });
      currentCharts = {};

      // --- 3. DIBUJAR GRÁFICOS ---
      // A. Ingresos por Categoría
      const canvasInc = document.getElementById('chartIncomeCategories');
      const containerInc = document.getElementById('legendIncomeCategories');
      const emptyInc = document.getElementById('emptyIncomeState');
      containerInc.innerHTML = '';
      if (ed.balanceStats.income.length === 0) {
        canvasInc.style.display = 'none';
        emptyInc.classList.remove('hidden');
      } else {
        canvasInc.style.display = 'block';
        emptyInc.classList.add('hidden');
        
        const labels = ed.balanceStats.income.map(i => i.name);
        const values = ed.balanceStats.income.map(i => i.value);
        const colors = ['#10b981', '#059669', '#34d399', '#0284c7', '#60a5fa', '#3b82f6'];

        currentCharts.income = new Chart(canvasInc, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: values,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 2,
              borderColor: '#1e293b'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ': ' + formatCurrency(context.raw);
                  }
                }
              }
            },
            cutout: '60%'
          }
        });

        // Crear leyenda en formato tabla
        ed.balanceStats.income.forEach((item, index) => {
          const color = colors[index % colors.length];
          const div = document.createElement('div');
          div.className = "flex items-center justify-between text-[10px] font-bold text-slate-500 py-0.5 hover:bg-slate-800/30 px-1 rounded transition-colors";
          div.innerHTML = '<div class="flex items-center gap-2 truncate">' +
            '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ' + color + '"></span>' +
            '<span class="truncate font-semibold text-slate-300">' + item.name + '</span>' +
            '</div>' +
            '<span class="font-bold text-slate-100 ml-2">' + formatCurrency(item.value) + '</span>';
          containerInc.appendChild(div);
        });
      }

      // B. Egresos por Categoría
      const canvasExp = document.getElementById('chartExpenseCategories');
      const containerExp = document.getElementById('legendExpenseCategories');
      const emptyExp = document.getElementById('emptyExpenseState');
      containerExp.innerHTML = '';
      if (ed.balanceStats.expense.length === 0) {
        canvasExp.style.display = 'none';
        emptyExp.classList.remove('hidden');
      } else {
        canvasExp.style.display = 'block';
        emptyExp.classList.add('hidden');

        const labels = ed.balanceStats.expense.map(e => e.name);
        const values = ed.balanceStats.expense.map(e => e.value);
        const colors = ['#f43f5e', '#e11d48', '#fb7185', '#f59e0b', '#d97706', '#ec4899'];

        currentCharts.expense = new Chart(canvasExp, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: values,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 2,
              borderColor: '#1e293b'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.label + ': ' + formatCurrency(context.raw);
                  }
                }
              }
            },
            cutout: '60%'
          }
        });

        ed.balanceStats.expense.forEach((item, index) => {
          const color = colors[index % colors.length];
          const div = document.createElement('div');
          div.className = "flex items-center justify-between text-[10px] font-bold text-slate-500 py-0.5 hover:bg-slate-800/30 px-1 rounded transition-colors";
          div.innerHTML = '<div class="flex items-center gap-2 truncate">' +
            '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ' + color + '"></span>' +
            '<span class="truncate font-semibold text-slate-300">' + item.name + '</span>' +
            '</div>' +
            '<span class="font-bold text-slate-100 ml-2">' + formatCurrency(item.value) + '</span>';
          containerExp.appendChild(div);
        });
      }

      // C. Canales de Venta (Particular vs Club)
      const canvasSellers = document.getElementById('chartSalesBySellerType');
      const containerSellers = document.getElementById('legendSalesBySellerType');
      const partVal = ed.salesBySellerType.particular;
      const clubVal = ed.salesBySellerType.club;
      
      currentCharts.sellers = new Chart(canvasSellers, {
        type: 'doughnut',
        data: {
          labels: ['Particular', 'Comisión Club'],
          datasets: [{
            data: [partVal, clubVal],
            backgroundColor: ['#f59e0b', '#6366f1'],
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.label + ': ' + context.raw + ' ventas';
                }
              }
            }
          },
          cutout: '55%'
        }
      });

      containerSellers.innerHTML = '<div class="flex flex-col items-center">' +
        '<span class="text-lg font-black font-manrope text-slate-100">' + partVal + '</span>' +
        '<div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">' +
        '<span class="w-2.5 h-2.5 rounded-full bg-warning"></span>Particular' +
        '</div>' +
        '</div>' +
        '<div class="flex flex-col items-center">' +
        '<span class="text-lg font-black font-manrope text-slate-100">' + clubVal + '</span>' +
        '<div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">' +
        '<span class="w-2.5 h-2.5 rounded-full bg-primary"></span>Comisión Club' +
        '</div>' +
        '</div>';

      // D. Modalidad de Pago
      const canvasPayments = document.getElementById('chartSalesPaymentType');
      const containerPayments = document.getElementById('legendSalesPaymentType');
      const contado = ed.salesPaymentType.contado;
      const cuotas = ed.salesPaymentType.cuotas;
      const sinCargo = ed.salesPaymentType.sinCargo;

      currentCharts.payments = new Chart(canvasPayments, {
        type: 'doughnut',
        data: {
          labels: ['Contado', 'Cuotas', 'Sin Cargo'],
          datasets: [{
            data: [contado, cuotas, sinCargo],
            backgroundColor: ['#10b981', '#6366f1', '#94a3b8'],
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.label + ': ' + context.raw + ' ventas';
                }
              }
            }
          },
          cutout: '55%'
        }
      });

      containerPayments.innerHTML = '<div class="flex flex-col items-center">' +
        '<span class="text-base font-black font-manrope text-slate-100">' + contado + '</span>' +
        '<div class="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">' +
        '<span class="w-2 h-2 rounded-full bg-success"></span>Contado' +
        '</div>' +
        '</div>' +
        '<div class="flex flex-col items-center">' +
        '<span class="text-base font-black font-manrope text-slate-100">' + cuotas + '</span>' +
        '<div class="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">' +
        '<span class="w-2 h-2 rounded-full bg-primary"></span>Cuotas' +
        '</div>' +
        '</div>' +
        '<div class="flex flex-col items-center">' +
        '<span class="text-base font-black font-manrope text-slate-100">' + sinCargo + '</span>' +
        '<div class="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">' +
        '<span class="w-2 h-2 rounded-full bg-slate-400"></span>S. Cargo' +
        '</div>' +
        '</div>';

      // E. Evolución Mensual de Ventas (Tendencias)
      const canvasTrend = document.getElementById('chartSalesTrend');
      const emptyTrend = document.getElementById('emptyTrendState');
      if (ed.salesTrend.length === 0) {
        canvasTrend.style.display = 'none';
        emptyTrend.classList.remove('hidden');
      } else {
        canvasTrend.style.display = 'block';
        emptyTrend.classList.add('hidden');

        const labels = ed.salesTrend.map(t => t.monthLabel);
        const counts = ed.salesTrend.map(t => t.salesCount);

        currentCharts.trend = new Chart(canvasTrend, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Ventas por Mes',
              data: counts,
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#6366f1',
              pointBorderColor: '#0f172a',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
              },
              y: {
                grid: { color: 'rgba(255,255,255,0.03)' },
                ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
              }
            }
          }
        });
      }

      // --- 4. LISTAS Y RENDIMIENTO ---
      // A. Geográfico
      const listGeog = document.getElementById('listSalesByCity');
      listGeog.innerHTML = '';
      if (ed.salesByCity.length === 0) {
        listGeog.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs font-semibold">Sin ubicaciones registradas</div>';
      } else {
        const maxVal = ed.salesByCity.length > 0 ? ed.salesByCity[0].value : 1;
        ed.salesByCity.forEach(item => {
          const percent = Math.round((item.value / maxVal) * 100);
          const div = document.createElement('div');
          div.className = "flex flex-col gap-1 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/20 hover:bg-slate-800/10 transition-all duration-300 group";
          div.innerHTML = '<div class="flex items-center justify-between text-xs">' +
            '<div class="flex items-center gap-1.5">' +
            '<i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-400 opacity-60"></i>' +
            '<span class="font-bold text-slate-300 group-hover:text-indigo-400 transition-colors uppercase tracking-wider text-[10px]">' + item.name + '</span>' +
            '</div>' +
            '<span class="font-black text-slate-100 font-manrope">' + item.value + (item.value === 1 ? ' venta' : ' ventas') + '</span>' +
            '</div>' +
            '<div class="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500" style="width: ' + percent + '%"></div>' +
            '</div>';
          listGeog.appendChild(div);
        });
      }

      // B. Nuevos Compradores
      const listNew = document.getElementById('listNewClientsByCity');
      listNew.innerHTML = '';
      if (ed.newClientsByCity.length === 0) {
        listNew.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs font-semibold">Sin nuevos compradores registrados</div>';
        document.getElementById('totalNewClientsLabel').innerText = '0 asociados';
      } else {
        const totalNew = ed.newClientsByCity.reduce((acc, curr) => acc + curr.value, 0);
        document.getElementById('totalNewClientsLabel').innerText = totalNew + ' asociados';
        ed.newClientsByCity.forEach(item => {
          const percent = totalNew > 0 ? Math.round((item.value / totalNew) * 100) : 0;
          const div = document.createElement('div');
          div.className = "flex flex-col gap-1 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/20 hover:bg-slate-800/10 transition-all duration-300 group";
          div.innerHTML = '<div class="flex items-center justify-between text-xs">' +
            '<div class="flex items-center gap-1.5">' +
            '<i data-lucide="user-plus" class="w-3.5 h-3.5 text-purple-400 opacity-60"></i>' +
            '<span class="font-bold text-slate-300 group-hover:text-purple-400 transition-colors uppercase tracking-wider text-[10px]">' + item.name + '</span>' +
            '</div>' +
            '<span class="font-black text-slate-100 font-manrope">' + item.value + (item.value === 1 ? ' comprador' : ' compradores') + '</span>' +
            '</div>' +
            '<div class="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden">' +
            '<div class="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500" style="width: ' + percent + '%"></div>' +
            '</div>';
          listNew.appendChild(div);
        });
      }

      // C. Rendimiento Vendedores (Ranking)
      const listSellers = document.getElementById('listSalesBySeller');
      listSellers.innerHTML = '';
      if (ed.salesBySeller.length === 0) {
        listSellers.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs font-semibold">Sin ventas de vendedores registradas</div>';
      } else {
        ed.salesBySeller.forEach((item, index) => {
          const div = document.createElement('div');
          div.className = "flex flex-col gap-1 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/20 hover:bg-slate-800/10 transition-all duration-300 group";
          
          const typeBadge = item.isParticular 
            ? '<span class="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/20">Particular</span>'
            : '<span class="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">Club</span>';

          div.innerHTML = '<div class="flex items-center justify-between text-xs">' +
            '<span class="font-bold text-slate-200 truncate pr-2 group-hover:text-amber-400 transition-colors uppercase tracking-wide text-[10px]">' + item.name + '</span>' +
            '<span class="font-black text-slate-100 font-manrope shrink-0">' + item.cartonsCount + (item.cartonsCount === 1 ? ' cartón' : ' cartones') + '</span>' +
            '</div>' +
            '<div class="flex items-center justify-between text-[9px] font-bold text-slate-400 mt-1">' +
            '<div class="flex items-center gap-1.5">' +
            typeBadge +
            '</div>' +
            '<span class="font-extrabold text-slate-500">TOP #' + (index + 1) + '</span>' +
            '</div>';
          listSellers.appendChild(div);
        });
      }

      // Re-trigger Lucide Icons
      lucide.createIcons();
    }

    // Modo Pantalla Completa
    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          alert("Error al entrar en modo pantalla completa: " + err.message);
        });
      } else {
        document.exitFullscreen();
      }
    }
  </script>
</body>
</html>
`;
}

main();
