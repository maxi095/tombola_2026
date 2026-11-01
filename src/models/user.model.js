import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    type: String,
    enum: ['Administrador', 'Vendedor', 'Directiva'],
    default: 'Vendedor'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    default: null
  },
  status: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  }
}, {
  timestamps: true
});

// Índice seguro para consultas por vendedor (sparse para no indexar nulls de admins)
userSchema.index({ seller: 1 }, { sparse: true });

export default mongoose.model('User', userSchema);
