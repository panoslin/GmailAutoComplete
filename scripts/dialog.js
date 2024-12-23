// Create prompt input dialog
const promptDialog = document.createElement("div");
promptDialog.className = "prompt-input-dialog";
promptDialog.innerHTML = `
  <div class="prompt-header">
    <span class="prompt-title">New instructions... (↑↓ for history)</span>
    <div class="prompt-model">gpt-4o</div>
  </div>
  <input type="text" placeholder="Esc to close" class="prompt-input">
`;
document.body.appendChild(promptDialog);

// Add prompt history management
const MAX_HISTORY = 50; // Maximum number of history items to keep
let promptHistory = [];
try {
  // Load history from localStorage if available
  promptHistory = JSON.parse(localStorage.getItem("promptHistory")) || [];
} catch (e) {
  console.error("Failed to load prompt history:", e);
  promptHistory = [];
}

let historyIndex = -1; // Current position in history while navigating
let currentInput = ""; // Store current input when starting to navigate history

// Function to add a prompt to history
function addToHistory(prompt) {
  // Don't add empty prompts or duplicates of the last item
  if (!prompt || (promptHistory.length > 0 && promptHistory[0] === prompt)) {
    return;
  }

  // Add to front of array
  promptHistory.unshift(prompt);

  // Keep only the last MAX_HISTORY items
  if (promptHistory.length > MAX_HISTORY) {
    promptHistory = promptHistory.slice(0, MAX_HISTORY);
  }

  // Save to localStorage
  try {
    localStorage.setItem("promptHistory", JSON.stringify(promptHistory));
  } catch (e) {
    console.error("Failed to save prompt history:", e);
  }
}

// Handle prompt input submission and history navigation
const promptInput = promptDialog.querySelector(".prompt-input");
promptInput.addEventListener("keydown", async (e) => {
  if (e.key === "Escape") {
    promptDialog.style.display = "none";
    historyIndex = -1; // Reset history index
    return;
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    e.preventDefault();

    // If starting to navigate history, store current input
    if (historyIndex === -1) {
      currentInput = promptInput.value;
    }

    if (e.key === "ArrowUp") {
      // Move back in history
      if (historyIndex < promptHistory.length - 1) {
        historyIndex++;
        promptInput.value = promptHistory[historyIndex];
      }
    } else {
      // Move forward in history
      if (historyIndex > -1) {
        historyIndex--;
        promptInput.value =
          historyIndex === -1 ? currentInput : promptHistory[historyIndex];
      }
    }

    // Move cursor to end of input
    setTimeout(() => {
      promptInput.selectionStart = promptInput.selectionEnd =
        promptInput.value.length;
    }, 0);
    return;
  }

  if (e.key === "Enter") {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Add to history
    addToHistory(prompt);

    // Reset history index
    historyIndex = -1;
    currentInput = "";

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
      showImprovement(result);
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
    historyIndex = -1; // Reset history index
  }
});

// Reset history navigation when dialog is shown
document.addEventListener("keydown", async (e) => {
  // Check if text is selected
  const selection = window.getSelection();
  if (!selection.toString()) return;

  // Check for Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
  if (e.ctrlKey && e.key.toLowerCase() === "z") {
    e.preventDefault();

    // Reset history navigation
    historyIndex = -1;
    currentInput = "";

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
    promptInput.value = "";
    promptInput.focus();
  }
});
