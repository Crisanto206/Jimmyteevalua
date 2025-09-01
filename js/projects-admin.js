import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
const tbody = document.querySelector('#projectsTable tbody');
const addForm = document.getElementById('addForm');
const nameInput = document.getElementById('name');
const managerInput = document.getElementById('manager');
// Configura tu Firebase aquí
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
onAuthStateChanged(auth, user => {
  if (!user) { window.location.href = 'login.html'; return; }
  loadProjects();
});
// Mostrar todos los proyectos
function loadProjects() {
  db.ref("projects").on("value", (snapshot) => {
    tbody.innerHTML = "";
    snapshot.forEach(child => {
      const project = child.val();
      const key = child.key;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="text" value="${project.name || ""}" data-key="${key}" data-field="name" /></td>
        <td><input type="text" value="${project.manager || ""}" data-key="${key}" data-field="manager" /></td>
        <td>
          <button class="save" data-key="${key}">Guardar</button>
          <button class="delete" data-key="${key}">Eliminar</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  });
}
// Agregar proyecto
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const manager = managerInput.value.trim();
  if (!name) return;
  db.ref("projects").push({ name, manager });
  addForm.reset();
});
// Editar proyecto
tbody.addEventListener("click", (e) => {
  if (e.target.classList.contains("save")) {
    const key = e.target.dataset.key;
    const row = e.target.closest("tr");
    const name = row.querySelector('input[data-field="name"]').value;
    const manager = row.querySelector('input[data-field="manager"]').value;
    db.ref("projects/" + key).update({ name, manager });
  }
  if (e.target.classList.contains("delete")) {
    const key = e.target.dataset.key;
    db.ref("projects/" + key).remove();
  }
});
loadProjects();
