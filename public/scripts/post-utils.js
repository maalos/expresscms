function confirmDelete(postIndex) {
    var confirmation = window.confirm("Are you sure you want to delete this post?");
    if (confirmation) {
        window.location.href = "/delete-post/" + postIndex;
    }
}