// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu item
  chrome.contextMenus.create({
    id: "improveEmail",
    title: "Improve Email ✨",
    contexts: ["selection"],
  });

  // Sub-menu items
  const menuItems = [
    { id: "summary", title: "Summarize 📝" },
    { id: "shorten", title: "Make it Shorter ✂️" },
    { id: "friendly", title: "Make it Friendly 😊" },
    { id: "response", title: "Generate Response 💬" },
    { id: "complete", title: "Complete Email 📧" },
    { id: "proofread", title: "Proofread 🔍" },
    { id: "academic", title: "Academic Style 🎓" },
    { id: "business", title: "Business Style 💼" },
  ];

  menuItems.forEach((item) => {
    chrome.contextMenus.create({
      id: item.id,
      parentId: "improveEmail",
      title: item.title,
      contexts: ["selection"],
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "improveText",
      improvementType: info.menuItemId,
      x: info.x,
      y: info.y,
    });
  }
});
