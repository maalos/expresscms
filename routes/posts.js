module.exports = function(app, fs, isAdmin, categories, posts, users, generateNav) {
    function postNotFoundErrorObject(req) {
            return {
            ...generateNav(req),

            pageTitle: 'Error',
            contentModule: 'error',
            
            errorCode: "404",
            errorMessage: "Post not found."
        }
    }

    app.get('/posts', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Posts index',
            contentModule: 'posts',
            
            categories,
            posts,
            user: req.session.user
        });
    });

    app.get('/posts/:id', (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('generic', postNotFoundErrorObject(req));
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Post',
            contentModule: 'post',
            
            postId,
            post: posts[postId],
            user: req.session.user,
            users,
            categories
        });
    });

    app.get('/posts/add', isAdmin, (req, res) => {
        const newPostId = posts.length
        const newPost = { title: "New post", content: "New post's content", categoryId: 0, author: req.session.user.username, createdAt: Date.now(), lastModifiedAt: Date.now() };
        posts.push(newPost);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect(`/posts/${newPostId}/edit`);
    });

    app.get('/posts/:id/edit', isAdmin, (req, res) => {
        const postId = req.params.id;
        const post = posts[postId];
        if (!post) {
            return res.render('generic', postNotFoundErrorObject(req));
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Edit post',
            contentModule: 'edit-post',
            
            post,
            postId,
            categories,
            formAction: `/posts/${postId}/edit`
        });
    });

    app.post('/posts/:id/edit', isAdmin, (req, res) => {
        const postId = req.params.id;
        const { title, content, categoryId, author } = req.body;
        posts[postId] = { title: title, content: content, categoryId: categoryId, author: author, createdAt: posts[postId].createdAt, lastModifiedAt: Date.now() };
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/posts/:id/delete', isAdmin, (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('generic', postNotFoundErrorObject(req));
        }
    
        posts.splice(postId, 1);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });
}