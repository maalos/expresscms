const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const https = require('https');
const multer = require('multer');
const { exec } = require('child_process');
var sizeOf = require('image-size');


function sha256(input) {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex');
}

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

let posts = [
    {
        "title": "Loading posts...",
        "content": "",
        "categoryId": "0"
    },
];

let categories = [
    {
        "id": 0,
        "name": "Uncategorised"
    },
];

if (fs.existsSync('data/users.json')) {
    users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
}

if (fs.existsSync('data/categories.json')) {
    categories = JSON.parse(fs.readFileSync('data/categories.json', 'utf8'))
}

if (fs.existsSync('data/posts.json')) {
    posts = JSON.parse(fs.readFileSync('data/posts.json', 'utf8'))
}

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

app.get('/add-post', isAuthorized, (req, res) => {
    const newPostId = posts.length
    const newPost = { title: "New post", content: "New post's content", categoryId: 0, author: req.session.user.username, createdAt: Date.now(), lastModifiedAt: Date.now() };
    posts.push(newPost);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/edit-post/' + newPostId);
});

app.get('/add-category', isAuthorized, (req, res) => {
    const newCategoryId = categories.length
    const newCategory = { id: newCategoryId, title: "New category" };
    categories.push(newCategory);
    fs.writeFileSync('data/categories.json', JSON.stringify(categories, null, 2));
    res.redirect('/edit-category/' + newCategoryId);
});

app.get('/add-user', isAuthorized, (req, res) => {
    const newUserId = users.length
    const newUser = { username: "New user #" + newUserId, password: sha256(Date.now().toString()), isAdmin: false };
    users.push(newUser);
    fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
    res.redirect('/edit-user/' + newUserId);
});

app.get('/edit-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    const post = posts[postId];
    if (!post) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    res.render('edit-post', { post, postId, categories });
});

app.post('/edit-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    const { title, content, categoryId, author } = req.body;
    posts[postId] = { title: title, content: content, categoryId: categoryId, author: author, createdAt: posts[postId].createdAt, lastModifiedAt: Date.now() };
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
    res.redirect('/dashboard');
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

app.get('/delete-post/:id', isAuthorized, (req, res) => {
    const postId = req.params.id;
    if (!posts[postId]) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    posts.splice(postId, 1);
    fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
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

app.get('/delete-user/:id', isAuthorized, (req, res) => {
    const userId = req.params.id;
    if (!users[userId]) {
        return res.render('error', { errorCode: "404", errorMessage: "User not found." });
    }

    users.splice(userId, 1);
    fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/', (req, res) => {
    res.render('home', { categories: categories, posts: posts, user: req.session.user });
});

app.get('/posts', (req, res) => {
    res.render('posts-index', { categories: categories, posts: posts, user: req.session.user });
});

app.get('/categories', (req, res) => {
    res.render('categories-index', { categories: categories, posts: posts, user: req.session.user });
});

app.get('/posts/:id', (req, res) => {
    const postId = req.params.id;
    if (!posts[postId]) {
        return res.render('error', { errorCode: "404", errorMessage: "Post not found." });
    }

    res.render('post', { postId: postId, post: posts[postId], user: req.session.user, categories: categories });
});

app.get('/categories/:id', (req, res) => {
    const categoryId = req.params.id;
    if (!categories[categoryId]) {
        return res.render('error', { errorCode: "404", errorMessage: "Category not found." });
    }

    res.render('category', { categoryId: categoryId, category: categories[categoryId], user: req.session.user, posts: posts });
});

app.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided.' });
    }

    const imageName = `img_${Date.now()}`;
    const imagePathTmp = `./public/images/posts/tmp/${imageName}.${req.file.mimetype.split('/')[1]}`;
    const imagePathWebp = `./public/images/posts/${imageName}.webp`;

    fs.writeFileSync(imagePathTmp, req.file.buffer);

    const cwebpCommand = `cwebp -q 70 ${imagePathTmp} -o ${imagePathWebp}`;
    exec(cwebpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error converting image to WebP:', error);
            return res.status(500).json({ error: 'Error converting image to WebP.' });
        }

        fs.rmSync(imagePathTmp);

        sizeOf(imagePathWebp, function (error, dimensions) {
            if (error)
                console.error(error)

            res.json({ imageName, width: dimensions.width, height: dimensions.height });
        });
    });
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