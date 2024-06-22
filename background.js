// console.log('Background script running');

function getUserPreferences() {
    chrome.storage.sync.get(['apiToken', 'selectedModel', 'autocompleteEnabled', 'userPrompt'], (result) => {
            apiToken = result.apiToken;
            selectedModel = result.selectedModel || 'gpt-3.5-turbo';
            autocompleteEnabled = result.autocompleteEnabled;
            userPrompt = result.userPrompt || defaultPrompt;
            console.log(apiToken, selectedModel, autocompleteEnabled, userPrompt);
        }
    );
}

function adjustLayout(node) {
    const toolBar = node.querySelector('table.iN tbody tr:nth-child(2)');
    if (toolBar) {
        toolBar.style.zIndex = '1';
    }
    const editor = node.querySelector('div.qz.aiL');
    if (editor) {
        editor.style.zIndex = '2';
        editor.style.position = 'relative';
    }
}

function setObserver() {
    const targetNode = document.querySelector('body.aAU.YxcKdf');
    const config = {childList: true, subtree: true};
    const callback = function (mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('M9')) {
                        getUserPreferences();
                        adjustLayout(node);
                    }
                });
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

const intervalId = setInterval(() => {
    if (document.querySelector('div.Am')) {
        getUserPreferences();
        adjustLayout(document);
        setObserver();
        clearInterval(intervalId);
    }
}, 1000);
