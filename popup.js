// console.log('Popup script running');

document.addEventListener('DOMContentLoaded', () => {
    addPopUpListener();
})

function addPopUpListener() {
    console.log('DOM content loaded');
    const apiTokenInput = document.getElementById('api-token');
    const modelSelect = document.getElementById('model-select');
    const autocompleteToggle = document.getElementById('autocomplete-toggle');
    const userPromptInput = document.getElementById('user-prompt');

    // Load stored settings
    chrome.storage.sync.get(['apiToken', 'selectedModel', 'autocompleteEnabled', 'userPrompt'], (result) => {
        if (result.apiToken) {
            apiTokenInput.value = result.apiToken;
        }

        if (result.selectedModel) {
            modelSelect.value = result.selectedModel;
        }

        autocompleteToggle.checked = result.autocompleteEnabled;

        if (result.userPrompt) {
            userPromptInput.value = result.userPrompt;
        } else {
            userPromptInput.value = `You are designed to assist with drafting emails by providing short, concise text predictions based on the user's input. Upon receiving the context or partial content of an email, you will offer a list of 6 possible completions in JSON format (e.g. following the exact format of '{"suggestions": ["How are you?", "Thank you", "Meeting update"]}'), each suggestion ranging from 1 to 5 words, focusing solely on delivering these suggestions without any additional explanations. Please be aware that you are required to provide the necessary punctuations and spaces (e.g. prefix or suffix spaces or puctuations if missing in the user provided origin content). Your provided suggestions should be able to be simply appended to the end of the origin text without needing any extra work to concat them.`;
        }

    });

    // Save API token
    apiTokenInput.addEventListener('input', () => {
        const apiToken = apiTokenInput.value;
        chrome.storage.sync.set({'apiToken': apiToken}, () => {});
    });

    // Save selected model
    modelSelect.addEventListener('change', () => {
        const selectedModel = modelSelect.value;
        chrome.storage.sync.set({'selectedModel': selectedModel}, () => {});
    });

    // Save autocomplete toggle state
    autocompleteToggle.addEventListener('change', () => {
        const autocompleteEnabled = autocompleteToggle.checked;
        chrome.storage.sync.set({'autocompleteEnabled': autocompleteEnabled}, () => {});
    });

    // Save user prompt
    userPromptInput.addEventListener('input', () => {
        const userPrompt = userPromptInput.value;
        chrome.storage.sync.set({'userPrompt': userPrompt}, () => {});
    });

}
