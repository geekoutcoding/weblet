const API_URL = "https://weblet.xyz/api/create"; // 🔥 CHANGE if your domain is different

document.getElementById("publish").addEventListener("click", publish);

async function publish() {
  const name = document.getElementById("name").value.trim();
  const html = document.getElementById("html").value;
  const result = document.getElementById("result");

  if (!name) {
    result.innerText = "Enter a site name";
    return;
  }

  result.innerText = "Publishing...";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, html })
    });

    // If server responded but error status
    if (!res.ok) {
      const text = await res.text();
      result.innerText = "Error: " + text;
      return;
    }

    const data = await res.json();

    if (data.url) {
      result.innerHTML =
        `🚀 Live: <a href="${data.url}" target="_blank">${data.url}</a>`;
    } else if (data.error) {
      result.innerText = data.error;
    } else {
      result.innerText = "Something went wrong";
    }

  } catch (err) {
    // THIS is your "request failed" fix
    console.error(err);
    result.innerText = "Request failed (check API URL / domain / routes)";
  }
}
