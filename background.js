console.log('Background script running');

function getUserPreferences() {
    chrome.storage.sync.get(['apiToken', 'selectedModel', 'autocompleteEnabled'], (result) => {
            apiToken = result.apiToken;
            selectedModel = result.selectedModel;
            autocompleteEnabled = result.autocompleteEnabled;
            // console.log(apiToken, selectedModel, autocompleteEnabled);
        }
    );
}

// Periodically check User Preference Updates
const intervalId = setInterval(() => {
    getUserPreferences();
}, 5000);
