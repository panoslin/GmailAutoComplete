# Gmail Email Assistant Chrome Extension

This Chrome extension enhances your Gmail composing experience by providing intelligent email improvements. The extension offers a powerful three-panel diff view to compare and review AI-suggested improvements to your email text.

<img src="./README.assets/image-20241220182940746.png" alt="Usage Screenshot" style="zoom:40%;" />

<img src="./README.assets/Screenshot 2024-12-23 at 18.06.39.png" alt="Screenshot 2024-12-23 at 18.06.39" style="zoom:40%;" />



<img src="./README.assets/image-20241220182313777.png" alt="Extension Screenshot" style="zoom:40%;" />

## Features

- **Multiple AI Models Support**: Choose from various AI models:
  - OpenAI GPT-3.5 Turbo and GPT-4
  - Anthropic Claude 2
  - LLaMA 2
  - Grok 1
- **Smart Email Improvements**:
  - **Summarize** emails 📝
  - Make text **shorter** ✂️
  - Make text more **friendly** 😊
  - Generate **responses** 💬
  - **Complete** emails 📧
  - **Proofread** content 🔍
  - Convert to **academic** style 🎓
  - Convert to **business** style 💼
- **Command Prompt Interface**:
  - Quick access with **Ctrl+Z**  ⌨️
  - Command history navigation with up/down arrows ↑↓
  - Persistent command history 📚
  - Escape key to close ❌
- **Advanced Diff Comparison**:
  - Three-panel diff view for **easy comparison**
  - Original text, modified text, and changes view
  - Synchronized scrolling option
  - Multiple diff modes (Words/Chars/Lines)
  - Color-coded additions and deletions

## Installation

1. **Install from [Chrome Web Store](https://chromewebstore.google.com/detail/gmail-autocomplete/jpbpagapiifleboecbkfljelpeknlbcl)**

2. **Configure the Extension**:
   - Click the extension icon in Chrome toolbar
   - Enter your API key ([**How to get the token?**](#API-Key-Setup))
   - Select your preferred AI model

   <img src="./README.assets/image-20241220182532391.png" alt="Settings Screenshot" style="zoom:40%;" />

## Usage

1. **Open Gmail** and compose or reply to an email

2. **Two Ways to Improve Text**:

   ### Method 1: Context Menu
   - **Select Text** you want to improve
   - **Right-Click** and choose "Improve Email ✨" from the context menu
   - Choose from predefined improvement types

   ### Method 2: Command Prompt
   - **Select Text** you want to improve
   - Press **Ctrl+Z**
   - Type your custom instruction
   - Use **↑↓** arrows to access command history
   - Press **Enter** to execute or **Esc** to cancel

3. **Review Changes** in the three-panel diff view:
   - Left panel: Original text
   - Middle panel: Modified text
   - Right panel: Color-coded changes

4. **Use the Controls**:
   - Toggle synchronized scrolling
   - Switch between diff modes
   - Copy, accept, or cancel changes

## API Key Setup

1. Add credit balance to [OpenAI Platform](https://platform.openai.com/settings/organization/billing/overview) (Minimum $5)

   <img src="./README.assets/5.png" alt="Billing Screenshot" style="zoom:40%;" />

2. Create an API Key from [OpenAI Dashboard](https://platform.openai.com/api-keys)

   <img src="./README.assets/4.png" alt="API Key Screenshot" style="zoom:40%;" />

3. Enter your API key in the extension settings

   <img src="./README.assets/image-20241220182532391.png" alt="Settings Screenshot" style="zoom:40%;" />

4. Start improving your emails with AI assistance!

   <img src="./README.assets/image-20241220182940746.png" alt="Usage Screenshot" style="zoom:40%;" />

## Contributing

We welcome contributions! Please feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share feedback and suggestions

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/panoslin/GmailAutoComplete/blob/main/LICENSE) file for details.

## Contact

For questions, support, or feedback:
- Open an issue on [GitHub](https://github.com/panoslin/GmailAutoComplete/issues)
- Email us at lghpanos@gmail.com

