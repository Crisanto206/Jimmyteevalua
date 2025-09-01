import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUser = null;
let isAdmin = false;
let proyectos = [];

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  const snap = await getDocs(collection(db, "users"));
  snap.forEach(u => {
    if (u.id === user.uid && (u.data().role === "admin" || u.data().isAdmin)) isAdmin = true;
  });
  if (!isAdmin) {
    alert("Solo administradores pueden acceder.");
    window.location.href = "index.html";
    return;
  }
  document.getElementById("userBar").innerHTML =
    `<span>${user.email}</span> <button id="logoutBtn">Cerrar Sesión</button>`;
  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    window.location.href = "login.html";
  };
  await loadProyectos();
  await renderKPI();
});

async function loadProyectos() {
  const snap = await getDocs(collection(db, "projects"));
  proyectos = [];
  const select = document.getElementById("kpiProyectoSelect");
  select.innerHTML = `<option value="">Todos</option>`;
  snap.forEach(docu => {
    proyectos.push(docu.id);
    const opt = document.createElement("option");
    opt.value = docu.id;
    opt.textContent = docu.id;
    select.appendChild(opt);
  });
}

document.getElementById("kpiFiltrarBtn").onclick = renderKPI;

async function renderKPI() {
  // Filtros
  const proyecto = document.getElementById("kpiProyectoSelect").value;
  const fechaIni = document.getElementById("kpiFechaInicio").value;
  const fechaFin = document.getElementById("kpiFechaFin").value;
  const estatus = document.getElementById("kpiEstatusSelect").value;

  // Vacantes
  const vacSnap = await getDocs(collection(db, "vacantes"));
  let vacantes = [];
  vacSnap.forEach(docu => {
    const v = docu.data();
    if ((proyecto && v.proyecto !== proyecto) || (estatus && v.estatus !== estatus)) return;
    vacantes.push(v);
  });

  // Entrevistas
  const entSnap = await getDocs(collection(db, "entrevistas"));
  let entrevistas = [];
  entSnap.forEach(docu => {
    const d = docu.data();
    if (proyecto && d.proyecto && d.proyecto !== proyecto) return;
    if (estatus && d.estatus !== estatus) return;
    if (fechaIni && d.createdAt?.toDate?.() && d.createdAt.toDate() < new Date(fechaIni)) return;
    if (fechaFin && d.createdAt?.toDate?.() && d.createdAt.toDate() > new Date(fechaFin)) return;
    entrevistas.push(d);
  });

  // KPIs
  let html = `<h3>Vacantes por Proyecto</h3>
    <table><thead><tr><th>Proyecto</th><th>Abiertas</th><th>Cubiertas</th></tr></thead><tbody>`;
  proyectos.forEach(p => {
    const abiertas = vacantes.filter(v => v.proyecto === p && v.estatus === "Abierto").length;
    const cubiertas = vacantes.filter(v => v.proyecto === p && v.estatus === "Cubierto").length;
    html += `<tr${abiertas > 3 ? ' style="background:#fffbe7;color:#c00;"' : ""}>
      <td>${p}</td><td>${abiertas}</td><td>${cubiertas}</td></tr>`;
  });
  html += "</tbody></table>";

  html += `<h3>Estadísticas de Entrevistas</h3>
    <table><thead><tr>
      <th>Total</th><th>Abierto</th><th>En proceso</th><th>Cerrado</th><th>Antigüedad Promedio (días)</th>
    </tr></thead><tbody>`;
  const total = entrevistas.length;
  const abiertos = entrevistas.filter(e => e.estatus === "Abierto").length;
  const proceso = entrevistas.filter(e => e.estatus === "En proceso").length;
  const cerrados = entrevistas.filter(e => e.estatus === "Cerrado").length;
  const promDias = total > 0 ? Math.round(entrevistas.reduce((a, e) => {
    const fecha = e.createdAt?.toDate?.() || new Date();
    return a + ((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24));
  }, 0) / total) : 0;
  html += `<tr>
    <td>${total}</td><td>${abiertos}</td><td>${proceso}</td><td>${cerrados}</td><td>${promDias}</td>
  </tr></tbody></table>`;

  document.getElementById("kpiDashboard").innerHTML = html;
}
