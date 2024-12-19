let apiToken;
let selectedModel = 'gpt-3.5-turbo';
let selectedTextElement = null;
let originalText = '';
let storedRange = null;

// Load initial settings
chrome.storage.sync.get(['selectedModel', 'apiToken'], function(result) {
  if (result.selectedModel) {
    selectedModel = result.selectedModel;
  }
  if (result.apiToken) {
    apiToken = result.apiToken;
  }
});

// Listen for settings updates from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    selectedModel = request.settings.selectedModel;
    apiToken = request.settings.apiToken;
    console.log('Settings updated:', { selectedModel, apiToken: '***' });
  }
});

// Create popup element with diff view
const popup = document.createElement('div');
popup.className = 'email-improvement-popup';
popup.innerHTML = `
  <h3>
    <button class="close-btn">×</button>
  </h3>
  <div class="diff-container">
    <div>
      <div class="diff-title">Original Text</div>
      <div class="diff-original"></div>
    </div>
    <div>
      <div class="diff-title">Improved Version</div>
      <div class="diff-improved"></div>
    </div>
  </div>
  <div class="diff-actions">
    <button class="diff-copy-btn">
      <span>📋</span> Copy
    </button>
    <div class="diff-right-actions">
      <button class="diff-cancel-btn">
        <span>✕</span> Cancel
      </button>
      <button class="diff-accept-btn">
        <span>✓</span> Accept Changes
      </button>
    </div>
  </div>
`;
document.body.appendChild(popup);

// Close button functionality
popup.querySelector('.close-btn').addEventListener('click', () => {
  popup.style.display = 'none';
  storedRange = null;
});

// Cancel button functionality
popup.querySelector('.diff-cancel-btn').addEventListener('click', () => {
  popup.style.display = 'none';
  storedRange = null;
});

// Accept button functionality
popup.querySelector('.diff-accept-btn').addEventListener('click', () => {
  if (storedRange && originalText) {
    const improvedText = popup.querySelector('.diff-improved').textContent;
    replaceSelectedText(improvedText);
    popup.style.display = 'none';
    storedRange = null;
  }
});

// Copy button functionality
popup.querySelector('.diff-copy-btn').addEventListener('click', () => {
  const improvedText = popup.querySelector('.diff-improved').textContent;
  navigator.clipboard.writeText(improvedText).then(() => {
    const copyBtn = popup.querySelector('.diff-copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span>✓</span> Copied!';
    copyBtn.style.backgroundColor = '#16a34a';
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.backgroundColor = '';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text:', err);
  });
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
  return '';
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
  const lines = newText.split('\n');
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
      const br = document.createElement('br');
      fragment.appendChild(br);
      lastNode = br;
    }
  });

  // If the fragment is empty (no text and no line breaks), add a space
  if (!firstNode) {
    const spaceNode = document.createTextNode('\u200B'); // Zero-width space
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
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: newText
    });
    editorElement.dispatchEvent(inputEvent);

    // Force Gmail to update its internal state
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true
    });
    editorElement.dispatchEvent(changeEvent);
  }
}

// Function to compute diff between two texts
function computeDiff(oldText, newText) {
  const diff = Diff.diffWords(oldText, newText);
  let originalHtml = '';
  let improvedHtml = '';
  
  diff.forEach(part => {
    const value = part.value;
    if (part.added) {
      improvedHtml += `<span class="diff-highlight-added">${value}</span>`;
    } else if (part.removed) {
      originalHtml += `<span class="diff-highlight-removed">${value}</span>`;
    } else {
      originalHtml += value;
      improvedHtml += value;
    }
  });
  
  return { originalHtml, improvedHtml };
}

// Function to show improvement result with diff
function showImprovement(result, x, y) {
  const diffResult = computeDiff(originalText, result);
  
  const originalDiv = popup.querySelector('.diff-original');
  const improvedDiv = popup.querySelector('.diff-improved');
  
  originalDiv.innerHTML = diffResult.originalHtml;
  improvedDiv.innerHTML = diffResult.improvedHtml;
  improvedDiv.textContent = result; // Store the plain text for accepting changes
  
  popup.style.display = 'block';
  
  // Position the popup
  const viewportHeight = window.innerHeight;
  const popupHeight = popup.offsetHeight;
  const maxY = viewportHeight - popupHeight - 20;
  
  popup.style.left = `${Math.min(x, window.innerWidth - popup.offsetWidth - 20)}px`;
  popup.style.top = `${Math.min(y, maxY)}px`;
}

// Create loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
document.body.appendChild(loadingOverlay);

// Create toast container
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

// Function to show loading indicator
function showLoading() {
  loadingOverlay.style.display = 'flex';
}

// Function to hide loading indicator
function hideLoading() {
  loadingOverlay.style.display = 'none';
}

// Function to show toast message
function showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML = `
    <span class="toast-icon">⚠️</span>
    <span class="toast-message">${message}</span>
  `;
  toastContainer.appendChild(toast);

  // Trigger reflow to enable animation
  toast.offsetHeight;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300); // Wait for the slide-out animation to complete
  }, duration);
}

// Update improveText function to use loading and toast
async function improveText(text, improvementType) {
  const prompts = {
    summary: "Summarize this email text concisely:",
    shorten: "Make this text shorter while maintaining the key message:",
    friendly: "Make this text more friendly and approachable:",
    response: "Draft a professional response to this email:",
    complete: "Complete this email in a professional manner:",
    proofread: "Proofread and improve this text:",
    academic: "Rewrite this in a formal academic style:",
    business: "Rewrite this in a professional business style:"
  };

  const prompt = prompts[improvementType] || "Improve this text:";
  
  try {
    showLoading();
    let response;
    let result;

    if (!apiToken) {
      throw new Error('API key is not set. Please set your API key in the extension settings.');
    }

    switch(selectedModel) {
      case 'gpt-3.5-turbo':
      case 'gpt-4o':
        // OpenAI API
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content: "You are a professional email writing assistant."
              },
              {
                role: "user",
                content: `${prompt}\n\n${text}`
              }
            ],
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'OpenAI API request failed');
        }
        
        const openAIData = await response.json();
        result = openAIData.choices[0].message.content;
        break;

      case 'claude-2':
        // Anthropic Claude API
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-2',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: `${prompt}\n\n${text}`
            }]
          })
        });
        const claudeData = await response.json();
        result = claudeData.content[0].text;
        break;

      case 'llama-2':
        // Example for a local LLaMA 2 API endpoint
        response = await fetch('http://localhost:8000/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            model: 'llama-2-70b-chat',
            messages: [
              {
                role: "system",
                content: "You are a professional email writing assistant."
              },
              {
                role: "user",
                content: `${prompt}\n\n${text}`
              }
            ],
            temperature: 0.7
          })
        });
        const llamaData = await response.json();
        result = llamaData.choices[0].message.content;
        break;

      case 'grok-1':
        // Example for Grok API (when available)
        response = await fetch('https://api.grok.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`
          },
          body: JSON.stringify({
            model: 'grok-1',
            messages: [
              {
                role: "system",
                content: "You are a professional email writing assistant."
              },
              {
                role: "user",
                content: `${prompt}\n\n${text}`
              }
            ]
          })
        });
        const grokData = await response.json();
        result = grokData.choices[0].message.content;
        break;

      default:
        throw new Error('Unsupported model selected');
    }

    hideLoading();
    return result;
  } catch (error) {
    hideLoading();
    console.error('Error:', error);
    const errorMessage = error.message || 'An unexpected error occurred';
    showToast(errorMessage);
    return `Error: ${errorMessage}`;
  }
}

// Update the message listener to handle errors better
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'improveText') {
    const selectedText = getSelectedText();
    if (selectedText) {
      improveText(selectedText, request.improvementType)
        .then(result => {
          if (!result.startsWith('Error:')) {
            showImprovement(result, request.x, request.y);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          showToast(error.message || 'Failed to process your request');
        });
    } else {
      showToast('Please select some text to improve');
    }
  }
});

