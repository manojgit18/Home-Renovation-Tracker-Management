import { auth, db } from "../firebase-config.js";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadUserProjects(user.uid);
});

async function loadUserProjects(userId) {
  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "<p>Loading your projects...</p>";

  try {
    const q = query(collection(db, "projects"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    projectList.innerHTML = "";
    if (querySnapshot.empty) {
      projectList.innerHTML = "<p>No projects yet. Create one!</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const project = docSnap.data();
      const projectId = docSnap.id;

      const div = document.createElement("div");
      div.classList.add("project-card");

      div.innerHTML = `
        <h3>${project.name}</h3>
        <p><b>Budget:</b> ${project.budget || "N/A"}</p>
        <p><b>Renovations:</b> ${project.renovations?.join(", ") || "None"}</p>
        <p><b>Description:</b> ${project.description || "No description"}</p>
        <p><b>Current Status:</b> ${project.status}</p>
        <div class="button-group">
          <button class="edit-btn" data-id="${projectId}">Edit Project</button>
          <button class="cancel-btn" data-id="${projectId}">Cancel Project</button>
        </div>
      `;

      projectList.appendChild(div);

      div.querySelector(".edit-btn").addEventListener("click", () => editProject(projectId, project));
      div.querySelector(".cancel-btn").addEventListener("click", () => cancelProject(projectId));
    });
  } catch (error) {
    projectList.innerHTML = "<p>❌ Failed to load projects.</p>";
    console.error(error);
  }
}

// Edit project
async function editProject(projectId, project) {
  const newName = prompt("Edit project name:", project.name);
  const newDesc = prompt("Edit project description:", project.description);
  const newBudget = prompt("Edit budget (₹):", project.budget);

  if (newName && newDesc && newBudget) {
    try {
      await updateDoc(doc(db, "projects", projectId), {
        name: newName,
        description: newDesc,
        budget: +newBudget
      });
      loadUserProjects(auth.currentUser.uid);
    } catch (error) {
      alert("❌ Failed to update project: " + error.message);
    }
  }
}

// Cancel project
async function cancelProject(projectId) {
  if (confirm("Are you sure you want to cancel this project?")) {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      loadUserProjects(auth.currentUser.uid);
    } catch (error) {
      alert("❌ Failed to cancel project: " + error.message);
    }
  }
}
