// Create popup element with three-panel diff view
const popup = document.createElement("div");
popup.className = "email-improvement-popup";
popup.innerHTML = `
  <div class="popup-header">
    <div class="diff-mode-selector">
      <label><input type="radio" name="diffMode" value="words" checked> Words</label>
      <label><input type="radio" name="diffMode" value="chars"> Chars</label>
      <label><input type="radio" name="diffMode" value="lines"> Lines</label>
      <label class="sync-scroll-label"><input type="checkbox" name="syncScroll" checked> Sync Scroll</label>
    </div>
    <button class="close-btn">×</button>
  </div>
  <div class="three-panel-diff">
    <div class="diff-panel">
      <div class="diff-title">Original</div>
      <div class="diff-content diff-original"></div>
    </div>
    <div class="diff-panel">
      <div class="diff-title">Modified</div>
      <div class="diff-content diff-modified"></div>
    </div>
    <div class="diff-panel">
      <div class="diff-title">Changes</div>
      <div class="diff-content diff-changes"></div>
    </div>
  </div>
  <div class="diff-actions">
    <div class="diff-right-actions">
      <button class="diff-copy-btn">
        <span>📋</span> Copy
      </button>
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

// Add synchronized scrolling functionality
const diffPanels = popup.querySelectorAll(".diff-content");

function syncScroll(event) {
  if (!popup.querySelector('input[name="syncScroll"]').checked) return;

  const scrolledPanel = event.target;
  const scrollRatio =
    scrolledPanel.scrollTop /
    (scrolledPanel.scrollHeight - scrolledPanel.clientHeight);

  diffPanels.forEach((panel) => {
    if (panel !== scrolledPanel) {
      const scrollHeight = panel.scrollHeight - panel.clientHeight;
      panel.scrollTop = scrollHeight * scrollRatio;
    }
  });
}

diffPanels[2].addEventListener("scroll", syncScroll);

// Close button functionality
popup.querySelector(".close-btn").addEventListener("click", () => {
  popup.style.display = "none";
  storedRange = null;
});

// Cancel button functionality
popup.querySelector(".diff-cancel-btn").addEventListener("click", () => {
  popup.style.display = "none";
  storedRange = null;
});

// Accept button functionality
popup.querySelector(".diff-accept-btn").addEventListener("click", () => {
  if (storedRange && originalText) {
    const improvedText = popup.dataset.improvedText;
    replaceSelectedText(improvedText);
    popup.style.display = "none";
    storedRange = null;
  }
});

// Copy button functionality
popup.querySelector(".diff-copy-btn").addEventListener("click", () => {
  const improvedText = popup.querySelector(".diff-modified").innerText;
  navigator.clipboard
    .writeText(improvedText)
    .then(() => {
      const copyBtn = popup.querySelector(".diff-copy-btn");
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "<span>✓</span> Copied!";
      copyBtn.style.backgroundColor = "#16a34a";
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.backgroundColor = "";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text:", err);
    });
});

// Function to show improvement result with diff
function showImprovement(result, x, y) {
  const diffResult = computeDiff(originalText, result);

  const originalDiv = popup.querySelector(".diff-original");
  const modifiedDiv = popup.querySelector(".diff-modified");
  const changesDiv = popup.querySelector(".diff-changes");

  originalDiv.innerText = originalText;
  modifiedDiv.innerText = result;
  changesDiv.innerHTML = diffResult.changesHtml;

  // Store the plain text for accepting changes
  popup.dataset.improvedText = result;

  popup.style.display = "block";

  // Position the popup
  const viewportHeight = window.innerHeight;
  const popupHeight = popup.offsetHeight;
  const maxY = viewportHeight - popupHeight - 20;

  popup.style.left = `${Math.min(
    x,
    window.innerWidth - popup.offsetWidth - 20
  )}px`;
  popup.style.top = `${Math.min(y, maxY)}px`;
}

// Add diff mode change handler
popup.querySelectorAll('input[name="diffMode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const mode = e.target.value;
    const improvedText = popup.dataset.improvedText;
    let diff;

    switch (mode) {
      case "chars":
        diff = computeDiff(originalText, improvedText, Diff.diffChars);
        break;
      case "lines":
        diff = computeDiff(originalText, improvedText, Diff.diffLines);
        break;
      default: // words
        diff = computeDiff(originalText, improvedText, Diff.diffWords);
    }

    const originalDiv = popup.querySelector(".diff-original");
    const modifiedDiv = popup.querySelector(".diff-modified");
    const changesDiv = popup.querySelector(".diff-changes");

    originalDiv.innerText = originalText;
    modifiedDiv.innerText = improvedText;
    changesDiv.innerHTML = diff.changesHtml;
  });
});
