import { auth, db, storage } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

let currentUser = null;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  document.getElementById("userBar").innerHTML =
    `<span>${user.email}</span> <button id="logoutBtn">Cerrar Sesión</button>`;
  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    window.location.href = "login.html";
  };
  await loadEntrevistas();
});

document.getElementById("entrevistaForm").onsubmit = async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombreCandidato").value.trim();
  const puesto = document.getElementById("puestoSolicitado").value.trim();
  const ticket = document.getElementById("ticketRH").value.trim();
  const motivo = document.getElementById("motivoNoViable").value.trim();
  const file = document.getElementById("cvAdjunto").files[0];
  let cvUrl = "";
  if (file) {
    const storagePath = `cv/${ticket}_${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, storagePath);
    await uploadBytes(fileRef, file);
    cvUrl = await getDownloadURL(fileRef);
  }
  const now = serverTimestamp();
  await addDoc(collection(db, "entrevistas"), {
    nombre, puesto, ticket, motivo, cvUrl,
    estatus: "Abierto",
    createdBy: currentUser.email,
    createdAt: now,
    updatedBy: currentUser.email,
    updatedAt: now
  });
  alert("Entrevista registrada.");
  e.target.reset();
  await loadEntrevistas();
};

async function loadEntrevistas() {
  const snap = await getDocs(collection(db, "entrevistas"));
  const list = document.getElementById("entrevistasList");
  let html = `<table><thead><tr>
    <th>Nombre</th><th>Puesto</th><th>Ticket</th><th>Fecha</th><th>Antigüedad (días)</th>
    <th>Estatus</th><th>CV</th><th>Motivo No Viable</th>
    </tr></thead><tbody>`;
  snap.forEach(docu => {
    const d = docu.data();
    const fecha = d.createdAt?.toDate?.() || new Date();
    const dias = Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24));
    html += `<tr>
      <td>${d.nombre}</td>
      <td>${d.puesto}</td>
      <td>${d.ticket}</td>
      <td>${fecha.toLocaleDateString()}</td>
      <td>${dias}</td>
      <td>${d.estatus}</td>
      <td>${d.cvUrl ? `<a href="${d.cvUrl}" target="_blank">Ver CV</a>` : "No adjunto"}</td>
      <td>${d.motivo || ""}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  list.innerHTML = html;
}
