const autoCompleteRegisteredElements = new Set();
const apiKey = 'secret';
document.addEventListener('input', function (event) {
    if (event.target.isContentEditable || event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        if (!autoCompleteRegisteredElements.has(event.target)) {
            autoCompleteRegisteredElements.add(event.target);
            const editableElement = event.target;
            const tribute = new Tribute(
                {
                    menuContainer: editableElement.parentNode,
                    autocompleteMode: true,
                    containerClass: 'tribute-container',
                    selectClass: "selected-item",
                    requireLeadingSpace: false,
                    allowSpaces: true,
                    // spaceSelectsMatch: true,
                    menuItemLimit: 9999,
                    menuShowMinLength: 1,
                    // noMatchTemplate: "",
                    searchOpts: {
                        pre: '',
                        post: '',
                        skip: true
                    },
                    loadingItemTemplate: '<div class="loading"><div class="spinner"></div>ChatGPT Loading...</div>',
                    values: debounce(async function (text, cb) {
                        const fullText = getTextBeforeCaret();
                        const loading = document.querySelector("div.loading");
                        if (loading) {
                            loading.style.display = "inline-flex";
                        }
                        await remoteSearch(fullText, users => cb(users));
                    }, 800),
                    // function called on select that returns the content to insert
                    selectTemplate: function (item) {
                        if (typeof item === "undefined") return null;
                        return `<span class="marker">${item.original.key}</span>`;
                    },
                    menuItemTemplate: function (item) {
                        return `<div class="item">${item.string}</div>`;
                    }
                }
            );
            tribute.requestID = 0;
            tribute.attach(editableElement);

            function getTextBeforeCaret() {
                const sel = window.getSelection();
                let textBeforeCaret = '';

                if (sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const preCaretRange = range.cloneRange();
                    preCaretRange.selectNodeContents(editableElement);
                    preCaretRange.setEnd(range.endContainer, range.endOffset);
                    textBeforeCaret = preCaretRange.toString();
                }

                return textBeforeCaret;
            }

            async function remoteSearch(text, cb) {
                console.log(text);
                let requestID = ++tribute.requestID % 1000;
                // let suggestions = await getSuggestions(text);
                getEmailSuggestions(apiKey, text).then(suggestions => {
                    console.log(suggestions, text);
                    suggestions = suggestions.map((s, i) => ({key: s, value: s}));
                    console.log(requestID, tribute.requestID, suggestions);
                    if (suggestions.length > 0 && requestID === tribute.requestID) {
                        cb(suggestions);
                    }
                });
            }

            function debounce(func, wait) {
                let timeout;
                return function (...args) {
                    const context = this;
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(context, args), wait);
                };
            }

            // Don't show the loading indicator when the selection menu show up
            editableElement.addEventListener('tribute-active-true', function (event) {
                    let loading = document.querySelector("div.loading");
                    if (loading) {
                        loading.style.display = "none";
                    }
                }
            );

            // Overwrite Tribute.js default replace behavior
            // append selectedText over replace
            editableElement.addEventListener('tribute-replaced',
                function (event) {
                    // remove child with class .marker
                    if (event.target.tagName === 'INPUT') {
                        // Parse the string as HTML
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(event.target.value, 'text/html');
                        let marker = doc.querySelector('span.marker');
                        if (marker) {
                            marker.nextSibling.remove();
                            marker.previousSibling.nodeValue = marker.previousSibling.nodeValue.trimEnd() + " " + event.detail.context.mentionText + event.detail.item.string;
                            marker.parentNode.removeChild(marker);
                            event.target.value = doc.body.textContent;
                        }
                    } else {
                        const marker = editableElement.querySelector('.marker');
                        if (marker) {
                            // remove &nbsp after the marker;
                            marker.nextSibling.remove();
                            marker.previousSibling.nodeValue = marker.previousSibling.nodeValue.trimEnd() + " " + event.detail.context.mentionText + event.detail.item.string;
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.setStartAfter(marker.previousSibling);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            marker.parentNode.removeChild(marker);
                        }

                    }
                });
        }
    }
});

async function getEmailSuggestions(apiKey, context, model = 'gpt-4o') {
    /**
     * Fetches email suggestions using OpenAI's GPT model.
     *
     * @param {string} apiKey - The API key for OpenAI.
     * @param {string} context - The context or partial content of an email.
     * @param {string} model - The model to use for generating suggestions (default is 'gpt-3.5-turbo').
     * @returns {Promise<Array<string>>} - A list of suggested email completions.
     */
    try {
        // Prepare the request
        const messages = [
            {
                role: "system",
                content: `You are designed to assist with drafting emails by providing short, concise text 
                        predictions based on the user's input. Upon receiving the context or partial content of an email, 
                        you will offer a list of 6 possible completions in JSON format (e.g. following the exact format of '{
                        "suggestions": ["How are you?", "Thank you", "Meeting update"]}'), each suggestion ranging from 1 to 10 
                        words, focusing solely on delivering these suggestions without any additional explanations. 
                        Please be aware that you also need to provide the necessary puctuations and spaces`
            },
            {
                role: "user",
                content: context
            }
        ];

        // Make the API call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                n: 1,
                frequency_penalty: 1.0
            })
        });

        const completion = await response.json();

        // Process the response
        if (completion.choices[0].finish_reason === 'length') {
            console.log("Completion finished with incomplete output, please try again with more context");
            console.log(completion.choices[0].message.content);
            return [];
        }

        return JSON.parse(completion.choices[0].message.content).suggestions || [];

    } catch (error) {
        console.error(`An error occurred: ${error}`);
        return [];
    }
}

