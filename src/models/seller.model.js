import mongoose from "mongoose";
import Counter from "./counter.model.js";

const sellerSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
    unique: true
  },
  sellerNumber: {
    type: Number,
    unique: true // 👈 mantenemos la unicidad pero quitamos `required`
  },
  status: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 100
  },
  isParticular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

sellerSchema.pre("save", async function (next) {
  const seller = this;

  console.log(">> Ejecutando pre-save Seller");

  if (seller.isNew && !seller.sellerNumber) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { model: "Seller" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      seller.sellerNumber = counter.seq.toString().padStart(0, "0");
      console.log(">> sellerNumber generado:", seller.sellerNumber);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

export default mongoose.model('Seller', sellerSchema);
