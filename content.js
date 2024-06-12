let currentSuggestionIndex = -1;
let suggestionBox;

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

function removeSuggestBox() {
    suggestionBox = document.querySelector('div.autocomplete-suggestions')
    // Remove any existing suggestions
    if (suggestionBox) {
        suggestionBox.remove();
    }
}

function initialize() {
    const composeArea = document.querySelector('div.Am');
    if (composeArea) {
        console.log('Content script running');
        const debouncedHandleInput = debounce(handleInput, 500);
        // removeSuggestBox once the caret move
        composeArea.addEventListener('selectionchange', removeSuggestBox);
        composeArea.addEventListener('input', removeSuggestBox);
        composeArea.addEventListener('input', debouncedHandleInput);
    }
}

function handleInput(event) {
    const text = event.target.innerText.trim();
    // return if empty string
    if (!text) {
        removeSuggestBox();
        return;
    }
    console.log('Input event received:', text);
    getSuggestions(text).then(suggestions => {
        showSuggestions(suggestions, event.target);
    });
}


function getSuggestions(text) {
    return new Promise((resolve) => {
        let timeOut = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
        // Simulate a delay for the web request
        setTimeout(() => {
            // Mock suggestions based on the input text
            const suggestions = [
                `suggestion ${Math.floor(Math.random() * 1000 % 100)}`,
                `suggestion ${Math.floor(Math.random() * 1000 % 100)}`,
                `suggestion ${Math.floor(Math.random() * 1000 % 100)}`,
                `suggestion ${Math.floor(Math.random() * 1000 % 100)}`,
                `suggestion ${Math.floor(Math.random() * 1000 % 100)}`
            ];
            resolve(suggestions);
        }, timeOut); // Simulate a 1-5 second delay
    });
}


function getCaretCoordinates(element) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return {top: rect.top + window.scrollY, left: rect.left + window.scrollX};
}

function showSuggestions(suggestions, editor) {
    console.log('Suggestions:', suggestions);

    // Create suggestion box
    suggestionBox = document.createElement('div');
    suggestionBox.className = 'autocomplete-suggestions';
    suggestionBox.tabIndex = 0; // Make the suggestionBox focusable

    // Calculate position based on editor's cursor position
    // TODO: optimize suggestionBox style and position
    const cursorPosition = getCaretCoordinates(editor);
    suggestionBox.style.top = `${cursorPosition.top}px`;
    suggestionBox.style.left = `${cursorPosition.left + 10}px`;

    // Populate suggestions
    suggestions.forEach((suggestion, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'autocomplete-suggestion';
        suggestionItem.innerText = suggestion;
        suggestionItem.addEventListener('click', () => applySuggestion(suggestion, editor));
        suggestionBox.appendChild(suggestionItem);
    });

    document.body.appendChild(suggestionBox);

    // Save the current selection range in the editor
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    // Set focus to the suggestionBox
    suggestionBox.focus();

    function keyDownWrapper(event) {
        handleKeyDown(event, selection, range);
    }

    // Add keyboard event listeners
    document.addEventListener('keydown', keyDownWrapper);
    // add mouse click event listener
    document.addEventListener('click', keyDownWrapper);
}

function restoreCaret(selection, range) {
    // Restore the caret position in the editor
    document.querySelector('div.Am').focus();
    // move caret to the end of the text
    const textArea = document.querySelector('div.Am');
    range = document.createRange();
    range.selectNodeContents(textArea);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    // if (range) {
    //     selection.removeAllRanges();
    //     selection.addRange(range);
    // }

}

function handleKeyDown(event, selection, range) {
    const suggestions = document.querySelectorAll('.autocomplete-suggestion');
    if (suggestions.length === 0) return;
    console.log('Key event received:', event.key);
    if (event.type === 'click') {
        // get the click element
        const clickElement = event.target;
        if (clickElement.classList.contains('autocomplete-suggestion')) {
            removeSuggestBox();
            // set focus back on editor
            // document.querySelector('div.Am').focus();
            restoreCaret(selection, range);
            return;
        }
    }
    switch (event.key) {
        case 'ArrowDown':
            currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
            highlightSuggestion(suggestions, currentSuggestionIndex);
            break;
        case 'ArrowUp':
            currentSuggestionIndex = (currentSuggestionIndex - 1 + suggestions.length) % suggestions.length;
            highlightSuggestion(suggestions, currentSuggestionIndex);
            break;
        case 'Enter':
            if (currentSuggestionIndex > -1) {
                applySuggestion(suggestions[currentSuggestionIndex].innerText, document.querySelector('div.Am'));
                removeSuggestBox();
                restoreCaret(selection, range);
            }
            break;
        // case of mouse left click
        default:
            break;
    }
}

function highlightSuggestion(suggestions, index) {
    suggestions.forEach((suggestion, i) => {
        suggestion.classList.toggle('highlight', i === index);
    });
}

function applySuggestion(suggestion, editor) {
    const textArea = document.querySelector('div.Am');
    textArea.innerText += ' ' + suggestion;
    document.removeEventListener('keydown', handleKeyDown);
    currentSuggestionIndex = -1;
}

// Check for the compose area periodically
const intervalId = setInterval(() => {
    if (document.querySelector('div.Am')) {
        initialize();
        clearInterval(intervalId);
    }
}, 1000);
