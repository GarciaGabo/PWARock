// functions/index.js (NUEVA VERSIÓN CORREGIDA)

// Importar módulos necesarios
// 💥 CAMBIO CLAVE: Importamos el disparador específico para Firestore
const { onDocumentCreated } = require('firebase-functions/v2/firestore'); 
const admin = require('firebase-admin');

// Inicializar el SDK de Admin (acceso privilegiado a Firestore y FCM)
admin.initializeApp();
const db = admin.firestore();

// 1. Definir la función que se dispara cuando se crea un nuevo documento en 'registros'
// Usamos la sintaxis V2, que es la más actual y compatible con Node 20
exports.notificarNuevoRegistro = onDocumentCreated('registros/{registroId}', 
    async (event) => {
        // Obtenemos los datos del documento creado (el formulario)
        const snap = event.data;
        if (!snap) {
            console.log("No se encontraron datos en el evento.");
            return null;
        }
        
        const nuevoRegistro = snap.data();
        
        // 2. Obtener todos los tokens de suscripción (lectura de la colección 'tokens_suscripcion')
        const tokensSnapshot = await db.collection('tokens_suscripcion').get();
        
        const registrationTokens = [];
        tokensSnapshot.forEach(doc => {
            const tokenData = doc.data();
            if (tokenData && tokenData.token) {
                registrationTokens.push(tokenData.token);
            }
        });

        if (registrationTokens.length === 0) {
            console.log("No hay tokens de suscripción registrados.");
            return null;
        }

        // 3. Definir el contenido de la notificación
        const payload = {
            notification: {
                title: '🎉 ¡Nuevo Registro en PWAROCK! 🎉',
                body: `¡${nuevoRegistro.nombre || 'Alguien'} acaba de unirse!`,
                icon: '/img/favicon-192.png',
                click_action: 'https://pwa-rock.vercel.app/' 
            }
        };

        // 4. Enviar la notificación a todos los tokens
        try {
            await admin.messaging().sendToDevice(registrationTokens, payload);
            console.log('Notificación enviada con éxito.');
        } catch (error) {
            console.error('Error al enviar la notificación:', error);
        }

        return null;
    });