const container = document.getElementById("fiches-container");
const ficheView = document.getElementById("fiche-view");
const home = document.getElementById("home");

function renderFiches(list) {
    container.innerHTML = "";
    list.forEach(f => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${f.titre}</h3>
            <p>${f.description}</p>
            <p><strong>${f.matiere}</strong> • ${f.difficulte}</p>
            <p>${f.tags.map(t => `<span class="tag">${t}</span>`).join("")}</p>
            <small>${f.date} — ${f.auteur}</small>
        `;
        div.onclick = () => openFiche(f.id);
        container.appendChild(div);
    });
}

function openFiche(id) {
    const fiche = fiches.find(f => f.id === id);
    if (!fiche) return;

    history.pushState({}, "", `?fiche=${id}`);
    home.classList.add("hidden");
    ficheView.classList.remove("hidden");
    ficheView.innerHTML = fiche.contenu;
}

function copyText(text) {
    navigator.clipboard.writeText(text);
    alert("Texte copié !");
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fiche");
    if (id) openFiche(id);
}

renderFiches(fiches);
loadFromURL();
