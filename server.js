const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Detect subdomain
function getSubdomain(host) {
    let parts = host.split(".");
    if (parts.length < 3) return null;
    return parts[0];
}

// Handle subdomains
app.get("*", (req, res, next) => {
    let host = req.headers.host;

    // MAIN DOMAIN → load frontend
    if (host === "weblet.xyz" || host.startsWith("www.")) {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    }

    let sub = getSubdomain(host);

    if (sub) {
        // TEMP: show subdomain works
        return res.send(`<h1>${sub}.weblet.xyz is working 🚀</h1>`);
    }

    next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running"));
