import Sale from '../models/sale.model.js';
import BingoCard from '../models/bingoCard.model.js';
import Quota from "../models/quota.model.js";
import Edition from "../models/edition.model.js";
import mongoose from 'mongoose';

// Helper interno para calcular métricas de cuotas por venta en una sola pasada
const attachQuotaMetrics = async (salesDocs) => {
    if (!salesDocs.length) return [];

    const salesIds = salesDocs.map(s => s._id);
    const quotas = await Quota.find({ sale: { $in: salesIds } })
        .select('sale amount paymentDate')
        .lean();

    const metricsBySale = {};
    for (const q of quotas) {
        const saleIdStr = q.sale.toString();
        if (!metricsBySale[saleIdStr]) {
            metricsBySale[saleIdStr] = { totalQuotas: 0, paidQuotas: 0, paidAmount: 0 };
        }
        metricsBySale[saleIdStr].totalQuotas += 1;
        if (q.paymentDate !== null && q.paymentDate !== undefined) {
            metricsBySale[saleIdStr].paidQuotas += 1;
            metricsBySale[saleIdStr].paidAmount += (q.amount || 0);
        }
    }

    return salesDocs.map(sale => {
        const plainSale = typeof sale.toObject === 'function' ? sale.toObject() : sale;
        const m = metricsBySale[plainSale._id.toString()] || { totalQuotas: 0, paidQuotas: 0, paidAmount: 0 };
        return {
            ...plainSale,
            totalQuotas: m.totalQuotas,
            paidQuotas: m.paidQuotas,
            paidAmount: m.paidAmount
        };
    });
};

// Obtener todas las ventas
export const getSales = async (req, res) => {
    try {
        const filter = {};
        if (req.query.edition) {
            filter.edition = req.query.edition;
        }

        const sales = await Sale.find(filter)
            .sort({ saleNumber: -1 })
            .populate([
                { path: 'edition' },
                { path: 'bingoCard', select: '-cardSets -numbers' },
                {
                    path: 'client',
                    populate: { path: 'person' }
                },
                {
                    path: 'seller',
                    populate: { path: 'person' }
                },
                { path: 'user' }
            ])
            .lean();

        const salesWithQuotasInfo = await attachQuotaMetrics(sales);
        res.json(salesWithQuotasInfo);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener una venta por ID
export const getSale = async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id).populate([
        { path: 'edition' },
        { path: 'bingoCard', select: '-cardSets -numbers' },
        {
          path: 'client',
          populate: { path: 'person' }
        },
        {
          path: 'seller',
          populate: { path: 'person' }
        },
        { path: 'user' }
      ]).lean();
  
      if (!sale) return res.status(404).json({ message: 'Sale not found' });

      const [saleWithMetrics] = await attachQuotaMetrics([sale]);
      res.json(saleWithMetrics);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
};

// Crear una nueva venta y generar sus cuotas automáticamente
export const createSale = async (req, res) => {
    try {
        const { edition, seller, client, bingoCard, saleDate, status } = req.body;

        if (!edition || !seller || !client || !bingoCard || !saleDate || !status) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const editionData = await Edition.findById(edition);
        if (!editionData) {
            return res.status(404).json({ message: "Edición no encontrada" });
        }

        const { installments } = editionData;
        if (!installments || !Array.isArray(installments) || installments.length === 0) {
            return res.status(400).json({ message: "La edición no tiene cuotas definidas" });
        }

        const newSale = new Sale({
            edition,
            seller,
            client,
            bingoCard,
            saleDate,
            status,
            user: req.user ? req.user.id : null,
        });

        const savedSale = await newSale.save();

        await BingoCard.findByIdAndUpdate(bingoCard, { status: "Vendido" });

        const quotas = installments.map((installment) => ({
            sale: savedSale._id,
            quotaNumber: installment.quotaNumber,
            dueDate: new Date(installment.dueDate),
            amount: parseFloat(installment.amount.toFixed(2)),
            paymentDate: null,
            paymentMethod: null,
        }));

        const createdQuotas = await Quota.insertMany(quotas);

        res.json({ sale: savedSale, quotas: createdQuotas });
    } catch (error) {
        console.error("❌ Error en createSale:", error);
        res.status(500).json({ message: "Error al crear la venta y cuotas", error: error.message });
    }
};

// Editar una venta
export const updateSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate([
                { path: 'edition' },
                { path: 'bingoCard', select: '-cardSets -numbers' },
                { path: 'seller', populate: { path: 'person' } },
                { path: 'client', populate: { path: 'person' } },
                { path: 'user' }
            ])
            .lean();
        if (!sale) return res.status(404).json({ message: 'Sale not found' });
        
        const [saleWithMetrics] = await attachQuotaMetrics([sale]);
        res.json(saleWithMetrics);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const cancelSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        
        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        sale.status = "Anulada";
        await sale.save();

        if (sale.bingoCard) {
            await BingoCard.findByIdAndUpdate(
                sale.bingoCard, 
                { status: "Disponible" },
                { new: true } 
            );
        }

        const updatedSale = await Sale.findById(req.params.id)
            .populate([
                { path: 'edition' },
                { path: 'bingoCard', select: '-cardSets -numbers' },
                { path: 'seller', populate: { path: 'person' } },
                { path: 'client', populate: { path: 'person' } },
                { path: 'user' }
            ])
            .lean();

        const [saleWithMetrics] = await attachQuotaMetrics([updatedSale]);
        res.json(saleWithMetrics);
    } catch (error) {
        console.error("❌ Error en cancelSale:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar una venta
export const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findByIdAndDelete(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        res.status(204).json({ message: 'Sale deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener ventas por vendedor (incluye totalQuotas, paidQuotas y paidAmount para evitar N+1 en frontend)
export const getSalesBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const sales = await Sale.find({ seller: sellerId })
            .populate([
                { path: 'edition' },
                { path: 'bingoCard', select: '-cardSets -numbers' },
                {
                    path: 'client',
                    populate: { path: 'person' }
                },
                {
                    path: 'seller',
                    populate: { path: 'person' }
                },
                { path: 'user' }
            ])
            .lean();

        const salesWithQuotasInfo = await attachQuotaMetrics(sales);
        res.json(salesWithQuotasInfo);
    } catch (error) {
        console.error("❌ Error en getSalesBySeller:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Operación atómica batch para Pago Contado, Entrega Sin Cargo y Reversión Sin Cargo (elimina N+1 de PUT /quota/:id)
export const processBatchSalePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, date, method, cardDetails } = req.body;

        const sale = await Sale.findById(id);
        if (!sale) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        if (action === "full_payment") {
            const paymentDate = date ? new Date(date) : new Date();
            const paymentMethod = method || "Efectivo";

            await Quota.updateMany(
                { sale: sale._id },
                { $set: { paymentDate, paymentMethod } }
            );

            sale.status = "Pagado";
            sale.fullPaymentMethod = paymentMethod;
            sale.lastFullPayment = paymentDate;
            if (cardDetails) {
                sale.cardPaymentDetails = { ...cardDetails };
            }
            await sale.save();
        } else if (action === "no_charge") {
            const paymentDate = date ? new Date(date) : new Date();

            await Quota.updateMany(
                { sale: sale._id },
                { $set: { paymentDate, paymentMethod: "Entregado sin cargo" } }
            );

            sale.status = "Entregado sin cargo";
            sale.lastFullPayment = paymentDate;
            sale.fullPaymentMethod = "Otro";
            await sale.save();
        } else if (action === "undo_no_charge") {
            await Quota.updateMany(
                { sale: sale._id },
                { $set: { paymentDate: null, paymentMethod: null } }
            );

            sale.status = "Pendiente de pago";
            sale.lastFullPayment = null;
            sale.fullPaymentMethod = undefined;
            await sale.save();
        } else {
            return res.status(400).json({ message: "Acción batch inválida" });
        }

        const updatedSale = await Sale.findById(sale._id)
            .populate([
                { path: 'edition' },
                { path: 'bingoCard', select: '-cardSets -numbers' },
                { path: 'client', populate: { path: 'person' } },
                { path: 'seller', populate: { path: 'person' } },
                { path: 'user' }
            ])
            .lean();

        const updatedQuotas = await Quota.find({ sale: sale._id })
            .populate("sale")
            .sort({ quotaNumber: 1 })
            .lean();

        const [saleWithMetrics] = await attachQuotaMetrics([updatedSale]);

        return res.json({
            sale: saleWithMetrics,
            quotas: updatedQuotas
        });
    } catch (error) {
        console.error("❌ Error en processBatchSalePayment:", error);
        return res.status(500).json({ message: error.message });
    }
};
