import { auth, db } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Helper to get current user info (for welcome message)
export async function getCurrentUser() {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) return resolve(null);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) resolve({ uid: user.uid, ...userDoc.data() });
      else resolve({ uid: user.uid, email: user.email });
    });
  });
}

// Existing DOMContentLoaded login/signup/logout logic
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");

  // LOGIN
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredential.user.uid;

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const role = userDoc.data().role;
          if (role === "admin") window.location.href = "admin-dashboard.html";
          else window.location.href = "user-dashboard.html";
        } else {
          document.getElementById("login-message").innerText =
            "No user data found!";
        }
      } catch (error) {
        document.getElementById("login-message").innerText = error.message;
      }
    });
  }

  // SIGNUP
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const role = document.getElementById("role").value;

      try {
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCredentials.user.uid), {
          email,
          role,
        });

        window.location.href = "index.html";
      } catch (error) {
        document.getElementById("signup-message").innerText = error.message;
      }
    });
  }

  // LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});
