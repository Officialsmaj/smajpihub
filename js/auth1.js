document.addEventListener("DOMContentLoaded", () => {

  // FORGOT PASSWORD
  const forgotForm = document.getElementById("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", e => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      document.getElementById("successMsg").textContent =
        "If an account exists, a reset link has been sent to " + email;
    });
  }

  // RESET PASSWORD
  const resetForm = document.getElementById("resetForm");
  if (resetForm) {
    resetForm.addEventListener("submit", e => {
      e.preventDefault();

      const pass = document.getElementById("password").value;
      const confirm = document.getElementById("confirmPassword").value;

      if (pass !== confirm) {
        alert("Passwords do not match");
        return;
      }

      document.getElementById("resetSuccess").textContent =
        "Password reset successful. You can now log in.";
    });
  }

});
