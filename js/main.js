// ===============================
// PI SDK – SANDBOX MODE
// ===============================
if (window.Pi) {
  Pi.init({
    version: "2.0",
    sandbox: true
  });
  console.log("Pi SDK initialized in SANDBOX mode");
} else {
  console.warn("Pi SDK not found. Open in Pi Browser.");
}

const piLoginBtn = document.getElementById("piLoginBtn");

if (piLoginBtn) {
  piLoginBtn.addEventListener("click", async () => {
    try {
      const scopes = ["username", "payments"];

      const authResult = await Pi.authenticate(scopes, onIncompletePayment);

      console.log("Pi Auth Success:", authResult);

      /*
        authResult contains:
        - accessToken
        - user.uid
        - user.username
      */

      // TEMP (frontend only – backend later)
      localStorage.setItem("pi_user", JSON.stringify(authResult.user));

      // Redirect to dashboard
      window.location.href = "../dashboard/client.html";

    } catch (err) {
      console.error("Pi Login Failed:", err);
      alert("Login failed. Please try again.");
    }
  });
}

// Required callback (even if unused now)
function onIncompletePayment(payment) {
  console.log("Incomplete payment found:", payment);
}

// Mobile Menu Toggle
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking a link
  document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
}

// ===============================
// AUTH GUARD – PROTECT PAGES
// ===============================
function requireAuth() {
  const token = localStorage.getItem("token");
  const piUser = localStorage.getItem("pi_user");

  if (!token && !piUser) {
    console.warn("Unauthorized access. Redirecting to login.");
    window.location.href = "../../pages/auth/login.html";
  }
}

const piUser = localStorage.getItem("pi_user");
if (piUser) {
  const user = JSON.parse(piUser);
  const el = document.getElementById("piUsername");
  if (el) el.textContent = user.username;
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("pi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../../pages/auth/login.html";
  });
}

// Sevice main

document.querySelectorAll('.cta-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'auth/login.html';
  });
});


// Placeholder Pi Wallet Button
const walletBtn = document.querySelector(".wallet-btn");
if (walletBtn) {
  walletBtn.addEventListener("click", () => {
    alert("Pi Wallet connection will be added soon.");
  });
}

const dropdownToggle = document.querySelector(".dropdown-toggle");

if (dropdownToggle) {
  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    dropdownToggle.parentElement.classList.toggle("active");
  });
}

console.log("SMAJ PI HUB navigation loaded");
