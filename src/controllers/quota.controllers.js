import Quota from '../models/quota.model.js';
import Sale from "../models/sale.model.js";
import dayjs from "dayjs";

// Obtener todas las cuotas
export const getQuotas = async (req, res) => {
    try {
        const quotas = await Quota.find().populate('sale');
        res.json(quotas);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener cuotas con paginación y filtros
export const getQuotasV2 = async (req, res) => {
  try {
    // Paginación
    const page = parseInt(req.query.page) || 1; // Página actual
    const limit = parseInt(req.query.limit) || 10; // Cuotas por página
    const skip = (page - 1) * limit;

    // Filtros
    const filter = {};

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

    // Filtro por ID de venta (sale)
    if (req.query.saleId) {
      filter.sale = req.query.saleId;
    }

    if (req.query.quotaNumber) {
      filter.quotaNumber = parseInt(req.query.quotaNumber);
    }

    // Orden (por defecto: más recientes primero, luego bingo y cuota descendente)
    let sort = {};
    if (req.query.sortBy) {
      const [field, direction] = req.query.sortBy.split(':'); // Ej: sortBy=dueDate:asc
      sort[field] = direction === 'desc' ? -1 : 1;
    } else {
      sort = {
        updatedAt: -1,   // Últimas actualizaciones primero
      };
    }

    // Consulta principal
    const [total, quotas] = await Promise.all([
      Quota.countDocuments(filter),
      Quota.find(filter)
        .populate({
          path: "sale",
          populate: [
            { path: "seller", model: "Seller", populate: { path: "person", model: "Person" } },
            { path: "client", model: "Client", populate: { path: "person", model: "Person" } },
            { path: "bingoCard", model: "BingoCard" },
            { path: "edition", model: "Edition" },
          ],
        })
        .sort(sort)
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
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
            { path: "bingoCard", model: "BingoCard" },
            { path: "edition", model: "Edition" },
          ],
        });
  
      // Filtrar cuotas donde sale no sea null (porque match puede dejarlo null)
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

        // Buscar cuotas que correspondan a la venta y poblar la información de Sale
        const quotas = await Quota.find({ sale: saleId }).populate("sale");

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
        // 1️⃣ Actualizar la cuota con los datos nuevos
        const quota = await Quota.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('sale');
        if (!quota) return res.status(404).json({ message: 'Cuota no encontrada' });

        // 2️⃣ Obtener todas las cuotas asociadas a la misma venta (Sale)
        const quotas = await Quota.find({ sale: quota.sale._id });

        // 3️⃣ Verificar si TODAS las cuotas tienen un `paymentDate` definido
        const allPaid = quotas.every(q => q.paymentDate !== null);

        // 4️⃣ Determinar el nuevo estado de la venta
        const newStatus = allPaid ? "Pagado" : "Pendiente de pago";

        // 5️⃣ Actualizar la venta con el nuevo estado
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
