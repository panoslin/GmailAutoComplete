// Create loading overlay
const loadingOverlay = document.createElement("div");
loadingOverlay.className = "loading-overlay";
loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
document.body.appendChild(loadingOverlay);

// Function to show loading indicator
function showLoading() {
  loadingOverlay.style.display = "flex";
}

// Function to hide loading indicator
function hideLoading() {
  loadingOverlay.style.display = "none";
}
