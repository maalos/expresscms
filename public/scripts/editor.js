const previewWindow = document.getElementById("post-editor-preview")
const textarea = document.getElementById("content-textarea")
const previewHeader = "<p id=\"post-preview-corner-text\">Post preview</p>"

function updatePreviewWindow() {
    if (previewWindow.innerHTML != previewHeader + textarea.value.replaceAll("<img", "&lt;img"))
        previewWindow.innerHTML = previewHeader + textarea.value.replaceAll("<img", "&lt;img")
}

updatePreviewWindow()

setInterval(() => {
    updatePreviewWindow()
}, 3000)

const singleTags = ["img", "hr", "br"]

function iT(button, event) {
    event.preventDefault();
    var cursorPos = textarea.selectionStart;
    var tagToInsert = button.innerHTML;

    textarea.value = `${textarea.value.substring(0, cursorPos)}<${tagToInsert}>${singleTags.includes(tagToInsert) ? "" : `</${tagToInsert}>`}${textarea.value.substring(cursorPos, textarea.value.length)}`;

    textarea.selectionStart = cursorPos + tagToInsert.length + 2;
    textarea.selectionEnd = textarea.selectionStart;

    textarea.focus();
}