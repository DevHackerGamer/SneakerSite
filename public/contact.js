document.addEventListener("DOMContentLoaded", () => {
  if (typeof emailjs === "undefined") {
    console.error("EmailJS SDK not loaded.");
    return;
  }

  emailjs.init("7etWoyt21zYLKQXDq"); // Replace with your own EmailJS public key

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  let toastTimeout;

  function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.className = "toast" + (isError ? " error" : "");
    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (form._gotcha.value) return; // Honeypot

    const submitButton = form.querySelector("button");
    submitButton.disabled = true;
    status.textContent = "Sending...";
    status.style.color = "black";

    const email = document.getElementById('email').value;
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("❌ Invalid email address.", true);
      status.textContent = "";
      submitButton.disabled = false;
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    document.getElementById("time").value = formattedTime;

    emailjs.sendForm('service_sjrmrih', 'template_c5yjz5d', this)
      .then(() => {
        showToast("✅ Your message has been sent!");
        status.textContent = "";
        form.reset();
        submitButton.disabled = false;
      }, (error) => {
        showToast("❌ Message failed. Please try again.", true);
        console.error('EmailJS error:', error);
        status.textContent = "";
        submitButton.disabled = false;
      });
  });
});
