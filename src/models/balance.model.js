import mongoose from 'mongoose';
import Counter from './counter.model.js';

// Categorías disponibles por tipo de movimiento
export const INCOME_CATEGORIES = [
  'Rendición de Vendedor',
  'Publicidad / Sponsoring',
  'Venta Directa',
  'Donación',
  'Otro Ingreso',
];

export const EXPENSE_CATEGORIES = [
  'Sueldo / Honorario',
  'Comisión de Vendedor',
  'Impuesto Lotería',
  'Premio de Sorteo',
  'Proveedor de Servicio',
  'Impresión de Cartones',
  'Publicidad',
  'Otro Egreso',
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const checkSchema = new mongoose.Schema(
  {
    checkNumber: { type: String, required: true },
    bank: { type: String, required: true },
    branch: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const balanceSchema = new mongoose.Schema(
  {
    edition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edition',
      required: true,
    },

    type: {
      type: String,
      enum: ['Ingreso', 'Egreso'],
      required: true,
    },

    transactionNumber: {
      type: Number,
      unique: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    // "Recibimos de" (Ingreso) / "A la orden de" (Egreso)
    counterpart: {
      type: String,
      required: true,
      trim: true,
    },

    // "En concepto de"
    concept: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ALL_CATEGORIES,
      required: true,
    },

    cashAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    transferAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    checks: {
      type: [checkSchema],
      default: [],
    },

    // Calculado automáticamente en pre-save desde checks[]
    checkAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // cashAmount + transferAmount + checkAmount (calculado en pre-save)
    totalAmount: {
      type: Number,
      default: 0,
    },

    observations: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['Activo', 'Anulado'],
      default: 'Activo',
    },

    // Referencia opcional a un SellerPayment (para rendiciones automáticas)
    sellerPaymentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SellerPayment',
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    canceledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    canceledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save: calcular montos y asignar número incremental ──────────────────
balanceSchema.pre('save', async function (next) {
  const doc = this;

  // 1. Calcular checkAmount desde el array de cheques
  doc.checkAmount = doc.checks.reduce((sum, c) => sum + (c.amount || 0), 0);

  // 2. Calcular totalAmount
  doc.totalAmount =
    (doc.cashAmount || 0) +
    (doc.transferAmount || 0) +
    (doc.checkAmount || 0);

  // 3. Asignar transactionNumber autoincremental solo en nuevos documentos
  if (doc.isNew && !doc.transactionNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: 'Balance' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      doc.transactionNumber = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model('Balance', balanceSchema);
