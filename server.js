const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const DB_FILE = "db.json";

// LOAD DB
function loadDB() {
    if (!fs.existsSync(DB_FILE)) return { users: [] };
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// SAVE DB
function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// GET SUBDOMAIN
function getSubdomain(host) {
    let parts = host.split(".");
    if (parts.length < 3) return null;
    return parts[0];
}

// 🌍 SERVE USER SITES
app.get("*", (req, res, next) => {
    let host = req.headers.host;

    // skip main domain
    if (host === "weblet.xyz" || host.startsWith("www.")) {
        return next();
    }

    let sub = getSubdomain(host);
    if (!sub) return next();

    let db = loadDB();

    for (let user of db.users) {
        let site = user.sites.find(s => s.name === sub);
        if (site) {
            return res.send(site.html);
        }
    }

    res.send("<h1>Site not found</h1>");
});

// 🧑 SIGNUP
app.post("/api/signup", (req, res) => {
    let db = loadDB();
    let { username, password } = req.body;

    if (db.users.find(u => u.username === username)) {
        return res.json({ error: "User exists" });
    }

    db.users.push({
        username,
        password,
        sites: [],
        dnsSlots: 5
    });

    saveDB(db);
    res.json({ success: true });
});

// 🔐 LOGIN
app.post("/api/login", (req, res) => {
    let db = loadDB();
    let { username, password } = req.body;

    let user = db.users.find(
        u => u.username === username && u.password === password
    );

    if (!user) return res.json({ error: "Invalid login" });

    res.json({ success: true, user });
});

// ➕ CREATE SITE
app.post("/api/create-site", (req, res) => {
    let db = loadDB();
    let { username, name } = req.body;

    let user = db.users.find(u => u.username === username);
    if (!user) return res.json({ error: "User not found" });

    if (user.sites.length >= 3) {
        return res.json({ error: "Max 3 sites" });
    }

    if (user.sites.find(s => s.name === name)) {
        return res.json({ error: "Name taken" });
    }

    user.sites.push({
        name,
        html: "<h1>Hello World</h1>"
    });

    saveDB(db);
    res.json({ success: true });
});

// 💾 SAVE SITE
app.post("/api/save-site", (req, res) => {
    let db = loadDB();
    let { username, name, html } = req.body;

    let user = db.users.find(u => u.username === username);
    if (!user) return res.json({ error: "User not found" });

    let site = user.sites.find(s => s.name === name);
    if (!site) return res.json({ error: "Site not found" });

    site.html = html;

    saveDB(db);
    res.json({ success: true });
});

// 🚀 START
app.listen(80, () => {
    console.log("Server running on port 80");
});
