class ChatApp {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        
        // DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.lmStudioUrl = document.getElementById('lmStudioUrl');
        this.modelName = document.getElementById('modelName');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize input
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message to chat UI and history
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Show typing indicator and create an empty bubble for the AI
        this.showTypingIndicator();
        
        try {
            // Stream the AI response
            await this.streamAIResponse();
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please check your LM Studio connection.', 'assistant');
            console.error('Error:', error);
        }
    }

    async streamAIResponse() {
        const url = this.lmStudioUrl.value || 'http://localhost:1234';
        const model = this.modelName.value || 'default';

        const requestBody = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are Jarvis, a helpful AI assistant. Be concise, friendly, and helpful in your responses."
                },
                ...this.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ],
            temperature: 0.7,
            max_tokens: 1000,
            stream: true // Enable streaming
        };

        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Create an empty message bubble for the assistant
        const assistantMessageContent = this.addMessage('', 'assistant', false);
        this.hideTypingIndicator();
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.substring(6);
                    if (dataStr.trim() === '[DONE]') break;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        const token = data.choices[0]?.delta?.content || '';
                        if (token) {
                            fullResponse += token;
                            // Use marked to parse markdown in real-time
                            assistantMessageContent.innerHTML = marked.parse(fullResponse);
                            this.scrollToBottom();
                        }
                    } catch (e) {
                        console.error('Error parsing stream data:', e);
                    }
                }
            }
        }

        // Add the complete message to history once streaming is finished
        if (fullResponse) {
            this.messages.push({ role: 'assistant', content: fullResponse, timestamp: new Date() });
        }
        
        // Highlight all code blocks and add copy buttons
        this.highlightCodeBlocks(assistantMessageContent);
    }

    async getAIResponse(userMessage) {
        const url = this.lmStudioUrl.value || 'http://localhost:1234';
        const model = this.modelName.value || 'default';

        const requestBody = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are Jarvis, a helpful AI assistant. Be concise, friendly, and helpful in your responses."
                },
                ...this.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
        };

        const response = await fetch(`${url}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    addMessage(content, role, addToHistory = true) {
        if (addToHistory) {
            const message = { content, role, timestamp: new Date() };
            this.messages.push(message);
        }

        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = role === 'user' ? 'U' : 'AI';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = marked.parse(content); // Use marked here for non-streamed messages too

        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);

        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();

        // Highlight and add copy buttons if it's an assistant message with code
        if(role === 'assistant') {
            this.highlightCodeBlocks(messageContent);
        }

        return messageContent;
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        this.typingIndicator.style.display = 'block';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.sendButton.disabled = false;
        this.typingIndicator.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    highlightCodeBlocks(container) {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            // Highlight the block
            hljs.highlightElement(codeBlock);

            // Add copy button
            const preElement = codeBlock.parentElement;
            if (preElement.querySelector('.copy-button')) return; // Don't add if already exists

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    copyButton.textContent = 'Copied!';
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
            });

            // Add language indicator
            const langIndicator = document.createElement('div');
            const lang = codeBlock.className.split(' ')[0].replace('language-', '');
            langIndicator.className = 'lang-indicator';
            langIndicator.textContent = lang;

            preElement.appendChild(langIndicator);
            preElement.appendChild(copyButton);
        });
    }

    // Clear chat history
    clearChat() {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="message assistant">
                <div class="avatar">AI</div>
                <div class="message-content">
                    Hello! I'm Jarvis, powered by LM Studio. How can I help you today?
                </div>
            </div>
        `;
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatApp = new ChatApp();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('messageInput').focus();
    }
    
    // Ctrl/Cmd + L to clear chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        window.chatApp.clearChat();
    }
}); 