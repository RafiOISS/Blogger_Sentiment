// Select elements by their IDs
const chatButton = document.getElementById('chat-open');
const chatColumn = document.getElementById('chat-col');
const closeButton = document.getElementById('chat-close');

// Select elements by their IDs
const openFormButton = document.getElementById('post-open-form');
const closeFormButton = document.getElementById('post-close-form');
const postDashboard = document.getElementById('post-dashboard');
const postDashboardBottom = document.getElementById('post-dashboard-bottom');
const postForm = document.getElementById('post-form');

// Show the chat column and hide the chat button on chat button click
chatButton.addEventListener('click', () => {
    chatButton.classList.add('hidden');   // Hide chat button
    chatColumn.classList.remove('hidden'); // Show chat column
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
});

// Show the chat button and hide the chat column on close button click
closeButton.addEventListener('click', () => {
    chatButton.classList.remove('hidden'); // Show chat button
    chatColumn.classList.add('hidden');    // Hide chat column
});


// Show the post form and hide the dashboard when Create a post button is clicked
openFormButton.addEventListener('click', () => {
    postDashboard.classList.add('hidden');         // Hide post dashboard
    postDashboardBottom.classList.add('hidden');  // Hide dashboard content
    postForm.classList.remove('hidden');           // Show post form
});

// Show the dashboard and hide the post form when Back button is clicked
closeFormButton.addEventListener('click', () => {
    postDashboard.classList.remove('hidden');      // Show post dashboard
    postDashboardBottom.classList.remove('hidden'); // Show dashboard content
    postForm.classList.add('hidden');              // Hide post form
});
