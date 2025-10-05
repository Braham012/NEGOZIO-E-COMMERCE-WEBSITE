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
        logoutButton.style.display = "none";
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

const popup = document.getElementById("order-confirm-popup");
const popupMessage = document.getElementById("order-confirm-message");
let currentCartIds = [];

function showOrderPopup(cartIds) {
  currentCartIds = Array.isArray(cartIds) ? cartIds : [cartIds];
  popup.style.display = "block";
  popupMessage.textContent = "Are you sure you want to place this order?";
  popupMessage.style.color = "black";
}

document.getElementById("order-no").addEventListener("click", () => {
  popup.style.display = "none";
});

document.getElementById("order-yes").addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:4500/order/orderbycart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cartIds: currentCartIds }),
    });
    const data = await response.json();
    if (data.success) {
      popupMessage.textContent = "Order placed successfully!";
      popupMessage.style.color = "#2ecc71";
      setTimeout(() => {
        popup.style.display = "none";
        fetchCartItems();
      }, 2000);
    } else {
      popupMessage.textContent = data.message || "Failed to place order";
      popupMessage.style.color = "#e74c3c";
      setTimeout(() => {
        popup.style.display = "none";
      }, 2000);
    }
  } catch {
    popupMessage.textContent = "Error placing order.";
    popupMessage.style.color = "#e74c3c";
    setTimeout(() => {
      popup.style.display = "none";
    }, 2000);
  }
});

async function fetchCartItems() {
  try {
    const response = await fetch("http://localhost:4500/cart/getcart", {
      method: "GET",
      credentials: "include",
    });
    const cartData = await response.json();
    const cartItemsContainer = document.getElementById("cart-items-list");
    const emptyCartMessage = document.getElementById("empty-cart-message");
    let totalAmount = 0;

    if (cartData.success) {
      cartItemsContainer.innerHTML = "";
      if (cartData.cartitems.length === 0) {
        emptyCartMessage.style.display = "block";
        document.getElementById("order-button").style.display = "none";
        document.getElementById("total-amount").textContent = "₹000";
      } else {
        emptyCartMessage.style.display = "none";
        cartData.cartitems.forEach((item) => {
          const itemElement = document.createElement("div");
          itemElement.classList.add("cart-item");

          const cartId = item._id;
          const quantity = item.quantity;

          itemElement.innerHTML = `
                  <a href="productinfo.html?id=${item.product._id}">
                    <img src="${item.product.images[0]}" alt="${
            item.product.name
          }" />
                  </a>
                  <div style="flex-grow: 1;">
                    <h3>${item.product.name}</h3>
                    <p>Price: ₹${item.product.sellingprice}</p>
                    <label for="quantity-${cartId}">Quantity:</label>
                    <select id="quantity-${cartId}">
                      ${[...Array(10).keys()]
                        .map(
                          (i) =>
                            `<option value="${i + 1}" ${
                              i + 1 === quantity ? "selected" : ""
                            }>${i + 1}</option>`
                        )
                        .join("")}
                    </select>
                    <p class="total-line">Total: ₹${(
                      item.product.sellingprice * quantity
                    ).toFixed(2)}</p>
                    <p class="seller-contact">Seller Contact: ${
                      item.product.Vendoremail
                    }</p>
                    <div>
                      <button class="remove-btn" data-id="${cartId}">Remove</button>
                      <button class="order-btn" data-id="${cartId}">Order Now</button>
                    </div>
                  </div>
                `;

          cartItemsContainer.appendChild(itemElement);
          totalAmount += item.product.sellingprice * quantity;

          const removeButton = itemElement.querySelector(".remove-btn");
          removeButton.addEventListener("click", async (event) => {
            const id = event.target.getAttribute("data-id");
            await fetch(`http://localhost:4500/cart/remove/${id}`, {
              method: "DELETE",
              credentials: "include",
            });
            fetchCartItems();
          });

          const quantitySelect = itemElement.querySelector(
            `#quantity-${cartId}`
          );
          quantitySelect.addEventListener("change", async (event) => {
            const newQuantity = parseInt(event.target.value, 10);
            await fetch(`http://localhost:4500/cart/changequantity/${cartId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ quantity: newQuantity }),
            });
            fetchCartItems();
          });

          const orderButton = itemElement.querySelector(".order-btn");
          orderButton.addEventListener("click", () => {
            showOrderPopup(cartId);
          });
        });

        document.getElementById(
          "total-amount"
        ).textContent = `₹${totalAmount.toFixed(2)}`;
        const mainOrderButton = document.getElementById("order-button");
        mainOrderButton.style.display = "block";
        mainOrderButton.addEventListener("click", () => {
          const allCartIds = cartData.cartitems.map((item) => item._id);
          showOrderPopup(allCartIds);
        });
      }
    }
  } catch (error) {
    console.error("Error fetching cart items:", error);
  }
}

fetchCartItems();
