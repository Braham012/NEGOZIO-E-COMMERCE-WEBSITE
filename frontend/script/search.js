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

      setupHoverToggle(welcomeMessageDiv, logoutButton);
      setupHoverToggle(logoutButton, logoutButton);

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
    }
  } catch (error) {
    console.error("Error verifying login:", error);
    window.location.href = "homepage.html?login";
  }
}

document.addEventListener("DOMContentLoaded", checkLogin);

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
document.addEventListener("DOMContentLoaded", checkLogin);

async function fetchSearchResults() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const productList = document.getElementById("product-list");

  if (!query) {
    productList.innerHTML = "<p>No search query provided.</p>";
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:4500/product/search?q=${encodeURIComponent(query)}`,
      {
        credentials: "include", // ensure cookies/session are sent
      }
    );

    const resData = await res.json();
    // handle both {success:true, products:[...]} and direct array
    const products = resData.products || resData;

    if (!products || products.length === 0) {
      productList.innerHTML = `<p>No products found for "${query}"</p>`;
      return;
    }

    productList.innerHTML = "";
    products.forEach((product) => {
      const firstImage =
        product.images && product.images.length > 0
          ? product.images[0]
          : "placeholder.jpg";
      const productDiv = document.createElement("div");
      productDiv.className = "product";

      productDiv.innerHTML = `
            <a href="productinfo.html?id=${product._id}" style="text-decoration:none;color:inherit">
              <img src="${firstImage}" alt="${product.name}">
              <h2>${product.name}</h2>
              <p>Price: ₹${product.sellingprice}</p>
              <p>${product.shortdescription}</p>
            </a>
          `;

      productList.appendChild(productDiv);
    });
  } catch (err) {
    console.error(err);
    productList.innerHTML = "<p>Error fetching search results.</p>";
  }
}

window.addEventListener("DOMContentLoaded", fetchSearchResults);

document.getElementById("search-bar").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    if (query !== "") {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  }
});
