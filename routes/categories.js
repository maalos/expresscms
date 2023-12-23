module.exports = function(app, fs, isAdmin, categories, posts, generateNav) {
    function categoryNotFoundErrorObject(req) {
        return {
            ...generateNav(req),

            pageTitle: 'Error',
            contentModule: 'error',
            
            errorCode: "404",
            errorMessage: "Category not found."
        }
    }

    app.get('/categories', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'All categories',
            contentModule: 'categories',
            
            categories,
            posts,
            user: req.session.user
        });
    });

    app.get('/categories/:id', (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('generic', categoryNotFoundErrorObject(req));
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Category',
            contentModule: 'category',
            
            categoryId,
            category: categories[categoryId],
            user: req.session.user,
            posts: posts
        });
    });

    app.get('/categories/add', isAdmin, (req, res) => {
        const newCategoryId = categories.length
        const newCategory = { id: newCategoryId, title: "New category" };
        categories.push(newCategory);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect(`/categories/${newCategoryId}/edit`);
    });

    app.get('/categories/:id/edit', isAdmin, (req, res) => {
        const categoryId = req.params.id;
        const category = categories[categoryId];
        if (!category) {
            return res.render('generic', categoryNotFoundErrorObject(req));
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Edit category',
            contentModule: 'edit-category',
            
            category,
            categoryId,
            formAction: `/categories/${categoryId}/edit`
        });
    });
    
    app.post('/categories/:id/edit', isAdmin, (req, res) => {
        const categoryId = req.params.id;
        const { name } = req.body;
        categories[categoryId] = { id: categoryId, name: name };
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/categories/:id/delete', isAdmin, (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('generic', categoryNotFoundErrorObject(req));
        }
    
        categories.splice(categoryId, 1);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });
}