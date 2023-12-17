// eslint-disable-next-line no-unused-vars
function confirmDelete(index, type) {
    if (window.confirm(`Are you sure you want to delete this ${type}?`))
        window.location.href = `/delete-${type}/${index}`;
}