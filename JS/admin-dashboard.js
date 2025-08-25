import { auth, db } from "../firebase-config.js";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Auth check
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
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

// Load all projects grouped by user
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

    // Group projects by userId
    const usersProjects = {};
    querySnapshot.forEach(docSnap => {
      const project = docSnap.data();
      const projectId = docSnap.id;
      if (!usersProjects[project.userId]) usersProjects[project.userId] = [];
      usersProjects[project.userId].push({ ...project, id: projectId });
    });

    // Render each user's projects in one container
    for (const userId in usersProjects) {
      // Use username from first project
      const username = usersProjects[userId][0].username || userId;

      const userDiv = document.createElement("div");
      userDiv.classList.add("user-project-container");
      userDiv.innerHTML = `<h2>${username}'s Dashboard</h2>`;

      usersProjects[userId].forEach(project => {
        const projectDiv = document.createElement("div");
        projectDiv.classList.add("project-card");

        const statusOptions = projectStatuses
          .map(status => `<option value="${status}" ${status === project.status ? "selected" : ""}>${status}</option>`)
          .join("");

        projectDiv.innerHTML = `
          <h3>${project.name}</h3>
          <p><b>Budget:</b> ₹${project.budget || "N/A"}</p>
          <p><b>Renovations:</b> ${project.renovations?.join(", ") || "None"}</p>
          <p><b>Description:</b> ${project.description || "No description"}</p>
          <div class="status-update">
            <label for="status-${project.id}">Update Status:</label>
            <select id="status-${project.id}">
              ${statusOptions}
            </select>
            <button class="update-status-btn">Update</button>
          </div>
          <div class="button-group">
            <button class="delete-btn" data-id="${project.id}">Delete Project</button>
          </div>
        `;
        userDiv.appendChild(projectDiv);

        // Event listeners
        projectDiv.querySelector(".update-status-btn").addEventListener("click", () => updateStatus(project.id, projectDiv));
        projectDiv.querySelector(".delete-btn").addEventListener("click", () => deleteProject(project.id));
      });

      projectList.appendChild(userDiv);
    }
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
  window.location.href = "index.html";
});
