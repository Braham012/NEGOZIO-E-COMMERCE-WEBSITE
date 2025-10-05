let productId = null;

async function loadProduct() {
  try {
    const response = await fetch("http://localhost:4500/product/getdetails", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    const products = data.products;

    if (!products || products.length === 0) {
      console.warn("No product found for this vendor");
      return;
    }

    const product = products[0];
    productId = product._id;

    document.getElementById("modifyName").value = product.name ?? "";
    document.getElementById("modifyType").value = product.producttype ?? "";
    document.getElementById("modifyShortDescription").value =
      product.shortdescription ?? "";
    document.getElementById("modifyDescription").value =
      product.description ?? "";
    document.getElementById("modifySellingPrice").value =
      product.sellingprice ?? "";
    document.getElementById("modifyDiscount").value = product.discount ?? "";
    document.getElementById("modifyCategory").value = product.category ?? "";
    document.getElementById("modifyPromotion").value = product.promotion
      ? "Yes"
      : "No";
  } catch (error) {
    console.error("Error loading product details:", error);
  }
}

document
  .getElementById("modifyProductForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!productId) {
      console.warn("Cannot update: No product loaded");
      return;
    }

    const payload = {
      name: document.getElementById("modifyName").value,
      producttype: document.getElementById("modifyType").value,
      shortdescription: document.getElementById("modifyShortDescription").value,
      description: document.getElementById("modifyDescription").value,
      sellingprice: document.getElementById("modifySellingPrice").value,
      discount: document.getElementById("modifyDiscount").value,
      category: document.getElementById("modifyCategory").value,
      promotion: document.getElementById("modifyPromotion").value === "Yes",
    };

    try {
      const response = await fetch(
        `http://localhost:4500/product/update/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok) {
        const successMessage = document.getElementById("successMessage");
        successMessage.style.display = "block";
        setTimeout(() => {
          window.location.href = "vendorallproduct.html";
          successMessage.style.display = "none";
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  });

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
      if (data.success) {
        window.location.href = "homepage.html";
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

window.onload = loadProduct;
