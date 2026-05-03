document.getElementById("publish").addEventListener("click", publish);

async function publish() {
  const name = document.getElementById("name").value.trim();
  const html = document.getElementById("html").value;
  const css = document.getElementById("css").value;
  const js = document.getElementById("js").value;

  if (!name) {
    alert("Enter a site name");
    return;
  }

  try {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, html, css, js })
    });

    const data = await res.json();

    if (data.url) {
      document.getElementById("result").innerHTML =
        `🚀 Live: <a href="${data.url}" target="_blank">${data.url}</a>`;
    } else {
      document.getElementById("result").innerText = "Error creating site";
    }

  } catch (err) {
    document.getElementById("result").innerText = "Request failed";
    console.error(err);
  }
}
