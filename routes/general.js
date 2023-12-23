module.exports = function(app, isAdmin, categories, posts, users, sha256, generateNav) {
    app.get('/', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Homepage',
            contentModule: 'home',
            
            categories,
            posts,
            user: req.session.user
        });
    });

    app.get('/login', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Log in',
            contentModule: 'login',
            
            categories,
            posts,
            users
        });
    });
    
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const user = users.find(u => u.username == username && u.password == sha256(password));
    
        if (user) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.redirect('/login?err=1');
        }
    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/');
    });
    
    app.get('/register', (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Register',
            contentModule: 'register',
            
            categories,
            posts,
            users
        });
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
            res.redirect('/register?err=1');
        }
    });

    app.get('/dashboard', isAdmin, (req, res) => {
        res.render('generic', {
            ...generateNav(req),

            pageTitle: 'Dashboard',
            contentModule: 'dashboard',
            
            categories,
            posts,
            users
        });
    });
}