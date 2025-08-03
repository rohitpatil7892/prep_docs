# Jarvis Chat - LM Studio Integration

A minimal, modern ChatGPT-like chat interface that connects to LM Studio's local API.

## Features

- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🤖 **LM Studio Integration**: Connect to any model running in LM Studio
- 💬 **Real-time Chat**: Full conversation history with context
- ⌨️ **Keyboard Shortcuts**: 
  - `Enter` to send message
  - `Ctrl/Cmd + K` to focus input
  - `Ctrl/Cmd + L` to clear chat
- ⚙️ **Configurable**: Easy settings for URL and model name
- 📱 **Mobile Friendly**: Responsive design works on all devices

## Setup

### 1. Start LM Studio

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Load your preferred model (e.g., Llama, Mistral, etc.)
3. Start the local server:
   - Go to "Local Server" tab
   - Click "Start Server"
   - Note the URL (usually `http://localhost:1234`)

### 2. Run the Chat App

Simply open `index.html` in your web browser! No server setup required.

```bash
# Navigate to the chat-app directory
cd chat-app

# Open in browser (or double-click index.html)
open index.html
```

### 3. Configure Settings

In the top-right settings panel:
- **LM Studio URL**: Your LM Studio server URL (default: `http://localhost:1234`)
- **Model Name**: The name of your loaded model (default: `default`)

## Usage

1. **Start Chatting**: Type your message and press Enter or click Send
2. **View History**: All messages are preserved in the conversation
3. **Clear Chat**: Use `Ctrl/Cmd + L` or refresh the page
4. **Switch Models**: Change the model name in settings and restart LM Studio

## API Endpoint

The app uses LM Studio's OpenAI-compatible API endpoint:
```
POST http://localhost:1234/v1/chat/completions
```

## Troubleshooting

### Connection Issues
- Ensure LM Studio server is running
- Check the URL in settings (default: `http://localhost:1234`)
- Verify your model is loaded and running

### Model Issues
- Make sure your model supports chat completions
- Check the model name in settings matches your loaded model
- Try restarting LM Studio

### Browser Issues
- Use a modern browser (Chrome, Firefox, Safari, Edge)
- Check browser console for error messages
- Ensure JavaScript is enabled

## Customization

### Styling
Edit the CSS in `index.html` to customize:
- Colors and gradients
- Fonts and spacing
- Layout and animations

### Functionality
Modify `chat.js` to add features like:
- Message persistence
- File uploads
- Voice input
- Custom system prompts

## File Structure

```
chat-app/
├── index.html      # Main HTML file with styles
├── chat.js         # JavaScript functionality
└── README.md       # This file
```

## Requirements

- Modern web browser
- LM Studio running locally
- Internet connection (for initial page load only)

## License

This is a simple, open-source chat interface. Feel free to modify and use as needed! 