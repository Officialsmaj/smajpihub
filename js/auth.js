document.addEventListener("DOMContentLoaded", () => {
  // Initialize Pi SDK
  if (window.Pi) {
    Pi.init({ version: "2.0", sandbox: true }); // Set sandbox to false in production
  }

  // Register form handler
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const email = document.getElementById("email").value;
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, username, password })
        });

        const data = await response.json();
        alert(data.message);
        if (response.ok) {
          window.location.href = 'login.html';
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
      }
    });
  }

  // Login form handler
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const identifier = document.querySelector('input[placeholder="Username or Email"]').value;
      const password = document.querySelector('input[placeholder="Password"]').value;

      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();
        alert(data.message);
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '../dashboard/client.html'; // Redirect to dashboard
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
      }
    });
  }

  // Pi Wallet login handler
  const piLoginBtn = document.getElementById("piLoginBtn");
  if (piLoginBtn) {
    piLoginBtn.addEventListener("click", async () => {
      if (!window.Pi) {
        alert("Pi SDK not loaded");
        return;
      }

      try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        alert(`Pi Wallet login successful for ${auth.user.username}`);
        // Handle Pi login (e.g., create session, redirect)
        localStorage.setItem('piUser', JSON.stringify(auth.user));
        window.location.href = '../dashboard/client.html';
      } catch (error) {
        console.error('Pi login error:', error);
        alert('Pi Wallet login failed.');
      }
    });
  }

  // Pi Wallet register handler
  const piRegisterBtn = document.getElementById("piRegisterBtn");
  if (piRegisterBtn) {
    piRegisterBtn.addEventListener("click", async () => {
      if (!window.Pi) {
        alert("Pi SDK not loaded");
        return;
      }

      try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        alert(`Pi Wallet registration successful for ${auth.user.username}`);
        // Handle Pi register (e.g., create account, redirect)
        localStorage.setItem('piUser', JSON.stringify(auth.user));
        window.location.href = '../dashboard/client.html';
      } catch (error) {
        console.error('Pi register error:', error);
        alert('Pi Wallet registration failed.');
      }
    });
  }

  // Forgot password form handler
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;

      try {
        const response = await fetch('http://localhost:3000/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.message);
      } catch (error) {
        console.error('Forgot password error:', error);
        alert('Failed to send reset link.');
      }
    });
  }

  // Reset password form handler
  const resetForm = document.getElementById("resetForm");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const token = new URLSearchParams(window.location.search).get('token');

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password })
        });

        const data = await response.json();
        alert(data.message);
        if (response.ok) {
          window.location.href = 'login.html';
        }
      } catch (error) {
        console.error('Reset password error:', error);
        alert('Password reset failed.');
      }
    });
  }

  function onIncompletePaymentFound(payment) {
    // Handle incomplete payments if needed
    console.log('Incomplete payment found:', payment);
  }
});

console.log("Auth page loaded");
