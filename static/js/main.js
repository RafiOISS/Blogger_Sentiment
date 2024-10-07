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

function addMessageToChat(message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${new Date(message.timestamp).toLocaleString()} - ${message.content}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Load previous messages
fetch('/messages')
    .then(response => response.json())
    .then(messages => {
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