const welcomeMessageDiv = document.getElementById("welcome-message");
const welcomeText = document.getElementById("welcome-text");
const logoutButton = document.getElementById("logout-button");

window.onload = async () => {
  const user = await isLoggedin();
  if (user) {
    welcomeText.textContent = `Welcome, ${user.name}`;
    welcomeMessageDiv.style.display = "block";
    document.getElementById("signup-link").style.display = "none";
    document.getElementById("seller-link").style.display = "none";
    document.getElementById("cart-link").style.display = "block";
    document.getElementById("order-link").style.display = "block";
    attachLogout();
  } else {
    welcomeMessageDiv.style.display = "none";
    document.getElementById("signup-link").style.display = "block";
    document.getElementById("seller-link").style.display = "block";
    document.getElementById("cart-link").style.display = "none";
    document.getElementById("order-link").style.display = "none";
  }
};

async function isLoggedin() {
  try {
    const res = await fetch("http://localhost:4500/user/verify", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    if (data.success) {
      return data.user;
    } else {
      return false;
    }
  } catch (err) {
    console.error("Error checking login:", err);
    return false;
  }
}
function attachLogout() {
  logoutButton.onclick = async function () {
    const res = await fetch("http://localhost:4500/user/logout", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    if (data.success) {
      welcomeMessageDiv.style.display = "none";
      logoutButton.style.display = "none";
      document.getElementById("signup-link").style.display = "block";
      document.getElementById("seller-link").style.display = "block";
      document.getElementById("cart-link").style.display = "none";
      document.getElementById("order-link").style.display = "none";
    }
  };
}
const searchBar = document.getElementById("search-bar");
const searchIcon = document.getElementById("search-icon");

function redirectToSearch() {
  const query = searchBar.value.trim();
  if (query !== "") {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
}

searchIcon.addEventListener("click", redirectToSearch);

searchBar.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    redirectToSearch();
  }
});

async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:4500/product/getproduct");
    const products = await response.json();
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";
    if (products && products.length > 0) {
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        const firstImage = product.images ? product.images[0] : "";
        productDiv.className = "product";

        const productLink = document.createElement("a");
        productLink.href = `productinfo.html?id=${product._id}`;
        productLink.style.textDecoration = "none";
        productLink.style.color = "inherit";

        productLink.innerHTML = `
                <img src="${firstImage}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p><b>Price: ₹${product.sellingprice}</b></p>
                <p> ${product.shortdescription}</p>
              `;

        productDiv.appendChild(productLink);
        productList.appendChild(productDiv);
      });
    } else {
      productList.innerHTML = "<p>No products found</p>";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

fetchProducts();

// Signup Modal
const signupModal = document.getElementById("signup-modal");
const signupLink = document.getElementById("signup-link");
const closeSignupModal = document.getElementsByClassName("close")[0];
const openLoginLink = document.getElementById("open-login");

signupLink.onclick = function () {
  signupModal.style.display = "block";
};

closeSignupModal.onclick = function () {
  signupModal.style.display = "none";
};

openLoginLink.onclick = function () {
  signupModal.style.display = "none";
  loginModal.style.display = "block";
};

// Login Modal
const loginModal = document.getElementById("login-modal");
const closeLoginModal = document.getElementsByClassName("close-login")[0];
const openSignupLink = document.getElementById("open-signup");

closeLoginModal.onclick = function () {
  loginModal.style.display = "none";
};

openSignupLink.onclick = function () {
  loginModal.style.display = "none";
  signupModal.style.display = "block";
};

window.addEventListener("click", function (event) {
  if (event.target == signupModal) {
    signupModal.style.display = "none";
  }
  if (event.target == loginModal) {
    loginModal.style.display = "none";
  }
});

// Signup form
const registrationForm = document.getElementById("Registration");
const messageDiv = document.getElementById("message");

// OTP Modal
const otpModal = document.getElementById("otp-modal");
const otpForm = document.getElementById("otp-form");
const otpMessageDiv = document.getElementById("otp-message");

registrationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registrationForm);

  const res = await fetch("http://localhost:4500/user/signup", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.get("name"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmpassword: formData.get("confirmpassword"),
    }),
  });
  const data = await res.json();
  if (data.success) {
    messageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
    setTimeout(() => {
      document.getElementById("otp-email").value = formData.get("email");
      signupModal.style.display = "none";
      otpModal.style.display = "block";
    }, 2000);
  } else {
    messageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
  }
});

// OTP submit
otpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(otpForm);

  const res = await fetch("http://localhost:4500/user/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("otp-email").value,
      otp: formData.get("otp"),
    }),
  });

  const data = await res.json();
  if (data.success) {
    otpMessageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
    setTimeout(() => {
      otpModal.style.display = "none";
      loginModal.style.display = "block";
    }, 2000);
  } else {
    otpMessageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
  }
});

// Resend OTP
const resendOtpButton = document.getElementById("resend-otp");
resendOtpButton.addEventListener("click", async () => {
  const res = await fetch("http://localhost:4500/user/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("otp-email").value,
    }),
  });
  const data = await res.json();
  if (data.success) {
    setTimeout(() => {
      otpMessageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
    }, 2000);
  } else {
    otpMessageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
  }
});

// Login form
const loginForm = document.getElementById("Login");
const loginMessageDiv = document.getElementById("login-message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  const res = await fetch("http://localhost:4500/user/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.get("email"),
      password: formData.get("password"),
    }),
  });
  const data = await res.json();
  if (data.success) {
    welcomeText.textContent = `Welcome, ${data.user.name}`;
    welcomeMessageDiv.style.display = "block";

    // Hide signup/login links
    document.getElementById("signup-link").style.display = "none";
    document.getElementById("seller-link").style.display = "none";
    document.getElementById("cart-link").style.display = "block";
    document.getElementById("order-link").style.display = "block";

    // Logout function
    logoutButton.onclick = async function () {
      const res = await fetch("http://localhost:4500/user/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        welcomeMessageDiv.style.display = "none";
        logoutButton.style.display = "none";
        document.getElementById("signup-link").style.display = "block";
        document.getElementById("seller-link").style.display = "block";
        document.getElementById("cart-link").style.display = "none";
        document.getElementById("order-link").style.display = "none";
      }
    };

    loginMessageDiv.textContent = "Login successful!";
    loginMessageDiv.style.color = "green";

    setTimeout(() => {
      loginModal.style.display = "none";
      loginMessageDiv.textContent = "";
    }, 2000);
  } else {
    loginMessageDiv.textContent = data.message;
    loginMessageDiv.style.color = "red";
  }
});

let logoutTimeout;
welcomeMessageDiv.addEventListener("mouseenter", () => {
  logoutButton.style.display = "block";
  clearTimeout(logoutTimeout);
});

welcomeMessageDiv.addEventListener("mouseleave", () => {
  logoutTimeout = setTimeout(() => {
    logoutButton.style.display = "none";
  }, 4000);
});

logoutButton.addEventListener("mouseenter", () => {
  logoutButton.style.display = "block";
  clearTimeout(logoutTimeout);
});

logoutButton.addEventListener("mouseleave", () => {
  logoutTimeout = setTimeout(() => {
    logoutButton.style.display = "none";
  }, 2000);
});

// ✅ Auto-open login modal if ?login is in the URL
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const loginParam = urlParams.get("login");

  if (loginParam !== null) {
    loginModal.style.display = "block";

    if (window.history.replaceState) {
      const cleanUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname;
      window.history.replaceState({ path: cleanUrl }, "", cleanUrl);
    }
  }
});
