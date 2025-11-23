import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuración
const firebaseConfig = {
  apiKey: "AIzaSyAkyJAy5vieRmHjoZWPEezUDzywQWlMh_E",
  authDomain: "lili-418a8.firebaseapp.com",
  projectId: "lili-418a8",
  storageBucket: "lili-418a8.firebasestorage.app",
  messagingSenderId: "926454298512",
  appId: "1:926454298512:web:4dff9df8c533a69113a515",
  measurementId: "G-WJ3PV6V4DP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
