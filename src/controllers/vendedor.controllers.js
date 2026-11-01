import BingoCard from '../models/bingoCard.model.js';
import Sale from '../models/sale.model.js';
import Quota from '../models/quota.model.js';
import Edition from '../models/edition.model.js';
import Seller from '../models/seller.model.js';
import Client from '../models/client.model.js';
import SellerPayment from '../models/sellerPayment.model.js';

/**
 * 1. Resumen Ejecutivo del Vendedor (Métricas de Bolsillo / Home Mobile) 📊
 * Retorna estado de inventario, dinero cobrado pendiente de rendir y comisión.
 */
export const getVendedorSummary = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        if (!sellerId) {
            return res.status(403).json({ message: "Usuario sin vendedor asignado" });
        }

        const seller = await Seller.findById(sellerId).populate('person').lean();
        if (!seller) {
            return res.status(404).json({ message: "Ficha de vendedor no encontrada" });
        }

        // Buscar edición activa
        let edition = null;
        if (req.query.editionId) {
            edition = await Edition.findById(req.query.editionId).lean();
        } else {
            edition = await Edition.findOne().sort({ createdAt: -1 }).lean();
        }

        const editionFilter = edition ? { edition: edition._id } : {};

        // 1. Inventario de cartones asignados a este vendedor
        const totalCards = await BingoCard.countDocuments({ seller: sellerId, ...editionFilter });
        const soldCards = await BingoCard.countDocuments({ seller: sellerId, status: 'Vendido', ...editionFilter });
        const availableCards = await BingoCard.countDocuments({ seller: sellerId, status: 'Disponible', ...editionFilter });

        // 2. Ventas activas del vendedor
        const sales = await Sale.find({ seller: sellerId, status: { $ne: 'Anulada' }, ...editionFilter })
            .select('_id')
            .lean();
        const saleIds = sales.map(s => s._id);

        // 3. Cuotas cobradas en la calle por este vendedor
        const paidQuotas = await Quota.find({
            sale: { $in: saleIds },
            paymentDate: { $ne: null }
        }).select('amount').lean();

        const totalCollected = paidQuotas.reduce((sum, q) => sum + (q.amount || 0), 0);

        // 4. Rendiciones oficiales realizadas en secretaría del club (SellerPayment)
        const sellerPayments = await SellerPayment.find({
            seller: sellerId,
            status: 'Activo',
            ...editionFilter
        }).lean();

        const totalRendered = sellerPayments.reduce((sum, p) => {
            const checksTotal = (p.checks || []).reduce((cSum, c) => cSum + (c.amount || 0), 0);
            return sum + (p.cashAmount || 0) + (p.transferAmount || 0) + (p.tarjetaUnicaAmount || 0) + checksTotal;
        }, 0);

        // 5. Dinero cobrado en la calle pendiente de rendir al club
        const pendingToRender = Math.max(0, totalCollected - totalRendered);

        // 6. Comisión acumulada
        const commissionRate = seller.commissionRate || 0;
        const commissionEarned = Math.round((totalRendered * commissionRate) / 100);

        res.json({
            seller: {
                id: seller._id,
                sellerNumber: seller.sellerNumber,
                name: `${seller.person?.firstName || ''} ${seller.person?.lastName || ''}`.trim(),
                commissionRate
            },
            edition: edition ? { id: edition._id, name: edition.name } : null,
            metrics: {
                totalCards,
                soldCards,
                availableCards,
                totalCollected,
                totalRendered,
                pendingToRender,
                commissionEarned
            }
        });
    } catch (error) {
        console.error("Error en getVendedorSummary:", error);
        res.status(500).json({ message: "Error al obtener resumen de vendedor", error: error.message });
    }
};

/**
 * 2. Cartones Asignados al Vendedor 🎟️
 * Permite filtrar por estado (Disponibles / Vendidos).
 */
export const getVendedorCards = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        const { status, editionId } = req.query;

        const query = { seller: sellerId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (editionId) {
            query.edition = editionId;
        }

        const cards = await BingoCard.find(query)
            .select('number status edition seller')
            .populate('edition', 'name cost')
            .sort({ number: 1 })
            .lean();

        res.json(cards);
    } catch (error) {
        console.error("Error en getVendedorCards:", error);
        res.status(500).json({ message: "Error al listar cartones", error: error.message });
    }
};

/**
 * 3. Cuotas de Ventas del Vendedor 💳
 * Lista cuotas pendientes y cobradas con datos mínimos del asociado para la calle.
 */
export const getVendedorQuotas = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        const { status = 'pending', editionId } = req.query;

        const saleQuery = { seller: sellerId, status: { $ne: 'Anulada' } };
        if (editionId) saleQuery.edition = editionId;

        const sales = await Sale.find(saleQuery)
            .populate({
                path: 'client',
                populate: { path: 'person', select: 'firstName lastName phone address city document' }
            })
            .populate('bingoCard', 'number')
            .populate('edition', 'name')
            .lean();

        if (!sales.length) {
            return res.json([]);
        }

        const saleMap = new Map(sales.map(s => [s._id.toString(), s]));
        const saleIds = sales.map(s => s._id);

        const quotaQuery = { sale: { $in: saleIds } };
        if (status === 'pending') {
            quotaQuery.paymentDate = null;
        } else if (status === 'paid') {
            quotaQuery.paymentDate = { $ne: null };
        }

        const quotas = await Quota.find(quotaQuery)
            .sort({ dueDate: 1, quotaNumber: 1 })
            .lean();

        const today = new Date();
        const enriched = quotas.map(q => {
            const sale = saleMap.get(q.sale?.toString());
            const isPaid = !!q.paymentDate;
            const isExpired = !isPaid && new Date(q.dueDate) < today;

            return {
                _id: q._id,
                saleId: q.sale,
                saleNumber: sale?.saleNumber,
                quotaNumber: q.quotaNumber,
                amount: q.amount,
                dueDate: q.dueDate,
                paymentDate: q.paymentDate,
                paymentMethod: q.paymentMethod,
                isPaid,
                isExpired,
                bingoCardNumber: sale?.bingoCard?.number,
                client: sale?.client ? {
                    id: sale.client._id,
                    clientNumber: sale.client.clientNumber,
                    fullName: `${sale.client.person?.lastName || ''}, ${sale.client.person?.firstName || ''}`.trim(),
                    phone: sale.client.person?.phone,
                    city: sale.client.person?.city,
                    address: sale.client.person?.address,
                    document: sale.client.person?.document
                } : null
            };
        });

        res.json(enriched);
    } catch (error) {
        console.error("Error en getVendedorQuotas:", error);
        res.status(500).json({ message: "Error al listar cuotas", error: error.message });
    }
};

/**
 * 4. Venta Rápida de Campo (Mobile Wizard) ✍️
 * Valida que el cartón pertenezca al vendedor y esté disponible.
 */
export const createVendedorSale = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        const { bingoCardId, clientId, paymentType = 'Cuotas', saleDate = new Date() } = req.body;

        if (!bingoCardId || !clientId) {
            return res.status(400).json({ message: "Cartón y Asociado son obligatorios" });
        }

        // 1. Validar que el cartón pertenezca al vendedor y esté disponible (RN-ROL-01)
        const card = await BingoCard.findById(bingoCardId);
        if (!card) {
            return res.status(404).json({ message: "Cartón no encontrado" });
        }

        if (card.seller?.toString() !== sellerId) {
            return res.status(403).json({ message: "El cartón no está asignado a su cartera" });
        }

        if (card.status === 'Vendido') {
            return res.status(400).json({ message: "El cartón ya se encuentra vendido" });
        }

        // 2. Validar cliente
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: "Asociado no encontrado" });
        }

        // 3. Validar edición y cuotas
        const edition = await Edition.findById(card.edition);
        if (!edition || !edition.installments || edition.installments.length === 0) {
            return res.status(400).json({ message: "La edición no posee cuotas configuradas" });
        }

        // 4. Crear la Venta
        const isContado = paymentType === 'Contado';
        const newSale = new Sale({
            edition: card.edition,
            seller: sellerId,
            client: clientId,
            bingoCard: card._id,
            saleDate,
            status: isContado ? 'Pagado' : 'Pendiente de pago',
            fullPaymentMethod: isContado ? 'Efectivo' : undefined,
            lastFullPayment: isContado ? new Date() : undefined,
            user: req.user.id || req.user._id
        });

        const savedSale = await newSale.save();

        // 5. Actualizar estado del cartón
        card.status = 'Vendido';
        await card.save();

        // 6. Generar cuotas
        const quotasToInsert = edition.installments.map(inst => ({
            sale: savedSale._id,
            quotaNumber: inst.quotaNumber,
            dueDate: inst.dueDate,
            amount: inst.amount,
            paymentDate: isContado ? new Date() : null,
            paymentMethod: isContado ? 'Efectivo' : undefined
        }));

        await Quota.insertMany(quotasToInsert);

        const populatedSale = await Sale.findById(savedSale._id)
            .populate('bingoCard', 'number')
            .populate({ path: 'client', populate: { path: 'person' } })
            .lean();

        res.status(201).json({
            message: "Venta registrada con éxito",
            sale: populatedSale
        });
    } catch (error) {
        console.error("Error en createVendedorSale:", error);
        res.status(500).json({ message: "Error al registrar venta", error: error.message });
    }
};

/**
 * 5. Cobro Táctil de Cuota en la Calle 💵
 * Registra pago de cuota validando pertenencia a la cartera del vendedor.
 */
export const payVendedorQuota = async (req, res) => {
    try {
        const sellerId = req.sellerId;
        const { quotaId, paymentMethod = 'Efectivo', paymentDate = new Date() } = req.body;

        if (!quotaId) {
            return res.status(400).json({ message: "El ID de la cuota es obligatorio" });
        }

        const quota = await Quota.findById(quotaId).populate('sale');
        if (!quota) {
            return res.status(404).json({ message: "Cuota no encontrada" });
        }

        // Validar que la venta pertenezca a este vendedor (RN-ROL-03)
        if (quota.sale?.seller?.toString() !== sellerId) {
            return res.status(403).json({ message: "No tiene permisos para cobrar cuotas de ventas ajenas" });
        }

        // Registrar pago
        quota.paymentDate = paymentDate;
        quota.paymentMethod = paymentMethod;
        await quota.save();

        // Verificar si la venta completó todas sus cuotas (RN-VEN-02)
        const allQuotas = await Quota.find({ sale: quota.sale._id });
        const allPaid = allQuotas.every(q => q.paymentDate !== null && q.paymentDate !== undefined);

        if (allPaid && quota.sale.status !== 'Entregado sin cargo') {
            await Sale.findByIdAndUpdate(quota.sale._id, { status: 'Pagado' });
        }

        res.json({
            message: "Cuota cobrada exitosamente",
            quota: {
                _id: quota._id,
                quotaNumber: quota.quotaNumber,
                amount: quota.amount,
                paymentDate: quota.paymentDate,
                paymentMethod: quota.paymentMethod,
                isSaleFullyPaid: allPaid
            }
        });
    } catch (error) {
        console.error("Error en payVendedorQuota:", error);
        res.status(500).json({ message: "Error al registrar cobro de cuota", error: error.message });
    }
};
