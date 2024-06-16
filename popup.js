document.addEventListener('DOMContentLoaded', () => {
    const apiTokenInput = document.getElementById('api-token');
    const modelSelect = document.getElementById('model-select');
    const autocompleteToggle = document.getElementById('autocomplete-toggle');

    // Load stored settings
    chrome.storage.sync.get(['apiToken', 'selectedModel', 'autocompleteEnabled'], (result) => {
        if (result.apiToken) {
            apiTokenInput.value = result.apiToken;
        }
        if (result.selectedModel) {
            modelSelect.value = result.selectedModel;
        }
        if (result.autocompleteEnabled !== undefined) {
            autocompleteToggle.checked = result.autocompleteEnabled;
        }
    });

    // Save API token
    apiTokenInput.addEventListener('input', () => {
        const apiToken = apiTokenInput.value;
        chrome.storage.sync.set({apiToken});
    });

    // Save selected model
    modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        chrome.storage.sync.set({selectedModel});
    });

    // Save autocomplete toggle state
    autocompleteToggle.addEventListener('change', () => {
        const autocompleteEnabled = autocompleteToggle.checked;
        chrome.storage.sync.set({autocompleteEnabled});
    });
});