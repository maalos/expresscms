// eslint-disable-next-line no-unused-vars
function confirmDelete(index, type, type_plural) {
    if (window.confirm(`Are you sure you want to delete this ${type}?`))
        window.location.href = `/${type_plural}/${index}/delete`;
}