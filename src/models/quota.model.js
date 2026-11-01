import mongoose from "mongoose";

const quotaSchema = new mongoose.Schema({
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    },
    quotaNumber: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque', 'Otro', 'Entregado sin cargo', ''],
    }
}, {
    timestamps: true
});

// Índices de lectura seguros para datos productivos e históricos
quotaSchema.index({ sale: 1, quotaNumber: 1 });
quotaSchema.index({ paymentDate: 1, dueDate: 1 });
quotaSchema.index({ dueDate: 1 });

export default mongoose.model('Quota', quotaSchema);
