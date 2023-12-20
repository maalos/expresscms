module.exports = function(app, fs, isAuthorized, categories, posts) {
    app.get('/categories', (req, res) => {
        res.render('categories-index', { categories: categories, posts: posts, user: req.session.user });
    });

    app.get('/categories/:id', (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('error', { errorCode: "404", errorMessage: "Category not found." });
        }
    
        res.render('category', { categoryId: categoryId, category: categories[categoryId], user: req.session.user, posts: posts });
    });

    app.get('/add-category', isAuthorized, (req, res) => {
        const newCategoryId = categories.length
        const newCategory = { id: newCategoryId, title: "New category" };
        categories.push(newCategory);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/edit-category/' + newCategoryId);
    });

    app.get('/edit-category/:id', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        const category = categories[categoryId];
        if (!category) {
            return res.render('error', { errorCode: "404", errorMessage: "Category not found." });
        }
    
        res.render('edit-category', { category, categoryId });
    });
    
    app.post('/edit-category/:id', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        const { name } = req.body;
        categories[categoryId] = { id: categoryId, name: name };
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });

    app.get('/delete-category/:id', isAuthorized, (req, res) => {
        const categoryId = req.params.id;
        if (!categories[categoryId]) {
            return res.render('error', { errorCode: "404", errorMessage: "Category not found." });
        }
    
        categories.splice(categoryId, 1);
        fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
        res.redirect('/dashboard');
    });
}