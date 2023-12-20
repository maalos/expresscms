module.exports = function(app, fs, isAuthorized, categories, posts) {
    app.get('/posts', (req, res) => {
        res.render('posts-index', { categories: categories, posts: posts, user: req.session.user });
    });

    app.get('/posts/:id', (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
        }
    
        res.render('post', { postId: postId, post: posts[postId], user: req.session.user, categories: categories });
    });

    app.get('/add-post', isAuthorized, (req, res) => {
        const newPostId = posts.length
        const newPost = { title: "New post", content: "New post's content", categoryId: 0, author: req.session.user.username, createdAt: Date.now(), lastModifiedAt: Date.now() };
        posts.push(newPost);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/edit-post/' + newPostId);
    });

    app.get('/edit-post/:id', isAuthorized, (req, res) => {
        const postId = req.params.id;
        const post = posts[postId];
        if (!post) {
            return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
        }
    
        res.render('edit-post', { post, postId, categories });
    });

    app.post('/edit-post/:id', isAuthorized, (req, res) => {
        const postId = req.params.id;
        const { title, content, categoryId, author } = req.body;
        posts[postId] = { title: title, content: content, categoryId: categoryId, author: author, createdAt: posts[postId].createdAt, lastModifiedAt: Date.now() };
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/delete-post/:id', isAuthorized, (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
        }
    
        posts.splice(postId, 1);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });
}