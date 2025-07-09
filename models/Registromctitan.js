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
  whatsappNumber: {
    type: String,
    index: true // Agregamos índice para búsquedas más rápidas
  },
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
  verificationDetails: {
    method: String,
    timestamp: Date,
    kommoLeadId: String,
    kommoContactId: String
  },
  verificationError: {
    tipo: String,
    mensaje: String,
    timestamp: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para búsqueda eficiente
registroSchema.index({ whatsappNumber: 1, verificationStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Registromctitan', registroSchema); 