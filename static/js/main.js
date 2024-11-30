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
const chatMessages = document.getElementById("chat-messages");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

// DOM Elements for Post Handling
//const postDashboard = document.getElementById('post-dashboard');
// const postForm = document.getElementById('post-form');
const postTitleInput = document.getElementById("title");
const postDescriptionInput = document.getElementById("description");
const postCaptionInput = document.getElementById("caption");
const postImageInput = document.getElementById("fileElem");

// const post_Form = document.querySelector('form');

// function addMessageToChat(message) {
//     const messageElement = document.createElement('p');
//     messageElement.textContent = `${new Date(message.timestamp).toLocaleString()} - ${message.content}`;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
// }

// Helper function to format date and time
function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Function to add user or bot message to the chat UI
function addMessageToChat(message) {
  //console.log('Received message:', message);

  const isUser = message.sender === "user"; // Check if the message is from the user or the bot
  const messageContainer = document.createElement("div");
  // messageContainer.classList.add('flex', 'items-start', 'space-x-2', isUser ? 'justify-end' : ''); // Adjust based on sender
  messageContainer.classList.add("flex", "items-start", "space-x-2"); // Adjust based on sender

  if (isUser) {
    messageContainer.classList.add("justify-end");
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
        ${
          isUser
            ? ""
            : `  <div class="w-9 h-9 text-slate-700 bg-pink-100 rounded-full flex items-center justify-center border">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

          </div>
`
        }
        <div>
            <p class="font-semibold text-sm text-slate-700 ${isUser ? "text-right" : ""}">${isUser ? "User" : "Bot"}</p>
            <p class="text-xs text-gray-500 ${isUser ? "text-right" : ""}">${timestamp}</p>
            <div class="${isUser ? "bg-blue-100" : "bg-gray-100"} p-3 text-slate-950 rounded-3xl max-w-xs">
                <p class="whitespace-pre-wrap">${message.content}</p>
            </div>
        </div>
        ${
          isUser
            ? `  <img
    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80"
    alt="avatar"
    class="relative inline-block h-9 w-9 !rounded-full  object-cover object-center"
  />`
            : ""
        }

    `;

  // Append the message container to the chat messages
  chatMessages.appendChild(messageContainer);
  // chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the bottom

  // Smooth auto-scroll to the bottom
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth'
  });
}

// Load previous messages
fetch("/messages")
  .then((response) => response.json())
  .then((messages) => {
    //console.log(messages);
    // chatMessages.innerHTML = '';
    messages.forEach(addMessageToChat);
  });

socket.on("receive_message", function (data) {
  addMessageToChat(data);
});

messageForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const message = messageInput.value; // Trim whitespace from the message
  if (message.trim()) {
    // Only send if the message is not empty
    socket.emit("send_message", { message: message });
    messageInput.value = "";
  }
});

messageInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevent default Enter behavior
    messageForm.dispatchEvent(new Event("submit"));
  } else if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault(); // Prevent default Enter behavior
    const start = this.selectionStart;
    const end = this.selectionEnd;
    this.value = this.value.substring(0, start) + "\n" + this.value.substring(end);
    this.selectionStart = this.selectionStart + 1;
    this.selectionEnd = this.selectionStart;
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
    <div class="bg-white shadow-md rounded-3xl p-4 space-y-4 id="post-${post.id}"">

    <div class="flex justify-between">
      <div class="flex items-center space-x-2">
            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=1480&amp;q=80" alt="avatar"
                 class="relative inline-block h-9 w-9 !rounded-full object-cover object-center" />
            <div>
              <p class="font-semibold text-slate-600">User</p>
              <p class="text-sm text-gray-500">${timestamp}</p>
            </div>
          </div>

          <div class="relative inline-block text-left">
        <div>
          <button type="button"
            class="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white active:bg-gray-200 px-2 py-2 font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
            id="menu-button-${post.id}" aria-expanded="false" aria-haspopup="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
          </button>
        </div>

        <div
          class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none hidden"
          role="menu" aria-orientation="vertical" id="dropdown-menu-${post.id}" tabindex="-1">
          <div class="py-1" role="none">
            <a href="#"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 mx-1 rounded-md flex items-center gap-2"
              role="menuitem" tabindex="-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>

              Edit
            </a>
            <a href="#"
              class="px-4 py-2 text-sm text-pink-600 hover:bg-gray-100 active:bg-gray-200 mx-1 rounded-md flex items-center gap-2 remove-link"
              role="menuitem" tabindex="-1" data-id="${post.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>

              Remove
            </a>
          </div>
        </div>
      </div>

          </div>

      <div class="flex justify-between items-start">
        <div class="w-1/2 flex flex-col space-y-8">
          
          <div>
            <p class="text-lg text-slate-600 font-semibold">${post.title}</p>
            <p class="text-gray-600 italic">${post.caption}</p>
          </div>
          <!-- Post Image -->
          ${
            post.image_url
              ? `
  <div class="w-full h-56 rounded-3xl relative overflow-hidden">
    <!-- Blurred background layer -->
    <div class="absolute inset-0 scale-110 bg-center bg-cover"
         style="background-image: url('${post.image_url}'); filter: blur(20px) brightness(0.9);">
    </div>
    
    <!-- Main image -->
    <div class="relative h-full w-full flex items-center justify-center">
      <img src="${post.image_url}" alt="Post Image" class="h-full w-full object-contain"/>
    </div>
  </div>
`
              : `<div class="w-full h-56 bg-gray-100 rounded-3xl flex justify-center items-center space-x-4 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p>No image in this post.</p>
          </div>`
          }
        </div>
        <div class="w-1/2 h-full flex flex-col items-center justify-center">
          <canvas class=" max-h-72" id="radarChart-${post.id}"></canvas>
          <!-- <div class="text-gray-500 text-xs"><p>≈75% Accurate</p></div> -->
        </div>
      </div>
      <p class="text-gray-700 whitespace-pre-wrap mt-4 first-letter:text-7xl  first-letter:me-3 first-letter:float-start first-letter:font-pacifico first-letter:uppercase">${post.description}</p>
      <div class="flex justify-end items-center space-x-4">
        
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
      </div>
    </div>`;

  postDashboard.insertAdjacentHTML("afterbegin", postHtml);

  // Render radar chart for the post
  renderRadarChart(post.id);

  // Initialize dropdown menu functionality
  initDropdownMenu(post.id);

  // Auto-scroll to the top after adding a new post
  // postDashboard.scrollTop = 0;

  postDashboard.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  // Attach click event listener to remove link
  attachRemoveEvent(post.id);
}

// Fetch and load existing posts
async function loadPosts() {
  try {
    const response = await fetch("/get_posts");
    const posts = await response.json();

    // Clear the current posts
    postDashboard.innerHTML = "";

    // Render each post dynamically
    posts.forEach(renderPost);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }
}

// Submit a new post
// async function submitPost(e) {
//   e.preventDefault();

//   const formData = new FormData(postForm);

//   // Add form fields to FormData
//   formData.append('title', document.getElementById('title').value);
//   formData.append('description', document.getElementById('description').value);
//   formData.append('caption', document.getElementById('caption').value);

//   // Add the selected file if it exists
//   if (selectedFile) {
//       formData.append('image', selectedFile);
//   }

//   try {
//     // Upload image (if provided)
//     const uploadResponse = await fetch('/upload_image', { method: 'POST', body: formData });
//     const uploadResult = await uploadResponse.json();

//     // Prepare post data
//     const postData = {
//       title: formData.get('title'),
//       description: formData.get('description'),
//       caption: formData.get('caption'),
//       image_filename: uploadResult.filename || null // Set filename if present
//     };

//     // Emit post data to the server
//     socket.emit('submit_post', postData);

//     // Reset form fields after submission
//     postForm.reset();
//     removeImage();
//     selectedFile = null;

//     // Check if required fields (title and description) are filled and then close the form
//     if (postData.title && postData.description) {
//       document.getElementById('post-close-form').click();  // Trigger close button functionality
//     }
//   } catch (error) {
//     console.error("Failed to submit post:", error);
//   }
// }

// Listen for real-time post updates from the server
socket.on("receive_post", function (post) {

  hidePostLoadingSkeleton();
  renderPost(post);

  // Re-enable submit button
  // const submitButton = document.getElementById('submit-post-button');
  submitButton.disabled = false;
  console.log("socket.on(\"receive_post\", function (post) {submitButton.disabled = false;}");
});

// Load posts when the page loads
document.addEventListener("DOMContentLoaded", loadPosts);

// Submit post form event listener
// postForm.addEventListener('submit', submitPost);

// // Add an event listener to the form's submit event
// post_Form.addEventListener('submit', (event) => {
//   event.preventDefault();  // Prevents the form from submitting and refreshing the page

//   // You can add your form submission logic here (e.g., sending data via AJAX)
//   console.log("Form submitted!");
// });

// Dropdown menu
function initDropdownMenu(postId) {
  const menuButton = document.getElementById(`menu-button-${postId}`);
  const dropdownMenu = document.getElementById(`dropdown-menu-${postId}`);

  if (!menuButton || !dropdownMenu) {
    console.error(`Dropdown elements not found for post ${postId}`);
    return;
  }

  // Toggle dropdown visibility
  menuButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent immediate closing
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", !isExpanded);
    dropdownMenu.classList.toggle("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    dropdownMenu.classList.add("hidden");
  });
}

// Remove in dropdown menu
function attachRemoveEvent(postId) {
  const removeLink = document.querySelector(
    `.remove-link[data-id="${postId}"]`
  );

  if (!removeLink) {
    console.error(`Remove link not found for post ${postId}`);
    return;
  }

  removeLink.addEventListener("click", (event) => {
    event.preventDefault();

    // Emit a socket message to remove the post
    socket.emit("remove_post", { id: postId });

    // Optimistically remove the post from the DOM
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.classList.add("opacity-50"); // Reduce opacity to indicate removal in progress
    }
  });
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed top-20 right-20 bg-${type === "success" ? "green" : "red"}-100 border border-${type === "success" ? "green" : "red"}-400 text-${type === "success" ? "green" : "red"}-700 px-4 py-2 rounded shadow`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Remove after 3 seconds
}

// Listen for the 'post_removed' event
socket.on("post_removed", () => {
  // Clear the current posts
  postDashboard.innerHTML = "";

  // Reload all posts dynamically
  loadPosts();
});

// Chart

async function renderRadarChart(postId) {
  try {
    // Fetch sentiment data for the post
    const response = await fetch(`/get_sentiment_data?post_id=${postId}`);
    const sentiment = await response.json();

    // Get the canvas for the radar chart
    const ctx = document
      .getElementById(`radarChart-${postId}`)
      .getContext("2d");

    // Render the radar chart
    new Chart(ctx, {
      type: "radar",
      data: {
        labels: [
          "Surprise 😲",
          "😄 Joy",
          "😐 Neutral",
          "😢 Sad",
          "Disgust 🤢",
          "Fear 😱",
          "Angry 😡",
        ],
        datasets: [
          {
            label: "≈ 75% Accuracy",
            data: [
              sentiment.surprised,
              sentiment.happy,
              sentiment.neutral,
              sentiment.sad,
              sentiment.disgust,
              sentiment.fear,
              sentiment.angry,
            ],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: {
              font: {
                family: "Poppins",
                size: 16,
              },
            },
            ticks: {
              display: true,
              font: {
                size: 10,
                family: "Poppins",
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true, // Disable legend for radar chart
          },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to render radar chart for post ${postId}:`, error);
  }
}

// // Doughnut Chart
// const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
// const doughnutChart = new Chart(doughnutCtx, {
//   type: 'doughnut',
//   data: {
//     labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'], // Labels for the doughnut chart
//     datasets: [{
//       data: [10, 15, 5, 8, 12], // Example data
//       backgroundColor: [
//         'rgba(75, 192, 192, 0.7)',
//         'rgba(255, 99, 132, 0.7)',
//         'rgba(255, 206, 86, 0.7)',
//         'rgba(153, 102, 255, 0.7)',
//         'rgba(255, 159, 64, 0.7)'
//       ],
//       borderColor: [
//         'rgba(75, 192, 192, 1)',
//         'rgba(255, 99, 132, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//       borderWidth: 1
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     cutout: '80%',
//     plugins: {
//       legend: {
//         display: true, // Enable legend for the doughnut chart
//         position: 'left',
//         labels: {
//           boxWidth: 15, // Set box width for square-shaped legend boxes
//           //   padding: 20
//         }
//       }
//     }
//   },

// });

// // Radar Chart 1
// const radarCtx1 = document.getElementById('radarChart1').getContext('2d');
// const radarChart1 = new Chart(radarCtx1, {
//   type: 'radar',
//   data: {
//     labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'],
//     datasets: [{
//       label: 'Sentiment 1',
//       data: [12, 19, 3, 5, 2],
//       backgroundColor: 'rgba(54, 162, 235, 0.2)',
//       borderColor: 'rgba(54, 162, 235, 1)',
//       borderWidth: 2
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       r: {
//         beginAtZero: true,
//         suggestedMin: 0,
//         suggestedMax: 20,
//         pointLabels: {
//           font: {
//             family: 'Poppins'
//           },
//         },
//         ticks: {
//           display: true,
//           font: {
//             size: 10,
//             family: 'Poppins',
//           }
//         }
//       }
//     },
//     plugins: {
//       legend: {
//         display: false // Disable legend for radar chart
//       }
//     }
//   }
// });

// // Radar Chart 2
// const radarCtx2 = document.getElementById('radarChart2').getContext('2d');
// const radarChart2 = new Chart(radarCtx2, {
//   type: 'radar',
//   data: {
//     labels: ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'],
//     datasets: [{
//       label: 'Sentiment 2',
//       data: [7, 11, 6, 9, 4],
//       backgroundColor: 'rgba(255, 99, 132, 0.2)',
//       borderColor: 'rgba(255, 99, 132, 1)',
//       borderWidth: 2
//     }]
//   },
//   options: {
//     responsive: true,
//     maintainAspectRatio: false,
//     scales: {
//       r: {
//         beginAtZero: true,
//         suggestedMin: 0,
//         suggestedMax: 20
//       }
//     },
//     plugins: {
//       legend: {
//         display: false // Disable legend for radar chart
//       }
//     }
//   }
// });

// Upload Image
