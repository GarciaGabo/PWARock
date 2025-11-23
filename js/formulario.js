const form = document.getElementById("registroForm");

// GUARDAR REGISTRO
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let nombre = document.getElementById("nombre").value;
    let edad = document.getElementById("edad").value;
    let correo = document.getElementById("correo").value;
    let telefono = document.getElementById("telefono").value;
    let comentarios = document.getElementById("comentarios").value;

    try {
        await db.collection("registros").add({
            nombre,
            edad,
            correo,
            telefono,
            comentarios,
            fecha: new Date()
        });

        alert("Datos guardados correctamente");
        form.reset();

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar");
    }
});

// MOSTRAR REGISTROS
document.getElementById("verRegistros").addEventListener("click", async () => {
    let tabla = document.getElementById("tablaRegistrosBody");
    tabla.innerHTML = "";

    const snapshot = await db.collection("registros").get();
    snapshot.forEach((doc) => {
        const data = doc.data();
        tabla.innerHTML += `
            <tr>
                <td>${data.nombre}</td>
                <td>${data.edad}</td>
                <td>${data.correo}</td>
                <td>${data.telefono}</td>
                <td>${data.comentarios}</td>
            </tr>
        `;
    });
});
