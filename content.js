let apiToken;
let selectedModel = 'gpt-3.5-turbo';

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

// Create popup element
const popup = document.createElement('div');
popup.className = 'email-improvement-popup';
popup.innerHTML = `
  <button class="close-btn">×</button>
  <h3>Email Improvement</h3>
  <div class="result"></div>
`;
document.body.appendChild(popup);

// Close button functionality
popup.querySelector('.close-btn').addEventListener('click', () => {
  popup.style.display = 'none';
});

// Function to get selected text
function getSelectedText() {
  const selection = window.getSelection();
  return selection.toString().trim();
}

// Function to improve text using AI
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
    let response;
    let result;

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

    return result;
  } catch (error) {
    console.error('Error:', error);
    if (error.message === 'Unsupported model selected') {
      return 'Error: The selected AI model is not supported. Please choose a different model in the settings.';
    }
    return 'Error processing your request. Please check your API key and try again.';
  }
}

// Function to show improvement result
function showImprovement(result, x, y) {
  const resultDiv = popup.querySelector('.result');
  resultDiv.textContent = result;
  popup.style.display = 'block';
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'improveText') {
    const selectedText = getSelectedText();
    if (selectedText) {
      improveText(selectedText, request.improvementType)
        .then(result => {
          showImprovement(result, request.x, request.y);
        })
        .catch(error => {
          console.error('Error:', error);
          showImprovement('Error processing your request. Please try again.', request.x, request.y);
        });
    }
  }
});

