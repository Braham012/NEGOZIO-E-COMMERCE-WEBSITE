let currentProductId = null;

async function fetchProductDetails() {
  const params = new URLSearchParams(window.location.search);
  currentProductId = params.get("id");
  if (!currentProductId) {
    document.getElementById("productDetail").innerHTML =
      "<p>Invalid product ID.</p>";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:4500/product/vendorproductinfo/${currentProductId}`,
      { method: "GET", credentials: "include" }
    );
    if (!response.ok) throw new Error("Failed to fetch product details");

    const product = await response.json();
    displayProductDetails(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    document.getElementById("productDetail").innerHTML =
      "<p>Error loading product details.</p>";
  }
}

function displayProductDetails(product) {
  const container = document.getElementById("productDetail");
  container.innerHTML = `
        <div class="product-card">
          <img src="${
            product.product.images?.[0] || "/frontend/images/placeholder.png"
          }" alt="Product Image" />
          <h2>${product.product.name}</h2>
          <p><span class="highlight">Price:</span> ₹${
            product.product.sellingprice
          }</p>
          <p><span class="highlight">Category:</span> ${
            product.product.category
          }</p>
          <p><span class="highlight">Promotion:</span> ${
            product.product.promotion || "None"
          }</p>
          <p><span class="highlight">Description:</span> ${
            product.product.description || "No description available"
          }</p>
          <div class="action-buttons">
            <button class="modify-btn" onclick="redirectToModify()">Modify</button>
            <button class="delete-btn" onclick="openModal()">Delete</button>
          </div>
        </div>
      `;
}

function redirectToModify() {
  window.location.href = `modifyproduct.html?id=${currentProductId}`;
}

function openModal() {
  document.getElementById("deleteMessage").style.display = "none"; // reset message
  document.getElementById("deleteModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("deleteModal").style.display = "none";
}

async function deleteProduct() {
  const messageDiv = document.getElementById("deleteMessage");
  messageDiv.style.display = "none";

  try {
    const response = await fetch(
      `http://localhost:4500/product/delete/${currentProductId}`,
      { method: "DELETE", credentials: "include" }
    );
    if (!response.ok) throw new Error("Failed to delete product");

    const result = await response.json();

    messageDiv.innerText = result.message || "Product deleted successfully!";
    messageDiv.style.color = "green";
    messageDiv.style.display = "block";

    setTimeout(() => {
      closeModal();
      window.location.href = "vendorallproduct.html";
    }, 1500);
  } catch (error) {
    messageDiv.innerText = "Error deleting product!";
    messageDiv.style.color = "red";
    messageDiv.style.display = "block";
    console.error("Error deleting product:", error);
  }
}

document
  .getElementById("logoutButton")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4500/vendor/logout", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) window.location.href = "homepage.html";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

window.onload = fetchProductDetails;
