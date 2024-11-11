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

// Initialize socket connection
const socket = io();
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// DOM Elements for Post Handling
//const postDashboard = document.getElementById('post-dashboard');
const postForm = document.getElementById('post-form');
const postTitleInput = document.getElementById('title');
const postDescriptionInput = document.getElementById('description');
const postCaptionInput = document.getElementById('caption');
const postImageInput = document.getElementById('fileElem');

// const post_Form = document.querySelector('form');

// function addMessageToChat(message) {
//     const messageElement = document.createElement('p');
//     messageElement.textContent = `${new Date(message.timestamp).toLocaleString()} - ${message.content}`;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// Helper function to format date and time
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Function to add user or bot message to the chat UI
function addMessageToChat(message) {
  //console.log('Received message:', message);

  const isUser = message.sender === 'user'; // Check if the message is from the user or the bot
  const messageContainer = document.createElement('div');
  // messageContainer.classList.add('flex', 'items-start', 'space-x-2', isUser ? 'justify-end' : ''); // Adjust based on sender
  messageContainer.classList.add('flex', 'items-start', 'space-x-2'); // Adjust based on sender

  if (isUser) {
    messageContainer.classList.add('justify-end');
  }

  // const timestamp = new Date(message.timestamp).toLocaleString(); // Convert timestamp to readable format

  // const timestamp = new Date(message.timestamp).toLocaleDateString('en-GB', {
  //   year: 'numeric',
  //   month: 'numeric',
  //   day: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   hour12: true
  // });

  const timestamp = formatTimestamp(message.timestamp);

  // Message HTML
  messageContainer.innerHTML = `
        ${isUser ? '' : `  <div class="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center border">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

          </div>
`}
        <div>
            <p class="font-semibold text-sm ${isUser ? 'text-right' : ''}">${isUser ? 'User' : 'Bot'}</p>
            <p class="text-xs text-gray-500 ${isUser ? 'text-right' : ''}">${timestamp}</p>
            <div class="${isUser ? 'bg-blue-100' : 'bg-gray-100'} p-3 rounded-3xl max-w-xs">
                <p>${message.content}</p>
            </div>
        </div>
        ${isUser ? `  <img
    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
    alt="avatar"
    class="relative inline-block h-9 w-9 !rounded-full  object-cover object-center"
  />` : ''}

    `;

  // Append the message container to the chat messages
  chatMessages.appendChild(messageContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom
}

// Load previous messages
fetch('/messages')
  .then(response => response.json())
  .then(messages => {
    //console.log(messages);
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



// Post Submission Form
// document.getElementById('post-form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const formData = new FormData(e.target);

//   const response = await fetch('/upload_image', { method: 'POST', body: formData });
//   const result = await response.json();

//   const postData = {
//     title: formData.get('title'),
//     description: formData.get('description'),
//     caption: formData.get('caption'),
//     image_filename: result.filename || null
//   };
//   socket.emit('submit_post', postData);
// });


/// Function to render a single post in the UI
function renderPost(post) {
  const timestamp = formatTimestamp(post.timestamp);

  const postHtml = `
    <div class="bg-white shadow-md rounded-3xl p-4 space-y-4">
      <div class="flex justify-between items-start">
        <div class="w-1/2 flex flex-col space-y-8">
          <div class="flex items-center space-x-2">
            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80" alt="avatar"
                 class="relative inline-block h-9 w-9 !rounded-full object-cover object-center" />
            <div>
              <p class="font-semibold">User</p>
              <p class="text-sm text-gray-500">${timestamp}</p>
            </div>
          </div>
          <div>
            <p class="text-lg font-semibold">${post.title}</p>
            <p class="text-gray-600 italic">${post.caption}</p>
          </div>
          <!-- Post Image -->
          ${post.image_url ? `<div class="w-full h-56 bg-gray-100 rounded-3xl mt-2">
            <img src="${post.image_url}" alt="Post Image" class="h-full w-full object-contain rounded-lg"/>
          </div>` : ''}
        </div>
        <div class="w-1/2 h-full flex items-center justify-center">
          <canvas class="max-w-72 max-h-72" id="radarChart1"></canvas>
        </div>
      </div>
      <p class="text-gray-700 mt-4 first-letter:text-7xl  first-letter:me-3 first-letter:float-start first-letter:font-pacifico first-letter:uppercase">${post.description}</p>
      <div class="flex justify-start items-center space-x-4">
        <button class="rounded-full border border-transparent py-1 px-4 text-center text-sm transition-all text-blue-500 hover:bg-blue-100 flex items-center justify-center gap-2" type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
          />
        </svg>Share</button>
        <button class="rounded-full border border-transparent py-1 px-4 text-center text-sm transition-all text-blue-500 hover:bg-blue-100 flex items-center justify-center gap-2" type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
          />
        </svg>Listen</button>
      </div>
    </div>`;
  
  postDashboard.insertAdjacentHTML('afterbegin', postHtml);
}

// Fetch and load existing posts
async function loadPosts() {
  try {
    const response = await fetch('/get_posts');
    const posts = await response.json();
    posts.forEach(renderPost);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }
}

// Submit a new post
async function submitPost(e) {
  e.preventDefault();

  const formData = new FormData(postForm);

  try {
    // Upload image (if provided)
    const uploadResponse = await fetch('/upload_image', { method: 'POST', body: formData });
    const uploadResult = await uploadResponse.json();
    const postData = {
      title: formData.get('title'),
      description: formData.get('description'),
      caption: formData.get('caption'),
      image_filename: uploadResult.filename || null // Set filename if present
    };

    // Emit post data to the server
    socket.emit('submit_post', postData);

    // Reset form fields after submission
    postTitleInput.value = '';
    postDescriptionInput.value = '';
    postCaptionInput.value = '';
    postImageInput.value = '';

    // Check if required fields (title and description) are filled and then close the form
    if (postData.title && postData.description) {  
      document.getElementById('post-close-form').click();  // Trigger close button functionality
    }
  } catch (error) {
    console.error("Failed to submit post:", error);
  }
}

// Listen for real-time post updates from the server
socket.on('receive_post', function (post) {
  renderPost(post);
});

// Load posts when the page loads
document.addEventListener('DOMContentLoaded', loadPosts);

// Submit post form event listener
postForm.addEventListener('submit', submitPost);



// // Add an event listener to the form's submit event
// post_Form.addEventListener('submit', (event) => {
//   event.preventDefault();  // Prevents the form from submitting and refreshing the page

//   // You can add your form submission logic here (e.g., sending data via AJAX)
//   console.log("Form submitted!");
// });


// Chart


// Doughnut Chart
const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
const doughnutChart = new Chart(doughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'], // Labels for the doughnut chart
    datasets: [{
      data: [10, 15, 5, 8, 12], // Example data
      backgroundColor: [
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: true, // Enable legend for the doughnut chart
        position: 'left',
        labels: {
          boxWidth: 15, // Set box width for square-shaped legend boxes
          //   padding: 20
        }
      }
    }
  },

});

// Radar Chart 1
const radarCtx1 = document.getElementById('radarChart1').getContext('2d');
const radarChart1 = new Chart(radarCtx1, {
  type: 'radar',
  data: {
    labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'],
    datasets: [{
      label: 'Sentiment 1',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 20,
        pointLabels: {
          font: {
            family: 'Poppins'
          },
        },
        ticks: {
          display: true,
          font: {
            size: 10,
            family: 'Poppins',
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false // Disable legend for radar chart
      }
    }
  }
});

// Radar Chart 2
const radarCtx2 = document.getElementById('radarChart2').getContext('2d');
const radarChart2 = new Chart(radarCtx2, {
  type: 'radar',
  data: {
    labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'],
    datasets: [{
      label: 'Sentiment 2',
      data: [7, 11, 6, 9, 4],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 20
      }
    },
    plugins: {
      legend: {
        display: false // Disable legend for radar chart
      }
    }
  }
});






// Upload Image



