// script.js - Logique principale avec gestion d'erreurs améliorée

// Variables globales
let fiches = [];
let filtresActifs = {
    recherche: '',
    matiere: '',
    difficulte: '',
    auteur: '',
    tags: [],
    view: 'grid'
};
let fichesFiltrees = [];
let ficheCourante = null;
let pageCourante = 1;
let fichesParPage = 12;

// Cache pour les fiches chargées
const cacheFiches = new Map();

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    try {
        initialiserApplication();
    } catch (error) {
        afficherErreur('Erreur lors de l\'initialisation de l\'application', error);
    }
});

// Initialiser l'application
function initialiserApplication() {
    // Vérifier que les données sont disponibles
    if (typeof fichesData === 'undefined') {
        throw new Error('Les données des fiches ne sont pas disponibles');
    }
    
    fiches = [...fichesData];
    fichesFiltrees = [...fiches];
    
    // Initialiser l'interface
    initialiserInterface();
    
    // Initialiser les événements
    initialiserEvenements();
    
    // Afficher les statistiques
    mettreAJourStatistiques();
    
    // Afficher les fiches
    afficherFiches();
    
    // Mettre à jour le statut
    mettreAJourStatut('success', `${fiches.length} fiches chargées avec succès`);
}

// Initialiser l'interface
function initialiserInterface() {
    // Remplir les filtres
    remplirFiltres();
    
    // Mettre à jour la version
    document.getElementById('version-number').textContent = CONFIG.site.version;
    
    // Appliquer les couleurs du thème
    appliquerCouleursTheme();
}

// Remplir les filtres avec les données disponibles
function remplirFiltres() {
    const matieres = [...new Set(fiches.map(f => f.matiere))];
    const auteurs = [...new Set(fiches.map(f => f.auteur))];
    const difficultees = [...new Set(fiches.map(f => f.difficulte))];
    
    // Matières
    const matiereSelect = document.getElementById('matiere-filter');
    matieres.forEach(matiere => {
        const option = document.createElement('option');
        option.value = matiere;
        option.textContent = matiere;
        matiereSelect.appendChild(option);
    });
    
    // Auteurs
    const auteurSelect = document.getElementById('auteur-filter');
    auteurs.forEach(auteur => {
        const option = document.createElement('option');
        option.value = auteur;
        option.textContent = auteur;
        auteurSelect.appendChild(option);
    });
    
    // Difficultés
    const difficulteSelect = document.getElementById('difficulte-filter');
    difficultees.forEach(difficulte => {
        const option = document.createElement('option');
        option.value = difficulte;
        option.textContent = traduireDifficulte(difficulte);
        difficulteSelect.appendChild(option);
    });
    
    // Tags populaires
    const popularTagsContainer = document.getElementById('popular-tags');
    const tagsCount = {};
    fiches.forEach(fiche => {
        fiche.tags.forEach(tag => {
            tagsCount[tag] = (tagsCount[tag] || 0) + 1;
        });
    });
    
    const tagsPopulaires = Object.entries(tagsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    
    tagsPopulaires.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'filter-tag';
        tagElement.textContent = tag;
        tagElement.dataset.tag = tag;
        tagElement.addEventListener('click', function() {
            toggleTagFiltre(tag);
        });
        popularTagsContainer.appendChild(tagElement);
    });
    
    // Tendances (les fiches les plus récentes)
    const trendingList = document.getElementById('trending-list');
    const fichesTendances = [...fiches]
        .sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')))
        .slice(0, 5);
    
    fichesTendances.forEach((fiche, index) => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        item.innerHTML = `
            <span class="trending-rank">${index + 1}</span>
            <span class="trending-title">${fiche.titre}</span>
        `;
        item.addEventListener('click', () => ouvrirFiche(fiche.id));
        trendingList.appendChild(item);
    });
}

// Appliquer les couleurs du thème
function appliquerCouleursTheme() {
    const root = document.documentElement;
    Object.entries(CONFIG.couleurs).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
    });
}

// Initialiser les événements
function initialiserEvenements() {
    // Recherche
    document.getElementById('search-input').addEventListener('input', function(e) {
        filtresActifs.recherche = e.target.value;
        filtrerEtAfficherFiches();
    });
    
    document.getElementById('search-clear').addEventListener('click', function() {
        document.getElementById('search-input').value = '';
        filtresActifs.recherche = '';
        filtrerEtAfficherFiches();
    });
    
    // Filtres
    document.getElementById('matiere-filter').addEventListener('change', function(e) {
        filtresActifs.matiere = e.target.value;
        filtrerEtAfficherFiches();
    });
    
    document.getElementById('difficulte-filter').addEventListener('change', function(e) {
        filtresActifs.difficulte = e.target.value;
        filtrerEtAfficherFiches();
    });
    
    document.getElementById('auteur-filter').addEventListener('change', function(e) {
        filtresActifs.auteur = e.target.value;
        filtrerEtAfficherFiches();
    });
    
    // Filtres rapides
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            if (filter === 'all') {
                filtresActifs.recherche = '';
                document.getElementById('search-input').value = '';
            } else if (filter === 'recent') {
                // Filtrer pour les fiches des 7 derniers jours
                const dateLimite = new Date();
                dateLimite.setDate(dateLimite.getDate() - 7);
                // Ce filtre serait appliqué dans la fonction de filtrage
            }
            filtrerEtAfficherFiches();
        });
    });
    
    // Filtres de difficulté
    document.querySelectorAll('.difficulty-filter').forEach(filter => {
        filter.addEventListener('click', function() {
            const level = this.dataset.level;
            filtresActifs.difficulte = filtresActifs.difficulte === level ? '' : level;
            filtrerEtAfficherFiches();
        });
    });
    
    // Tri
    document.getElementById('sort-by').addEventListener('change', function() {
        trierFiches();
        afficherFiches();
    });
    
    // Affichage
    document.getElementById('display-count').addEventListener('change', function(e) {
        fichesParPage = e.target.value === 'all' ? fichesFiltrees.length : parseInt(e.target.value);
        pageCourante = 1;
        afficherFiches();
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtresActifs.view = this.dataset.view;
            afficherFiches();
        });
    });
    
    // Boutons d'action
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('stats-btn').addEventListener('click', afficherStatistiques);
    document.getElementById('export-btn').addEventListener('click', exporterDonnees);
    document.getElementById('contribute-btn').addEventListener('click', function() {
        window.open(CONFIG.footerLinks.github, '_blank');
    });
    
    // Navigation modale
    document.getElementById('prev-fiche').addEventListener('click', naviguerFichePrecedente);
    document.getElementById('next-fiche').addresseEventListener('click', naviguerFicheSuivante);
    document.getElementById('fiche-print').addEventListener('click', imprimerFiche);
    document.getElementById('fiche-favorite').addEventListener('click', toggleFavori);
    
    // Fermer modales
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Fermer modale en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Fermer toast
    document.querySelector('.toast-close').addEventListener('click', function() {
        document.getElementById('error-toast').style.display = 'none';
    });
    
    // Gestion de l'URL
    window.addEventListener('popstate', chargerFicheDepuisURL);
    chargerFicheDepuisURL();
}

// Toggle un tag dans les filtres
function toggleTagFiltre(tag) {
    const index = filtresActifs.tags.indexOf(tag);
    if (index === -1) {
        filtresActifs.tags.push(tag);
    } else {
        filtresActifs.tags.splice(index, 1);
    }
    filtrerEtAfficherFiches();
}

// Filtrer et afficher les fiches
function filtrerEtAfficherFiches() {
    try {
        filtrerFiches();
        trierFiches();
        afficherFiches();
        mettreAJourCompteurResultats();
    } catch (error) {
        afficherErreur('Erreur lors du filtrage des fiches', error);
    }
}

// Filtrer les fiches
function filtrerFiches() {
    fichesFiltrees = fiches.filter(fiche => {
        // Filtre par recherche
        if (filtresActifs.recherche) {
            const recherche = filtresActifs.recherche.toLowerCase();
            const matchRecherche = 
                fiche.titre.toLowerCase().includes(recherche) ||
                fiche.description.toLowerCase().includes(recherche) ||
                fiche.matiere.toLowerCase().includes(recherche) ||
                fiche.auteur.toLowerCase().includes(recherche) ||
                fiche.tags.some(tag => tag.toLowerCase().includes(recherche));
            if (!matchRecherche) return false;
        }
        
        // Filtre par matière
        if (filtresActifs.matiere && fiche.matiere !== filtresActifs.matiere) {
            return false;
        }
        
        // Filtre par difficulté
        if (filtresActifs.difficulte && fiche.difficulte !== filtresActifs.difficulte) {
            return false;
        }
        
        // Filtre par auteur
        if (filtresActifs.auteur && fiche.auteur !== filtresActifs.auteur) {
            return false;
        }
        
        // Filtre par tags
        if (filtresActifs.tags.length > 0) {
            const matchTags = filtresActifs.tags.every(tag => fiche.tags.includes(tag));
            if (!matchTags) return false;
        }
        
        return true;
    });
    
    pageCourante = 1; // Réinitialiser à la première page après filtrage
}

// Trier les fiches
function trierFiches() {
    const tri = document.getElementById('sort-by').value;
    
    fichesFiltrees.sort((a, b) => {
        switch(tri) {
            case 'date-desc':
                return new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-'));
            case 'date-asc':
                return new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'));
            case 'titre-asc':
                return a.titre.localeCompare(b.titre);
            case 'difficulte-asc':
                const ordreDifficulte = { 'facile': 1, 'moyen': 2, 'difficile': 3 };
                return ordreDifficulte[a.difficulte] - ordreDifficulte[b.difficulte];
            case 'popularite':
                // Simuler la popularité par le nombre de tags
                return b.tags.length - a.tags.length;
            default:
                return 0;
        }
    });
}

// Afficher les fiches
function afficherFiches() {
    const container = document.getElementById('fiches-container');
    const pagination = document.getElementById('pagination');
    
    try {
        // Calculer les fiches à afficher pour la page courante
        const debut = (pageCourante - 1) * fichesParPage;
        const fin = debut + fichesParPage;
        const fichesPage = fichesParPage === fichesFiltrees.length ? 
            fichesFiltrees : 
            fichesFiltrees.slice(debut, fin);
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Afficher le message si aucun résultat
        if (fichesFiltrees.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--text-tertiary); margin-bottom: 1rem;"></i>
                    <h3>Aucune fiche trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche ou vos filtres.</p>
                    <button class="btn-small" onclick="reinitialiserFiltres()">
                        <i class="fas fa-redo"></i> Réinitialiser les filtres
                    </button>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }
        
        // Appliquer la classe de vue
        container.className = `fiches-container ${filtresActifs.view}-view`;
        
        // Afficher les fiches
        fichesPage.forEach(fiche => {
            const card = creerCarteFiche(fiche);
            container.appendChild(card);
        });
        
        // Afficher la pagination si nécessaire
        if (fichesParPage < fichesFiltrees.length) {
            afficherPagination();
        } else {
            pagination.innerHTML = '';
        }
        
    } catch (error) {
        afficherErreur('Erreur lors de l\'affichage des fiches', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur d'affichage</h3>
                <p>Impossible d'afficher les fiches. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Créer une carte de fiche
function creerCarteFiche(fiche) {
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.dataset.id = fiche.id;
    
    const description = fiche.description.length > 120 ? 
        fiche.description.substring(0, 120) + '...' : 
        fiche.description;
    
    card.innerHTML = `
        <div class="fiche-header">
            <div class="fiche-category">
                <i class="fas fa-book"></i>
                ${fiche.matiere}
            </div>
            <h3 class="fiche-title">${fiche.titre}</h3>
            <p class="fiche-description">${description}</p>
            <div class="fiche-meta">
                <div class="fiche-author">
                    <div class="author-avatar">${fiche.auteur.charAt(0)}</div>
                    ${fiche.auteur}
                </div>
                <div class="fiche-date">${fiche.date}</div>
            </div>
        </div>
        <div class="fiche-footer">
            <div class="fiche-tags">
                ${fiche.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                ${fiche.tags.length > 3 ? `<span class="tag">+${fiche.tags.length - 3}</span>` : ''}
            </div>
            <span class="difficulte ${fiche.difficulte}">${traduireDifficulte(fiche.difficulte)}</span>
        </div>
    `;
    
    card.addEventListener('click', () => ouvrirFiche(fiche.id));
    return card;
}

// Afficher la pagination
function afficherPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(fichesFiltrees.length / fichesParPage);
    
    let html = '<div class="pagination-content">';
    
    // Bouton précédent
    if (pageCourante > 1) {
        html += `<button class="pagination-btn" onclick="changerPage(${pageCourante - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>`;
    }
    
    // Pages
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= pageCourante - 1 && i <= pageCourante + 1)) {
            html += `<button class="pagination-btn ${i === pageCourante ? 'active' : ''}" 
                        onclick="changerPage(${i})">${i}</button>`;
        } else if (i === pageCourante - 2 || i === pageCourante + 2) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Bouton suivant
    if (pageCourante < totalPages) {
        html += `<button class="pagination-btn" onclick="changerPage(${pageCourante + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

// Changer de page
function changerPage(page) {
    pageCourante = page;
    afficherFiches();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mettre à jour le compteur de résultats
function mettreAJourCompteurResultats() {
    const countElement = document.getElementById('results-count');
    countElement.textContent = `${fichesFiltrees.length} résultat${fichesFiltrees.length !== 1 ? 's' : ''}`;
}

// Ouvrir une fiche
async function ouvrirFiche(id) {
    try {
        const fiche = fiches.find(f => f.id === id);
        if (!fiche) {
            throw new Error(`Fiche ${id} non trouvée`);
        }
        
        ficheCourante = fiche;
        
        // Mettre à jour l'URL
        const nouvelleURL = `${window.location.pathname}?fiche=${id}`;
        history.pushState({ ficheId: id }, '', nouvelleURL);
        
        // Afficher la modal
        const modal = document.getElementById('fiche-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = fiche.titre;
        modalBody.innerHTML = `
            <div class="chargement-fiche">
                <div class="spinner"></div>
                <p>Chargement de la fiche...</p>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Charger le contenu de la fiche
        await chargerContenuFiche(fiche);
        
        // Mettre à jour la navigation
        mettreAJourNavigationFiche();
        
    } catch (error) {
        afficherErreur(`Impossible d'ouvrir la fiche ${id}`, error);
    }
}

// Charger le contenu d'une fiche
async function chargerContenuFiche(fiche) {
    const modalBody = document.getElementById('modal-body');
    
    try {
        // Vérifier le cache
        if (cacheFiches.has(fiche.id)) {
            modalBody.innerHTML = cacheFiches.get(fiche.id);
            attacherEvenementsContenu();
            return;
        }
        
        // Charger depuis le serveur
        const contenu = await chargerContenuExterne(fiche.contenuFichier);
        
        // Construire le HTML complet
        const htmlComplet = `
            <div class="fiche-content-detailed">
                <div class="fiche-meta-detailed">
                    <div class="meta-grid">
                        <div class="meta-item">
                            <i class="fas fa-user-graduate"></i>
                            <div>
                                <span class="meta-label">Auteur</span>
                                <span class="meta-value">${fiche.auteur}</span>
                            </div>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-book-open"></i>
                            <div>
                                <span class="meta-label">Matière</span>
                                <span class="meta-value">${fiche.matiere}</span>
                            </div>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <span class="meta-label">Date</span>
                                <span class="meta-value">${fiche.date}</span>
                            </div>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tags"></i>
                            <div>
                                <span class="meta-label">Tags</span>
                                <div class="meta-tags">${fiche.tags.map(tag => 
                                    `<span class="meta-tag">${tag}</span>`
                                ).join('')}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="fiche-introduction">
                    <h3><i class="fas fa-info-circle"></i> Introduction</h3>
                    <p>${fiche.introduction}</p>
                </div>
                
                ${contenu}
            </div>
        `;
        
        // Mettre en cache
        cacheFiches.set(fiche.id, htmlComplet);
        
        // Afficher
        modalBody.innerHTML = htmlComplet;
        attacherEvenementsContenu();
        
    } catch (error) {
        modalBody.innerHTML = `
            <div class="erreur-chargement">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Contenu non disponible</h3>
                <p>Impossible de charger le contenu de cette fiche.</p>
                <p>Erreur : ${error.message}</p>
                <button class="btn-small" onclick="reessayerChargement('${fiche.id}')">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        `;
    }
}

// Charger du contenu externe sans fetch (utiliser XMLHttpRequest)
function chargerContenuExterne(url) {
    return new Promise((resolve, reject) => {
        // Utiliser l'URL configurée
        const urlComplete = CONFIG.fichesBaseUrl + url.split('/').pop();
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', urlComplete, true);
        xhr.timeout = 10000; // 10 secondes
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.responseText);
            } else {
                reject(new Error(`Erreur ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
        xhr.onerror = function() {
            reject(new Error('Erreur réseau'));
        };
        
        xhr.ontimeout = function() {
            reject(new Error('Timeout de la requête'));
        };
        
        xhr.send();
    });
}

// Réessayer le chargement
function reessayerChargement(ficheId) {
    const fiche = fiches.find(f => f.id === ficheId);
    if (fiche) {
        chargerContenuFiche(fiche);
    }
}

// Attacher les événements au contenu chargé
function attacherEvenementsContenu() {
    // Boutons Copier
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            copierTexte(this);
        });
    });
    
    // Boutons Réponse
    document.querySelectorAll('.btn-voir-reponse').forEach(btn => {
        btn.addEventListener('click', function() {
            afficherReponse(this);
        });
    });
}

// Mettre à jour la navigation entre fiches
function mettreAJourNavigationFiche() {
    if (!ficheCourante) return;
    
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    const counter = document.getElementById('fiche-counter');
    
    counter.textContent = `${currentIndex + 1} / ${fichesFiltrees.length}`;
    
    // Activer/désactiver les boutons
    document.getElementById('prev-fiche').disabled = currentIndex === 0;
    document.getElementById('next-fiche').disabled = currentIndex === fichesFiltrees.length - 1;
}

// Navigation entre fiches
function naviguerFichePrecedente() {
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    if (currentIndex > 0) {
        ouvrirFiche(fichesFiltrees[currentIndex - 1].id);
    }
}

function naviguerFicheSuivante() {
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    if (currentIndex < fichesFiltrees.length - 1) {
        ouvrirFiche(fichesFiltrees[currentIndex + 1].id);
    }
}

// Charger une fiche depuis l'URL
function chargerFicheDepuisURL() {
    const params = new URLSearchParams(window.location.search);
    const ficheId = params.get('fiche');
    
    if (ficheId) {
        ouvrirFiche(ficheId);
    }
}

// Mettre à jour les statistiques
function mettreAJourStatistiques() {
    document.getElementById('total-fiches').textContent = fiches.length;
    document.getElementById('total-matieres').textContent = new Set(fiches.map(f => f.matiere)).size;
    document.getElementById('total-auteurs').textContent = new Set(fiches.map(f => f.auteur)).size;
    
    const allTags = new Set();
    fiches.forEach(fiche => fiche.tags.forEach(tag => allTags.add(tag)));
    document.getElementById('total-tags').textContent = allTags.size;
}

// Afficher les statistiques détaillées
function afficherStatistiques() {
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    
    // Calculer les statistiques
    const stats = {
        totalFiches: fiches.length,
        matieres: {},
        difficultes: {},
        auteurs: {},
        tags: {}
    };
    
    fiches.forEach(fiche => {
        // Matières
        stats.matieres[fiche.matiere] = (stats.matieres[fiche.matiere] || 0) + 1;
        
        // Difficultés
        stats.difficultes[fiche.difficulte] = (stats.difficultes[fiche.difficulte] || 0) + 1;
        
        // Auteurs
        stats.auteurs[fiche.auteur] = (stats.auteurs[fiche.auteur] || 0) + 1;
        
        // Tags
        fiche.tags.forEach(tag => {
            stats.tags[tag] = (stats.tags[tag] || 0) + 1;
        });
    });
    
    // Générer le HTML
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card-large">
                <h3><i class="fas fa-book"></i> Fiches totales</h3>
                <div class="stat-value-large">${stats.totalFiches}</div>
            </div>
            
            <div class="stat-section">
                <h3>Répartition par matière</h3>
                <div class="stats-list">
                    ${Object.entries(stats.matieres)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([matiere, count]) => `
                            <div class="stat-row">
                                <span>${matiere}</span>
                                <span class="stat-count">${count}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="stat-section">
                <h3>Niveaux de difficulté</h3>
                <div class="difficulty-stats">
                    ${Object.entries(stats.difficultes)
                        .map(([difficulte, count]) => `
                            <div class="difficulty-stat">
                                <span class="difficulty-label ${difficulte}">${traduireDifficulte(difficulte)}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill ${difficulte}" 
                                         style="width: ${(count / stats.totalFiches) * 100}%"></div>
                                </div>
                                <span class="stat-count">${count}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="stat-section">
                <h3>Top 5 des auteurs</h3>
                <div class="stats-list">
                    ${Object.entries(stats.auteurs)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([auteur, count]) => `
                            <div class="stat-row">
                                <div class="author-info">
                                    <div class="author-avatar-small">${auteur.charAt(0)}</div>
                                    <span>${auteur}</span>
                                </div>
                                <span class="stat-count">${count} fiches</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Exporter les données
function exporterDonnees() {
    try {
        const data = {
            fiches: fichesFiltrees,
            dateExport: new Date().toISOString(),
            total: fichesFiltrees.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `revisionpro-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        afficherToast('success', `Export réussi : ${fichesFiltrees.length} fiches exportées`);
        
    } catch (error) {
        afficherErreur('Erreur lors de l\'export', error);
    }
}

// Toggle thème
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#theme-toggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    afficherToast('info', `Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`);
}

// Toggle favori
function toggleFavori() {
    const btn = document.getElementById('fiche-favorite');
    const isFavorite = btn.classList.contains('fas');
    
    if (isFavorite) {
        btn.className = 'far fa-star';
        afficherToast('info', 'Retiré des favoris');
    } else {
        btn.className = 'fas fa-star';
        btn.style.color = 'var(--warning)';
        afficherToast('success', 'Ajouté aux favoris');
    }
}

// Imprimer fiche
function imprimerFiche() {
    window.print();
}

// Réinitialiser les filtres
function reinitialiserFiltres() {
    filtresActifs = {
        recherche: '',
        matiere: '',
        difficulte: '',
        auteur: '',
        tags: [],
        view: 'grid'
    };
    
    document.getElementById('search-input').value = '';
    document.getElementById('matiere-filter').value = '';
    document.getElementById('difficulte-filter').value = '';
    document.getElementById('auteur-filter').value = '';
    document.getElementById('sort-by').value = 'date-desc';
    
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    filtrerEtAfficherFiches();
    afficherToast('info', 'Filtres réinitialisés');
}

// Fonctions utilitaires
function traduireDifficulte(difficulte) {
    const traductions = {
        'facile': 'Facile',
        'moyen': 'Moyen',
        'difficile': 'Difficile'
    };
    return traductions[difficulte] || difficulte;
}

function copierTexte(bouton) {
    const section = bouton.parentElement;
    const textToCopy = section.innerText.replace('Copier', '').trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = bouton.textContent;
        bouton.textContent = 'Copié !';
        bouton.style.backgroundColor = 'var(--success)';
        
        setTimeout(() => {
            bouton.textContent = originalText;
            bouton.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        afficherErreur('Erreur lors de la copie', err);
    });
}

function afficherReponse(bouton) {
    const reponse = bouton.nextElementSibling;
    const isVisible = reponse.style.display === 'block';
    
    reponse.style.display = isVisible ? 'none' : 'block';
    bouton.textContent = isVisible ? 'Voir la réponse' : 'Masquer la réponse';
}

// Gestion des erreurs
function afficherErreur(message, error) {
    console.error(message, error);
    
    const banner = document.getElementById('status-banner');
    const bannerMessage = document.getElementById('status-message');
    
    banner.className = 'status-banner error';
    bannerMessage.textContent = `${message}: ${error.message}`;
    
    // Afficher aussi un toast
    afficherToast('error', message);
    
    // Cacher après 5 secondes
    setTimeout(() => {
        banner.style.opacity = '0';
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    }, 5000);
}

function afficherToast(type, message) {
    const toast = document.getElementById('error-toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Changer la couleur selon le type
    toast.style.backgroundColor = `var(--${type})`;
    
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    // Cacher après 5 secondes
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function mettreAJourStatut(type, message) {
    const banner = document.getElementById('status-banner');
    const bannerMessage = document.getElementById('status-message');
    
    banner.className = `status-banner ${type}`;
    bannerMessage.textContent = message;
    
    // Cacher après 3 secondes pour les succès
    if (type === 'success') {
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => {
                banner.style.display = 'none';
            }, 300);
        }, 3000);
    }
}

// Exposer certaines fonctions au scope global
window.changerPage = changerPage;
window.reessayerChargement = reessayerChargement;
window.reinitialiserFiltres = reinitialiserFiltres;