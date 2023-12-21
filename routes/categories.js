module.exports = function(app, fs, isAuthorized, categories, posts, generateBreadcrumbs, generateLoginText) {
    const categoryNotFoundErrorObject = {
        breadcrumbs: ``,
        logintext: ``,
        dashboardtext: ``,

        pageTitle: 'Error',
        pageCategory: 'Error',
        contentModule: 'error',
        
        errorCode: "404",
        errorMessage: "Category not found."
    };

    app.get('/categories', (req, res) => {
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'All categories',
            pageCategory: 'All categories',
            contentModule: 'categories-index',
            
            categories,
            posts,
            user: req.session.user
        });
    });

    app.get('/categories/:id', (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('generic', categoryNotFoundErrorObject);
        }
    
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Category',
            pageCategory: 'Category',
            contentModule: 'category',
            
            categoryId,
            category: categories[categoryId],
            user: req.session.user,
            posts: posts
        });
    });

    app.get('/categories/add', isAuthorized, (req, res) => {
        const newCategoryId = categories.length
        const newCategory = { id: newCategoryId, title: "New category" };
        categories.push(newCategory);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect(`/categories/${newCategoryId}/edit`);
    });

    app.get('/categories/:id/edit', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        const category = categories[categoryId];
        if (!category) {
            return res.render('generic', categoryNotFoundErrorObject);
        }
    
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Edit category',
            pageCategory: 'Categories',
            contentModule: 'edit-category',
            
            category,
            categoryId,
            formAction: `/categories/${categoryId}/edit`
        });
    });
    
    app.post('/categories/:id/edit', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        const { name } = req.body;
        categories[categoryId] = { id: categoryId, name: name };
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/categories/:id/delete', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('generic', categoryNotFoundErrorObject);
        }
    
        categories.splice(categoryId, 1);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });
}