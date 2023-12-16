const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const https = require('https');

function sha256(input) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(session({ secret: 'miguelmiguelmiguel', resave: true, saveUninitialized: true }));
app.use(express.static('public'));

function isAuthorized(req, res, next) {
    if (req.session && req.session.user) {
        for (const index in users) {
            if (users[index].username == req.session.user.username) {
                if (users[index].isAdmin == true) return next();
            }
        }
        return res.render('error', { errorMessage: "Unauthorized", errorCode: "401"});
    } else {
        return res.render('error', { errorMessage: "Unauthorized", errorCode: "401"});
    }
}

let users = [ // gets replaced if the users file exists
    {
        "username": "admin",
        "password": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // admin [sha256]
        "isAdmin": true
    }
];

let posts = [];

if (fs.existsSync('data/users.json')) {
    users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
}

if (fs.existsSync('data/posts.json')) {
    posts = JSON.parse(fs.readFileSync('data/posts.json', 'utf8'))
}

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === sha256(password));

    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

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
    res.render('dashboard', { posts });
});

app.get('/add-post', isAuthorized, (req, res) => {
    const newPost = { title: "New post", content: "New post's content", author: req.session.user.username, createdAt: Date.now(), lastModifiedAt: Date.now() };
    posts.push(newPost);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/edit-post/' + (posts.length - 1));
});

app.get('/edit-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    const post = posts[postId];
    if (!post) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    res.render('edit-post', { post, postId });
});

app.post('/edit-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    const { title, content, author } = req.body;
    posts[postId] = { title: title, content: content, author: author, createdAt: posts[postId].createdAt, lastModifiedAt: Date.now() };
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/dashboard');
});

app.get('/delete-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    if (!posts[postId]) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    posts.splice(postId, 1);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.render('posts-index', { posts: posts, user: req.session.user });
});

app.get('/posts', (req, res) => {
    res.redirect("/");
});

app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    if (!posts[postId]) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    res.render('post', { postId: postId, post: posts[postId], user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const privateKey = fs.readFileSync('data/server.key', 'utf8');
const certificate = fs.readFileSync('data/server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

const PORT_HTTPS = process.env.PORT_HTTPS || 3443;
httpsServer.listen(PORT_HTTPS, () => {
  console.log(`Server is running on https://localhost:${PORT_HTTPS}`);
});

const httpServer = express();
httpServer.use((req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});