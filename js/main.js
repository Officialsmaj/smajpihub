// Mobile Menu Toggle
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
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