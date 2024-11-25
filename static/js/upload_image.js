// Elements
let dropArea = document.getElementById('drop-area');
let fileInput = document.getElementById('fileElem');
let uploadButton = document.getElementById('upload-button');
let previewContainer = document.getElementById('image-preview');
let imageInfo = document.getElementById('image-info');
let imageNameElement = document.getElementById('image-name');
let uploadInstruction = document.getElementById('upload-instruction');
const removeButton = document.getElementById('remove-button');
const postForm = document.getElementById('post-form');

// Global variable to store the selected file
let selectedFile = null;

// Handle file drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragging'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragging'), false);
});

// Handle dropped files
dropArea.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
});

// Handle file input click
uploadButton.addEventListener('click', () => fileInput.click());

// Handle file input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Handle file paste
document.addEventListener('paste', (e) => {
    let items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
            let file = items[i].getAsFile();
            handleFiles([file]);
        }
    }
});

// Function to handle file selection and display
function handleFiles(files) {
    if (files.length) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            // Store the file for later upload
            selectedFile = file;
            
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                // Display image preview
                previewContainer.innerHTML = ""; // Clear previous preview
                let img = document.createElement('img');
                img.src = reader.result;
                img.classList.add('w-full', 'mb-1', 'h-32', 'object-contain', 'rounded-lg');
                previewContainer.appendChild(img);

                // Display file name and show remove button
                imageNameElement.textContent = file.name;
                imageInfo.classList.remove('hidden');
                dropArea.classList.add('hidden');
                previewContainer.classList.remove('hidden');
            }
        }
    }
}

// Function to remove image
function removeImage(event) {
    if (event) {
        event.preventDefault();
    }
    previewContainer.innerHTML = "";
    imageInfo.classList.add('hidden');
    dropArea.classList.remove('hidden');
    previewContainer.classList.add('hidden');
    fileInput.value = "";
    selectedFile = null; // Clear the selected file
}

// Add event listener to remove button
removeButton.addEventListener('click', removeImage);

// Submit post form
async function submitPost(e) {
    e.preventDefault();

    const formData = new FormData();
    
    // Add form fields to FormData
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('caption', document.getElementById('caption').value);
    
    // Add the selected file if it exists
    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
        // Show loading state if you have one
        // setLoading(true);
        
        // Upload image (if provided) and create post
        const uploadResponse = await fetch('/upload_image', {
            method: 'POST',
            body: formData
        });
        const uploadResult = await uploadResponse.json();

        // Prepare post data
        const postData = {
            title: formData.get('title'),
            description: formData.get('description'),
            caption: formData.get('caption'),
            image_filename: uploadResult.filename || null
        };

        // Emit post data to the server
        socket.emit('submit_post', postData);

        // Reset form
        postForm.reset();
        removeImage();
        selectedFile = null;
        if (window.resetTextareaHeight) {
            window.resetTextareaHeight(); // Call the globally available function
        }

        // Close form if required fields are filled
        if (postData.title && postData.description) {
            document.getElementById('post-close-form').click();
        }
    } catch (error) {
        console.error("Failed to submit post:", error);
    }
}

// Add form submit event listener
postForm.addEventListener('submit', submitPost);