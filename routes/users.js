module.exports = function(app, fs, isAdmin, users, posts, sha256, generateNav) {
    function userNotFoundErrorObject(req) {
        return {
            ...generateNav(req),

            pageTitle: 'Error',
            contentModule: 'error',
            
            errorCode: "404",
            errorMessage: "User not found."
        }
    }

    app.get('/users', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Users',
            contentModule: 'users',

            users,
            user: req.session.user
        });
    });

    app.get('/users/:id', (req, res) => {
        const userId = req.params.id;
        const user = users[userId];
        if (!user) {
            return userNotFoundErrorObject(req);
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'User',
            contentModule: 'user',

            user,
            userId,
            posts,
        });
    });

    app.get('/users/add', isAdmin, (req, res) => {
        const newUserId = users.length
        const newUser = { username: "New user #" + newUserId, password: sha256(Date.now().toString()), isAdmin: false };
        users.push(newUser);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect(`/users/${newUserId}/edit`);
    });
    
    app.get('/users/:id/edit', isAdmin, (req, res) => {
        const userId = req.params.id;
        const user = users[userId];
        if (!user) {
            return userNotFoundErrorObject(req);
        }
    
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Edit user',
            contentModule: 'edit-user',

            user,
            userId,
            formAction: `/users/${userId}/edit`
        });
    });
    
    app.post('/users/:id/edit', isAdmin, (req, res) => {
        const userId = req.params.id;
        const { username, password, isAdmin } = req.body;
        users[userId] = { username, password, isAdmin };
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
    
    app.get('/users/:id/delete', isAdmin, (req, res) => {
        const userId = req.params.id;
        if (!users[userId]) {
            return userNotFoundErrorObject(req);
        }
    
        users.splice(userId, 1);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
}