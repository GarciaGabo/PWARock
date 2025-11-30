import { db, messaging } from "/js/firebase.js";
import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

const VAPID_KEY = "BJZNSD9DhU2M2oFjfuHxWC8Ihqni-WANm28vYOjzsB3lGBFmVplNLbuvV_Tn3BZ5fbGotiuuEjP3qLQi0JgGL00";
function subscribeToPush() {
    // 1. Solicitar permiso de notificación al usuario
    Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Permiso de notificación concedido.');
            
            // 2. Obtener el token de suscripción para el navegador actual
            getToken(messaging, { vapidKey: VAPID_KEY })
                .then(async (currentToken) => {
                    if (currentToken) {
                        console.log('Token de suscripción:', currentToken);
                        // 3. 💥 GUARDAR el token en Firestore
                        await addDoc(collection(db, "tokens_suscripcion"), {
                            token: currentToken
                        });
                        console.log('Token guardado en Firestore.');
                        
                    } else {
                        console.log('No se obtuvo el token de suscripción.');
                    }
                })
                .catch((err) => {
                    console.error('Error al obtener o guardar el token:', err);
                });
        } else {
            console.log('Permiso de notificación denegado.');
        }
    });
}

// Usamos $(document).ready() para asegurar que el DOM está cargado 
// (igual que lo haces en main.js)
$(document).ready(function() {
    
    // TODAS LAS VARIABLES DEL DOM DEBEN DECLARARSE AQUÍ ADENTRO:
    // La variable 'form' se define AHORA aquí dentro, resolviendo el 'is not defined'.
    const form = document.getElementById("registroForm");
    const tablaRegistros = document.getElementById("tablaRegistros");
    const tablaBody = document.getElementById("tablaRegistrosBody");
    const verRegistrosBtn = document.getElementById("verRegistros");

    subscribeToPush();
    
    // ✔ Guardar datos
    if (form) { // Comprobamos que el elemento exista
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // CLAVE: Prevenir la recarga de la página

            const nombre = document.getElementById("nombre").value;
            const edad = document.getElementById("edad").value;
            const correo = document.getElementById("correo").value;
            const telefono = document.getElementById("telefono").value;
            const comentarios = document.getElementById("comentarios").value;

            try {
                await addDoc(collection(db, "registros"), {
                    nombre,
                    edad,
                    correo,
                    telefono,
                    comentarios
                });

                alert("Datos enviados correctamente.");
                form.reset();

            } catch (error) {
                console.error("Error al guardar:", error);
                alert("Hubo un error al guardar.");
            }
        });
    }

    // ✔ Visualizar registros
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


