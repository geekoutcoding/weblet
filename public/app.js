let currentUser = null;

function render(html) {
    document.getElementById("app").innerHTML = `
        <div class="container">${html}</div>
    `;
}

// AUTH SCREEN
function showAuth() {
    render(`
        <div class="card">
            <h1>Weblet</h1>

            <h3>Login</h3>
            <input id="loginUser" placeholder="Username">
            <input id="loginPass" type="password" placeholder="Password">
            <button onclick="login()">Login</button>

            <h3>Signup</h3>
            <input id="signupUser" placeholder="Username">
            <input id="signupPass" type="password" placeholder="Password">
            <button onclick="signup()">Signup</button>
        </div>
    `);
}

// LOGIN
async function login() {
    let res = await fetch("/api/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: loginUser.value,
            password: loginPass.value
        })
    });

    let data = await res.json();
    if (data.error) return alert(data.error);

    currentUser = data.user;
    showDashboard();
}

// SIGNUP
async function signup() {
    let res = await fetch("/api/signup", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: signupUser.value,
            password: signupPass.value
        })
    });

    let data = await res.json();
    if (data.error) return alert(data.error);

    alert("Account created!");
}

// DASHBOARD
function showDashboard() {
    let html = `
        <div class="card">
            <h2>Welcome ${currentUser.username}</h2>
            <button onclick="createSite()">Create Site</button>
        </div>
    `;

    currentUser.sites.forEach((s, i) => {
        html += `
        <div class="site">
            <div>${s.name}.weblet.xyz</div>
            <div>
                <button onclick="editSite(${i})">Edit</button>
                <button onclick="viewSite(${i})">View</button>
            </div>
        </div>
        `;
    });

    render(html);
}

// CREATE SITE
async function createSite() {
    let name = prompt("Subdomain name:");
    if (!name) return;

    let res = await fetch("/api/create-site", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: currentUser.username,
            name
        })
    });

    let data = await res.json();
    if (data.error) return alert(data.error);

    location.reload();
}

// EDIT SITE
function editSite(i) {
    let site = currentUser.sites[i];

    render(`
        <div class="card">
            <h2>Editing ${site.name}</h2>
            <textarea id="editor">${site.html}</textarea>
            <button onclick="saveSite('${site.name}')">Save</button>
        </div>
    `);
}

// SAVE
async function saveSite(name) {
    let res = await fetch("/api/save-site", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            username: currentUser.username,
            name,
            html: editor.value
        })
    });

    let data = await res.json();
    if (data.error) return alert(data.error);

    alert("Saved!");
    showDashboard();
}

// VIEW
function viewSite(i) {
    let site = currentUser.sites[i];
    window.open(`http://${site.name}.weblet.xyz`);
}

// INIT
showAuth();
