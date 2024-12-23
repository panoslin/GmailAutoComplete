// Create toast container
const toastContainer = document.createElement("div");
toastContainer.className = "toast-container";
document.body.appendChild(toastContainer);

// Function to show toast message
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = "toast toast-error";
  toast.innerHTML = `
    <span class="toast-icon">⚠️</span>
    <span class="toast-message">${message}</span>
  `;
  toastContainer.appendChild(toast);

  // Trigger reflow to enable animation
  toast.offsetHeight;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300); // Wait for the slide-out animation to complete
  }, duration);
}
