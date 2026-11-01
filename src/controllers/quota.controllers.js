import Quota from '../models/quota.model.js';
import Sale from "../models/sale.model.js";
import dayjs from "dayjs";

// Obtener todas las cuotas
export const getQuotas = async (req, res) => {
    try {
        const quotas = await Quota.find().populate('sale').lean();
        res.json(quotas);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener cuotas con paginación y filtros (incluye filtro por edición y fecha de actualización en servidor)
export const getQuotasV2 = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filtro por edición en servidor (resuelve el desfase de paginación en QuotasPage)
    if (req.query.edition) {
      const editionSales = await Sale.find({
        edition: req.query.edition,
        status: { $ne: "Anulada" }
      }).select('_id').lean();
      filter.sale = { $in: editionSales.map(s => s._id) };
    }

    // Filtro por estado de pago
    if (req.query.paid === 'true') {
      filter.paymentDate = { $ne: null };
    } else if (req.query.paid === 'false') {
      filter.paymentDate = null;
    }

    // Filtro por método de pago
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    // Filtro por fecha de vencimiento desde/hasta
    if (req.query.dueFrom || req.query.dueTo) {
      filter.dueDate = {};
      if (req.query.dueFrom) filter.dueDate.$gte = new Date(req.query.dueFrom);
      if (req.query.dueTo) filter.dueDate.$lte = new Date(req.query.dueTo);
    }

    // Filtro por fecha de modificación (updatedDate en QuotasPage)
    if (req.query.updatedDate) {
      const startOfDay = dayjs(req.query.updatedDate).startOf('day').toDate();
      const endOfDay = dayjs(req.query.updatedDate).endOf('day').toDate();
      filter.updatedAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // Filtro por ID de venta específico
    if (req.query.saleId) {
      filter.sale = req.query.saleId;
    }

    if (req.query.quotaNumber) {
      filter.quotaNumber = parseInt(req.query.quotaNumber);
    }

    let sort = {};
    if (req.query.sortBy) {
      const [field, direction] = req.query.sortBy.split(':');
      sort[field] = direction === 'desc' ? -1 : 1;
    } else {
      sort = { updatedAt: -1 };
    }

    const [total, quotas] = await Promise.all([
      Quota.countDocuments(filter),
      Quota.find(filter)
        .populate({
          path: "sale",
          populate: [
            { path: "seller", model: "Seller", populate: { path: "person", model: "Person" } },
            { path: "client", model: "Client", populate: { path: "person", model: "Person" } },
            { path: "bingoCard", model: "BingoCard", select: "-cardSets -numbers" },
            { path: "edition", model: "Edition" },
          ],
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      quotas
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpiredQuotas = async (req, res) => {
    try {
      const today = dayjs().startOf("day").toDate();
  
      const quotas = await Quota.find({
        paymentMethod: null,
        paymentDate: null,
        dueDate: { $lt: today },
      })
        .populate({
          path: "sale",
          match: { status: { $ne: "Anulada" } }, 
          populate: [
            { path: "seller", model: "Seller", populate: { path: "person", model: "Person" } },
            { path: "client", model: "Client", populate: { path: "person", model: "Person" } },
            { path: "bingoCard", model: "BingoCard", select: "-cardSets -numbers" },
            { path: "edition", model: "Edition" },
          ],
        })
        .lean();
  
      const filteredQuotas = quotas.filter(quota => quota.sale !== null);
  
      res.json(filteredQuotas);
    } catch (error) {
      console.error("Error al obtener cuotas vencidas:", error);
      return res.status(500).json({ message: error.message });
    }
  };

// Obtener cuotas de una venta específica (Sale)
export const getQuotasBySale = async (req, res) => {
    try {
        const saleId = req.params.saleId;

        if (!saleId) {
            return res.status(400).json({ message: "saleId es requerido" });
        }

        const quotas = await Quota.find({ sale: saleId })
            .populate("sale")
            .sort({ quotaNumber: 1 })
            .lean();

        if (!quotas.length) {
            return res.status(404).json({ message: "No se encontraron cuotas para esta venta" });
        }

        res.json(quotas);
    } catch (error) {
        console.error("Error obteniendo cuotas:", error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// Obtener una cuota por ID
export const getQuota = async (req, res) => {
    try {
        const quota = await Quota.findById(req.params.id).populate('sale');
        if (!quota) return res.status(404).json({ message: 'Cuota no encontrada' });
        res.json(quota);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Crear una nueva cuota
export const createQuota = async (req, res) => {
    try {
        const { sale, quotaNumber, dueDate, amount, paymentDate, paymentMethod } = req.body;

        const newQuota = new Quota({
            sale,
            quotaNumber,
            dueDate,
            amount,
            paymentDate,
            paymentMethod
        });

        const savedQuota = await newQuota.save();
        res.json(savedQuota);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Editar una cuota
export const updateQuota = async (req, res) => {
    try {
        const quota = await Quota.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('sale');
        if (!quota) return res.status(404).json({ message: 'Cuota no encontrada' });

        const quotas = await Quota.find({ sale: quota.sale._id }).select('paymentDate').lean();

        const allPaid = quotas.every(q => q.paymentDate !== null);

        // Si la venta estaba entregada sin cargo y siguen todas con fecha, preservar o recalcular estado
        const currentSale = quota.sale;
        const newStatus = allPaid
            ? (currentSale.status === "Entregado sin cargo" ? "Entregado sin cargo" : "Pagado")
            : "Pendiente de pago";

        const sale = await Sale.findByIdAndUpdate(
            quota.sale._id,
            { status: newStatus },
            { new: true }
        );

        res.json({ quota, sale });
    } catch (error) {
        console.error("Error actualizando la cuota o la venta:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Eliminar una cuota
export const deleteQuota = async (req, res) => {
    try {
        const quota = await Quota.findByIdAndDelete(req.params.id);
        if (!quota) return res.status(404).json({ message: 'Cuota no encontrada' });

        res.status(204).json({ message: 'Cuota eliminada con éxito' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
