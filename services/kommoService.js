const axios = require('axios');

class KommoService {
  constructor(kommoId, token) {
    this.kommoId = kommoId;
    this.token = token;
    this.baseUrl = `https://${kommoId}.kommo.com/api/v4`;
  }

  async getLeadDetails(leadId) {
    try {
      const response = await axios.get(`${this.baseUrl}/leads/${leadId}?with=contacts`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener detalles del lead ${leadId}:`, error.message);
      throw new Error(`Error al obtener detalles del lead: ${error.message}`);
    }
  }

  async getContactWhatsApp(contact) {
    if (!contact) return null;

    const whatsappField = contact.custom_fields_values?.find(field =>
      field.field_code === "PHONE" || field.field_name?.toLowerCase().includes("whatsapp")
    );

    return whatsappField?.values?.[0]?.value || null;
  }

  async sendMetaEvent(registro, eventName = "Lead") {
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pixelEndpointUrl = `https://graph.facebook.com/v18.0/${registro.pixel}/events?access_token=${registro.token}`;

    try {
      await axios.post(pixelEndpointUrl, {
        data: [{
          event_name: eventName,
          event_id: eventId,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: `https://${registro.subdominio}.${registro.dominio}`,
          user_data: {
            client_ip_address: registro.ip,
            client_user_agent: registro.userAgent,
            fbp: registro.fbp,
            fbc: registro.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${registro.fbclid}` : undefined
          }
        }]
      });

      console.log(`✅ Evento ${eventName} enviado a Meta`);
      return true;
    } catch (error) {
      console.error(`❌ Error al enviar evento ${eventName} a Meta:`, error.message);
      throw new Error(`Error al enviar evento a Meta: ${error.message}`);
    }
  }

  static cleanWhatsAppNumber(number) {
    return number.replace(/\D/g, '');
  }
}

module.exports = KommoService; 