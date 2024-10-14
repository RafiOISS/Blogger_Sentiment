document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('description');

    // Adjust the height of the textarea when the content changes
    const adjustHeight = (element) => {
        element.style.height = 'auto'; // Reset height to allow shrinking
        element.style.height = element.scrollHeight + 'px'; // Set new height based on content
    };

    // Attach input event listener to adjust height as you type
    textarea.addEventListener('input', function () {
        adjustHeight(textarea);
    });

    // Optionally: Adjust the height initially if the textarea already has content
    adjustHeight(textarea);
});
