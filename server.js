const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const crypto = require('crypto');
const LeadTracker = require('./LeadTracker');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(require('cors')());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Conexión MongoDB
mongoose.connect('mongodb+srv://lauraahora4632025:hXqOPPuQ1INnrtkX@ahora4633.kcvqn5q.mongodb.net/')
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err.message));

// Utilidades
const generateTrackingCode = () => {
  return crypto.randomBytes(16).toString('hex');
};

const getDeviceInfo = (userAgent) => {
  // Implementar lógica para extraer información del dispositivo
  return {
    userAgent,
    platform: 'web', // Mejorar con detección real
    browser: 'unknown' // Mejorar con detección real
  };
};

// Endpoint para guardar click inicial
app.post('/track', async (req, res) => {
  try {
    const {
      id, token, pixel, subdominio, dominio, ip, fbclid, mensaje,
      whatsappNumber, email, sourceUrl
    } = req.body;

    // Validaciones básicas
    if (!id || !token || !pixel || !subdominio || !dominio || !ip) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const trackingCode = generateTrackingCode();
    const deviceInfo = getDeviceInfo(req.headers['user-agent']);

    const lead = new LeadTracker({
      id,
      token,
      pixel,
      subdominio,
      dominio,
      ip,
      fbclid,
      mensaje,
      whatsappNumber,
      email,
      sourceUrl,
      trackingCode,
      deviceInfo,
      clickTimestamp: new Date()
    });

    await lead.save();
    res.status(201).json({
      mensaje: 'Tracking iniciado con éxito',
      trackingCode
    });

  } catch (error) {
    console.error('Error al guardar tracking:', error);
    res.status(500).json({ error: 'Error interno al guardar tracking' });
  }
});

// Webhook para mensajes de Kommo
app.post('/webhook/kommo/message', async (req, res) => {
  try {
    const { 
      whatsappNumber,
      messageContent,
      timestamp,
      sourceUrl,
      deviceInfo
    } = req.body;

    // Buscar leads potenciales en una ventana de tiempo (últimas 24 horas)
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const potentialLeads = await LeadTracker.find({
      verificationStatus: { $in: ['pendiente', 'primer_mensaje'] },
      clickTimestamp: { $gte: timeWindow }
    });

    // Encontrar la mejor coincidencia
    let bestMatch = null;
    let highestConfidence = 0;

    for (const lead of potentialLeads) {
      const matchResult = lead.checkMatch({
        whatsappNumber,
        messageContent,
        timestamp,
        sourceUrl,
        deviceInfo
      });

      if (matchResult.isMatch && matchResult.confidence > highestConfidence) {
        bestMatch = lead;
        highestConfidence = matchResult.confidence;
      }
    }

    if (bestMatch) {
      // Actualizar estado del mensaje
      if (bestMatch.verificationStatus === 'pendiente') {
        bestMatch.verificationStatus = 'primer_mensaje';
        bestMatch.messageStatus.firstMessage = {
          timestamp: new Date(timestamp),
          content: messageContent
        };
      } else if (bestMatch.verificationStatus === 'primer_mensaje') {
        // Es el segundo mensaje, procedemos con la verificación
        bestMatch.verificationStatus = 'verificado';
        bestMatch.messageStatus.secondMessage = {
          timestamp: new Date(timestamp),
          content: messageContent
        };
        bestMatch.isVerified = true;
        bestMatch.verificationDetails = {
          method: 'message_matching',
          matchedFields: ['whatsapp', 'timeWindow'],
          confidence: highestConfidence,
          verifiedAt: new Date()
        };

        // Enviar evento a Meta
        try {
          const eventId = `lead_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          const pixelEndpointUrl = `https://graph.facebook.com/v18.0/${bestMatch.pixel}/events?access_token=${bestMatch.token}`;
          
          await axios.post(pixelEndpointUrl, {
            data: [{
              event_name: 'Lead',
              event_id: eventId,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: `https://${bestMatch.subdominio}.${bestMatch.dominio}`,
              user_data: {
                client_ip_address: bestMatch.ip,
                client_user_agent: bestMatch.deviceInfo.userAgent,
                fbp: req.cookies._fbp,
                fbc: bestMatch.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${bestMatch.fbclid}` : undefined
              }
            }]
          });
        } catch (error) {
          console.error('Error al enviar evento a Meta:', error);
          // No fallamos la respuesta, solo loggeamos el error
        }
      }

      await bestMatch.save();
      
      res.status(200).json({
        mensaje: 'Mensaje procesado y verificado con éxito',
        status: bestMatch.verificationStatus
      });
    } else {
      res.status(404).json({
        error: 'No se encontró coincidencia para este mensaje',
        detalles: {
          tipo: 'sin_coincidencia',
          timestamp: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Error en webhook de mensajes:', error);
    res.status(500).json({
      error: 'Error interno al procesar mensaje',
      detalles: {
        tipo: 'error_interno',
        mensaje: error.message,
        timestamp: new Date()
      }
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 