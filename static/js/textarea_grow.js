document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('description');
    const defaultHeight = '96px'; // This matches the min-h-24 class (24 * 4px = 96px)

    // Adjust the height of the textarea when the content changes
    const adjustHeight = (element) => {
        element.style.height = 'auto'; // Reset height to allow shrinking
        element.style.height = element.scrollHeight + 'px'; // Set new height based on content
    };

    // Make resetHeight available on window object so other scripts can use it
    window.resetTextareaHeight = function() {
        textarea.style.height = defaultHeight;
        textarea.value = '';
    };

    // Attach input event listener to adjust height as you type
    textarea.addEventListener('input', function () {
        adjustHeight(textarea);
    });

    // Optionally: Adjust the height initially if the textarea already has content
    adjustHeight(textarea);
});
