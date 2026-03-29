import mongoose from "mongoose";

const bingoCardSchema = new mongoose.Schema({
    edition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Edition',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: false
    },
    number: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Disponible', 'Vendido'],
        default: 'Disponible'
    },
    cardSets: [
        {
            setNumber: { type: Number, required: true }, // 1, 2, 3, 4, 5
            numbers: { type: [Number], default: [] }     // 20 números para este set
        }
    ],
    numbers: { 
        type: [Number], 
        default: [] 
    }, // Deprecated - usar cardSets
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('BingoCard', bingoCardSchema);
