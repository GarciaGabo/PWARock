import admin from "firebase-admin";

// OneSignal: variables de entorno
const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

// Firebase: para acceder a Firestore
const projectId = process.env.FB_PROJECT_ID;
const clientEmail = process.env.FB_CLIENT_EMAIL;
const privateKey = process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { mensaje } = req.body;

  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_API_KEY) {
    return res.status(500).json({
      error: "Faltan variables de entorno de OneSignal",
    });
  }

  try {
    // Obtener Player IDs de Firestore
    const tokensSnap = await admin
      .firestore()
      .collection("tokens_suscripcion")
      .get();

    const playerIds = tokensSnap.docs
      .map(doc => doc.data().token)
      .filter(id => !!id);

    console.log("PLAYER IDs encontrados:", playerIds);

    if (playerIds.length === 0) {
      return res.status(200).json({ ok: true, msg: "No hay Player IDs registrados" });
    }

    // Enviar notificación a OneSignal
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${ONE_SIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONE_SIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: "Nuevo formulario recibido" },
        contents: { en: mensaje },
      }),
    });

    const data = await response.json();
    console.log("Respuesta OneSignal:", data);

    return res.status(200).json({ ok: true, enviados: playerIds.length, oneSignal: data });

  } catch (error) {
    console.error("❌ ERROR BACKEND:", error);
    return res.status(500).json({
      error: "Falló el envío de la notificación",
      detalle: error.message,
    });
  }
}
