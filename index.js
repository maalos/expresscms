const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const fs = require("fs");
const crypto = require("crypto");
const compression = require("compression");
const multer = require("multer");
const { exec } = require("child_process");
const sizeOf = require("image-size");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(session({ secret: "miguelmiguelmiguel", resave: true, saveUninitialized: true })); // remember to change the secret
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function isAuthorized(req, res, next) {
    const user = req.session && req.session.user;

    if (user && users.some(u => u.username === user.username && u.isAdmin))
        return next();

    res.render('generic', {
        breadcrumbs: ``,
        logintext: ``,
        dashboardtext: ``,

        pageTitle: 'Error',
        pageCategory: 'Error',
        contentModule: 'error',
        
        errorCode: "401",
        errorMessage: "Unauthorized."
    });
}

function sha256(input) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

function readJSONFile(filePath, defaultValue) {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : defaultValue;
};

let users = readJSONFile("data/users.json", [{
    "username": "admin",
    "password": sha256("admin"),
    "isAdmin": true
}]);

let posts = readJSONFile("data/posts.json", [{
    "title": "Default post's title",
    "content": "Default post's content",
    "categoryId": "0"
}]);

let categories = readJSONFile("data/categories.json", [{
    "id": 0,
    "name": "Uncategorised"
}]);

function generateBreadcrumbs(req) {
    const path = req.originalUrl;
    const segments = path.split("/").filter(segment => segment !== "");

    let breadcrumbsHTML = `<a href="/">Home</a> `;
    let currentPath = "";
    
    for (const segment of segments) {
        currentPath += `/${segment}`;
        const capitalizedSegment = segment.replace(/-/g, " ").charAt(0).toUpperCase() + segment.replace(/-/g, " ").slice(1);
        breadcrumbsHTML += `&raquo; <a href="${currentPath}">${capitalizedSegment}</a> `;
    }

    return breadcrumbsHTML;
};

function generateLoginText(req) {
    const user = req.session.user;

    if (user)
        return `<a href="/logout" id="logout"> ${user.username} (Log out)</a>`;

    return `<a href="/login" id="logout">Guest (Log in)</a>`;
}

require("./routes/general")(app, isAuthorized, categories, posts, users, sha256, generateBreadcrumbs, generateLoginText);
require("./routes/posts")(app, fs, isAuthorized, categories, posts, generateBreadcrumbs, generateLoginText);
require("./routes/users")(app, fs, isAuthorized, users, sha256, generateBreadcrumbs, generateLoginText);
require("./routes/media")(app, fs, isAuthorized, upload, exec, sizeOf);
require("./routes/categories")(app, fs, isAuthorized, categories, posts, generateBreadcrumbs, generateLoginText);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`ExpressCMS is running on http://localhost:${PORT}`);
});