// js/firebase-config.js

// 1) Importamos desde el CDN de Firebase la parte mínima que necesitamos:
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 2) Tu configuración tal cual la copiaste en la consola de Firebase:
const firebaseConfig = {
  apiKey: "AIzaSyCpqGuJoGY3WKBcNQi4sPBNJlEjG7Lsjkk",
  authDomain: "accessone-checklist.firebaseapp.com",
  projectId: "accessone-checklist",
  storageBucket: "accessone-checklist.firebasestorage.app",
  messagingSenderId: "1058284021087",
  appId: "1:1058284021087:web:08f14a99b423911985c2ea",
  measurementId: "G-M7LS11DYDH"
};

// 3) Inicializamos la app de Firebase con esa configuración:
const app = initializeApp(firebaseConfig);

// 4) Configuramos los servicios que vamos a usar (Auth y Firestore):
const auth = getAuth(app);
const db   = getFirestore(app);

// 5) Exportamos “auth” y “db” para que los podamos importar desde otros módulos:
export { auth, db, firebaseConfig };


