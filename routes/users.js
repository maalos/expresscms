module.exports = function(app, fs, isAuthorized, users, sha256, generateBreadcrumbs, generateLoginText) {
    app.get('/users/add', isAuthorized, (req, res) => {
        const newUserId = users.length
        const newUser = { username: "New user #" + newUserId, password: sha256(Date.now().toString()), isAdmin: false };
        users.push(newUser);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect(`/users/${newUserId}/edit`);
    });
    
    app.get('/users/:id/edit', isAuthorized, (req, res) => {
        const userId = req.params.id;
        const user = users[userId];
        if (!user) {
            return res.render('error', { errorCode: "404", errorMessage: "User not found." });
        }
    
        res.render('generic', {
            breadcrumbs: generateBreadcrumbs(req),
            logintext: generateLoginText(req),
            dashboardtext: (req.session.user && (req.session.user.isAdmin == true || req.session.user.isAdmin == "true") ? `<a href="/dashboard" id="dashboard">Dashboard</a>` : ``),

            pageTitle: 'Edit user',
            pageCategory: 'Users',
            contentModule: 'edit-user',

            user,
            userId,
            formAction: `/users/${userId}/edit`
        });
    });
    
    app.post('/users/:id/edit', isAuthorized, (req, res) => {
        const userId = req.params.id;
        const { username, password, isAdmin } = req.body;
        users[userId] = { username, password, isAdmin };
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
    
    app.get('/users/:id/delete', isAuthorized, (req, res) => {
        const userId = req.params.id;
        if (!users[userId]) {
            return res.render('error', { errorCode: "404", errorMessage: "User not found." });
        }
    
        users.splice(userId, 1);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
}