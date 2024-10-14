// Elements
let dropArea = document.getElementById('drop-area');
let fileInput = document.getElementById('fileElem');
let uploadButton = document.getElementById('upload-button');
let previewContainer = document.getElementById('image-preview');
let imageInfo = document.getElementById('image-info');
let imageNameElement = document.getElementById('image-name');
let uploadInstruction = document.getElementById('upload-instruction');

// Handle file drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragging'), false)
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragging'), false)
});

// Handle dropped files
dropArea.addEventListener('drop', (e) => {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
});

// Handle file input click
uploadButton.addEventListener('click', () => fileInput.click());

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
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                // Display image preview
                previewContainer.innerHTML = ""; // Clear previous preview
                let img = document.createElement('img');
                img.src = reader.result;
                img.classList.add('w-full', 'mt-3', 'rounded-lg');
                previewContainer.appendChild(img);

                // Display file name and show remove button
                imageNameElement.textContent = file.name;
                imageInfo.classList.remove('hidden');  // Show image info section
                uploadInstruction.classList.add('hidden'); // Hide upload instruction
            }
        }
    }
}

// Function to remove image
function removeImage() {
    previewContainer.innerHTML = ""; // Clear image preview
    imageInfo.classList.add('hidden');  // Hide image info section
    uploadInstruction.classList.remove('hidden');  // Show upload instruction
    fileInput.value = "";  // Reset file input
}