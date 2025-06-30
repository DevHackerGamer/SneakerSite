let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    // Defensive check: make sure price and qty are valid
    if (typeof item.price !== "number" || typeof item.qty !== "number") {
      console.warn("Invalid cart item:", item);
      return;
    }

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

  updateCartCount(); // ✅ Update badge after rendering
}

function updateQty(idx, value) {
  const qty = Math.max(1, parseInt(value, 10) || 1); // ✅ Fallback if input is invalid
  cart[idx].qty = qty;
  renderCart();
}

function removeItem(idx) {
  const itemName = cart[idx]?.name || "Item";
  if (confirm(`Remove "${itemName}" from cart?`)) {
    cart.splice(idx, 1);
    renderCart();
  }
}


function clearCart() {
  if (!confirm("Are you sure you want to clear your cart?")) return;
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  // Save cart to localStorage again (optional safeguard)
  localStorage.setItem("cart", JSON.stringify(cart));
  // Redirect to checkout page
  window.location.href = "checkout.html";
}


// ✅ Optional: update cart count badge in header
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countElem = document.getElementById('cart-count');
  if (countElem) countElem.textContent = count;
}

// ✅ Optional: live sync across browser tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
    cart = JSON.parse(e.newValue) || [];
    renderCart();
  }
});

renderCart();
