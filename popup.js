// console.log('Popup script running');

document.addEventListener('DOMContentLoaded', function() {
  const modelSelect = document.getElementById('model');
  const apiKeyInput = document.getElementById('apiKey');
  const toggleVisibilityBtn = document.querySelector('.toggle-visibility');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['selectedModel', 'apiToken'], function(result) {
    if (result.selectedModel) {
      modelSelect.value = result.selectedModel;
    }
    if (result.apiToken) {
      apiKeyInput.value = result.apiToken;
    }
  });

  // Toggle API key visibility
  toggleVisibilityBtn.addEventListener('click', function() {
    const type = apiKeyInput.type;
    apiKeyInput.type = type === 'password' ? 'text' : 'password';
    // Using HTML entity references for better compatibility
    toggleVisibilityBtn.innerHTML = type === 'password' ? '&#128065;&#xFE0F;' : '&#128065;';
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const model = modelSelect.value;
    const apiKey = apiKeyInput.value;

    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    chrome.storage.sync.set({
      selectedModel: model,
      apiToken: apiKey
    }, function() {
      showStatus('Settings saved successfully! ✓', 'success');
      
      // Notify content script of the changes
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: {
              selectedModel: model,
              apiToken: apiKey
            }
          });
        }
      });
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
