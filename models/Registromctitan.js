const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true
  },
  pixel: {
    type: String,
    required: true
  },
  subdominio: {
    type: String,
    required: true
  },
  dominio: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  fbclid: String,
  mensaje: String,
  whatsappNumber: String,
  email: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pendiente', 'verificado', 'fallido'],
    default: 'pendiente'
  },
  verificationError: {
    tipo: String,
    mensaje: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registromctitan', registroSchema); 