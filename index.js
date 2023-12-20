const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const multer = require('multer');
const { exec } = require('child_process');
const sizeOf = require('image-size');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(session({ secret: 'miguelmiguelmiguel', resave: true, saveUninitialized: true })); // remember to change the secret
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function isAuthorized(req, res, next) {
    const user = req.session && req.session.user;

    if (user && users.some(u => u.username === user.username && u.isAdmin))
        return next();

    res.render('error', { errorMessage: "Unauthorized", errorCode: "401" });
}

function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

function readJSONFile(filePath, defaultValue) {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : defaultValue;
};

let users = readJSONFile('data/users.json', [{
    "username": "admin",
    "password": sha256("admin"),
    "isAdmin": true
}]);

let posts = readJSONFile('data/posts.json', [{
    "title": "Loading posts...",
    "content": "",
    "categoryId": "0"
}]);

let categories = readJSONFile('data/categories.json', [{
    "id": 0,
    "name": "Uncategorised"
}]);

require("./routes/general")(app, isAuthorized, categories, posts, users, sha256);
require("./routes/posts")(app, fs, isAuthorized, categories, posts);
require("./routes/users")(app, fs, isAuthorized, users, sha256);
require("./routes/media")(app, fs, isAuthorized, upload, exec, sizeOf);
require("./routes/categories")(app, fs, isAuthorized, categories, posts);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ExpressCMS is running on http://localhost:${PORT}`);
});