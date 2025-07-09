const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const RegistroMacleyn = require("./models/Registro");
const RegistroLuchito = require("./models/RegistroLuchito");
const RegistroBetone = require("./models/RegistroBetone");
const RegistroBettwo = require("./models/RegistroBettwo");
const RegistroBetthree = require("./models/RegistroBetthree");
const RegistroBetFour = require("./models/RegistroBetFour");
const RegistroGanamosnet = require("./models/RegistroGanamosnet");
const RegistroCash365 = require("./models/RegistroCash365");
const Registromctitan = require("./models/Registromctitan");
const axios = require('axios');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const KommoService = require('./services/kommoService');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(require("cors")());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Asegura que req.body funcione correctamente
app.use(cookieParser());

// Conexión a MongoDB con manejo de eventos
mongoose.connect("mongodb+srv://lauraahora4632025:hXqOPPuQ1INnrtkX@ahora4633.kcvqn5q.mongodb.net/")
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
  });

// Eventos adicionales de conexión--
mongoose.connection.on('connected', () => {
  console.log('🟢 MongoDB conectado');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Error en la conexión de MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 MongoDB desconectado');
});

const isValidIP = (ip) => {
  const regex =
    /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return regex.test(ip);
};

app.post("/guardar", async (req, res) => {
  try {
    const { id, token, pixel, subdominio, dominio, ip, fbclid, mensaje } =
      req.body;

    const { kommoId } = req.query;

    // 1. Verificación de campos obligatorios
    if (!id || !token || !pixel || !subdominio || !dominio || !ip) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // 2. Validación de tipos y formatos
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "ID debe ser numérico" });
    }

    if (!isValidIP(ip)) {
      return res.status(400).json({ error: "IP no es válida" });
    }

    let existente;
    // 3. Evitar duplicados si el ID ya existe estii
    if (kommoId === "cajaadmi01") {
      existente = await RegistroMacleyn.findOne({ id });
    } else if (kommoId === "luchito4637") {
      existente = await RegistroLuchito.findOne({ id });
    } else if (kommoId === "blackpanther1") {
      existente = await RegistroBetone.findOne({ id });
    } else if (kommoId === "blackpanther2") {
      existente = await RegistroBettwo.findOne({ id });
    } else if (kommoId === "blackpanther3") {
      existente = await RegistroBetthree.findOne({ id });
    } else if (kommoId === "blackpanther4") {
      existente = await RegistroBetFour.findOne({ id });
    } else if (kommoId === "Ganamosnet") {
      existente = await RegistroGanamosnet.findOne({ id });
    } else if (kommoId === "Cash365") {
      existente = await RegistroCash365.findOne({ id });
    } else if (kommoId === "mctitan") {
      existente = await Registromctitan.findOne({ id });
    }

    if (existente) {
      return res.status(409).json({ error: "Este ID ya fue registrado" });
    }

    let nuevoRegistro;

    if (kommoId === "cajaadmi01") {
      nuevoRegistro = new RegistroMacleyn({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    } else if (kommoId === "luchito4637") {
      nuevoRegistro = new RegistroLuchito({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }  else if (kommoId === "blackpanther1") {
      nuevoRegistro = new RegistroBetone({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }  else if (kommoId === "blackpanther2") {
      nuevoRegistro = new RegistroBettwo({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }  else if (kommoId === "blackpanther3") {
      nuevoRegistro = new RegistroBetthree({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }  else if (kommoId === "blackpanther4") {
      nuevoRegistro = new RegistroBetFour({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }  else if (kommoId === "Ganamosnet") {
      nuevoRegistro = new RegistroGanamosnet({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    } else if (kommoId === "Cash365") {
      nuevoRegistro = new RegistroCash365({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    } else if (kommoId === "mctitan") {
      nuevoRegistro = new Registromctitan({
        id,
        token,
        pixel,
        subdominio,
        dominio,
        ip,
        fbclid,
        mensaje,
      });

      await nuevoRegistro.save();
    }

    res.status(201).json({ mensaje: "Datos guardados con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno al guardar los datos" });
  }
});

app.post("/verificacion", async (req, res) => {
  const body = req.body;
  const { kommoId, token } = req.query;

  console.log("📥 Webhook recibido:", JSON.stringify(body, null, 2));
  console.log("🔑 KommoId:", kommoId);

  const leadId = req.body?.leads?.add?.[0]?.id;

  if (!leadId) {
    return res.status(400).json({
      error: "Lead ID no encontrado",
      detalles: {
        tipo: 'lead_no_encontrado',
        mensaje: "No se encontró el ID del lead en la solicitud",
        timestamp: new Date()
      }
    });
  }

  try {
    const kommoService = new KommoService(kommoId, token);

    // Obtener información del lead y contacto
    const leadData = await kommoService.getLeadDetails(leadId);
    const contacto = leadData._embedded?.contacts?.[0];
    
    if (!contacto) {
      return res.status(404).json({
        error: "Contacto no encontrado",
        detalles: { tipo: 'contacto_no_encontrado', leadId }
      });
    }

    // Obtener número de WhatsApp
    const whatsappNumber = await kommoService.getContactWhatsApp(contacto);

    if (!whatsappNumber) {
      return res.status(400).json({
        error: "Número de WhatsApp no encontrado",
        detalles: { tipo: 'whatsapp_no_encontrado', contactId: contacto.id }
      });
    }

    console.log("📱 Número de WhatsApp encontrado:", whatsappNumber);

    // Lógica específica para mctitan
    if (kommoId === "mctitan") {
      // Buscar registro pendiente en las últimas 24 horas
      const timeWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const cleanNumber = KommoService.cleanWhatsAppNumber(whatsappNumber);
      
      const registro = await Registromctitan.findOne({
        whatsappNumber: cleanNumber,
        verificationStatus: 'pendiente',
        createdAt: { $gte: timeWindow }
      }).sort({ createdAt: -1 }); // Obtener el más reciente

      if (registro) {
        console.log("✅ Registro encontrado:", registro.id);

        try {
          // Actualizar registro
          registro.isVerified = true;
          registro.verificationStatus = 'verificado';
          registro.lastActivity = new Date();
          registro.verificationDetails = {
            method: 'whatsapp_matching',
            timestamp: new Date(),
            kommoLeadId: leadId,
            kommoContactId: contacto.id
          };

          // Enviar evento a Meta
          await kommoService.sendMetaEvent(registro);
          await registro.save();

          return res.status(200).json({
            mensaje: "Lead verificado y evento enviado",
            detalles: {
              leadId: registro.id,
              estado: 'verificado'
            }
          });
        } catch (error) {
          console.error("❌ Error en el proceso de verificación:", error);
          
          registro.verificationStatus = 'fallido';
          registro.verificationError = {
            tipo: error.message.includes('Meta') ? 'meta_error' : 'error_interno',
            mensaje: error.message,
            timestamp: new Date()
          };
          await registro.save();

          return res.status(500).json({
            error: "Error en el proceso de verificación",
            detalles: registro.verificationError
          });
        }
      } else {
        console.log("❌ No se encontró registro pendiente para el número:", cleanNumber);
        return res.status(404).json({
          error: "Registro no encontrado",
          detalles: {
            tipo: 'registro_no_encontrado',
            whatsappNumber: cleanNumber
          }
        });
      }
    }

    // ... rest of the existing code for other kommoIds ...
  } catch (error) {
    console.error("❌ Error en el proceso de verificación:", error);
    return res.status(500).json({
      error: "Error interno",
      detalles: {
        tipo: 'error_interno',
        mensaje: error.message
      }
    });
  }
});

async function obtenerContactoDesdeLead(leadId, kommoId, token) {
  const url = `https://${kommoId}.kommo.com/api/v4/leads/${leadId}?with=contacts`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const lead = response.data;
    const contacto = lead._embedded?.contacts?.[0]; // primer contacto vinculado

    if (!contacto) {
      console.log("⚠️ No se encontró ningún contacto asociado a este lead");
      return null;
    }

    console.log("✅ Contacto vinculado al lead:", contacto);
    return contacto;

  } catch (err) {
    console.error("❌ Error al obtener contacto desde lead:", err.response?.data || err.message);
    return null;
  }
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});