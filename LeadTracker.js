const mongoose = require('mongoose');

const leadTrackerSchema = new mongoose.Schema({
  // Campos originales
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

  // Campos mejorados para tracking
  whatsappNumber: {
    type: String,
    index: true // Indexado para búsquedas más rápidas
  },
  email: String,
  
  // Datos del dispositivo y origen
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String
  },
  
  // Tracking de tiempo y origen
  clickTimestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  sourceUrl: String,
  trackingCode: {
    type: String,
    unique: true
  },

  // Estado de mensajes
  messageStatus: {
    firstMessage: {
      timestamp: Date,
      content: String
    },
    secondMessage: {
      timestamp: Date,
      content: String
    }
  },

  // Estado de verificación mejorado
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['pendiente', 'primer_mensaje', 'segundo_mensaje', 'verificado', 'fallido'],
    default: 'pendiente'
  },
  verificationDetails: {
    method: String, // Qué método de verificación se usó
    matchedFields: [String], // Qué campos coincidieron
    confidence: Number, // Nivel de confianza de la coincidencia
    verifiedAt: Date
  },
  verificationError: {
    tipo: String,
    mensaje: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Índices compuestos para búsquedas eficientes
leadTrackerSchema.index({ whatsappNumber: 1, clickTimestamp: -1 });
leadTrackerSchema.index({ trackingCode: 1 });

// Método para verificar coincidencia basada en múltiples campos
leadTrackerSchema.methods.checkMatch = function(kommoData) {
  let score = 0;
  let matchedFields = [];

  // Implementa lógica de scoring aquí
  // Por ejemplo: coincidencia de número, ventana de tiempo, etc.

  return {
    isMatch: score >= 0.7, // 70% de confianza mínima
    confidence: score,
    matchedFields
  };
};

module.exports = mongoose.model('LeadTracker', leadTrackerSchema); 