import mongoose from 'mongoose';
import Counter from "./counter.model.js";

const sellerPaymentSchema = new mongoose.Schema({
  edition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Edition',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  cashAmount: {
    type: Number,
    required: true,
    min: 0
  },
  transferAmount: {
    type: Number,
    required: true,
    min: 0
  },
  tarjetaUnicaAmount: {
    type: Number,
    required: true,
    min: 0
  },
  checks: [
        {
          checkNumber: { type: String, required: true },
          bank: { type: String, required: true },
          branch: { type: String, required: true },
          date: { type: Date, required: true },
          amount: { type: Number, required: true, min: 0 }
        }
      ],
  checkAmount: {
    type: Number,
    required: false,
    min: 0
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 100
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  commissionType: {
    type: String,
    enum: ['Efectivo', 'Transferencia'],
    default: 'Efectivo'
  },
  date: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String,
    default: ''
  },
  observations: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Activo', 'Anulado'],
    default: 'Activo'
  },
  sellerPaymentNumber: {
    type: Number,
    unique: true // 👈 mantenemos la unicidad pero quitamos `required`
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  canceledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  canceledAt: {
    type: Date
  }
}, {
  timestamps: true
});

sellerPaymentSchema.pre("save", async function (next) {
  const sellerPayment = this;

  // Calcular automáticamente checkAmount desde los cheques
  sellerPayment.checkAmount = sellerPayment.checks.reduce((sum, check) => sum + check.amount, 0);

  console.log(">> Ejecutando pre-save SellerPayment");

  if (sellerPayment.isNew && !sellerPayment.sellerPaymentNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: "SellerPayment" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      sellerPayment.sellerPaymentNumber = counter.seq.toString().padStart(0, "0");
      console.log(">> sellerPaymentNumber generado:", sellerPayment.sellerPaymentNumber);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model('SellerPayment', sellerPaymentSchema);
