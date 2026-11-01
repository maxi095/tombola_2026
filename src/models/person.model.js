import mongoose from "mongoose";

const personSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    document: {
        type: String,
        required: false,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

// Índices no-únicos seguros sobre datos históricos (permite múltiples registros sin DNI o email)
personSchema.index({ document: 1 });
personSchema.index({ lastName: 1, firstName: 1 });
personSchema.index({ city: 1 });

export default mongoose.model('Person', personSchema);
