import Balance from '../models/balance.model.js';
import Edition from '../models/edition.model.js';

// ─── Populate helper ─────────────────────────────────────────────────────────
const fullPopulate = (query) =>
  query
    .populate('edition', 'name')
    .populate({ path: 'createdBy', select: 'username email', populate: { path: 'person', select: 'firstName lastName' } })
    .populate({ path: 'canceledBy', select: 'username email', populate: { path: 'person', select: 'firstName lastName' } })
    .populate('sellerPaymentRef', 'sellerPaymentNumber');

// ─── Crear movimiento de balance ─────────────────────────────────────────────
export const createBalance = async (req, res) => {
  try {
    const {
      edition,
      type,
      date,
      counterpart,
      concept,
      category,
      cashAmount = 0,
      transferAmount = 0,
      tarjetaUnicaAmount = 0,
      checks = [],
      observations = '',
      sellerPaymentRef = null,
      taxPercentage = null,
      totalRenderedAmount = null,
      taxPaymentDate = null,
      declarationDate = null,
    } = req.body;

    // Validar edición
    const editionData = await Edition.findById(edition);
    if (!editionData) {
      return res.status(404).json({ message: 'Edición no encontrada' });
    }

    const createdBy = req.user?._id || req.user?.id;

    // Calcular totales (el pre-save los recalculará también)
    const checkTotal = checks.reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const totalAmount =
      Number(cashAmount) +
      Number(transferAmount) +
      Number(tarjetaUnicaAmount) +
      checkTotal;

    if (totalAmount <= 0) {
      return res.status(400).json({
        message:
          'Debe ingresar al menos un monto mayor a cero (efectivo, transferencia, tarjeta o cheque)',
      });
    }

    const newBalance = new Balance({
      edition,
      type,
      date,
      counterpart,
      concept,
      category,
      cashAmount,
      transferAmount,
      tarjetaUnicaAmount,
      checks,
      observations,
      sellerPaymentRef: sellerPaymentRef || null,
      taxPercentage,
      totalRenderedAmount,
      taxPaymentDate: taxPaymentDate || null,
      declarationDate: declarationDate || null,
      createdBy,
    });

    const saved = await newBalance.save();
    const populated = await fullPopulate(Balance.findById(saved._id));

    return res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error en createBalance:', error.message);
    return res.status(500).json({ message: 'Error al registrar el movimiento', error: error.message });
  }
};

// ─── Obtener todos los movimientos ───────────────────────────────────────────
export const getBalances = async (req, res) => {
  try {
    const balances = await fullPopulate(
      Balance.find().sort({ transactionNumber: -1 })
    );
    return res.json(balances);
  } catch (error) {
    console.error('❌ Error en getBalances:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Obtener movimientos por edición ─────────────────────────────────────────
export const getBalancesByEdition = async (req, res) => {
  try {
    const { editionId } = req.params;
    const balances = await fullPopulate(
      Balance.find({ edition: editionId }).sort({ transactionNumber: -1 })
    );
    return res.json(balances);
  } catch (error) {
    console.error('❌ Error en getBalancesByEdition:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Obtener un movimiento por ID ─────────────────────────────────────────────
export const getBalanceById = async (req, res) => {
  try {
    const balance = await fullPopulate(Balance.findById(req.params.id));
    if (!balance) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    return res.json(balance);
  } catch (error) {
    console.error('❌ Error en getBalanceById:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Anular un movimiento ─────────────────────────────────────────────────────
export const cancelBalance = async (req, res) => {
  try {
    const balance = await Balance.findById(req.params.id);

    if (!balance) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    if (balance.status === 'Anulado') {
      return res.status(400).json({ message: 'El movimiento ya está anulado' });
    }

    balance.status = 'Anulado';
    balance.canceledBy = req.user?._id || req.user?.id;
    balance.canceledAt = new Date();

    await balance.save();

    const updated = await fullPopulate(Balance.findById(balance._id));
    return res.json(updated);
  } catch (error) {
    console.error('❌ Error en cancelBalance:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Resumen / KPIs por edición ───────────────────────────────────────────────
export const getBalanceSummary = async (req, res) => {
  try {
    const { edition } = req.query;

    const filter = { status: 'Activo' };
    if (edition) filter.edition = edition;

    const movements = await Balance.find(filter, 'type totalAmount');

    const totalIngresos = movements
      .filter((m) => m.type === 'Ingreso')
      .reduce((sum, m) => sum + (m.totalAmount || 0), 0);

    const totalEgresos = movements
      .filter((m) => m.type === 'Egreso')
      .reduce((sum, m) => sum + (m.totalAmount || 0), 0);

    const netBalance = totalIngresos - totalEgresos;

    return res.json({ totalIngresos, totalEgresos, netBalance });
  } catch (error) {
    console.error('❌ Error en getBalanceSummary:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── Función interna: crear movimientos automáticos desde SellerPayment ──────
// Usada internamente por sellerPayment.controllers.js (no es una ruta HTTP).
export const createBalanceFromSellerPayment = async ({
  edition,
  sellerPaymentRef,
  sellerName,
  cashAmount,
  transferAmount,
  tarjetaUnicaAmount,
  checks,
  commissionAmount,
  commissionType,
  date,
  createdBy,
}) => {
  const movements = [];

  // Movimiento 1: Ingreso por rendición del vendedor
  const ingreso = new Balance({
    edition,
    type: 'Ingreso',
    date,
    counterpart: sellerName,
    concept: 'Rendición de ventas de cartones',
    category: 'Rendición de Vendedor',
    cashAmount,
    transferAmount,
    tarjetaUnicaAmount,
    checks: checks || [],
    observations: '',
    sellerPaymentRef,
    createdBy,
  });
  const savedIngreso = await ingreso.save();
  movements.push(savedIngreso);

  // Movimiento 2: Egreso por comisión (solo si comisión > 0)
  if (commissionAmount > 0) {
    const egresoCash = commissionType === 'Efectivo' ? commissionAmount : 0;
    const egresoTransfer = commissionType === 'Transferencia' ? commissionAmount : 0;

    const egreso = new Balance({
      edition,
      type: 'Egreso',
      date,
      counterpart: sellerName,
      concept: 'Comisión de vendedor',
      category: 'Comisión de Vendedor',
      cashAmount: egresoCash,
      transferAmount: egresoTransfer,
      checks: [],
      observations: `Comisión ${commissionType} generada automáticamente al registrar rendición`,
      sellerPaymentRef,
      createdBy,
    });
    const savedEgreso = await egreso.save();
    movements.push(savedEgreso);
  }

  return movements;
};
