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

saleSchema.pre("save", async function (next) {
  const sale = this;

  console.log(">> Ejecutando pre-save sale");

  if (sale.isNew && !sale.saleNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: "Sale" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      sale.saleNumber = counter.seq.toString().padStart(0, "0");
      console.log(">> saleNumber generado:", sale.saleNumber);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model('Sale', saleSchema);
