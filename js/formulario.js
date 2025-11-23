import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("registroForm");
const tablaRegistros = document.getElementById("tablaRegistros");
const tablaBody = document.getElementById("tablaBody");
const verRegistrosBtn = document.getElementById("verRegistrosBtn");

// ✔ Guardar datos
form.addEventListener("submit", async (e) => {
  e.preventDefault();

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

// ✔ Visualizar registros
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
