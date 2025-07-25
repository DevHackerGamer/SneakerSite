const order = JSON.parse(localStorage.getItem("lastOrder"));
if (!order) {
  window.location.href = "index.html";
}

// Fill buyer info
document.getElementById("conf-name").textContent = order.fullName;
document.getElementById("conf-email").textContent = order.email;
document.getElementById("conf-phone").textContent = order.phone;
document.getElementById("conf-address").textContent = `${order.street}, ${order.city}, ${order.zip}`;

// Populate order table
const tbody = document.querySelector("#order-table tbody");
let total = 0;
order.cart.forEach(item => {
  const subtotal = item.price * item.qty;
  total += subtotal;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.qty}</td>
    <td>R${item.price.toFixed(2)}</td>
    <td>R${subtotal.toFixed(2)}</td>
  `;
  tbody.appendChild(row);
});

document.getElementById("conf-total").textContent = `R${total.toFixed(2)}`;

// Send email with loader
document.getElementById("sendEmailBtn").addEventListener("click", async () => {
  const loader = document.getElementById("loader");
  loader.style.display = "flex"; // Show loader

  try {
    const response = await fetch("/send-confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if (result.success) {
    // Clear the cart from localStorage
    localStorage.removeItem("cart");

    // Optionally also clear lastOrder if you want
    localStorage.removeItem("lastOrder");

    localStorage.setItem("recentCustomerName", order.fullName);
    setTimeout(() => {
        loader.style.display = "none";
        window.location.href = "thankyou.html";
    }, 3000);}
    else {
      loader.style.display = "none";
      // Optionally show a message on screen instead of alert
    }
  } catch (error) {
    loader.style.display = "none";
    // Optionally show a message on screen instead of alert
  }
});
