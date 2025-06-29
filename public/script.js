const productsContainer = document.getElementById("products");

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").textContent = totalQty;
}

function addToCart(productId) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === productId);
  if (index > -1) {
    cart[index].qty += 1;
  } else {
    const sneaker = allSneakers.find((s) => s.id === productId);
    if (!sneaker) return;
    cart.push({ ...sneaker, qty: 1 });
  }
  setCart(cart);
  updateCartCount();
  renderProduct(productId);
}

function removeFromCart(productId) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === productId);
  if (index > -1) {
    if (cart[index].qty > 1) {
      cart[index].qty -= 1;
    } else {
      cart.splice(index, 1);
    }
    setCart(cart);
    updateCartCount();
    renderProduct(productId);
  }
}

let allSneakers = []; // loaded once and reused

function renderProduct(productId) {
  const sneaker = allSneakers.find((s) => s.id === productId);
  const productDiv = document.getElementById(`product-${productId}`);
  if (!sneaker || !productDiv) return;

  const cart = getCart();
  const inCart = cart.find((item) => item.id === productId);

  productDiv.innerHTML = `
    <img src="${sneaker.image}" alt="${sneaker.name}" />
    <h2>${sneaker.name}</h2>
    <p>$${sneaker.price.toFixed(2)}</p>
    <button onclick="addToCart('${sneaker.id}')">Add to Cart</button>
    ${inCart ? `<button onclick="removeFromCart('${sneaker.id}')">Remove from Cart (${inCart.qty})</button>` : ""}
  `;
}

function renderProducts() {
  productsContainer.innerHTML = "";

  allSneakers.forEach((sneaker) => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.id = `product-${sneaker.id}`;
    productsContainer.appendChild(productDiv);
    renderProduct(sneaker.id);
  });
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  fetch("sneakers.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load sneaker data.");
      return res.json();
    })
    .then((data) => {
      // ✅ Ensure each sneaker has a unique ID (number or string)
      allSneakers = data.map((sneaker, index) => ({
        ...sneaker,
        id: sneaker.id ?? index // fallback to index if no id provided
      }));
      renderProducts();
    })
    .catch((error) => {
      productsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
    });

  const cartIcon = document.getElementById("cart-icon");
  if (cartIcon) {
    cartIcon.onclick = () => {
      window.location.href = "cart.html";
    };
  }
});
