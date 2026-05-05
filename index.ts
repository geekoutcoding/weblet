export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const host = url.hostname;

    const ROOT = "weblet.xyz";

    // ---------------- API ----------------
    return new Response("WORKER HIT");
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

      const exists = await env.WEBSITES.get(`${name}/index.html`);
      if (exists) {
        return new Response("Subdomain taken", { status: 409 });
      }

      await env.WEBSITES.put(`${name}/index.html`, html);

      return new Response(
        JSON.stringify({ url: `https://${name}.${ROOT}` }),
        { headers: { "content-type": "application/json" } }
      );
    }

    // ---------------- SUBDOMAIN ----------------
    if (host.endsWith(`.${ROOT}`)) {
      const sub = host.replace(`.${ROOT}`, "").split(".")[0];

      if (sub && sub !== "www") {
        const html = await env.WEBSITES.get(`${sub}/index.html`);

        if (html) {
          return new Response(html, {
            headers: { "content-type": "text/html" }
          });
        }

        return new Response("Site not found", { status: 404 });
      }
    }

    // ---------------- MAIN SITE ----------------
    // THIS is what you were missing
    // serve your frontend files

    return fetch(request); // let Pages/static handle it
  }
};
