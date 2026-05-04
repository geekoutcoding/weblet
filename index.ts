export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const host = url.hostname;

    const ROOT = "weblet.xyz";

    // ---------------- API: CREATE SITE ----------------
    if (url.pathname === "/api/create" && request.method === "POST") {
      let data;

      try {
        data = await request.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const name = (data.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      const html = data.html || "<h1>Hello</h1>";

      if (!name) {
        return new Response("Invalid name", { status: 400 });
      }

      // check if taken
      const exists = await env.WEBSITES.get(`${name}/index.html`);
      if (exists) {
        return new Response("Subdomain taken", { status: 409 });
      }

      // save site
      await env.WEBSITES.put(`${name}/index.html`, html);

      return new Response(
        JSON.stringify({
          url: `https://${name}.${ROOT}`
        }),
        {
          headers: { "content-type": "application/json" }
        }
      );
    }

    // ---------------- SERVE SUBDOMAIN SITES ----------------
    let sub: string | null = null;

    if (host.endsWith(ROOT)) {
      const withoutRoot = host.replace(`.${ROOT}`, "");
      if (withoutRoot !== ROOT) {
        const parts = withoutRoot.split(".");
        sub = parts[0];
      }
    }

    if (sub && sub !== "weblet" && sub !== "") {
      const html = await env.WEBSITES.get(`${sub}/index.html`);

      if (html) {
        return new Response(html, {
          headers: { "content-type": "text/html" }
        });
      }

      return new Response("Site not found", { status: 404 });
    }

    // ---------------- ROOT (your main site) ----------------
    return new Response("Weblet running 🚀");
  }
};
