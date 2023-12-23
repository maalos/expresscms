const previewWindow = document.getElementById("post-editor-preview")
const textarea = document.getElementById("content-textarea")
const previewHeader = "<p id=\"preview-corner-text\">Post preview</p>"

function updatePreviewWindow() {
    if (previewWindow.innerHTML != previewHeader + textarea.value.replaceAll("<img", "&lt;img"))
        previewWindow.innerHTML = previewHeader + textarea.value.replaceAll("<img", "&lt;img")
}

updatePreviewWindow()

setInterval(() => {
    updatePreviewWindow()
}, 3000)

const singleTags = ["img", "hr", "br"]

function insertTag(button, event, text) {
    const cursorPos = textarea.selectionStart;

    if (!text) {
        event.preventDefault()
        const tagToInsert = button.innerHTML;
        textarea.value = `${textarea.value.substring(0, cursorPos)}<${tagToInsert}>${singleTags.includes(tagToInsert) ? "" : `</${tagToInsert}>`}${textarea.value.substring(cursorPos, textarea.value.length)}`;
    } else {
        textarea.value = `${textarea.value.substring(0, cursorPos)}${text}${textarea.value.substring(cursorPos, textarea.value.length)}`;
    }

    // textarea.selectionStart = cursorPos + tagToInsert.length;
    // textarea.selectionEnd = textarea.selectionStart;

    textarea.focus();
}

function uploadImage(button, event) {
    event.preventDefault();

    imageButton.click()
}

imageButton.addEventListener('change', function() {
    const file = imageButton.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        fetch('/upload-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                const imgTag = `<img src="/images/posts/${data.imageName}.webp" alt="Uploaded Image" width="${data.width}" height="${data.height}" loading="lazy">`;
                insertTag(undefined, undefined, imgTag);
            }
        })
        .catch(error => console.error('Error uploading image:', error));
    }
})