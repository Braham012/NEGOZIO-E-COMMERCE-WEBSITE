function showMessage(message) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message;
  messageBox.style.display = "block";
}

document.getElementById("images").addEventListener("change", function (e) {
  const container = document.getElementById("image-preview-container");
  container.innerHTML = "";

  if (this.files.length > 6) {
    alert("Maximum 6 images allowed");
    this.value = "";
    return;
  }

  Array.from(this.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const div = document.createElement("div");
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.overflow = "hidden";
      div.style.borderRadius = "5px";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";

      div.appendChild(img);
      container.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
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
