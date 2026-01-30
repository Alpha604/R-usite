// config.js - Configuration modifiée
const CONFIG = {
    // Modes de chargement disponibles
    modes: {
        local: true,      // Charger depuis data.js local
        external: false,  // Charger depuis URL externe (désactivé par défaut)
        demo: true        // Utiliser les données de démonstration si tout échoue
    },
    
    // URLs (seulement utilisées si external: true)
    externalUrls: {
        data: 'https://votre-domaine.com/data/data.js',
        fiches: 'https://votre-domaine.com/data/fiches/'
    },
    
    // Configuration du site
    site: {
        nom: 'RévisionPro',
        version: '2.1',
        auteur: 'Équipe Révision',
        github: 'https://github.com/votre-compte/revision-pro',
        contact: 'contact@revisionpro.fr'
    },
    
    // Couleurs du thème
    couleurs: {
        primaire: '#4361ee',
        secondaire: '#3a0ca3',
        accent: '#f72585',
        succes: '#4cc9f0',
        avertissement: '#f8961e',
        danger: '#f94144',
        texte: '#2b2d42',
        texteSecondaire: '#8d99ae',
        fond: '#f8f9fa',
        carte: '#ffffff'
    }
};