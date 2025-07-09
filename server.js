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
    console.log('Webhook recibido:', req.body);
    console.log('Query params:', req.query);

    // Validar el kommoId y token
    const { kommoId, token } = req.query;
    if (!kommoId || !token) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    // Validar que el kommoId coincida con el subdominio de Kommo
    if (kommoId !== 'mctitan') {
      return res.status(401).json({ 
        error: 'Subdominio de Kommo no válido',
        expected: 'mctitan',
        received: kommoId
      });
    }

    // Extraer información del mensaje de Kommo
    const whatsappNumber = req.body.contacts?.[0]?.phone || req.body.phone;
    const messageContent = req.body.message?.text || req.body.text;
    const timestamp = new Date();

    if (!whatsappNumber || !messageContent) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        received: { whatsappNumber, messageContent } 
      });
    }

    // Buscar leads potenciales en una ventana de tiempo (últimas 24 horas)
    const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const potentialLeads = await LeadTracker.find({
      verificationStatus: { $in: ['pendiente', 'primer_mensaje'] },
      clickTimestamp: { $gte: timeWindow },
      whatsappNumber: whatsappNumber.replace(/\D/g, '') // Limpiar número de teléfono
    });

    console.log(`Encontrados ${potentialLeads.length} leads potenciales`);

    if (potentialLeads.length > 0) {
      const lead = potentialLeads[0]; // Tomamos el más reciente

      // Actualizar estado del mensaje
      if (lead.verificationStatus === 'pendiente') {
        lead.verificationStatus = 'primer_mensaje';
        lead.messageStatus = {
          firstMessage: {
            timestamp: timestamp,
            content: messageContent
          }
        };
      } else if (lead.verificationStatus === 'primer_mensaje') {
        // Es el segundo mensaje, procedemos con la verificación
        lead.verificationStatus = 'verificado';
        lead.messageStatus.secondMessage = {
          timestamp: timestamp,
          content: messageContent
        };
        lead.isVerified = true;
        lead.verificationDetails = {
          method: 'message_matching',
          matchedFields: ['whatsapp'],
          confidence: 1,
          verifiedAt: new Date()
        };

        // Enviar evento a Meta
        try {
          const eventId = `lead_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
          const pixelEndpointUrl = `https://graph.facebook.com/v18.0/${lead.pixel}/events?access_token=${lead.token}`;
          
          await axios.post(pixelEndpointUrl, {
            data: [{
              event_name: 'Lead',
              event_id: eventId,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: `https://${lead.subdominio}.${lead.dominio}`,
              user_data: {
                client_ip_address: lead.ip,
                client_user_agent: lead.deviceInfo.userAgent,
                fbp: req.cookies._fbp,
                fbc: lead.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${lead.fbclid}` : undefined
              }
            }]
          });
          console.log('✅ Evento enviado a Meta');
        } catch (error) {
          console.error('❌ Error al enviar evento a Meta:', error);
        }
      }

      await lead.save();
      console.log(`✅ Lead actualizado: ${lead.id} - Estado: ${lead.verificationStatus}`);
      
      res.status(200).json({
        mensaje: 'Mensaje procesado y verificado con éxito',
        status: lead.verificationStatus,
        leadId: lead.id
      });
    } else {
      console.log('❌ No se encontraron leads para el número:', whatsappNumber);
      res.status(404).json({
        error: 'No se encontró coincidencia para este mensaje',
        detalles: {
          tipo: 'sin_coincidencia',
          whatsappNumber,
          timestamp: new Date()
        }
      });
    }

  } catch (error) {
    console.error('❌ Error en webhook de mensajes:', error);
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