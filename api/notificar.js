import admin from "firebase-admin";

// Validar variables antes de usarlas
const projectId = process.env.FB_PROJECT_ID;
const clientEmail = process.env.FB_CLIENT_EMAIL;
const privateKey = process.env.FB_PRIVATE_KEY;

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
      privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Si faltan variables, avisar
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
    const tokensSnap = await admin
      .firestore()
      .collection("tokens_suscripcion")
      .get();

    const tokens = tokensSnap.docs.map((doc) => doc.data().token);

    console.log("TOKENS ENCONTRADOS:", tokens);

    if (tokens.length === 0) {
      return res.status(200).json({ ok: true, msg: "No hay tokens registrados" });
    }

    const payload = {
      notification: {
        title: "Nuevo formulario recibido",
        body: mensaje,
      }
    };

    await admin.messaging().sendToDevice(tokens, payload);

    return res.status(200).json({ ok: true, enviados: tokens.length });

  } catch (error) {
    console.error("❌ ERROR BACKEND:", error);
    return res.status(500).json({
      error: "Falló el envío",
      detalle: error.message,
    });
  }
}
