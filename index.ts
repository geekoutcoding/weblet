export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const host = url.hostname;
    const sub = host.split(".")[0];

    // ----------------------------
    // API: CREATE SITE
    // ----------------------------
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

      const html = data.html || "<h1>Empty</h1>";

      if (!name) {
        return new Response("Invalid name", { status: 400 });
      }

      // check if taken
      const existing = await env.WEBSITES.get(`${name}/index.html`);
      if (existing) {
        return new Response("Subdomain taken", { status: 409 });
      }

      // save site
      await env.WEBSITES.put(`${name}/index.html`, html);

      return new Response(
        JSON.stringify({
          success: true,
          url: `https://${name}.weblet.xyz`
        }),
        { headers: { "content-type": "application/json" } }
      );
    }

    // ----------------------------
    // SERVE SUBDOMAIN SITES
    // ----------------------------
    if (sub && sub !== "weblet") {
      const html = await env.WEBSITES.get(`${sub}/index.html`);

      if (html) {
        return new Response(html, {
          headers: { "content-type": "text/html" }
        });
      }

      return new Response("Site not found", { status: 404 });
    }

    // ----------------------------
    // ROOT
    // ----------------------------
    return new Response("Weblet is running 🚀");
  }
};
