document.querySelectorAll(".openWpp").forEach((button) => {
  button.addEventListener("click", async function () {
    // Obtener fbclid si existe
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");

    // Obtener configuración dinámica
    const subdominio = window.location.hostname.split(".")[0];

    try {
      const config = await fetch(
        "https://ahora4633.io/backend/get_config.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subdominio }),
        }
      ).then((res) => res.json());

      if (config.error) {
        console.error("❌ Error al obtener configuración:", config.error);
        return;
      }

      // 1. Generar ID único numérico
      const generarIdUnico = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
      };

      // 2. Obtener IP pública (usando un servicio externo)
      await fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then(async (data) => {
          const ip = data.ip;
          const idUnico = generarIdUnico();

          // Obtener número de WhatsApp y mensaje
          const links = config.numeros.map((n) => `https://wa.me/${n}`);
          const whatsappNumber = config.numeros[Math.floor(Math.random() * config.numeros.length)];
          const mensaje = encodeURIComponent(
            "mi id es : " + idUnico + ", " + config.mensaje_wpp
          );
          const randomLink = links[Math.floor(Math.random() * links.length)];
          const redirectUrl = `${randomLink}?text=${mensaje}`;

          // 3. Armar objeto con todos los datos necesarios para el nuevo backend
          const newData = {
            id: idUnico.toString(),
            token: config.token,
            pixel: config.meta_pixel_id,
            subdominio,
            dominio: config.dominio,
            ip: ip,
            fbclid,
            mensaje,
            whatsappNumber, // Agregado para el nuevo backend
            sourceUrl: window.location.href, // Agregado para el nuevo backend
            email: '' // Campo opcional para el nuevo backend
          };

          console.log("Enviando datos al backend:", newData);

          // Enviar al nuevo backend
          try {
            const response = await fetch("https://mctitan.onrender.com/track", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newData),
            });

            if (!response.ok) {
              throw new Error(`Error del servidor: ${response.status}`);
            }

            const responseData = await response.json();
            console.log("✅ Tracking guardado:", responseData);
            
            // Redirigir a WhatsApp
            window.location.href = redirectUrl;
          } catch (error) {
            console.error("❌ Error al guardar tracking:", error);
            // Aún redirigimos a WhatsApp en caso de error para no afectar la experiencia del usuario
            window.location.href = redirectUrl;
          }
        });
    } catch (error) {
      console.error("❌ Error en la configuración o proceso general:", error);
    }
  });
});
