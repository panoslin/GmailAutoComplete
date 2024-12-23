
// Function to compute diff between two texts
function computeDiff(oldText, newText) {
    // Use diffWords from the library
    const diff = Diff.diffWords(oldText, newText, { ignoreWhitespace: false });
    let changesHtml = "";
  
    diff.forEach((part) => {
      const value = part.value;
      const escapedValue = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
      // Changes view shows color-coded differences
      if (part.added) {
        changesHtml += `<span class="diff-highlight-added">${escapedValue}</span>`;
      } else if (part.removed) {
        changesHtml += `<span class="diff-highlight-removed">${escapedValue}</span>`;
      } else {
        changesHtml += escapedValue;
      }
    });
  
    return {
      changesHtml,
      hasChanges: diff.some((part) => part.added || part.removed),
    };
  }