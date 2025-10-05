async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:4500/product/getdetails", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    displayProducts(data.products);
    document.getElementById("shopname").innerHTML = data.shopname;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = ""; // Clear existing products
  products.forEach((product) => {
    const productBox = document.createElement("div");
    productBox.className = "product-box";
    productBox.innerHTML = `
      <a href="vendorproductinfo.html?id=${product._id}" style="text-decoration: none; color: inherit;">
        <img src="${product.images[0]}" alt="${product.name}" />
        <h2>${product.name}</h2>
        <p>Price: ₹${product.sellingprice}</p>
      </a>
    `;
    productContainer.appendChild(productBox);
  });
}

window.onload = () => {
  fetchProducts();
};

document
  .getElementById("logoutButton")
  .addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    try {
      const response = await fetch("http://localhost:4500/vendor/logout", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        window.location.href = "homepage.html";
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });
