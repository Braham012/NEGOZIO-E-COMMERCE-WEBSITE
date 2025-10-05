async function fetchActiveOrders() {
  try {
    const response = await fetch("http://localhost:4500/order/vendororders", {
      credentials: "include",
    });
    const data = await response.json();

    const container = document.getElementById("ordersContainer");
    container.innerHTML = "";

    if (data.success && data.orders.length > 0) {
      data.orders.forEach((order) => {
        const product = order.productID || {}; // Handles null
        const imageUrl =
          product.images?.[0] || "https://via.placeholder.com/150";
        const productName = product.name || "Unknown Product";
        const productprice = product.sellingprice || "N/A";

        const orderBox = document.createElement("div");
        orderBox.className = "order-box";
        orderBox.innerHTML = `
                <img src="${imageUrl}" alt="${productName}" />
                <h2>${productName}</h2>
                <p>Price: ₹${productprice}</p>
                <p>Quantity: ${order.quantity}</p>
                <p>Status: ${order.status}</p>
                <p>Delivery: ${
                  order.deliverydate
                    ? new Date(order.deliverydate).toLocaleDateString()
                    : "N/A"
                }</p>
              `;

        // Make the entire box clickable if productID exists
        if (order.productID && order.productID._id) {
          orderBox.style.cursor = "pointer";
          orderBox.addEventListener("click", () => {
            window.location.href = `vendorproductinfo.html?id=${order.productID._id}`;
          });
        }

        container.appendChild(orderBox);
      });
    } else {
      container.innerHTML =
        '<p style="text-align:center; padding:20px;">No active orders found.</p>';
    }
  } catch (error) {
    console.error("Error fetching active orders:", error);
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
      if (data.success) {
        window.location.href = "homepage.html";
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  });

fetchActiveOrders();
