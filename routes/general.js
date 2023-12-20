module.exports = function(app, isAuthorized, categories, posts, users, sha256) {
    app.get('/', (req, res) => {
        res.render('home', { categories: categories, posts: posts, user: req.session.user });
    });

    app.get('/login', (req, res) => {
        res.render('login');
    });
    
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username == username && u.password == sha256(password));
    
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });
    
    app.get('/register', (req, res) => {
        res.render('register');
    });
    
    app.post('/register', (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username == username);
    
        if (!user) {
            req.session.user = { username: username, password: sha256(password), isAdmin: false };
            users.push(req.session.user);
            fs.writeFileSync('data/users.json', JSON.stringify(users, null, 4));
            res.redirect('/');
        } else {
            res.redirect('/register');
        }
    });

    app.get('/dashboard', isAuthorized, (req, res) => {
        res.render('dashboard', { categories, posts, users });
    });
}