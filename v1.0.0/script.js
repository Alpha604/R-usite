// script.js - Logique principale de l'application

// Variables globales
let fiches = [];
let toutesMatieres = [];
let toutesDifficultes = [];
let tousTags = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que les données sont chargées
    if (typeof fichesData === 'undefined') {
        console.error('Les données des fiches ne sont pas chargées. Vérifiez data.js');
        return;
    }
    
    // Copier les données
    fiches = [...fichesData];
    
    // Initialiser les filtres
    initialiserFiltres();
    
    // Initialiser les événements
    initialiserEvenements();
    
    // Afficher les fiches
    afficherFiches(fiches);
});

// Initialiser les filtres
function initialiserFiltres() {
    // Extraire les matières, difficultés et tags uniques
    toutesMatieres = [...new Set(fiches.map(fiche => fiche.matiere))];
    toutesDifficultes = [...new Set(fiches.map(fiche => fiche.difficulte))];
    
    // Collecter tous les tags
    let tagsSet = new Set();
    fiches.forEach(fiche => {
        fiche.tags.forEach(tag => tagsSet.add(tag));
    });
    tousTags = Array.from(tagsSet);
    
    // Mettre à jour les compteurs
    document.getElementById('fiche-count').textContent = fiches.length;
    document.getElementById('matiere-count').textContent = toutesMatieres.length;
    
    // Remplir les sélecteurs de filtre
    const matiereFilter = document.getElementById('matiere-filter');
    const difficulteFilter = document.getElementById('difficulte-filter');
    
    // Matières
    toutesMatieres.forEach(matiere => {
        const option = document.createElement('option');
        option.value = matiere;
        option.textContent = matiere;
        matiereFilter.appendChild(option);
    });
    
    // Difficultés
    toutesDifficultes.forEach(difficulte => {
        const option = document.createElement('option');
        option.value = difficulte;
        option.textContent = traduireDifficulte(difficulte);
        difficulteFilter.appendChild(option);
    });
    
    // Tags de filtre
    const matiereTagsContainer = document.getElementById('matiere-tags');
    const difficulteTagsContainer = document.getElementById('difficulte-tags');
    const popularTagsContainer = document.getElementById('popular-tags');
    
    // Tags de matières
    toutesMatieres.forEach(matiere => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.textContent = matiere;
        tag.dataset.filter = 'matiere';
        tag.dataset.value = matiere;
        matiereTagsContainer.appendChild(tag);
    });
    
    // Tags de difficultés
    toutesDifficultes.forEach(difficulte => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.textContent = traduireDifficulte(difficulte);
        tag.dataset.filter = 'difficulte';
        tag.dataset.value = difficulte;
        difficulteTagsContainer.appendChild(tag);
    });
    
    // Tags populaires (premiers 6)
    tousTags.slice(0, 6).forEach(tagText => {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.textContent = tagText;
        tag.dataset.filter = 'tag';
        tag.dataset.value = tagText;
        popularTagsContainer.appendChild(tag);
    });
}

// Initialiser les événements
function initialiserEvenements() {
    // Recherche
    document.getElementById('search-input').addEventListener('input', function(e) {
        filtrerFiches();
    });
    
    // Filtres
    document.getElementById('matiere-filter').addEventListener('change', filtrerFiches);
    document.getElementById('difficulte-filter').addEventListener('change', filtrerFiches);
    
    // Tags de filtre
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // Activer/désactiver le tag
            this.classList.toggle('active');
            
            // Mettre à jour les filtres
            if (filterType === 'matiere') {
                const select = document.getElementById('matiere-filter');
                if (this.classList.contains('active')) {
                    select.value = filterValue;
                } else {
                    select.value = '';
                }
            } else if (filterType === 'difficulte') {
                const select = document.getElementById('difficulte-filter');
                if (this.classList.contains('active')) {
                    select.value = filterValue;
                } else {
                    select.value = '';
                }
            }
            
            filtrerFiches();
        });
    });
    
    // Tri
    document.getElementById('sort-by').addEventListener('change', function() {
        filtrerFiches();
    });
    
    // Fermer la modal
    document.querySelector('.close-btn').addEventListener('click', fermerModal);
    document.getElementById('fiche-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            fermerModal();
        }
    });
    
    // Gestion de l'URL
    window.addEventListener('popstate', function() {
        chargerFicheDepuisURL();
    });
    
    // Vérifier si une fiche est demandée dans l'URL
    chargerFicheDepuisURL();
}

// Traduire le niveau de difficulté
function traduireDifficulte(difficulte) {
    const traductions = {
        'facile': 'Facile',
        'moyen': 'Moyen',
        'difficile': 'Difficile'
    };
    return traductions[difficulte] || difficulte;
}

// Filtrer et trier les fiches
function filtrerFiches() {
    const recherche = document.getElementById('search-input').value.toLowerCase();
    const matiere = document.getElementById('matiere-filter').value;
    const difficulte = document.getElementById('difficulte-filter').value;
    const tri = document.getElementById('sort-by').value;
    
    let fichesFiltrees = fiches.filter(fiche => {
        // Filtre par recherche
        const matchRecherche = recherche === '' || 
            fiche.titre.toLowerCase().includes(recherche) ||
            fiche.description.toLowerCase().includes(recherche) ||
            fiche.tags.some(tag => tag.toLowerCase().includes(recherche)) ||
            fiche.matiere.toLowerCase().includes(recherche);
        
        // Filtre par matière
        const matchMatiere = matiere === '' || fiche.matiere === matiere;
        
        // Filtre par difficulté
        const matchDifficulte = difficulte === '' || fiche.difficulte === difficulte;
        
        return matchRecherche && matchMatiere && matchDifficulte;
    });
    
    // Trier les fiches
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
            default:
                return 0;
        }
    });
    
    // Afficher les fiches filtrées
    afficherFiches(fichesFiltrees);
}

// Afficher les fiches dans le conteneur
function afficherFiches(fichesAAfficher) {
    const container = document.getElementById('fiches-container');
    container.innerHTML = '';
    
    if (fichesAAfficher.length === 0) {
        container.innerHTML = '<p class="no-results">Aucune fiche ne correspond à vos critères de recherche.</p>';
        return;
    }
    
    fichesAAfficher.forEach(fiche => {
        const card = document.createElement('div');
        card.className = 'fiche-card';
        card.dataset.id = fiche.id;
        
        card.innerHTML = `
            <div class="fiche-header">
                <div class="fiche-date">${fiche.date}</div>
                <h3 class="fiche-title">${fiche.titre}</h3>
                <p class="fiche-description">${fiche.description}</p>
                <div class="fiche-tags">
                    ${fiche.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${fiche.tags.length > 3 ? `<span class="tag">+${fiche.tags.length - 3}</span>` : ''}
                </div>
            </div>
            <div class="fiche-footer">
                <span class="difficulte ${fiche.difficulte}">${traduireDifficulte(fiche.difficulte)}</span>
                <span class="fiche-matiere">${fiche.matiere}</span>
            </div>
        `;
        
        card.addEventListener('click', function() {
            ouvrirFiche(fiche.id);
        });
        
        container.appendChild(card);
    });
}

// Ouvrir une fiche
function ouvrirFiche(id) {
    const fiche = fiches.find(f => f.id === id);
    if (!fiche) return;
    
    // Mettre à jour l'URL
    const nouvelleURL = window.location.origin + window.location.pathname + '?fiche=' + id;
    history.pushState({ ficheId: id }, '', nouvelleURL);
    
    // Charger et afficher la fiche
    chargerContenuFiche(fiche);
}

// Charger le contenu d'une fiche depuis son fichier HTML
function chargerContenuFiche(fiche) {
    const modal = document.getElementById('fiche-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    // Afficher un message de chargement
    modalTitle.textContent = fiche.titre;
    modalBody.innerHTML = `
        <div class="chargement">
            <p>Chargement de la fiche...</p>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Charger le contenu HTML depuis le fichier
    fetch(fiche.contenuFichier)
        .then(response => {
            if (!response.ok) {
                throw new Error('Fichier non trouvé');
            }
            return response.text();
        })
        .then(html => {
            // Injecter le contenu HTML
            modalBody.innerHTML = `
                <div class="fiche-content">
                    <div class="fiche-meta">
                        <div class="meta-item">
                            <i class="fas fa-user"></i>
                            <span>${fiche.auteur}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-book"></i>
                            <span>${fiche.matiere}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>${fiche.date}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tags"></i>
                            <span>${fiche.tags.join(', ')}</span>
                        </div>
                    </div>
                    <div class="introduction">
                        <h3>Introduction</h3>
                        <p>${fiche.introduction}</p>
                    </div>
                    ${html}
                </div>
            `;
            
            // Attacher les événements aux boutons dans le contenu chargé
            attacherEvenementsContenu();
        })
        .catch(error => {
            console.error('Erreur de chargement:', error);
            modalBody.innerHTML = `
                <div class="erreur">
                    <p>Impossible de charger le contenu de la fiche.</p>
                    <p>Erreur: ${error.message}</p>
                    <br>
                    <p>Contacter le service client</p>
                </div>
            `;
        });
}

// Attacher les événements aux éléments du contenu chargé
function attacherEvenementsContenu() {
    // Boutons "Copier"
    document.querySelectorAll('.copy-btn').forEach(bouton => {
        bouton.addEventListener('click', function() {
            copierTexte(this);
        });
    });
    
    // Boutons "Voir la réponse"
    document.querySelectorAll('.btn-voir-reponse').forEach(bouton => {
        bouton.addEventListener('click', function() {
            afficherReponse(this);
        });
    });
}

// Fermer la modal
function fermerModal() {
    const modal = document.getElementById('fiche-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Mettre à jour l'URL pour enlever le paramètre fiche
    history.pushState({}, '', window.location.pathname);
}

// Charger une fiche depuis l'URL
function chargerFicheDepuisURL() {
    const params = new URLSearchParams(window.location.search);
    const ficheId = params.get('fiche');
    
    if (ficheId) {
        const fiche = fiches.find(f => f.id === ficheId);
        if (fiche) {
            chargerContenuFiche(fiche);
        }
    }
}

// Fonctions utilitaires pour les fiches
function copierTexte(bouton) {
    const section = bouton.parentElement;
    const textToCopy = section.innerText.replace('Copier', '').trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Feedback visuel
        const originalText = bouton.textContent;
        bouton.textContent = 'Copié !';
        bouton.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            bouton.textContent = originalText;
            bouton.style.backgroundColor = '#3498db';
        }, 2000);
    }).catch(err => {
        console.error('Erreur de copie:', err);
        bouton.textContent = 'Erreur';
        bouton.style.backgroundColor = '#e74c3c';
        
        setTimeout(() => {
            bouton.textContent = 'Copier';
            bouton.style.backgroundColor = '#3498db';
        }, 2000);
    });
}

function afficherReponse(bouton) {
    const reponse = bouton.nextElementSibling;
    if (reponse.style.display === 'block') {
        reponse.style.display = 'none';
        bouton.textContent = 'Voir la réponse';
    } else {
        reponse.style.display = 'block';
        bouton.textContent = 'Masquer la réponse';
    }
}