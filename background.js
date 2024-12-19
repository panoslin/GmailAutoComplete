// Background service worker
console.log('Background service worker initialized');

let apiToken;
let selectedModel = 'gpt-3.5-turbo';

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  
  // Parent menu item
  chrome.contextMenus.create({
    id: 'improveEmail',
    title: 'Improve Email ✨',
    contexts: ['selection']
  });

  // Sub-menu items
  const menuItems = [
    { id: 'summary', title: 'Summarize 📝' },
    { id: 'shorten', title: 'Make it Shorter ✂️' },
    { id: 'friendly', title: 'Make it Friendly 😊' },
    { id: 'response', title: 'Generate Response 💬' },
    { id: 'complete', title: 'Complete Email 📧' },
    { id: 'proofread', title: 'Proofread 🔍' },
    { id: 'academic', title: 'Academic Style 🎓' },
    { id: 'business', title: 'Business Style 💼' }
  ];

  menuItems.forEach(item => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: 'improveEmail',
      title: item.title,
      contexts: ['selection']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'improveText',
      improvementType: info.menuItemId,
      x: info.x,
      y: info.y
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    apiToken = request.settings.apiToken;
    selectedModel = request.settings.selectedModel;
  }
});
