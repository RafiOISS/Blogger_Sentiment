// document.getElementById('sidebarToggle').addEventListener('click', function() {
//     var drawer = document.getElementById('slideDrawer');
//     if (drawer.classList.contains('translate-x-full')) {
//         drawer.classList.remove('translate-x-full');
//         drawer.classList.add('translate-x-0');
//     } else {
//         drawer.classList.remove('translate-x-0');
//         drawer.classList.add('translate-x-full');
//     }
// });

const socket = io();
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// function addMessageToChat(message) {
//     const messageElement = document.createElement('p');
//     messageElement.textContent = `${new Date(message.timestamp).toLocaleString()} - ${message.content}`;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// Function to add user or bot message to the chat UI
function addMessageToChat(message) {
    console.log('Received message:', message);
    
    const isUser = message.sender === 'user'; // Check if the message is from the user or the bot
    const messageContainer = document.createElement('div');
    // messageContainer.classList.add('flex', 'items-start', 'space-x-2', isUser ? 'justify-end' : ''); // Adjust based on sender
    messageContainer.classList.add('flex', 'items-start', 'space-x-2'); // Adjust based on sender

    if (isUser) {
        messageContainer.classList.add('justify-end');
    }

    // const timestamp = new Date(message.timestamp).toLocaleString(); // Convert timestamp to readable format

    const timestamp = new Date(message.timestamp).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Message HTML
    messageContainer.innerHTML = `
        ${isUser ? '' : `<div class="w-10 h-10 bg-gray-300 rounded-full"></div>`}
        <div>
            <p class="font-semibold text-sm ${isUser ? 'text-right' : ''}">${isUser ? 'User' : 'Bot'}</p>
            <p class="text-xs text-gray-500 ${isUser ? 'text-right' : ''}">${timestamp}</p>
            <div class="${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'} p-3 rounded-lg max-w-xs">
                <p>${message.content}</p>
            </div>
        </div>
        ${isUser ? `<div class="w-10 h-10 bg-gray-300 rounded-full"></div>` : ''}
    `;

    // Append the message container to the chat messages
    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
}

// Load previous messages
fetch('/messages')
    .then(response => response.json())
    .then(messages => {
        console.log(messages);
        // chatMessages.innerHTML = '';
        messages.forEach(addMessageToChat);
    });

socket.on('receive_message', function (data) {
    addMessageToChat(data);
});

messageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const message = messageInput.value.trim(); // Trim whitespace from the message
    if (message) { // Only send if the message is not empty
        socket.emit('send_message', { message: message });
        messageInput.value = '';
    }
});