const cart = JSON.parse(localStorage.getItem("cart")) || [];

// Calculate and display cart total
function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
}

document.getElementById("checkout-total").textContent = `$${calculateTotal(cart)}`;

// Handle form submission and send to PayFast
document.getElementById("checkout-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const fullName = formData.get("fullName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const street = formData.get("street");
  const city = formData.get("city");
  const zip = formData.get("zip");

  const total = calculateTotal(cart);

  // Save order data for confirmation page
  const orderDetails = {
    fullName, email, phone, street, city, zip, cart
  };
  localStorage.setItem("lastOrder", JSON.stringify(orderDetails));

  // Create form for PayFast submission
  const pfForm = document.createElement("form");
  pfForm.method = "POST";
  pfForm.action = "https://sandbox.payfast.co.za/eng/process";

  const pfData = {
    merchant_id: "10040075",
    merchant_key: "ab1vifaxv0b3w",
    return_url: `${window.location.origin}/confirmation.html`,
    cancel_url: `${window.location.origin}/checkout.html`,
    amount: total,
    item_name: "Big Dawg Sneakers Order",
    name_first: fullName.split(" ")[0] || "",
    name_last: fullName.split(" ")[1] || "",
    email_address: email
  };

  for (const key in pfData) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = pfData[key];
    pfForm.appendChild(input);
  }

  document.body.appendChild(pfForm);
  pfForm.submit();
});

// Use browser location and reverse geocode to autofill address
async function fillLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      const address = data.address || {};

      document.getElementById("street").value = address.road || "";
      document.getElementById("city").value = address.city || address.town || address.village || "";
      document.getElementById("zip").value = address.postcode || "";

    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      alert("Could not get your address. Please fill it in manually.");
    }
  }, (err) => {
    alert("Location access denied or failed.");
    console.error(err);
  });
}
