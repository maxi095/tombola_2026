import SellerPayment from '../models/sellerPayment.model.js';
import Seller from '../models/seller.model.js';
import Edition from '../models/edition.model.js';
import { createBalanceFromSellerPayment } from './balance.controllers.js';
import Balance from '../models/balance.model.js';


// Crear nuevo pago de vendedor
export const createSellerPayment = async (req, res) => {
  console.log("REQ.BODY", req.body);
  console.log("USER", req.user);

  try {
    const {
      edition,
      seller,
      cashAmount = 0,
      transferAmount = 0,
      tarjetaUnicaAmount = 0,
      checks = [],
      // checkAmount = 0, ---> se calcula automáticamente desde el pre-save en el modelo
      commissionRate,
      commissionAmount,
      commissionType,
      date,
      reference,
      observations
    } = req.body;

    // Buscar edición
    const editionData = await Edition.findById(edition);
    if (!editionData) {
        return res.status(404).json({ message: "Edición no encontrada" });
    }

    const createdBy = req.user?._id || req.user?.id;

    if (!seller) {
      return res.status(400).json({ message: "El campo 'seller' es obligatorio." });
    }

    // ✅ Calcular automáticamente el total de cheques
    const checkAmount = checks.reduce((sum, check) => sum + Number(check.amount || 0), 0);

    //const totalAmount = Number(cashAmount) + Number(transferAmount) + Number(checkAmount);
    const totalAmount = Number(cashAmount) + Number(transferAmount) + Number(tarjetaUnicaAmount) + Number(checkAmount)

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Debe ingresar al menos un monto mayor a cero (efectivo, cheque o transferencia)."
      });
    }

    // 🛡️ Control de Idempotencia (Evitar doble submit en margen de 10 segundos)
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const duplicate = await SellerPayment.findOne({
      seller,
      edition,
      cashAmount: Number(cashAmount),
      transferAmount: Number(transferAmount),
      tarjetaUnicaAmount: Number(tarjetaUnicaAmount),
      checkAmount: Number(checkAmount),
      status: "Activo",
      createdAt: { $gte: tenSecondsAgo }
    });

    if (duplicate) {
      console.log("⚠️ Intento de pago duplicado bloqueado para vendedor:", seller);
      return res.status(409).json({
        message: "Ya se registró un pago idéntico para este vendedor en los últimos 10 segundos. Verifique si el pago ya fue creado."
      });
    }

    const newPayment = new SellerPayment({
      edition,
      seller,
      cashAmount,
      transferAmount,
      tarjetaUnicaAmount,
      checks,
      //checkAmount,
      commissionRate,
      commissionAmount,
      commissionType,
      date,
      reference,
      observations,
      createdBy
    });

    console.log("NEW PAYMENT", {
      edition,
      seller,
      cashAmount,
      transferAmount,
      tarjetaUnicaAmount,
      checks,
      //checkAmount,
      commissionRate,
      commissionAmount,
      date,
      reference,
      observations,
      createdBy
    });

    const savedPayment = await newPayment.save();

    // ─── Generar movimientos automáticos en Balance ────────────────────────────
    try {
      // Resolver nombre del vendedor para el campo counterpart
      const sellerDoc = await Seller.findById(seller).populate('person', 'firstName lastName');
      const sellerName = sellerDoc?.person
        ? `${sellerDoc.person.firstName} ${sellerDoc.person.lastName}`
        : 'Vendedor';

      await createBalanceFromSellerPayment({
        edition,
        sellerPaymentRef: savedPayment._id,
        sellerName,
        cashAmount:       Number(cashAmount),
        transferAmount:   Number(transferAmount),
        tarjetaUnicaAmount: Number(tarjetaUnicaAmount || 0),
        checks,
        commissionAmount: Number(commissionAmount || 0),
        commissionType,
        date,
        createdBy,
      });
      console.log('✅ Movimientos de Balance generados automáticamente');
    } catch (balanceError) {
      // No bloqueamos el alta del pago si falla el balance, solo logueamos
      console.error('⚠️ Error al generar movimientos de Balance:', balanceError.message);
    }
    // ─────────────────────────────────────────────────────────────────────────

    const populatedPayment = await savedPayment.populate([
      { path: 'seller' },
      { path: 'createdBy' }
    ]);

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error("Error al registrar pago:", error);
    res.status(500).json({ message: "Error al registrar el pago", error });
  }
};


// Obtener todos los pagos
export const getSellerPayments = async (req, res) => {
  try {
    const payments = await SellerPayment.find()
      .sort({ sellerPaymentNumber: -1 }) // 1 = ascendente, -1 = descendente
      .populate(
        'edition'
      )
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate({
        path: 'createdBy',
        populate: { path: 'person' }
      })
      .populate({
        path: 'canceledBy',
        populate: { path: 'person' }
      })
      .sort({ date: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Obtener pagos por ID de vendedor
export const getSellerPaymentsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const payments = await SellerPayment.find({ seller: sellerId })
      .populate(
        'edition'
      )
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate({
        path: 'createdBy',
        populate: { path: 'person' }
      })
      .populate({
        path: 'canceledBy',
        populate: { path: 'person' }
      })
      .sort({ date: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un pago
export const deleteSellerPayment = async (req, res) => {
  try {
    const payment = await SellerPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Pago no encontrado' });

    // También eliminamos los movimientos de balance asociados
    await Balance.deleteMany({ sellerPaymentRef: req.params.id });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelSellerPayment = async (req, res) => {
  try {
    console.log("🛠 ID del pago a cancelar:", req.params.id);

    const payment = await SellerPayment.findById(req.params.id);

    if (!payment) {
      console.log("❌ Pago no encontrado");
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    console.log("✅ Pago encontrado:", payment);

    // Verificamos si ya está anulado
    if (payment.status === "Anulado") {
      return res.status(400).json({ message: "El pago ya está anulado" });
    }

    // Actualizamos el estado y la trazabilidad
    payment.status = "Anulado";
    payment.canceledBy = req.user?._id || req.user?.id;
    payment.canceledAt = new Date();

    const savedPayment = await payment.save();

    console.log("🔄 Pago anulado:", savedPayment);

    // También anulamos los movimientos de balance asociados
    await Balance.updateMany(
      { sellerPaymentRef: payment._id },
      { 
        status: "Anulado",
        canceledBy: req.user?._id || req.user?.id,
        canceledAt: new Date()
      }
    );

    const updatedPayment = await SellerPayment.findById(savedPayment._id)
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate('createdBy')
      .populate('canceledBy');

    res.json(updatedPayment);
  } catch (error) {
    console.error("❌ Error en cancelSellerPayment:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getSellerPaymentById = async (req, res) => {
  try {
    const payment = await SellerPayment.findById(req.params.id)
      .populate(
          'edition'
      )
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })

    if (!payment) return res.status(404).json({ message: "Pago no encontrado" });

    res.json(payment);
  } catch (error) {
    console.error("Error al obtener pago:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateSellerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await SellerPayment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    })
      .populate('edition')
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate({
        path: 'createdBy',
        populate: { path: 'person' }
      })
      .populate({
        path: 'canceledBy',
        populate: { path: 'person' }
      });

    if (!updated) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    // ─── Sincronizar Comisión con Movimientos de Balance ─────────────────────
    if (updates.commissionType && updated.commissionAmount > 0) {
      try {
        const egresoCash = updates.commissionType === 'Efectivo' ? updated.commissionAmount : 0;
        const egresoTransfer = updates.commissionType === 'Transferencia' ? updated.commissionAmount : 0;

        await Balance.updateOne(
          { sellerPaymentRef: id, type: 'Egreso', category: 'Comisión de Vendedor' },
          {
            cashAmount: egresoCash,
            transferAmount: egresoTransfer,
            observations: `Comisión ${updates.commissionType} generada automáticamente al registrar rendición`
          }
        );
        console.log("✅ Movimiento de comisión en Balance sincronizado:", updates.commissionType);
      } catch (balanceSyncError) {
        console.error("⚠️ Error al sincronizar actualización en Balance:", balanceSyncError.message);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.json(updated);
  } catch (error) {
    console.error("❌ Error en updateSellerPayment:", error.message);
    res.status(500).json({ message: "Error al actualizar el pago", error });
  }
};
