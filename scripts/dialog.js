// Create prompt input dialog
const promptDialog = document.createElement("div");
promptDialog.className = "prompt-input-dialog";
promptDialog.innerHTML = `
  <div class="prompt-header">
    <span class="prompt-title">New code instructions... (↑↓ for history)</span>
    <div class="prompt-model">gpt-4o</div>
  </div>
  <input type="text" placeholder="Esc to close" class="prompt-input">
`;
document.body.appendChild(promptDialog);

// Add event listener for the hotkey (Cmd+Z on Mac, Ctrl+Z on Windows/Linux)
document.addEventListener("keydown", async (e) => {
  // Check if text is selected
  const selection = window.getSelection();
  if (!selection.toString()) return;

  // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
  if (e.ctrlKey && e.key.toLowerCase() === "z") {
    e.preventDefault();

    // Store the selected text and range
    originalText = selection.toString();
    storedRange = selection.getRangeAt(0);

    // Position and show the prompt dialog near the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    promptDialog.style.left = `${rect.left}px`;
    promptDialog.style.top = `${rect.bottom + 10}px`;
    promptDialog.style.display = "block";

    // Focus the input
    const promptInput = promptDialog.querySelector(".prompt-input");
    promptInput.value = "";
    promptInput.focus();
  }
});

// Handle prompt input submission
promptDialog
  .querySelector(".prompt-input")
  .addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
      promptDialog.style.display = "none";
      return;
    }

    if (e.key === "Enter") {
      const prompt = e.target.value;
      if (!prompt.trim()) return;

      // Hide the prompt dialog
      promptDialog.style.display = "none";

      // Show loading indicator
      showLoading();

      try {
        // Get response from LLM
        const result = await improveText(originalText, prompt);

        // Position the improvement popup near the original selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Show the improvement in the three-panel view
        showImprovement(result, rect.left, rect.bottom + 10);
      } catch (error) {
        showToast("Error: Failed to get improvement", "error");
        console.error("Error:", error);
      } finally {
        hideLoading();
      }
    }
  });

// Close prompt dialog when clicking outside
document.addEventListener("click", (e) => {
  if (
    !promptDialog.contains(e.target) &&
    promptDialog.style.display === "block"
  ) {
    promptDialog.style.display = "none";
  }
});
