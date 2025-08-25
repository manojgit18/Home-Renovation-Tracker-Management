import { auth, db } from "../firebase-config.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Wait for auth state
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("createProjectForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // form fields
      const name = document.getElementById("projectName").value.trim();
      const description = document.getElementById("projectDesc").value.trim();
      const budget = document.getElementById("projectBudget").value.trim();

      // check renovation checkboxes
      const renovations = [];
      document.querySelectorAll("input[name='renovation']:checked").forEach((checkbox) => {
        renovations.push(checkbox.value);
      });

      if (!name) {
        alert("Project name is required!");
        return;
      }

      try {
        await addDoc(collection(db, "projects"), {
          userId: user.uid,
          name,
          description,
          budget,
          renovations,
          status: "pending",      // default until admin approves
          progress: ["Created"],  // default first step
          createdAt: new Date()
        });

        alert("✅ Project created successfully!");
        form.reset();
      } catch (error) {
        console.error("Error creating project:", error);
        alert("❌ Failed to create project: " + error.message);
      }
    });
  }
});
