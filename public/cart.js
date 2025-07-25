let cart = JSON.parse(localStorage.getItem("cart")) || [];

let confirmCallback = null; // will hold the action to run on confirmation

function renderCart() {
  const tbody = document.querySelector("#cart-table tbody");
  tbody.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx) => {
    if (typeof item.price !== "number" || typeof item.qty !== "number") {
      console.warn("Invalid cart item:", item);
      return;
    }

    const subtotal = item.price * item.qty;
    total += subtotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>R${item.price.toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" onchange="updateQty(${idx}, this.value)" />
      </td>
      <td>R${subtotal.toFixed(2)}</td>
      <td><button onclick="removeItem(${idx})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("cart-total").textContent = `Total: R${total.toFixed(2)}`;
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}

function updateQty(idx, value) {
  const qty = Math.max(1, parseInt(value, 10) || 1);
  cart[idx].qty = qty;
  renderCart();
}

function removeItem(idx) {
  if (cart.length === 0 || !cart[idx]) {
    showToast("Cart is already empty.", true);
    return;
  }

  const itemName = cart[idx]?.name || "Item";

  showConfirmModal(`Remove "${itemName}" from cart?`, () => {
    cart.splice(idx, 1);
    renderCart();
    showToast(`Removed "${itemName}" from cart`, true);
  });
}

function clearCart() {
  if (cart.length === 0) {
    showToast("Cart is already empty.", true);
    return;
  }

  showConfirmModal("Are you sure you want to clear your cart?", () => {
    cart = [];
    localStorage.removeItem("cart");
    renderCart();
    showToast("Cart cleared successfully.", true);
  });
}

function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!", true);
    return;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  window.location.href = "checkout.html";
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countElem = document.getElementById('cart-count');
  if (countElem) countElem.textContent = count;
}

function showToast(message, isWarning = false) {
  const toast = document.createElement("div");
  toast.className = `cart-toast${isWarning ? " warning" : ""}`;
  toast.textContent = message;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ✅ Confirm Modal Handler
function showConfirmModal(message, callback) {
  const modal = document.getElementById("confirm-modal");
  const msgElem = document.getElementById("confirm-message");
  msgElem.textContent = message;
  modal.style.display = "flex";
  confirmCallback = callback;
}

document.getElementById("confirm-yes").onclick = () => {
  if (confirmCallback) confirmCallback();
  closeModal();
};

document.getElementById("confirm-cancel").onclick = closeModal;

function closeModal() {
  document.getElementById("confirm-modal").style.display = "none";
  confirmCallback = null;
}

// Sync across tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
    cart = JSON.parse(e.newValue) || [];
    renderCart();
  }
});

renderCart();
