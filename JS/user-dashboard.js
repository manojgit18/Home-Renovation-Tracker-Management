import { auth, db } from "../firebase-config.js";
import { 
  doc, getDoc, setDoc, collection, addDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Authentication & role check
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;

      if (role !== "user") {
        window.location.href = "admin-dashboard.html"; 
        return;
      }

      document.getElementById("userEmail").textContent = user.email;
      document.getElementById("userRole").textContent = role;

      // Load user's projects
      loadUserProjects(user.uid);

      // Project creation
      const form = document.getElementById("createProjectForm");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          await createProject(user.uid);
        });
      }

      // Logout
      const logoutBtn = document.getElementById("logoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          await auth.signOut();
          window.location.href = "index.html";
        });
      }

    } else {
      alert("No user document found!");
      window.location.href = "index.html";
    }
  } else {
    window.location.href = "index.html"; 
  }
});

// Create a new project
async function createProject(userId) {
  const name = document.getElementById("projectName").value;
  const budget = document.getElementById("projectBudget").value;
  const renovations = Array.from(
    document.querySelectorAll('input[name="renovation"]:checked')
  ).map(el => el.value);

  if (!name.trim()) {
    alert("Project name is required!");
    return;
  }

  await addDoc(collection(db, "projects"), {
    userId,
    name,
    budget: budget || 0,
    renovations,
    status: "pending",
    progress: ["Created"],
    createdAt: new Date()
  });

  alert("Project created successfully!");
  document.getElementById("createProjectForm").reset();
  loadUserProjects(userId);
}

// Load user's projects
async function loadUserProjects(userId) {
  const q = query(collection(db, "projects"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  const projectList = document.getElementById("projectList");
  projectList.innerHTML = "";

  if (querySnapshot.empty) {
    projectList.innerHTML = "<p>No projects found. Create one!</p>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const project = docSnap.data();
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${project.name}</strong> <br>
      Budget: ₹${project.budget} <br>
      Services: ${project.renovations?.join(", ") || "None"} <br>
      Status: <b>${project.status}</b> <br>
      Progress: ${project.progress?.join(" ➝ ") || "Not started"}
    `;

    projectList.appendChild(li);
  });
}
