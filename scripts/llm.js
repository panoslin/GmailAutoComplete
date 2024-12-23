  /**
   * Sends an API request to the selected AI model to improve the given text.
   * @param {string} text The text to improve.
   * @param {string} improvementType The type of improvement to apply. Supported values are:
   *  - "summary": Summarize the text concisely.
   *  - "shorten": Make the text shorter while maintaining the key message.
   *  - "friendly": Make the text more friendly and approachable.
   *  - "response": Draft a professional response to the email.
   *  - "complete": Complete the email in a professional manner.
   *  - "proofread": Proofread and improve the email body.
   *  - "academic": Rewrite the text in a formal academic style.
   *  - "business": Rewrite the text in a professional business style.
   * @returns {Promise<string>} The improved text. If an error occurs, returns a string in the format "Error: <error message>".
   */
async function improveText(text, improvementType) {
    const prompts = {
      summary: "Summarize this email text concisely:",
      shorten: "Make this text shorter while maintaining the key message:",
      friendly: "Make this text more friendly and approachable:",
      response: "Draft a response to this email:",
      complete: "Complete this email:",
      proofread: "Proofread and improve this email body:",
      academic: "Rewrite this in a formal academic style:",
      business: "Rewrite this in a professional business style:",
    };
  
    const prompt = prompts[improvementType] || "Improve this text:";
  
    try {
      showLoading();
      let response;
      let result;
  
      if (!apiToken) {
        throw new Error(
          "API key is not set. Please set your API key in the extension settings."
        );
      }
  
      switch (selectedModel) {
        case "gpt-3.5-turbo":
        case "gpt-4o":
          // OpenAI API
          response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: [
                {
                  role: "system",
                  content: "You are a professional email writing assistant.",
                },
                {
                  role: "user",
                  content: `${prompt}\n\n${text}`,
                },
              ],
              temperature: 0.7,
            }),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error?.message || "OpenAI API request failed"
            );
          }
  
          const openAIData = await response.json();
          result = openAIData.choices[0].message.content;
          break;
  
        case "claude-2":
          // Anthropic Claude API
          response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiToken,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-2",
              max_tokens: 1024,
              messages: [
                {
                  role: "user",
                  content: `${prompt}\n\n${text}`,
                },
              ],
            }),
          });
          const claudeData = await response.json();
          result = claudeData.content[0].text;
          break;
  
        case "llama-2":
          // Example for a local LLaMA 2 API endpoint
          response = await fetch("http://localhost:8000/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              model: "llama-2-70b-chat",
              messages: [
                {
                  role: "system",
                  content: "You are a professional email writing assistant.",
                },
                {
                  role: "user",
                  content: `${prompt}\n\n${text}`,
                },
              ],
              temperature: 0.7,
            }),
          });
          const llamaData = await response.json();
          result = llamaData.choices[0].message.content;
          break;
  
        case "grok-1":
          // Example for Grok API (when available)
          response = await fetch("https://api.grok.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify({
              model: "grok-1",
              messages: [
                {
                  role: "system",
                  content: "You are a professional email writing assistant.",
                },
                {
                  role: "user",
                  content: `${prompt}\n\n${text}`,
                },
              ],
            }),
          });
          const grokData = await response.json();
          result = grokData.choices[0].message.content;
          break;
  
        default:
          throw new Error("Unsupported model selected");
      }
  
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      console.error("Error:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      showToast(errorMessage);
      return `Error: ${errorMessage}`;
    }
  }
  