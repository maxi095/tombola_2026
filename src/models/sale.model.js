import mongoose from "mongoose";
import Counter from "./counter.model.js";

const saleSchema = new mongoose.Schema({
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
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    bingoCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BingoCard',
        required: true
    },
    status: {
        type: String,
        enum: ['Pendiente de pago', 'Pagado', 'Anulada', 'Entregado sin cargo'],
        default: 'Pendiente de pago'
    },
    saleNumber: {
        type: Number,
        unique: true 
    },
    saleDate: {
        type: Date,
        required: true
    },

    fullPaymentMethod: {
      type: String,
      enum: ["Efectivo", "Tarjeta", "Transferencia", "Cheque", "Otro"],
    },

    lastFullPayment: {
      type: Date,
    },

    cardPaymentDetails: {
      cardHolder: { type: String },         // Titular
      cardNumber: { type: String },         // Últimos 4 dígitos o número completo (cuidado con privacidad)
      cardPlan: { type: String },           // Plan en cuotas
      cardAmount: { type: Number },         // Monto total del pago
      authCode: { type: String },           // Número de autorización
    },


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices de lectura seguros para datos productivos e históricos
saleSchema.index({ edition: 1, status: 1 });
saleSchema.index({ seller: 1, edition: 1 });
saleSchema.index({ client: 1 });
saleSchema.index({ bingoCard: 1, status: 1 });
saleSchema.index({ saleDate: -1 });

saleSchema.pre("save", async function (next) {
  const sale = this;

  if (sale.isNew && !sale.saleNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: "Sale" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      sale.saleNumber = counter.seq.toString().padStart(0, "0");
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model('Sale', saleSchema);
