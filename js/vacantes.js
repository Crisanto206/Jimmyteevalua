import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// --- Igual que checklist: proyectos permitidos por usuario ---
let currentUser = null;
let userProjects = [];
let userRole = "";

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  // Igual que checklist: obtener proyectos asignados al usuario
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    alert("No tienes permisos configurados.");
    window.location.href = "login.html";
    return;
  }
  userProjects = snap.data().assignedProjects || [];
  userRole = snap.data().role || "";
  document.getElementById("userBar").innerHTML =
    `<span>${user.email}</span> <button id="logoutBtn">Cerrar Sesión</button>`;
  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    window.location.href = "login.html";
  };
  buildProjectList(); // <- esto llena el datalist igual que checklist
  await loadVacantes();
});

function buildProjectList() {
  // Igual que checklist: llena el datalist solo con proyectos permitidos
  const datalist = document.getElementById('projectList');
  datalist.innerHTML = "";
  userProjects.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    datalist.appendChild(option);
  });
}

document.getElementById("vacanteForm").onsubmit = async e => {
  e.preventDefault();
  const proyecto = document.getElementById("project").value;
  const vacantes = parseInt(document.getElementById("vacantesDisponibles").value) || 0;
  if (!proyecto) return alert("Selecciona un proyecto.");
  // Solo gerente del proyecto o admin puede crear/editar
  if (userRole !== "admin" && !userProjects.includes(proyecto)) {
    alert("No tienes permisos para este proyecto.");
    return;
  }
  // Guardar/actualizar vacante
  const ref = doc(db, "vacantes", proyecto);
  const snap = await getDoc(ref);
  const now = serverTimestamp();
  let data = {
    proyecto,
    vacantes,
    estatus: vacantes > 0 ? "Abierto" : "Cubierto",
    updatedBy: currentUser.email,
    updatedAt: now
  };
  if (!snap.exists()) {
    data.createdBy = currentUser.email;
    data.createdAt = now;
  }
  await setDoc(ref, data, { merge: true });
  alert("Vacante guardada.");
  await loadVacantes();
};

async function loadVacantes() {
  const vacantesSnap = await getDocs(collection(db, "vacantes"));
  const list = document.getElementById("vacantesList");
  let html = `<table><thead><tr>
    <th>Proyecto</th><th>Vacantes</th><th>Estatus</th><th>Última actualización</th><th>Acciones</th>
    </tr></thead><tbody>`;
  vacantesSnap.forEach(docu => {
    const v = docu.data();
    // Solo mostrar vacantes de los proyectos asignados al usuario (igual que checklist)
    if (!userProjects.includes(v.proyecto)) return;
    html += `<tr>
      <td>${v.proyecto}</td>
      <td>${v.vacantes}</td>
      <td>${v.estatus}</td>
      <td>${(v.updatedAt?.toDate?.() || "").toLocaleString?.() || ""}</td>
      <td>
        ${v.estatus === "Abierto" && (userRole === "admin" || userProjects.includes(v.proyecto)) ?
          `<button onclick="window.cubrirVacante('${v.proyecto}')">Marcar Cubierta</button>` : ""}
      </td>
    </tr>`;
  });
  html += "</tbody></table>";
  list.innerHTML = html;
}

window.cubrirVacante = async function(proyecto) {
  if (!confirm("¿Marcar vacante como cubierta?")) return;
  const ref = doc(db, "vacantes", proyecto);
  await updateDoc(ref, {
    estatus: "Cubierto",
    hireDate: serverTimestamp(),
    updatedBy: currentUser.email,
    updatedAt: serverTimestamp()
  });
  await loadVacantes();
};
};
