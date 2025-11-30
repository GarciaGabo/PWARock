import { db, messaging } from "/js/firebase.js";
import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const VAPID_KEY = "BJZNSD9DhU2M2oFjfuHxWC8Ihqni-WANm28vYOjzsB3lGBFmVplNLbuvV_Tn3BZ5fbGotiuuEjP3qLQi0JgGL00";

// ✨ NUEVO — Función que llamará al backend de Vercel
async function notificarEnvio() {
    await fetch("/api/notificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            mensaje: "📩 ¡Nuevo formulario enviado!",
        })
    })
    .then(res => res.json())
    .then(data => console.log("Respuesta servidor:", data))
    .catch(err => console.error("Error en notificarEnvio:", err));
}

function subscribeToPush() {
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Permiso de notificación concedido.');
            
            getToken(messaging, { vapidKey: VAPID_KEY })
                .then(async (currentToken) => {
                    if (currentToken) {
                        console.log('Token de suscripción:', currentToken);
                        await addDoc(collection(db, "tokens_suscripcion"), {
                            token: currentToken
                        });
                        console.log('Token guardado en Firestore.');
                    } else {
                        console.log('No se obtuvo el token de suscripción.');
                    }
                })
                .catch((err) => {
                    console.error('Error', err);
                });
        } else {
            console.log('Permiso de notificación denegado.');
        }
    });
}

$(document).ready(function() {

    const form = document.getElementById("registroForm");
    const tablaRegistros = document.getElementById("tablaRegistros");
    const tablaBody = document.getElementById("tablaRegistrosBody");
    const verRegistrosBtn = document.getElementById("verRegistros");

    subscribeToPush();
    
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const edad = document.getElementById("edad").value;
            const correo = document.getElementById("correo").value;
            const telefono = document.getElementById("telefono").value;
            const comentarios = document.getElementById("comentarios").value;

            try {
                // Guardar datos
                await addDoc(collection(db, "registros"), {
                    nombre,
                    edad,
                    correo,
                    telefono,
                    comentarios
                });

alert("Datos enviados correctamente.");
await notificarEnvio();  // ← ENVÍA LA NOTIFICACIÓN
form.reset();


            } catch (error) {
                console.error("Error al guardar:", error);
                alert("Hubo un error al guardar.");
            }
        });
    }

    if (verRegistrosBtn) { 
        verRegistrosBtn.addEventListener("click", async () => {
            tablaBody.innerHTML = "";
            tablaRegistros.style.display = "block";

            const querySnapshot = await getDocs(collection(db, "registros"));
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                const row = `
                    <tr>
                        <td>${data.nombre}</td>
                        <td>${data.edad}</td>
                        <td>${data.correo}</td>
                        <td>${data.telefono}</td>
                        <td>${data.comentarios}</td>
                    </tr>
                `;
                tablaBody.innerHTML += row;
            });
        });
    }
});

