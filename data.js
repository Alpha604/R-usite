// data.js - Données locales avec fallback intégré
console.log('Chargement des données locales...');

// Fonction pour créer des données de démonstration
function creerDonneesDemo() {
    console.log('Création des données de démonstration...');
    
    return [
        {
            id: "00001",
            titre: "Introduction à l'Algorithmique",
            description: "Concepts fondamentaux de l'algorithmique et structures de données de base.",
            date: "15/10/2023",
            tags: ["algorithmique", "complexité", "boucles", "récursivité", "programmation"],
            difficulte: "moyen",
            matiere: "Informatique",
            auteur: "Dr. Martin Dubois",
            introduction: "L'algorithmique est la science de la conception et de l'analyse d'algorithmes. Cette fiche présente les concepts fondamentaux nécessaires à la compréhension et à la création d'algorithmes efficaces.",
            contenuFichier: "fiches/00001.html"
        },
        {
            id: "00002",
            titre: "La Révolution Française",
            description: "Étude des causes, déroulement et conséquences de la Révolution Française de 1789.",
            date: "22/09/2023",
            tags: ["histoire", "révolution", "France", "18ème siècle", "politique"],
            difficulte: "facile",
            matiere: "Histoire",
            auteur: "Prof. Sophie Leroy",
            introduction: "La Révolution Française (1789-1799) est une période de transformation profonde de la société française qui a marqué la fin de l'Ancien Régime et posé les bases de la France contemporaine.",
            contenuFichier: "fiches/00002.html"
        },
        {
            id: "00003",
            titre: "Les Lois de Newton",
            description: "Principes fondamentaux de la mécanique classique et applications pratiques.",
            date: "10/11/2023",
            tags: ["physique", "mécanique", "newton", "forces", "mouvement"],
            difficulte: "moyen",
            matiere: "Physique",
            auteur: "Prof. Alain Bernard",
            introduction: "Les trois lois de Newton constituent les principes fondamentaux de la mécanique classique. Elles permettent de décrire et prédire le mouvement des objets sous l'action des forces.",
            contenuFichier: "fiches/00003.html"
        },
        {
            id: "00004",
            titre: "Photosynthèse",
            description: "Processus biologique par lequel les plantes convertissent l'énergie lumineuse en énergie chimique.",
            date: "05/11/2023",
            tags: ["biologie", "plantes", "énergie", "chlorophylle", "biochimie"],
            difficulte: "facile",
            matiere: "Biologie",
            auteur: "Dr. Claire Martin",
            introduction: "La photosynthèse est un processus essentiel à la vie sur Terre, permettant aux plantes, algues et certaines bactéries de produire de la matière organique à partir de dioxyde de carbone et d'eau, en utilisant l'énergie lumineuse.",
            contenuFichier: "fiches/00004.html"
        },
        {
            id: "00005",
            titre: "Théorème de Pythagore",
            description: "Relation fondamentale en géométrie euclidienne entre les côtés d'un triangle rectangle.",
            date: "28/10/2023",
            tags: ["mathématiques", "géométrie", "triangle", "théorème"],
            difficulte: "facile",
            matiere: "Mathématiques",
            auteur: "Prof. Jean Dupont",
            introduction: "Le théorème de Pythagore est une relation fondamentale en géométrie euclidienne qui établit que dans un triangle rectangle, le carré de la longueur de l'hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.",
            contenuFichier: "fiches/00005.html"
        },
        {
            id: "00006",
            titre: "Chimie Organique - Bases",
            description: "Introduction aux composés organiques et à leurs réactions fondamentales.",
            date: "12/11/2023",
            tags: ["chimie", "organique", "carbone", "molécules", "réactions"],
            difficulte: "difficile",
            matiere: "Chimie",
            auteur: "Dr. Marie Curie",
            introduction: "La chimie organique est la branche de la chimie qui étudie les composés carbonés et leurs propriétés. Cette fiche introduit les concepts de base des liaisons chimiques et des réactions organiques.",
            contenuFichier: "fiches/00006.html"
        }
    ];
}

// Initialisation des données
let fichesData;

try {
    // Essayer de charger les données existantes
    if (typeof window.fichesData !== 'undefined') {
        console.log('Données existantes chargées');
        fichesData = window.fichesData;
    } else {
        // Créer des données de démonstration
        console.log('Utilisation des données de démonstration');
        fichesData = creerDonneesDemo();
    }
    
    console.log(`${fichesData.length} fiches chargées`);
    
} catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    // Toujours créer des données de démonstration en cas d'erreur
    fichesData = creerDonneesDemo();
}

// Exporter les données
window.fichesData = fichesData;