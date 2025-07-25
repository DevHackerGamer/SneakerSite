function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countElem = document.getElementById('cart-count');
  if (countElem) countElem.textContent = count;
}

window.addEventListener('storage', (e) => {
  if (e.key === 'cart') {
    updateCartCount();
  }
});

document.addEventListener('DOMContentLoaded', updateCartCount);
