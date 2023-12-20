module.exports = function(app, fs, isAuthorized, users, sha256) {
    app.get('/add-user', isAuthorized, (req, res) => {
        const newUserId = users.length
        const newUser = { username: "New user #" + newUserId, password: sha256(Date.now().toString()), isAdmin: false };
        users.push(newUser);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/edit-user/' + newUserId);
    });
    
    app.get('/edit-user/:id', isAuthorized, (req, res) => {
        const userId = req.params.id;
        const user = users[userId];
        if (!user) {
            return res.render('error', { errorCode: "404", errorMessage: "User not found." });
        }
    
        res.render('edit-user', { user, userId });
    });
    
    app.post('/edit-user/:id', isAuthorized, (req, res) => {
        const userId = req.params.id;
        const { username, password, isAdmin } = req.body;
        users[userId] = { username, password, isAdmin };
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
    
    app.get('/delete-user/:id', isAuthorized, (req, res) => {
        const userId = req.params.id;
        if (!users[userId]) {
            return res.render('error', { errorCode: "404", errorMessage: "User not found." });
        }
    
        users.splice(userId, 1);
        fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
        res.redirect('/dashboard');
    });
}