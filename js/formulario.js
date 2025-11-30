import { db } from "/js/firebase.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Guardar Player ID de OneSignal
async function guardarPlayerId() {
    // Revisar si hay Player ID
    const playerId = OneSignal?.User?.PushSubscription?.id;
    console.log(playerId);
    if (!playerId) {
        console.warn("No se encontró Player ID. El usuario puede no estar suscrito.");
        return;
    }

    try {
        await addDoc(collection(db, "tokens_suscripcion"), {
            token: playerId
        });
        console.log("Player ID guardado en Firestore:", playerId);
    } catch (error) {
        console.error("Error guardando Player ID:", error);
    }
}

$(document).ready(function() {

    const form = document.getElementById("registroForm");
    const tablaBody = document.getElementById("tablaRegistrosBody");
    const verRegistrosBtn = document.getElementById("verRegistros");

    // Guardar Player ID apenas cargue la página
    guardarPlayerId();

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("nombre").value;
            const edad = document.getElementById("edad").value;
            const correo = document.getElementById("correo").value;
            const telefono = document.getElementById("telefono").value;
            const comentarios = document.getElementById("comentarios").value;

            try {
                // Guardar datos del formulario
                await addDoc(collection(db, "registros"), {
                    nombre,
                    edad,
                    correo,
                    telefono,
                    comentarios
                });

                alert("Datos enviados correctamente.");

                // ✨ Enviar notificación
                await notificarEnvio();

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
            document.getElementById("tablaRegistros").style.display = "table";

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

