document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.getElementById("welcome-text");
  const logoutButton = document.getElementById("logout-button");
  const welcomeMessageDiv = document.getElementById("welcome-message");
  const ordersContainer = document.getElementById("orders-container");
  let logoutTimeout;

  fetch("http://localhost:4500/user/verify", {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        welcomeText.textContent = `Welcome, ${data.user.name}`;
        welcomeMessageDiv.style.display = "block";
        logoutButton.style.display = "none";
        fetchOrders();
      } else {
        welcomeText.textContent = "Welcome, Guest";
        window.location.href = "homepage.html";
      }
    });

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
    logoutButton.style.display = "block";
    clearTimeout(logoutTimeout);
  });
  logoutButton.addEventListener("mouseleave", () => {
    logoutTimeout = setTimeout(() => {
      logoutButton.style.display = "none";
    }, 2000);
  });

  function fetchOrders() {
    fetch("http://localhost:4500/order/getorders", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        ordersContainer.innerHTML = "";

        if (!data.success || !data.orders || data.orders.length === 0) {
          ordersContainer.textContent = "No Orders Yet";
          return;
        }

        data.orders.forEach((order) => {
          const orderDiv = document.createElement("div");
          orderDiv.classList.add("order-card");

          const productImage =
            order.productID?.images && order.productID.images.length > 0
              ? order.productID.images[0]
              : "placeholder.jpg";

          const deliveryDate = new Date(order.deliverydate);
          const formattedDeliveryDate = deliveryDate.toLocaleDateString(
            undefined,
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          let deliveryMessage = "";
          if (order.status.toLowerCase() === "delivered") {
            deliveryMessage = `<p><strong>Delivered on:</strong> ${formattedDeliveryDate}</p>`;
          } else {
            deliveryMessage = `<p><strong>Delivering on:</strong> ${formattedDeliveryDate}</p>`;
          }

          orderDiv.innerHTML = `
                  <a href="productinfo.html?id=${order.productID?._id || ""}">
                    <img src="${productImage}" alt="Product Image" style="  border-radius: 8px; margin-bottom: 10px; cursor: pointer;" />
                  </a>
                  <p><strong>Order Date:</strong> ${new Date(
                    order.orderdate
                  ).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                  <p><strong>Status:</strong> ${order.status}</p>
                  ${deliveryMessage}
                  <p><strong>Quantity:</strong> ${order.quantity}</p>
                  <p><strong>Total Cost:</strong> ₹${order.totalamount}</p>
                  <p><strong>Seller Contact:</strong> ${order.vendoremail}</p>
                `;

          if (
            order.status.toLowerCase() !== "delivered" &&
            order.status.toLowerCase() !== "cancelled"
          ) {
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel Order";
            cancelButton.style.cssText =
              "float: right; background-color: red; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer;";

            cancelButton.addEventListener("click", () => {
              showCancelPopup(order._id);
            });

            orderDiv.appendChild(cancelButton);
          }

          ordersContainer.appendChild(orderDiv);
        });
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        ordersContainer.textContent = "Failed to load orders.";
      });
  }

  function showCancelPopup(orderId) {
    const popup = document.createElement("div");
    popup.style.cssText =
      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;";

    popup.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; width: 300px;">
              <h3>Confirm Cancellation</h3>
              <p>Are you sure you want to cancel this order?</p>
              <button id="confirm-cancel" style="background-color: red; color: white; padding: 8px 12px; margin-right: 10px; border: none; border-radius: 5px; cursor: pointer;">Yes</button>
              <button id="cancel-popup" style="background-color: gray; color: white; padding: 8px 12px; border: none; border-radius: 5px; cursor: pointer;">No</button>
              <p id="cancel-message" style="margin-top: 10px; color: green; display: none;"></p>
            </div>
          `;

    document.body.appendChild(popup);

    document.getElementById("cancel-popup").addEventListener("click", () => {
      document.body.removeChild(popup);
    });

    document.getElementById("confirm-cancel").addEventListener("click", () => {
      fetch(`http://localhost:4500/order/cancelorder/${orderId}`, {
        method: "PUT",
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          const message = document.getElementById("cancel-message");
          if (data.success) {
            message.textContent = "Order cancelled successfully!";
            message.style.color = "green";
            message.style.display = "block";
            setTimeout(() => {
              document.body.removeChild(popup);
              fetchOrders();
            }, 2000);
          } else {
            message.textContent = "Failed to cancel order!";
            message.style.color = "red";
            message.style.display = "block";
          }
        })
        .catch(() => {
          const message = document.getElementById("cancel-message");
          message.textContent = "Error cancelling order!";
          message.style.color = "red";
          message.style.display = "block";
        });
    });
  }
});
