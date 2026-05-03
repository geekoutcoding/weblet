export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CREATE SITE
    if (url.pathname === "/api/create" && request.method === "POST") {
      const { name, html } = await request.json();

      if (!name || !html) {
        return new Response("Missing name or html", { status: 400 });
      }

      const safeName = name.toLowerCase().replace(/[^a-z0-9-]/g, "");

      const existing = await env.WEBSITES.get(`${safeName}/index.html`);
      if (existing) {
        return new Response("Subdomain taken", { status: 409 });
      }

      await env.WEBSITES.put(`${safeName}/index.html`, html);

      return new Response(`https://${safeName}.weblet.xyz`);
    }

    return new Response("Worker running");
  }
};
