
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    const subtotal = item.price * item.qty;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)" />
      </td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button onclick="removeItem(${idx})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("cart-total").textContent = `Total: $${total.toFixed(2)}`;
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateQty(idx, value) {
  const qty = Math.max(1, parseInt(value, 10));
  cart[idx].qty = qty;
  renderCart();
}

function removeItem(idx) {
  cart.splice(idx, 1);
  renderCart();
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  alert("Proceeding to payment...");
  // Payment logic can go here.
}

renderCart();
