import mongoose from "mongoose";

const editionSchema = new mongoose.Schema( {
    name: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    quantityCartons: {
        type: Number,
        require: true,
        trim: true,
        unique: false
    },
    cost: {
        type: Number,
        require: true,
        trim: true,
        unique: false
    },
    maxQuotas: {
        type: Number,
        require: true,
        trim: true,
        unique: false
    },
    installments: [
        {
            quotaNumber: { type: Number, required: true },
          dueDate: { type: Date, required: true },
          amount: { type: Number, required: true },
        }
      ],
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    // Parámetros técnicos Bingo V10
    totalBalls: { type: Number, default: 70 },
    clusterSize: { type: Number, default: 5 },
    clustersPerCard: { type: Number, default: 4 },
    cardSets: { type: Number, default: 5 },
    auditStats: {
        singleWinnerProb: { type: Number },
        avgFollowers: { type: Number }
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
})

export default mongoose.model('Edition', editionSchema)