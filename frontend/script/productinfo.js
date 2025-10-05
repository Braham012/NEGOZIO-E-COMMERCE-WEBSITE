document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.getElementById("welcome-text");
  const logoutButton = document.getElementById("logout-button");
  const welcomeMessageDiv = document.getElementById("welcome-message");

  fetch("http://localhost:4500/user/verify", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        welcomeText.textContent = `Welcome, ${data.user.name}`;
        welcomeMessageDiv.style.display = "block";
      } else {
        welcomeText.textContent = "Welcome, Guest";
      }
    });

  // Logout functionality
  logoutButton.addEventListener("click", () => {
    fetch("http://localhost:4500/user/logout", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "homepage.html";
        }
      });
  });

  // Hover logic for logout
  let logoutTimeout;
  welcomeMessageDiv.addEventListener("mouseenter", () => {
    logoutButton.style.display = "block";
    clearTimeout(logoutTimeout);
  });
  welcomeMessageDiv.addEventListener("mouseleave", () => {
    logoutTimeout = setTimeout(() => {
      logoutButton.style.display = "none";
    }, 2000);
  });
  logoutButton.addEventListener("mouseenter", () => {
    clearTimeout(logoutTimeout);
  });
  logoutButton.addEventListener("mouseleave", () => {
    logoutTimeout = setTimeout(() => {
      logoutButton.style.display = "none";
    }, 2000);
  });
});

// === PRODUCT INFO SCRIPT ===
let currentImageIndex = 0;
let productImages = [];
let currentProductId = null;

async function checkLogin() {
  try {
    const res = await fetch("http://localhost:4500/user/verify", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!data.success) {
      window.location.href = "homepage.html?login";
    } else {
      fetchProductInfo();
    }
  } catch (error) {
    console.error("Error verifying login:", error);
    window.location.href = "homepage.html?login";
  }
}

checkLogin();

async function fetchProductInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  currentProductId = productId;

  if (!productId) {
    document.getElementById("product-info").innerHTML =
      "<p>Product ID not found.</p>";
    return;
  }
  try {
    const response = await fetch(
      `http://localhost:4500/product/getproductdetail/${productId}`
    );
    const product = await response.json();

    if (product) {
      productImages = product.images;
      document.getElementById("product-info").innerHTML = `
              <h1>${product.name}</h1>
              <div class="image-container">
                <img id="product-image" src="${product.images[0]}">
                <button class="arrow-button left-arrow" onclick="changeImage(-1)">&#10094;</button>
                <button class="arrow-button right-arrow" onclick="changeImage(1)">&#10095;</button>
              </div>
              <p><strong>Price:</strong> ₹${product.sellingprice}</p>
              <p><strong>Description:</strong> ${product.description}</p>
              <p><strong>Sold By:</strong> ${product.soldby}</p>
              <div class="button-container">
                <button class="button add-to-cart">Add to Cart</button>
                <button class="button order-now">Order Now</button>
              </div>
              <div id="message"></div>
            `;
      displayImage(currentImageIndex);

      document
        .querySelector(".add-to-cart")
        .addEventListener("click", addtocart);
      document
        .querySelector(".order-now")
        .addEventListener("click", showOrderPopup);
    } else {
      document.getElementById("product-info").innerHTML =
        "<p>Product not found.</p>";
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    document.getElementById("product-info").innerHTML =
      "<p>Error fetching product details.</p>";
  }
}

function displayImage(index) {
  const imageElement = document.getElementById("product-image");
  if (imageElement) {
    imageElement.src = productImages[index];
  }
}

function changeImage(direction) {
  currentImageIndex += direction;
  if (currentImageIndex < 0) {
    currentImageIndex = productImages.length - 1;
  } else if (currentImageIndex >= productImages.length) {
    currentImageIndex = 0;
  }
  displayImage(currentImageIndex);
}

async function addtocart() {
  const res = await fetch(
    `http://localhost:4500/cart/addtocart/${currentProductId}`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await res.json();
  if (data.success) {
    document.getElementById(
      "message"
    ).innerHTML = `<p style='color:green'>Product added to cart successfully.</p>`;
  } else {
    document.getElementById(
      "message"
    ).innerHTML = `<p style='color:red;'>Failed to add product.</p>`;
  }
  setTimeout(() => {
    document.getElementById("message").innerHTML = "";
  }, 1500);
}

// === ORDER NOW POPUP LOGIC ===
const popup = document.getElementById("order-confirm-popup");
const popupMessage = document.getElementById("order-confirm-message");

function showOrderPopup() {
  popup.style.display = "block";
  popupMessage.textContent = "Are you sure you want to place this order?";
  popupMessage.style.color = "black";
}

document.getElementById("order-no").addEventListener("click", () => {
  popup.style.display = "none";
});

document.getElementById("order-yes").addEventListener("click", async () => {
  try {
    const response = await fetch(
      `http://localhost:4500/order/orderbyid/${currentProductId}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();
    if (data.success) {
      popupMessage.textContent = "Order placed successfully!";
      popupMessage.style.color = "#2ecc71";
      setTimeout(() => {
        popup.style.display = "none";
      }, 2000);
    } else {
      popupMessage.textContent = data.message || "Failed to place order.";
      popupMessage.style.color = "#e74c3c";
      setTimeout(() => {
        popup.style.display = "none";
      }, 2000);
    }
  } catch (error) {
    popupMessage.textContent = "Error placing order.";
    popupMessage.style.color = "#e74c3c";
    setTimeout(() => {
      popup.style.display = "none";
    }, 2000);
  }
});
