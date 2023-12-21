module.exports = function(app, fs, isAuthorized, categories, posts, generateBreadcrumbs, generateLoginText) {
    const postNotFoundErrorObject = {
        breadcrumbs: ``,
        logintext: ``,
        dashboardtext: ``,

        pageTitle: 'Error',
        pageCategory: 'Error',
        contentModule: 'error',
        
        errorCode: "404",
        errorMessage: "Post not found."
    }

    app.get('/posts', (req, res) => {
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Posts index',
            pageCategory: 'Posts index',
            contentModule: 'posts-index',
            
            categories,
            posts,
            user: req.session.user
        });
    });

    app.get('/posts/:id', (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('generic', postNotFoundErrorObject);
        }
    
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Post',
            pageCategory: 'Post',
            contentModule: 'post',
            
            postId,
            post: posts[postId],
            user: req.session.user,
            categories
        });
    });

    app.get('/posts/add', isAuthorized, (req, res) => {
        const newPostId = posts.length
        const newPost = { title: "New post", content: "New post's content", categoryId: 0, author: req.session.user.username, createdAt: Date.now(), lastModifiedAt: Date.now() };
        posts.push(newPost);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect(`/posts/${newPostId}/edit`);
    });

    app.get('/posts/:id/edit', isAuthorized, (req, res) => {
        const postId = req.params.id;
        const post = posts[postId];
        if (!post) {
            return res.render('generic', postNotFoundErrorObject);
        }
    
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Edit post',
            pageCategory: 'Posts',
            contentModule: 'edit-post',
            
            post,
            postId,
            categories,
            formAction: `/posts/${postId}/edit`
        });
    });

    app.post('/posts/:id/edit', isAuthorized, (req, res) => {
        const postId = req.params.id;
        const { title, content, categoryId, author } = req.body;
        posts[postId] = { title: title, content: content, categoryId: categoryId, author: author, createdAt: posts[postId].createdAt, lastModifiedAt: Date.now() };
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/posts/:id/delete', isAuthorized, (req, res) => {
        const postId = req.params.id;
        if (!posts[postId]) {
            return res.render('generic', postNotFoundErrorObject);
        }
    
        posts.splice(postId, 1);
        fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
        res.redirect('/dashboard');
    });
}