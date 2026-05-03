export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = request.headers.get("host") || "";
    const sub = getSubdomain(host);

    // -------------------------
    // CREATE / UPDATE SITE
    // -------------------------
    if (url.pathname === "/api/publish" && request.method === "POST") {
      const body = await request.json();

      const name = sanitize(body.name);
      const html = body.html || "<h1>Empty</h1>";
      const css = body.css || "";
      const js = body.js || "";

      await env.WEBSITES.put(`${name}/index.html`, html);
      await env.WEBSITES.put(`${name}/style.css`, css);
      await env.WEBSITES.put(`${name}/script.js`, js);

      return json({
        success: true,
        url: `https://${name}.weblet.xyz`
      });
    }

    // -------------------------
    // SERVE SITE (SUBDOMAIN)
    // -------------------------
    if (sub && sub !== "weblet") {
      const html = await env.WEBSITES.get(`${sub}/index.html`);
      const css = await env.WEBSITES.get(`${sub}/style.css`);
      const js = await env.WEBSITES.get(`${sub}/script.js`);

      if (!html) return new Response("Site not found", { status: 404 });

      const fullPage = buildPage(html, css, js);

      return new Response(fullPage, {
        headers: { "content-type": "text/html" }
      });
    }

    // -------------------------
    // DASHBOARD UI
    // -------------------------
    return new Response(dashboard(), {
      headers: { "content-type": "text/html" }
    });
  }
};

// -------------------------
// HELPERS
// -------------------------

function getSubdomain(host) {
  host = host.split(":")[0];
  const parts = host.split(".");
  if (parts.length < 3) return null;
  return parts[0];
}

function sanitize(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" }
  });
}

// -------------------------
// BUILD FINAL SITE
// -------------------------

function buildPage(html, css, js) {
  return `
<!DOCTYPE html>
<html>
<head>
<style>${css || ""}</style>
</head>
<body>
${html || ""}
<script>${js || ""}</script>
</body>
</html>
`;
}

// -------------------------
// DASHBOARD (NEW BUILDER)
// -------------------------

function dashboard() {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Weblet Studio</title>
  <style>
    body {
      font-family: Arial;
      background:#0b0f1a;
      color:white;
      text-align:center;
      padding:30px;
    }

    input, textarea {
      width:80%;
      margin:10px;
      padding:10px;
      border-radius:8px;
      border:none;
      background:#111827;
      color:white;
    }

    textarea { height:120px; font-family: monospace; }

    button {
      padding:10px 20px;
      border:none;
      border-radius:8px;
      background:#6366f1;
      color:white;
      cursor:pointer;
    }

    .row { margin-bottom: 20px; }
  </style>
</head>
<body>

<h1>Weblet Studio 🚀</h1>

<input id="name" placeholder="site name (e.g. peepee)" />

<div class="row">
  <h3>HTML</h3>
  <textarea id="html"><h1>Hello Weblet</h1></textarea>
</div>

<div class="row">
  <h3>CSS</h3>
  <textarea id="css">body { font-family: Arial; }</textarea>
</div>

<div class="row">
  <h3>JS</h3>
  <textarea id="js">console.log("hello")</textarea>
</div>

<button onclick="publish()">Publish</button>

<p id="out"></p>

<script>
async function publish() {
  const name = document.getElementById("name").value;
  const html = document.getElementById("html").value;
  const css = document.getElementById("css").value;
  const js = document.getElementById("js").value;

  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, html, css, js })
  });

  const data = await res.json();

  document.getElementById("out").innerHTML =
    "Live: <a href='" + data.url + "'>" + data.url + "</a>";
}
</script>

</body>
</html>
`;
}
