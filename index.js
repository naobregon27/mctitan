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

// Eventos adicionales de conexión
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
    // 3. Evitar duplicados si el ID ya existe
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

  console.log(JSON.stringify(body, null, 2), "← este es lo que devuelve el body");
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

  const contacto = await obtenerContactoDesdeLead(leadId, kommoId, token);

  if (contacto) {
    console.log("🧾 ID del contacto:", contacto.id);

    const leadResponse = await axios.get(`https://${kommoId}.kommo.com/api/v4/leads/${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const lead = leadResponse.data;

    const campoMensaje = lead.custom_fields_values?.find(field =>
      field.field_name === "mensajeenviar"
    );
    const mensaje = campoMensaje?.values?.[0]?.value;

    console.log("📝 Mensaje guardado en el lead (mensajeenviar):", mensaje);

    const idExtraido = mensaje?.match(/\d{13,}/)?.[0];
    console.log("🧾 ID extraído del mensaje:", idExtraido); //cambios

    if (idExtraido) {
      let Modelo;

      if (kommoId === "cajaadmi01") {
        Modelo = RegistroMacleyn;
      } else if (kommoId === "luchito4637") {
        Modelo = RegistroLuchito;
      } else if (kommoId === "blackpanther1") {
        Modelo = RegistroBetone;
      } else if (kommoId === "blackpanther2") {
        Modelo = RegistroBettwo;
      } else if (kommoId === "blackpanther3") {
        Modelo = RegistroBetthree;
      } else if (kommoId === "blackpanther4") {
        Modelo = RegistroBetFour;
      } else if (kommoId === "Ganamosnet") {
        Modelo = RegistroGanamosnet;
      } else if (kommoId === "Cash365") {
        Modelo = RegistroCash365;
      } else if (kommoId === "mctitan") {
        Modelo = Registromctitan;
      }

      try {
        let registro = await Modelo.findOne({ id: idExtraido });

        if (registro) {
          console.log("✅ Registro encontrado:", registro);

          if (registro.isVerified) {
            return console.log("Registro ya pixeleado")
          }

          // Obtener el número de WhatsApp del contacto
          const whatsappNumber = contacto.custom_fields_values?.find(field =>
            field.field_code === "PHONE" || field.field_name?.toLowerCase().includes("whatsapp")
          )?.values?.[0]?.value;

          if (whatsappNumber) {
            registro.whatsappNumber = whatsappNumber;
            console.log("📱 Número de WhatsApp guardado:", whatsappNumber);
          }

          // Intentamos verificar el registro
          try {
            // Generar fbc, fbp y event_id
            const cookies = req.cookies;
            const fbclid = registro.fbclid;

            const fbc = cookies._fbc || (fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}` : null);
            const fbp = cookies._fbp || `fb.1.${Math.floor(Date.now() / 1000)}.${Math.floor(1000000000 + Math.random() * 9000000000)}`;
            const event_id = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

            // Marcar como verificado
            registro.isVerified = true;
            registro.verificationStatus = 'verificado';
            await registro.save();

            // URL con el parámetro access_token correctamente
            const pixelEndpointUrl = `https://graph.facebook.com/v18.0/${registro.pixel}/events?access_token=${registro.token}`;

            const eventData = {
              event_name: "Lead",
              event_id,
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_source_url: `https://${registro.subdominio}.${registro.dominio}`,
              user_data: {
                client_ip_address: registro.ip,
                client_user_agent: req.headers["user-agent"],
                em: registro.email ? require("crypto").createHash("sha256").update(registro.email).digest("hex") : undefined,
                fbc,
                fbp
              },
            };

            console.log("Datos del evento a enviar:", JSON.stringify(eventData, null, 2));
            console.log("URL del Pixel:", pixelEndpointUrl);

            const pixelResponse = await axios.post(
              pixelEndpointUrl,
              {
                data: [eventData],
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            console.log("📡 Pixel ejecutado con éxito:", pixelResponse.data);
            return res.status(200).json({
              mensaje: "Verificación completada exitosamente",
              estado: "verificado"
            });

          } catch (error) {
            console.error("❌ Error al ejecutar el pixel:", error.response?.data || error.message);

            // Actualizar el registro con el error
            registro.isVerified = false;
            registro.verificationStatus = 'fallido';
            registro.verificationError = {
              tipo: 'pixel_error',
              mensaje: error.response?.data?.error?.message || error.message,
              timestamp: new Date()
            };
            await registro.save();

            if (error.response) {
              console.error("Estado del error:", error.response.status);
              console.error("Encabezados del error:", error.response.headers);
              console.error("Datos del error:", error.response.data);
            } else if (error.request) {
              console.error("No se recibió respuesta del servidor:", error.request);
            } else {
              console.error("Error desconocido:", error.message);
            }

            return res.status(500).json({
              error: "Error al ejecutar el pixel",
              detalles: registro.verificationError
            });
          }
        } else {
          console.log("❌ No se encontró un registro con ese ID");
          return res.status(404).json({
            error: "Registro no encontrado",
            detalles: {
              tipo: 'registro_no_encontrado',
              mensaje: `No se encontró un registro con el ID ${idExtraido}`,
              timestamp: new Date()
            }
          });
        }
      } catch (error) {
        console.error("Error al buscar o actualizar el registro:", error);
        return res.status(500).json({
          error: "Error interno",
          detalles: {
            tipo: 'error_interno',
            mensaje: error.message,
            timestamp: new Date()
          }
        });
      }
    } else {
      console.log("⚠️ No se pudo extraer un ID del mensaje");
      return res.status(400).json({
        error: "ID no encontrado",
        detalles: {
          tipo: 'id_no_encontrado',
          mensaje: "No se pudo extraer un ID válido del mensaje",
          timestamp: new Date()
        }
      });
    }
  }

  return res.status(400).json({
    error: "Contacto no encontrado",
    detalles: {
      tipo: 'contacto_no_encontrado',
      mensaje: "No se pudo obtener la información del contacto",
      timestamp: new Date()
    }
  });
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