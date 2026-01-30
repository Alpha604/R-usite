// script.js - Version simplifiée sans problèmes de CORS

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

// Cache pour les contenus de fiches
const cacheFiches = new Map();

// Données de démonstration pour les contenus (en attendant les fichiers HTML)
const contenusDemo = {
    "00001": `
        <div class="section">
            <h3 class="section-title">Définition et importance</h3>
            <div class="paragraphe paragraphe-bleu">
                <h4>Qu'est-ce qu'un algorithme ?</h4>
                <p>Un algorithme est une suite finie et non ambiguë d'instructions permettant de résoudre un problème ou d'obtenir un résultat.</p>
            </div>
            
            <div class="copy-section">
                <button class="copy-btn">Copier</button>
                <p>Exemple d'algorithme de recherche linéaire :</p>
                <pre><code>function rechercheLineaire(tableau, cible) {
    for (let i = 0; i < tableau.length; i++) {
        if (tableau[i] === cible) {
            return i;
        }
    }
    return -1;
}</code></pre>
            </div>
            
            <div class="exercice">
                <div class="exercice-question">
                    <p>Quelle est la complexité de cet algorithme ?</p>
                </div>
                <button class="btn-voir-reponse">Voir la réponse</button>
                <div class="exercice-reponse">
                    <p>Complexité : O(n) - linéaire</p>
                </div>
            </div>
        </div>
    `,
    "00002": `
        <div class="section">
            <h3 class="section-title">Les causes de la Révolution</h3>
            <div class="paragraphe paragraphe-orange">
                <p>La France du XVIIIe siècle était marquée par de profondes inégalités sociales.</p>
            </div>
            
            <div class="table-container">
                <table>
                    <tr><th>Ordre</th><th>Population</th><th>Privilèges</th></tr>
                    <tr><td>Clergé</td><td>~130k</td><td>Exempté d'impôts</td></tr>
                    <tr><td>Noblesse</td><td>~350k</td><td>Exemptée d'impôts</td></tr>
                    <tr><td>Tiers-État</td><td>~24M</td><td>Aucun privilège</td></tr>
                </table>
            </div>
        </div>
    `,
    // Ajouter d'autres contenus démo...
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    try {
        initialiserApplication();
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        afficherErreur('Erreur lors de l\'initialisation', error);
    }
});

function initialiserApplication() {
    console.log('Initialisation de l\'application...');
    
    // Vérifier les données
    if (typeof fichesData === 'undefined' || !Array.isArray(fichesData)) {
        throw new Error('Données des fiches non disponibles');
    }
    
    // Copier les données
    fiches = [...fichesData];
    fichesFiltrees = [...fiches];
    
    console.log(`${fiches.length} fiches chargées`);
    
    // Initialiser l'interface
    initialiserInterface();
    
    // Initialiser les événements
    initialiserEvenements();
    
    // Afficher les statistiques
    mettreAJourStatistiques();
    
    // Afficher les fiches
    afficherFiches();
    
    // Mettre à jour le statut
    mettreAJourStatut('success', `${fiches.length} fiches chargées`);
}

function initialiserInterface() {
    console.log('Initialisation de l\'interface...');
    
    // Remplir les filtres
    remplirFiltres();
    
    // Mettre à jour la version
    const versionElement = document.getElementById('version-number');
    if (versionElement) {
        versionElement.textContent = CONFIG.site.version || '2.1';
    }
    
    // Appliquer les couleurs du thème
    appliquerCouleursTheme();
}

function remplirFiltres() {
    console.log('Remplissage des filtres...');
    
    // Récupérer toutes les valeurs uniques
    const matieres = [...new Set(fiches.map(f => f.matiere))];
    const auteurs = [...new Set(fiches.map(f => f.auteur))];
    const difficultees = [...new Set(fiches.map(f => f.difficulte))];
    
    // Matières
    const matiereSelect = document.getElementById('matiere-filter');
    if (matiereSelect) {
        matieres.forEach(matiere => {
            const option = document.createElement('option');
            option.value = matiere;
            option.textContent = matiere;
            matiereSelect.appendChild(option);
        });
    }
    
    // Auteurs
    const auteurSelect = document.getElementById('auteur-filter');
    if (auteurSelect) {
        auteurs.forEach(auteur => {
            const option = document.createElement('option');
            option.value = auteur;
            option.textContent = auteur;
            auteurSelect.appendChild(option);
        });
    }
    
    // Difficultés
    const difficulteSelect = document.getElementById('difficulte-filter');
    if (difficulteSelect) {
        difficultees.forEach(difficulte => {
            const option = document.createElement('option');
            option.value = difficulte;
            option.textContent = traduireDifficulte(difficulte);
            difficulteSelect.appendChild(option);
        });
    }
    
    // Tags populaires
    const popularTagsContainer = document.getElementById('popular-tags');
    if (popularTagsContainer) {
        // Compter les tags
        const tagsCount = {};
        fiches.forEach(fiche => {
            fiche.tags.forEach(tag => {
                tagsCount[tag] = (tagsCount[tag] || 0) + 1;
            });
        });
        
        // Prendre les 10 plus populaires
        const tagsPopulaires = Object.entries(tagsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([tag]) => tag);
        
        // Créer les éléments
        tagsPopulaires.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'filter-tag';
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag;
            tagElement.addEventListener('click', function() {
                this.classList.toggle('active');
                const tagValue = this.dataset.tag;
                const index = filtresActifs.tags.indexOf(tagValue);
                if (index === -1) {
                    filtresActifs.tags.push(tagValue);
                } else {
                    filtresActifs.tags.splice(index, 1);
                }
                filtrerEtAfficherFiches();
            });
            popularTagsContainer.appendChild(tagElement);
        });
    }
    
    // Tendances
    const trendingList = document.getElementById('trending-list');
    if (trendingList) {
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
}

function appliquerCouleursTheme() {
    const root = document.documentElement;
    if (CONFIG.couleurs) {
        Object.entries(CONFIG.couleurs).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    }
}

function initialiserEvenements() {
    console.log('Initialisation des événements...');
    
    // Recherche
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filtresActifs.recherche = e.target.value;
            filtrerEtAfficherFiches();
        });
    }
    
    const searchClear = document.getElementById('search-clear');
    if (searchClear) {
        searchClear.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            filtresActifs.recherche = '';
            filtrerEtAfficherFiches();
        });
    }
    
    // Filtres
    ['matiere-filter', 'difficulte-filter', 'auteur-filter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', function(e) {
                filtresActifs[id.replace('-filter', '')] = e.target.value;
                filtrerEtAfficherFiches();
            });
        }
    });
    
    // Filtres rapides
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtrerEtAfficherFiches();
        });
    });
    
    // Tri
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            trierFiches();
            afficherFiches();
        });
    }
    
    // Affichage
    const displayCount = document.getElementById('display-count');
    if (displayCount) {
        displayCount.addEventListener('change', function(e) {
            fichesParPage = e.target.value === 'all' ? fichesFiltrees.length : parseInt(e.target.value);
            pageCourante = 1;
            afficherFiches();
        });
    }
    
    // Vue
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtresActifs.view = this.dataset.view;
            afficherFiches();
        });
    });
    
    // Boutons d'action
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
        statsBtn.addEventListener('click', afficherStatistiques);
    }
    
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exporterDonnees);
    }
    
    // Navigation modale
    const prevBtn = document.getElementById('prev-fiche');
    if (prevBtn) prevBtn.addEventListener('click', naviguerFichePrecedente);
    
    const nextBtn = document.getElementById('next-fiche');
    if (nextBtn) nextBtn.addEventListener('click', naviguerFicheSuivante);
    
    const printBtn = document.getElementById('fiche-print');
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    
    const favBtn = document.getElementById('fiche-favorite');
    if (favBtn) {
        favBtn.addEventListener('click', function() {
            this.classList.toggle('fas');
            this.classList.toggle('far');
            afficherToast('info', this.classList.contains('fas') ? 'Ajouté aux favoris' : 'Retiré des favoris');
        });
    }
    
    // Fermer modales
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
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
    const toastClose = document.querySelector('.toast-close');
    if (toastClose) {
        toastClose.addEventListener('click', function() {
            const toast = document.getElementById('error-toast');
            if (toast) toast.style.display = 'none';
        });
    }
    
    // Gestion de l'URL
    window.addEventListener('popstate', chargerFicheDepuisURL);
    chargerFicheDepuisURL();
}

function filtrerEtAfficherFiches() {
    try {
        filtrerFiches();
        trierFiches();
        afficherFiches();
        mettreAJourCompteurResultats();
    } catch (error) {
        console.error('Erreur de filtrage:', error);
        afficherErreur('Erreur lors du filtrage', error);
    }
}

function filtrerFiches() {
    fichesFiltrees = fiches.filter(fiche => {
        // Recherche
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
        
        // Matière
        if (filtresActifs.matiere && fiche.matiere !== filtresActifs.matiere) {
            return false;
        }
        
        // Difficulté
        if (filtresActifs.difficulte && fiche.difficulte !== filtresActifs.difficulte) {
            return false;
        }
        
        // Auteur
        if (filtresActifs.auteur && fiche.auteur !== filtresActifs.auteur) {
            return false;
        }
        
        // Tags
        if (filtresActifs.tags.length > 0) {
            const matchTags = filtresActifs.tags.every(tag => fiche.tags.includes(tag));
            if (!matchTags) return false;
        }
        
        return true;
    });
    
    pageCourante = 1;
}

function trierFiches() {
    const tri = document.getElementById('sort-by')?.value || 'date-desc';
    
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
                return (ordreDifficulte[a.difficulte] || 0) - (ordreDifficulte[b.difficulte] || 0);
            default:
                return 0;
        }
    });
}

function afficherFiches() {
    const container = document.getElementById('fiches-container');
    const pagination = document.getElementById('pagination');
    
    if (!container) return;
    
    try {
        // Calculer la pagination
        const debut = (pageCourante - 1) * fichesParPage;
        const fin = debut + fichesParPage;
        const fichesPage = fichesParPage >= fichesFiltrees.length ? 
            fichesFiltrees : 
            fichesFiltrees.slice(debut, fin);
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Message si pas de résultats
        if (fichesFiltrees.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Aucune fiche trouvée</h3>
                    <p>Essayez de modifier vos critères de recherche.</p>
                    <button class="btn-small" onclick="reinitialiserFiltres()">
                        Réinitialiser les filtres
                    </button>
                </div>
            `;
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        // Appliquer la vue
        container.className = `fiches-container ${filtresActifs.view}-view`;
        
        // Afficher les fiches
        fichesPage.forEach(fiche => {
            const card = creerCarteFiche(fiche);
            container.appendChild(card);
        });
        
        // Pagination
        if (pagination && fichesParPage < fichesFiltrees.length) {
            afficherPagination();
        } else if (pagination) {
            pagination.innerHTML = '';
        }
        
    } catch (error) {
        console.error('Erreur d\'affichage:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur d'affichage</p>
            </div>
        `;
    }
}

function creerCarteFiche(fiche) {
    const card = document.createElement('div');
    card.className = 'fiche-card';
    card.dataset.id = fiche.id;
    
    const description = fiche.description.length > 100 ? 
        fiche.description.substring(0, 100) + '...' : 
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

function afficherPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(fichesFiltrees.length / fichesParPage);
    
    let html = '<div class="pagination-content">';
    
    // Précédent
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
    
    // Suivant
    if (pageCourante < totalPages) {
        html += `<button class="pagination-btn" onclick="changerPage(${pageCourante + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

function changerPage(page) {
    pageCourante = page;
    afficherFiches();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mettreAJourCompteurResultats() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = `${fichesFiltrees.length} résultat${fichesFiltrees.length !== 1 ? 's' : ''}`;
    }
}

async function ouvrirFiche(id) {
    try {
        const fiche = fiches.find(f => f.id === id);
        if (!fiche) {
            throw new Error(`Fiche ${id} non trouvée`);
        }
        
        ficheCourante = fiche;
        
        // Mettre à jour l'URL
        history.pushState({ ficheId: id }, '', `?fiche=${id}`);
        
        // Afficher la modal
        const modal = document.getElementById('fiche-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = fiche.titre;
        modalBody.innerHTML = `
            <div class="chargement-fiche">
                <div class="spinner"></div>
                <p>Chargement de la fiche...</p>
            </div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Charger le contenu
        await chargerContenuFiche(fiche);
        
        // Mettre à jour la navigation
        mettreAJourNavigationFiche();
        
    } catch (error) {
        console.error('Erreur d\'ouverture:', error);
        afficherErreur(`Impossible d'ouvrir la fiche`, error);
    }
}

async function chargerContenuFiche(fiche) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    try {
        // Vérifier le cache
        if (cacheFiches.has(fiche.id)) {
            modalBody.innerHTML = cacheFiches.get(fiche.id);
            attacherEvenementsContenu();
            return;
        }
        
        // Essayer de charger depuis un fichier
        let contenu = '';
        
        try {
            // Pour la démo, utiliser le contenu intégré
            contenu = contenusDemo[fiche.id] || `
                <div class="section">
                    <h3>Contenu de la fiche</h3>
                    <p>Le contenu détaillé de cette fiche sera disponible bientôt.</p>
                    <p>En attendant, voici le résumé : ${fiche.description}</p>
                </div>
            `;
            
        } catch (error) {
            console.log('Utilisation du contenu de démonstration');
            contenu = contenusDemo[fiche.id] || `
                <div class="section">
                    <h3>Contenu non disponible</h3>
                    <p>Le fichier de contenu pour cette fiche n'est pas encore disponible.</p>
                </div>
            `;
        }
        
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
        console.error('Erreur de chargement:', error);
        modalBody.innerHTML = `
            <div class="erreur-chargement">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger le contenu de cette fiche.</p>
                <button class="btn-small" onclick="rechargerContenu('${fiche.id}')">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        `;
    }
}

function attacherEvenementsContenu() {
    // Boutons Copier
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.parentElement.textContent.replace('Copier', '').trim();
            navigator.clipboard.writeText(text).then(() => {
                const original = this.textContent;
                this.textContent = 'Copié!';
                setTimeout(() => this.textContent = original, 2000);
            });
        });
    });
    
    // Boutons Réponse
    document.querySelectorAll('.btn-voir-reponse').forEach(btn => {
        btn.addEventListener('click', function() {
            const reponse = this.nextElementSibling;
            if (reponse.style.display === 'block') {
                reponse.style.display = 'none';
                this.textContent = 'Voir la réponse';
            } else {
                reponse.style.display = 'block';
                this.textContent = 'Masquer la réponse';
            }
        });
    });
}

function mettreAJourNavigationFiche() {
    if (!ficheCourante) return;
    
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    const counter = document.getElementById('fiche-counter');
    const prevBtn = document.getElementById('prev-fiche');
    const nextBtn = document.getElementById('next-fiche');
    
    if (counter) {
        counter.textContent = `${currentIndex + 1} / ${fichesFiltrees.length}`;
    }
    
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === fichesFiltrees.length - 1;
}

function naviguerFichePrecedente() {
    if (!ficheCourante) return;
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    if (currentIndex > 0) {
        ouvrirFiche(fichesFiltrees[currentIndex - 1].id);
    }
}

function naviguerFicheSuivante() {
    if (!ficheCourante) return;
    const currentIndex = fichesFiltrees.findIndex(f => f.id === ficheCourante.id);
    if (currentIndex < fichesFiltrees.length - 1) {
        ouvrirFiche(fichesFiltrees[currentIndex + 1].id);
    }
}

function chargerFicheDepuisURL() {
    const params = new URLSearchParams(window.location.search);
    const ficheId = params.get('fiche');
    if (ficheId) {
        ouvrirFiche(ficheId);
    }
}

function mettreAJourStatistiques() {
    const elements = {
        'total-fiches': fiches.length,
        'total-matieres': new Set(fiches.map(f => f.matiere)).size,
        'total-auteurs': new Set(fiches.map(f => f.auteur)).size,
        'total-tags': new Set(fiches.flatMap(f => f.tags)).size
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function afficherStatistiques() {
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');
    
    if (!modal || !content) return;
    
    // Calculer les stats
    const stats = {
        total: fiches.length,
        matieres: {},
        difficultes: {}
    };
    
    fiches.forEach(fiche => {
        stats.matieres[fiche.matiere] = (stats.matieres[fiche.matiere] || 0) + 1;
        stats.difficultes[fiche.difficulte] = (stats.difficultes[fiche.difficulte] || 0) + 1;
    });
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card-large">
                <h3><i class="fas fa-book"></i> Fiches totales</h3>
                <div class="stat-value-large">${stats.total}</div>
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
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function exporterDonnees() {
    try {
        const data = {
            fiches: fichesFiltrees,
            exportDate: new Date().toISOString(),
            count: fichesFiltrees.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `revisionpro-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        afficherToast('success', `${fichesFiltrees.length} fiches exportées`);
        
    } catch (error) {
        afficherErreur('Erreur d\'export', error);
    }
}

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    afficherToast('info', `Thème ${newTheme === 'dark' ? 'sombre' : 'clair'}`);
}

// Fonctions utilitaires
function traduireDifficulte(difficulte) {
    return {
        'facile': 'Facile',
        'moyen': 'Moyen', 
        'difficile': 'Difficile'
    }[difficulte] || difficulte;
}

function afficherErreur(message, error) {
    console.error(message, error);
    
    const banner = document.getElementById('status-banner');
    const bannerMessage = document.getElementById('status-message');
    
    if (banner && bannerMessage) {
        banner.className = 'status-banner error';
        bannerMessage.textContent = `${message}: ${error.message}`;
        
        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.style.display = 'none', 300);
        }, 5000);
    }
    
    afficherToast('error', message);
}

function afficherToast(type, message) {
    const toast = document.getElementById('error-toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    // Couleurs selon le type
    const colors = {
        success: '#10b981',
        error: '#ef4444', 
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    toastMessage.textContent = message;
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function mettreAJourStatut(type, message) {
    const banner = document.getElementById('status-banner');
    const bannerMessage = document.getElementById('status-message');
    
    if (banner && bannerMessage) {
        banner.className = `status-banner ${type}`;
        bannerMessage.textContent = message;
        
        if (type === 'success') {
            setTimeout(() => {
                banner.style.opacity = '0';
                setTimeout(() => banner.style.display = 'none', 300);
            }, 3000);
        }
    }
}

function reinitialiserFiltres() {
    filtresActifs = {
        recherche: '',
        matiere: '',
        difficulte: '',
        auteur: '',
        tags: [],
        view: 'grid'
    };
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    
    ['matiere-filter', 'difficulte-filter', 'auteur-filter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    document.querySelectorAll('.quick-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'all');
    });
    
    filtrerEtAfficherFiches();
    afficherToast('info', 'Filtres réinitialisés');
}

function rechargerContenu(ficheId) {
    const fiche = fiches.find(f => f.id === ficheId);
    if (fiche) {
        chargerContenuFiche(fiche);
    }
}

// Exposer les fonctions globales
window.changerPage = changerPage;
window.reinitialiserFiltres = reinitialiserFiltres;
window.rechargerContenu = rechargerContenu;

// Charger le thème sauvegardé
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
});