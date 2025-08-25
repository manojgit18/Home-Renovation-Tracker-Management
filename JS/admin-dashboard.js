import { auth, db } from "../firebase-config.js";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Auth check
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadAllProjects();
});

// Admin-defined project statuses
const projectStatuses = [
  "Estimated Time & Quotation",
  "Approved",
  "Contractor Assigned",
  "Tasks Assigned",
  "Mobilizing Inventory & Logistics",
  "Project Started",
  "Project Pending",
  "Completed",
  "Delivered"
];

// Load all projects
async function loadAllProjects() {
  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "Loading projects...";

  try {
    const querySnapshot = await getDocs(collection(db, "projects"));
    projectList.innerHTML = "";

    if (querySnapshot.empty) {
      projectList.innerHTML = "<p>No projects found.</p>";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const project = docSnap.data();
      const projectId = docSnap.id;

      const div = document.createElement("div");
      div.classList.add("project-card");

      // Build status dropdown
      const statusOptions = projectStatuses
        .map(status => `<option value="${status}" ${status === project.status ? "selected" : ""}>${status}</option>`)
        .join("");

      div.innerHTML = `
        <h3>${project.name} (User: ${project.userId})</h3>
        <p><b>Budget:</b> ${project.budget || "N/A"}</p>
        <p><b>Renovations:</b> ${project.renovations?.join(", ") || "None"}</p>
        <p><b>Description:</b> ${project.description || "No description"}</p>
        <div class="status-update">
          <label for="status-${projectId}">Update Status:</label>
          <select id="status-${projectId}">
            ${statusOptions}
          </select>
          <button class="update-status-btn">Update</button>
        </div>
        <div class="button-group">
          <button class="delete-btn" data-id="${projectId}">Delete Project</button>
        </div>
      `;

      projectList.appendChild(div);

      // Event listeners
      div.querySelector(".update-status-btn").addEventListener("click", () => updateStatus(projectId, div));
      div.querySelector(".delete-btn").addEventListener("click", () => deleteProject(projectId));
    });
  } catch (error) {
    projectList.innerHTML = "<p>❌ Failed to load projects.</p>";
    console.error(error);
  }
}

// Update project status
async function updateStatus(projectId, div) {
  const selectEl = div.querySelector("select");
  const newStatus = selectEl.value;

  try {
    await updateDoc(doc(db, "projects", projectId), { status: newStatus });
    alert(`Status updated to "${newStatus}"`);
    loadAllProjects();
  } catch (error) {
    alert("❌ Failed to update status: " + error.message);
  }
}

// Delete project
async function deleteProject(projectId) {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      loadAllProjects();
    } catch (error) {
      alert("❌ Failed to delete project: " + error.message);
    }
  }
}

// Logout
document.getElementById("logout-btn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "login.html";
});
