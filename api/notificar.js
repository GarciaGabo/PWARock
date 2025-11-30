import admin from "firebase-admin";

// Variables de entorno de Firebase
const projectId = process.env.FB_PROJECT_ID;
const clientEmail = process.env.FB_CLIENT_EMAIL;
const privateKey = process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Validar variables
if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Variables de entorno faltantes:", {
    FB_PROJECT_ID: !!projectId,
    FB_CLIENT_EMAIL: !!clientEmail,
    FB_PRIVATE_KEY: !!privateKey,
  });
}

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

  if (!projectId || !clientEmail || !privateKey) {
    return res.status(500).json({
      error: "Faltan variables de entorno en Vercel",
      vars: {
        FB_PROJECT_ID: !!projectId,
        FB_CLIENT_EMAIL: !!clientEmail,
        FB_PRIVATE_KEY: !!privateKey,
      },
    });
  }

  const { mensaje } = req.body;

  try {
    // Obtener Player IDs de Firestore
    const tokensSnap = await admin
      .firestore()
      .collection("tokens_suscripcion")
      .get();

    const playerIds = tokensSnap.docs
      .map(doc => doc.data().token)
      .filter(id => !!id); // eliminar valores nulos o vacíos

    console.log("PLAYER IDs encontrados:", playerIds);

    if (playerIds.length === 0) {
      return res.status(200).json({ ok: true, msg: "No hay Player IDs registrados" });
    }

    // Construir payload compatible con OneSignal
    const payload = {
      notification: {
        title: "Nuevo formulario recibido",
        body: mensaje,
      },
      tokens: playerIds, // enviar a todos los Player IDs
    };

    // Enviar notificación vía Firebase Cloud Messaging
    await admin.messaging().sendMulticast({
      tokens: playerIds,
      notification: {
        title: "Nuevo formulario recibido",
        body: mensaje,
      },
    });

    return res.status(200).json({ ok: true, enviados: playerIds.length });

  } catch (error) {
    console.error("❌ ERROR BACKEND:", error);
    return res.status(500).json({
      error: "Falló el envío",
      detalle: error.message,
    });
  }
}
