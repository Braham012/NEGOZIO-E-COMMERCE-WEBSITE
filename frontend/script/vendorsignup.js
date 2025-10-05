const form = document.getElementById("Registration");
const messageDiv = document.getElementById("message");
const loginModal = document.getElementById("loginModal");
const openLoginButton = document.getElementById("open-login");
const closeButton = document.querySelector(".close-button");
const loginForm = document.getElementById("Login");
const loginMessageDiv = document.getElementById("login-message");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const sendOtpButton = document.getElementById("sendOtpButton");
const verifyOtpButton = document.getElementById("verifyOtpButton");
const resetPasswordButton = document.getElementById("resetPasswordButton");
const otpMessage = document.getElementById("otpMessage");
const resetPasswordSection = document.getElementById("resetPasswordSection");

// Open the login modal when "Login here" is clicked
openLoginButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default anchor behavior
  loginModal.style.display = "flex"; // Show the modal
});

// Close the modal when the close button is clicked
closeButton.addEventListener("click", () => {
  loginModal.style.display = "none"; // Hide the modal
  forgotPasswordForm.classList.add("hidden"); // Hide forgot password form
  loginForm.classList.remove("hidden"); // Show login form
});

// Close the modal when clicking outside of the modal content
window.addEventListener("click", (event) => {
  if (event.target === loginModal) {
    loginModal.style.display = "none"; // Hide the modal
    forgotPasswordForm.classList.add("hidden"); // Hide forgot password form
    loginForm.classList.remove("hidden"); // Show login form
  }
});

// Handle signup form submission
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);

  const res = await fetch("http://localhost:4500/vendor/register", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      name: formData.get("name"),
      shopname: formData.get("shopname"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmpassword: formData.get("confirmpassword"),
      address: {
        currentaddress: formData.get("currentaddress"),
        pincode: formData.get("pincode"),
        city: formData.get("city"),
        state: formData.get("state"),
      },
    }),
  });
  const data = await res.json();
  if (data.success) {
    messageDiv.innerHTML = `<p style="color: red;">${data.message}</p>
                    <br /><form id="otpForm">
                    <label for="otp">Enter OTP:</label>
                    <input type="text" id="otp" name="otp" required autocomplete="off" /><br /><br />
                    <button type="submit">Submit</button><button type="button" id="resendOtpButton">Resend OTP</button>
                    <br /><br />
                    <div id="otpMessage"></div>
                    </form>`;
    const otpForm = document.getElementById("otpForm");
    const otpMessageDiv = document.getElementById("otpMessage");

    otpForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const otpData = new FormData(otpForm);
      const otpRes = await fetch("http://localhost:4500/vendor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          otp: otpData.get("otp"),
        }),
      });
      const otpMessage = await otpRes.json();
      if (otpMessage.success) {
        otpMessageDiv.innerHTML = `<p style="color: green;">${otpMessage.message}</p>`;
      } else {
        otpMessageDiv.innerHTML = `<p style="color: red;">${otpMessage.message}</p>`;
      }
      setTimeout(() => {
        window.location.href = "";
      }, 3000);
    });
    document
      .getElementById("resendOtpButton")
      .addEventListener("click", async (event) => {
        event.preventDefault();
        const resendOtpRes = await fetch(
          "http://localhost:4500/vendor/resend-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.get("email"),
            }),
          }
        );
        const resendOtpMessage = await resendOtpRes.json();
        otpMessageDiv.innerHTML = `<p style="color: green;">${resendOtpMessage.message}</p>`;
      });
  } else {
    messageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
  }
});

// Handle login form submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  const res = await fetch("http://localhost:4500/vendor/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
    credentials: "include",
  });
  const data = await res.json();
  if (data.success) {
    loginMessageDiv.textContent = data.message;
    loginMessageDiv.style.color = "green";
    setTimeout(() => {
      window.location.href = "vendorallproduct.html"; // Redirect or close modal
    }, 2000);
  } else {
    loginMessageDiv.textContent = data.message;
    loginMessageDiv.style.color = "red";
  }
});

// Show forgot password form
document
  .getElementById("forgot-password-button")
  .addEventListener("click", (event) => {
    event.preventDefault();
    forgotPasswordForm.classList.remove("hidden"); // Show forgot password form
    loginForm.classList.add("hidden"); // Hide login form
  });

// Handle sending OTP for forgot password
sendOtpButton.addEventListener("click", async () => {
  const email = document.getElementById("forgotEmail").value;
  const res = await fetch("http://localhost:4500/vendor/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  otpMessage.textContent = data.message;
  otpMessage.style.color = data.success ? "green" : "red";
  if (data.success) {
    resetPasswordSection.classList.remove("hidden");
  }
});

// Handle OTP verification
verifyOtpButton.addEventListener("click", async () => {
  const email = document.getElementById("forgotEmail").value;
  const otp = document.getElementById("otp").value;
  const res = await fetch(
    "http://localhost:4500/vendor/verify-forgot-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }
  );
  const data = await res.json();
  otpMessage.textContent = data.message;
  otpMessage.style.color = data.success ? "green" : "red";
  if (data.success) {
    resetPasswordSection.classList.remove("hidden");
  }
});

// password reset
resetPasswordButton.addEventListener("click", async () => {
  const email = document.getElementById("forgotEmail").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmNewPassword =
    document.getElementById("confirmNewPassword").value;

  if (newPassword !== confirmNewPassword) {
    otpMessage.textContent = "Passwords do not match.";
    otpMessage.style.color = "red";
    return;
  }

  const res = await fetch("http://localhost:4500/vendor/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, newPassword, confirmNewPassword }),
  });
  const data = await res.json();
  otpMessage.textContent = data.message;
  otpMessage.style.color = data.success ? "green" : "red";
  if (data.success) {
    setTimeout(() => {
      loginModal.style.display = "none";
      forgotPasswordForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    }, 2000);
  }
});

document.getElementById("signup-link").addEventListener("click", (event) => {
  event.preventDefault();
  loginModal.style.display = "none";
});
