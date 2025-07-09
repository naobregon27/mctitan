app.post("/verificacion", async (req, res) => {
  const body = req.body;
  const { kommoId, token } = req.query;

  console.log(JSON.stringify(body, null, 2), "← este es lo que devuelve el body");
  const leadId = req.body?.leads?.add?.[0]?.id;

  if (!leadId) {
    return res.status(400).send("Lead ID no encontrado");
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
    console.log("🧾 ID extraído del mensaje:", idExtraido);

    if (idExtraido) {
      let registro;
      let Modelo;

      if (kommoId === "cajaadmi01") {
        Modelo = RegistroMacleyn;
      } else if (kommoId === "luchito4637") {
        Modelo = RegistroLuchito;
      }

      try {
        registro = await Modelo.findOne({ id: idExtraido });

        if (registro) {
          console.log("✅ Registro encontrado:", registro);

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

  res.status(200).json({
    mensaje: "Verificación completada exitosamente",
    estado: "verificado"
  });
}); 