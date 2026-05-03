const express = require("express");
const fs = require("fs-extra");
const path = require("path");

const app = express();
const PORT = 3000;

// where sites are stored
const SITE_DIR = path.join(__dirname, "sites");

app.use(express.json());

// ----------------------------
// CREATE SITE
// ----------------------------
app.post("/api/create", async (req, res) => {
  const { name, html } = req.body;

  if (!name || !html) {
    return res.status(400).json({ error: "Missing name or html" });
  }

  const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const sitePath = path.join(SITE_DIR, safeName);

  // check if taken
  if (await fs.pathExists(sitePath)) {
    return res.status(409).json({ error: "Subdomain taken" });
  }

  // create site
  await fs.ensureDir(sitePath);
  await fs.writeFile(path.join(sitePath, "index.html"), html);

  res.json({
    success: true,
    url: `http://${safeName}.localhost:${PORT}`
  });
});

// ----------------------------
// SERVE SUBDOMAINS
// ----------------------------
app.use(async (req, res, next) => {
  const host = req.headers.host || "";
  const sub = host.split(".")[0];

  if (!sub || sub === "localhost") return next();

  const filePath = path.join(SITE_DIR, sub, "index.html");

  if (await fs.pathExists(filePath)) {
    return res.sendFile(filePath);
  }

  next();
});

// ----------------------------
// DEFAULT ROUTE
// ----------------------------
app.get("/", (req, res) => {
  res.send("Weblet server running");
});

// ----------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
