const express = require("express");
const path = require("path");

const app = express();

// serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// helper: get subdomain
function getSubdomain(host) {
    if (!host) return null;

    host = host.split(":")[0]; // remove port
    const parts = host.split(".");

    if (parts.length < 3) return null;

    return parts[0];
}

// main handler
app.get("*", (req, res) => {
    const host = (req.headers.host || "").split(":")[0];

    // MAIN DOMAIN
    if (host === "weblet.xyz" || host === "www.weblet.xyz") {
        return res.sendFile(path.join(__dirname, "public", "index.html"));
    }

    // SUBDOMAIN
    const sub = getSubdomain(host);

    if (sub) {
        return res.send(`
            <h1 style="font-family:sans-serif;text-align:center;margin-top:20%">
                ${sub}.weblet.xyz is working 🚀
            </h1>
        `);
    }

    // fallback
    res.status(404).send("Not found");
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
