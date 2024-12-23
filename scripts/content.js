let apiToken;
let selectedModel = "gpt-3.5-turbo";
let selectedTextElement = null;
let originalText = "";
let storedRange = null;

// Load initial settings
chrome.storage.sync.get(["selectedModel", "apiToken"], function (result) {
  if (result.selectedModel) {
    selectedModel = result.selectedModel;
  }
  if (result.apiToken) {
    apiToken = result.apiToken;
  }
});

// Listen for messages from popup and handle settings updates and text improvement
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSettings") {
    selectedModel = request.settings.selectedModel;
    apiToken = request.settings.apiToken;
    console.log("Settings updated:", { selectedModel, apiToken: "***" });
  } else if (request.action === "improveText") {
    const selectedText = getSelectedText();
    if (selectedText) {
      improveText(selectedText, request.improvementType)
        .then((result) => {
          if (!result.startsWith("Error:")) {
            showImprovement(result, request.x, request.y);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          showToast(error.message || "Failed to process your request");
        });
    } else {
      showToast("Please select some text to improve");
    }
  }
});

// Function to get selected text and element
function getSelectedText() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    storedRange = range.cloneRange();
    selectedTextElement = range.commonAncestorContainer;
    while (selectedTextElement.nodeType !== Node.ELEMENT_NODE) {
      selectedTextElement = selectedTextElement.parentNode;
    }
    originalText = selection.toString().trim();
    return originalText;
  }
  return "";
}

// Function to replace selected text
function replaceSelectedText(newText) {
  if (!storedRange) return;

  let editorElement = storedRange.commonAncestorContainer;
  while (editorElement && editorElement.nodeType !== Node.ELEMENT_NODE) {
    editorElement = editorElement.parentElement;
  }

  if (editorElement) {
    editorElement.focus();
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(storedRange);

  // Split text by newlines and create elements
  const lines = newText.split("\n");
  const fragment = document.createDocumentFragment();
  let firstNode = null;
  let lastNode = null;

  lines.forEach((line, index) => {
    // Create text node for the line (even if empty)
    const textNode = document.createTextNode(line);
    fragment.appendChild(textNode);

    // Keep track of first and last nodes
    if (!firstNode) firstNode = textNode;
    lastNode = textNode;

    // Add <br> after each line except the last one
    if (index < lines.length - 1) {
      const br = document.createElement("br");
      fragment.appendChild(br);
      lastNode = br;
    }
  });

  // If the fragment is empty (no text and no line breaks), add a space
  if (!firstNode) {
    const spaceNode = document.createTextNode("\u200B"); // Zero-width space
    fragment.appendChild(spaceNode);
    firstNode = lastNode = spaceNode;
  }

  // Replace content
  storedRange.deleteContents();
  storedRange.insertNode(fragment);

  // Create a new range that encompasses all the inserted content
  const newRange = document.createRange();
  newRange.setStartBefore(firstNode);
  newRange.setEndAfter(lastNode);

  // Update selection
  selection.removeAllRanges();
  selection.addRange(newRange);

  if (editorElement) {
    // Trigger input event
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      inputType: "insertText",
      data: newText,
    });
    editorElement.dispatchEvent(inputEvent);

    // Force Gmail to update its internal state
    const changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });
    editorElement.dispatchEvent(changeEvent);
  }
}
