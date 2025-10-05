async function checkLogin() {
  try {
    const res = await fetch("http://localhost:4500/user/verify", {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    const welcomeText = document.getElementById("welcome-text");
    const logoutButton = document.getElementById("logout-button");
    const welcomeMessageDiv = document.getElementById("welcome-message");

    if (!data.success) {
      window.location.href = "homepage.html?login";
    } else {
      welcomeText.textContent = `Welcome, ${data.user.name}`;
      welcomeMessageDiv.style.display = "block";
      logoutButton.style.display = "none";

      // Setup hover show/hide for logout
      setupHoverToggle(welcomeMessageDiv, logoutButton);
      setupHoverToggle(logoutButton, logoutButton);

      // Logout functionality
      logoutButton.addEventListener("click", async () => {
        const logoutRes = await fetch("http://localhost:4500/user/logout", {
          method: "GET",
          credentials: "include",
        });
        const logoutData = await logoutRes.json();
        if (logoutData.success) {
          window.location.href = "homepage.html";
        }
      });

      fetchProducts();
    }
  } catch (error) {
    console.error("Error verifying login:", error);
    window.location.href = "homepage.html?login";
  }
}

function setupHoverToggle(element, target, delay = 2000) {
  let timeout;
  element.addEventListener("mouseenter", () => {
    target.style.display = "block";
    clearTimeout(timeout);
  });
  element.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => (target.style.display = "none"), delay);
  });
}

checkLogin();
const searchBar = document.getElementById("search-bar");
const searchIcon = document.getElementById("search-icon");

function redirectToSearch() {
  const query = searchBar.value.trim();
  if (query !== "") {
    // Use `q` as the query parameter
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
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category");

  if (!category) {
    document.getElementById("product-list").innerHTML =
      "<p>Category not found.</p>";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:4500/product/getproductbycategory/${category}`
    );
    const products = await response.json();
    const productList = document.getElementById("product-list");
    productList.innerHTML = "";

    if (products && products.length > 0) {
      products.forEach((product) => {
        const productDiv = document.createElement("div");
        const firstImage = product.images ? product.images[0] : "";
        productDiv.className = "product";
        productDiv.innerHTML = `
                <a href="productinfo.html?id=${product._id}" style="text-decoration: none; color: inherit;">
                  <img src="${firstImage}" alt="${product.name}">
                  <h2>${product.name}</h2>
                  <p>Price: ₹${product.sellingprice}</p>
                  <p>Description: ${product.shortdescription}</p>
                </a>
              `;
        productList.appendChild(productDiv);
      });
    } else {
      productList.innerHTML = "<p>No products found</p>";
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}
