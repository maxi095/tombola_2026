import mongoose from "mongoose";

const drawSchema = new mongoose.Schema({
    edition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Edition',
        required: true
    },
    type: {
        type: String,
        enum: ['Mensual', 'Final'],
        required: true
    },
    drawDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    cardSetNumber: {
        type: Number,
        min: 1,
        max: 5,
        required: function() {
            return this.type === 'Final'; // Solo requerido para sorteos finales
        }
    },
    // Números extraídos en el sorteo (solo para sorteo final tipo bingo)
    drawnNumbers: {
        type: [Number],
        default: []
    },
    prizes: [
        {
            position: { 
                type: Number, 
                required: true 
            }, // 1er premio, 2do premio, etc.
            description: { 
                type: String, 
                trim: true 
            }, // Descripción del premio
            // Ganador
            bingoCard: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BingoCard'
            },
            sale: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Sale'
            },
            // Esto se llena cuando se registra el ganador
            winnerRegisteredAt: {
                type: Date
            },
            notes: {
                type: String,
                trim: true
            }
        }
    ],
    status: {
        type: String,
        enum: ['Programado', 'En curso', 'Finalizado'],
        default: 'Programado'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índice para búsquedas frecuentes
drawSchema.index({ edition: 1, drawDate: 1 });
drawSchema.index({ edition: 1, type: 1 });

export default mongoose.model('Draw', drawSchema);