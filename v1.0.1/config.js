// config.js - Configuration des chemins externes
const CONFIG = {
    // Chemin vers le fichier data.js (peut être sur un autre serveur)
    dataUrl: 'https://votre-domaine.com/data/data.js',
    
    // Chemin de base pour les fiches HTML
    fichesBaseUrl: 'https://votre-domaine.com/data/fiches/',
    
    // Configuration du site
    site: {
        nom: 'RévisionPro',
        version: '2.0',
        auteur: 'Équipe Révision',
        github: 'https://github.com/votre-compte/revision-pro'
    },
    
    // Configuration des couleurs
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
    },
    
    // Footer
    footerLinks: {
        serviceClient: 'mailto:support@revisionpro.fr',
        github: 'https://github.com/votre-compte/revision-pro',
        documentation: 'https://docs.revisionpro.fr',
        blog: 'https://blog.revisionpro.fr',
        contact: 'mailto:contact@revisionpro.fr',
        politique: '/politique-confidentialite'
    }
};