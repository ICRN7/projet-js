// ===================================================================
// DONNÉES DU CLUB (instances de classes)
// ===================================================================

// Disciplines du club
const listeDisciplines = [
    new Disciplines("Savate Boxe Française", 7),
    new Disciplines("Savate Défense", 12),
    new Disciplines("Savate Training", 14),
    new Disciplines("Savate Forme", 16)
];

// Équipe du club : un objet Coach par moniteur
// Paramètres : nom, prénom, fonction, cours enseignés, catégorie d'âge en Boxe Française ("" = non précisée), occasionnel
const coachs = [
    new Coach("SUISSE", "Philippe", "Président du club",
        ["Savate Boxe Française", "Savate Forme", "Savate Défense", "Savate Training"],
        "Cours enfants / ados / adultes", false),
    new Coach("SUISSE", "Anne-Laure", "Monitrice",
        ["Savate Boxe Française", "Savate Forme"],
        "Cours enfants", false),
    new Coach("CARON", "Maëva", "Monitrice",
        ["Savate Boxe Française"],
        "Cours enfants", false),
    new Coach("DIEFFENBACH", "Damien", "Moniteur",
        ["Savate Boxe Française", "Savate Training"],
        "Cours ados / adultes", false),
    new Coach("WILLO", "Julien", "Moniteur",
        ["Savate Boxe Française"],
        "Cours ados / adultes", false),
    new Coach("CHIUMMIENTO", "Nicolas", "Moniteur",
        ["Savate Boxe Française"],
        "Cours ados / adultes", true)
];

// Retourne l'objet Discipline portant ce nom (null si introuvable)
const trouverDiscipline = (nom) => {
    for (let i = 0; i < listeDisciplines.length; i++) {
        if (listeDisciplines[i].getNom() === nom) {
            return listeDisciplines[i];
        }
    }
    return null;
};

// Affichage de l'équipe : une carte par moniteur
const afficherEquipe = () => {
    const grille = document.querySelector("#liste-equipe");
    let htmlCartes = "";

    for (let i = 0; i < coachs.length; i++) {
        const coach = coachs[i];
        const cours = coach.cours;

        // Boucle imbriquée : une "puce" par discipline
        let puces = "";
        for (let j = 0; j < cours.length; j++) {
            puces += `<span class="puce">${cours[j]}</span>`;

            // Truthy / falsy : si une catégorie d'âge est renseignée, on la place après la Boxe Française
            if (cours[j] === "Savate Boxe Française" && coach.categorieBoxe) {
                puces += `<span class="puce puce-cours">${coach.categorieBoxe}</span>`;
            }
        }

        // la carte du président est mise en avant
        const classeCarte = coach.estPresident ? "carte-coach carte-president" : "carte-coach";

        // mention affichée uniquement pour les intervenants occasionnels
        const mention = coach.occasionnel
            ? '<p class="occasionnel">Intervient occasionnellement</p>'
            : "";

        // coach.afficher() (redéfinie dans Coach) sert d'infobulle sur le badge
        htmlCartes += `
            <article class="${classeCarte} ${coach.occasionnel ? "carte-occasionnelle" : ""}">
                <div class="badge-coach couleur-${i % 4}" title="${coach.afficher()}">${coach.initiales}</div>
                <div class="infos-coach">
                    <h3>${coach.prenom} ${coach.nom}</h3>
                    <p class="fonction">${coach.fonction}</p>
                    <div class="puces">${puces}</div>
                    ${mention}
                </div>
            </article>
        `;
    }

    grille.innerHTML = htmlCartes;
};

// ===================================================================
// DEMANDES ENREGISTRÉES
// ===================================================================

// Un seul tableau d'objets Demande (remplace les tableaux parallèles noms / prenoms / ages / ...)
// "let" car on ne modifie jamais le tableau : on le remplace par une nouvelle copie (immutabilité)
let demandes = [];

// Retourne une copie du tableau sans l'élément à la position donnée (le tableau d'origine n'est pas modifié)
const retirerElement = (tableau, position) => [...tableau.slice(0, position), ...tableau.slice(position + 1)];

const CLE_DEMANDES = "demandesBFC";

// Sérialisation : JSON.stringify ne lit pas les champs privés (#)
// On construit donc des objets simples à partir des getters de chaque Demande
const sauvegarderDemandes = () => {
    let donnees = [];
    for (let i = 0; i < demandes.length; i++) {
        const demande = demandes[i];
        donnees = [...donnees, {
            nom: demande.nom,
            prenom: demande.prenom,
            age: demande.age,
            discipline: demande.discipline,
            horodatage: demande.horodatage
        }];
    }
    localStorage.setItem(CLE_DEMANDES, JSON.stringify(donnees));
};

// Désérialisation : localStorage -> JSON -> objets simples -> instances de Demande
const chargerDemandes = () => {
    const texte = localStorage.getItem(CLE_DEMANDES);

    // getItem renvoie null si la clé n'existe pas (null = falsy)
    if (!texte) {
        return;
    }

    // JSON.parse lève une SyntaxError si le texte est corrompu : try...catch obligatoire
    try {
        const donnees = JSON.parse(texte);

        let liste = [];
        for (let i = 0; i < donnees.length; i++) {
            liste = [...liste, Demande.depuisSauvegarde(donnees[i])];
        }
        demandes = liste;
    } catch (erreur) {
        console.error("Données illisibles, remise à zéro :", erreur.message);
        localStorage.removeItem(CLE_DEMANDES);
    }
};

// ===== Objets du noyau : Math et Date =====

// new Date() + toLocaleDateString : date du jour affichée dans l'entête
const afficherDateDuJour = () => {
    const maintenant = new Date();
    const dateFormatee = maintenant.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    document.querySelector("#date-du-jour").textContent = dateFormatee;
};

// Affiche les statistiques calculées par la méthode statique Demande.statistiques()
const afficherStatistiques = () => {
    const zone = document.querySelector("#statistiques");
    const stats = Demande.statistiques(demandes);

    // Aucune demande : rien à afficher
    if (!stats) {
        zone.innerHTML = "";
        return;
    }

    zone.innerHTML = `
        <div class="stat">
            <span class="stat-valeur">${stats.plusJeune} ans</span>
            <span class="stat-libelle">Plus jeune</span>
        </div>
        <div class="stat">
            <span class="stat-valeur">${stats.plusAge} ans</span>
            <span class="stat-libelle">Plus âgé</span>
        </div>
        <div class="stat">
            <span class="stat-valeur">${stats.moyenne} ans</span>
            <span class="stat-libelle">Âge moyen</span>
        </div>
    `;
};

// Math.random + Math.floor : sélectionne une discipline au hasard parmi celles proposées dans la liste
const choisirDisciplineAuHasard = () => {
    const champDiscipline = document.querySelector("#discipline");

    // La position 0 est l'invite ("-- Sélectionner... --") : il reste (nombre d'options - 1) vraies disciplines
    const nbDisciplines = champDiscipline.options.length - 1;
    if (nbDisciplines < 1) {
        return;
    }

    // Entier aléatoire entre 1 et nbDisciplines (même schéma que le cours : floor(random * n) + 1)
    const position = Math.floor(Math.random() * nbDisciplines) + 1;
    champDiscipline.selectedIndex = position;

    // Changement fait par le code (pas par l'utilisateur) : oninput ne se déclenche pas, on relance le contrôle
    controlerSaisie();
};

// Fonction d'affichage : génère une carte par demande et l'injecte dans la page
const afficherDemandes = () => {
    const liste = document.querySelector("#liste-demandes");
    const compteur = document.querySelector("#compteur");

    afficherStatistiques();

    // Ternaire : accord du mot "demande" selon le nombre
    compteur.textContent = demandes.length + " demande" + (demandes.length > 1 ? "s" : "");

    if (demandes.length === 0) {
        liste.innerHTML = "<p class='vide'>Aucune demande enregistrée pour le moment.</p>";
        return;
    }

    let htmlContenu = "";

    for (let i = 0; i < demandes.length; i++) {
        const demande = demandes[i];

        // Switch : une couleur d'en-tête différente selon la discipline
        let classeDiscipline;
        switch (demande.discipline) {
            case "Savate Boxe Française":
                classeDiscipline = "disc-boxe";
                break;
            case "Savate Défense":
                classeDiscipline = "disc-defense";
                break;
            case "Savate Training":
                classeDiscipline = "disc-training";
                break;
            case "Savate Forme":
                classeDiscipline = "disc-forme";
                break;
            default:
                classeDiscipline = "disc-autre";
        }

        // Les valeurs viennent des getters de la classe Demande (statut, dateFormatee, anciennete...)
        // onclick placé directement dans le HTML généré : il appelle supprimerDemande avec la position de la carte
        htmlContenu += `
            <article class="carte-demande">
                <h3 class="${classeDiscipline}">${demande.discipline}</h3>
                <p class="identite">${demande.prenom} ${demande.nom}</p>
                <p class="details">${demande.age} ans · ${demande.statut}</p>
                <p class="date-demande">${demande.dateFormatee}<br><span class="delai">${demande.anciennete}</span></p>
                <button type="button" class="btn-supprimer" onclick="supprimerDemande(${i})">Supprimer</button>
            </article>
        `;
    }

    liste.innerHTML = htmlContenu;
};

// Suppression directe d'une demande : on remplace chaque tableau par une copie sans l'élément
const supprimerDemande = (position) => {
    retirerElement(demandes, position);
    sauvegarderDemandes();

    afficherDemandes();
};

// Met à jour la liste déroulante selon l'âge saisi : seules les disciplines accessibles sont proposées
const mettreAJourDisciplines = () => {
    const champAge = document.querySelector("#age");
    const champDiscipline = document.querySelector("#discipline");

    // On mémorise le choix en cours pour le conserver s'il reste valide
    const choixActuel = champDiscipline.value;

    // Champ vide : on ne filtre pas, toutes les disciplines sont proposées
    const filtrer = champAge.value !== "";
    const age = Number(champAge.value);

    let htmlOptions = "";
    let nbDisponibles = 0;

    for (let i = 0; i < listeDisciplines.length; i++) {
        const discipline = listeDisciplines[i];

        // Méthode de la classe Disciplines
        if (!filtrer || discipline.accessiblePour(age)) {
            htmlOptions += `<option value="${discipline.getNom()}">${discipline.getNom()}</option>`;
            nbDisponibles++;
        }
    }

    // Ternaire : texte d'invite selon qu'il reste ou non des disciplines
    const invite = nbDisponibles === 0
        ? "-- Aucune discipline disponible à cet âge --"
        : "-- Sélectionner une discipline --";

    champDiscipline.innerHTML = `<option value="">${invite}</option>` + htmlOptions;

    champDiscipline.value = choixActuel;

    // L'âge a changé : on relance le contrôle de saisie
    controlerSaisie();
};

// ===== Contrôle de saisie =====

// Messages associés aux champs obligatoires (même ordre que les paramètres de trouverChampVide)
const messagesChamps = ["Veuillez renseigner le nom.", "Veuillez renseigner le prénom.", "Veuillez renseigner l'âge."];

// Paramètre Rest : accepte un nombre quelconque de valeurs et retourne la position de la première vide (-1 si aucune)
const trouverChampVide = (...valeurs) => {
    for (let i = 0; i < valeurs.length; i++) {
        if (!valeurs[i]) {
            return i;
        }
    }
    return -1;
};

// Retourne true si le texte contient au moins un chiffre
const contientChiffre = (texte) => {
    for (let i = 0; i < texte.length; i++) {
        if ("0123456789".includes(texte[i])) {
            return true;
        }
    }
    return false;
};

// Lit les champs du formulaire et retourne leurs valeurs dans un tableau
const lireFormulaire = () => [
    document.querySelector("#nom").value,
    document.querySelector("#prenom").value,
    document.querySelector("#age").value,
    document.querySelector("#discipline").value
];

// Retourne le premier message d'erreur ("" si tout est correct)
// soumission = true : on exige que tous les champs soient remplis ; false : on ne contrôle que ce qui est déjà saisi
const verifierSaisie = (soumission) => {
    // Déstructuration : on extrait directement chaque valeur du tableau
    const [nom, prenom, ageTexte, discipline] = lireFormulaire();
    const age = Number(ageTexte);
    // Déstructuration : on ne garde que la première discipline (la Boxe Française) pour l'âge minimum d'une séance d'essai
    const [boxe] = listeDisciplines;
    const ageMinimumEssai = boxe.getAgeMinimum();

    if (soumission) {
        if (nom.trim() === "") {
            return "Veuillez renseigner le nom.";
        }

        if (prenom.trim() === "") {
            return "Veuillez renseigner le prénom.";
        }

        if (ageTexte === "") {
            return "Veuillez renseigner l'âge.";
        }
    }

    if (contientChiffre(nom)) {
        return "Le nom ne doit pas contenir de chiffres.";
    }
    if (contientChiffre(prenom)) {
        return "Le prénom ne doit pas contenir de chiffres.";
    }
    if (ageTexte !== "" && age < ageMinimumEssai) {
        return "L'âge minimum pour une séance d'essai est de " + ageMinimumEssai + " ans.";
    }
    if (soumission && !discipline) {
        return "Veuillez choisir une discipline.";
    }

    // Objet Disciplines correspondant au choix (null si aucune discipline choisie)
    const disciplineChoisie = trouverDiscipline(discipline);
    if (disciplineChoisie && ageTexte !== "" && !disciplineChoisie.accessiblePour(age)) {
        return discipline + " est accessible à partir de " + disciplineChoisie.getAgeMinimum() + " ans.";
    }

    return "";
};

// Appelée à chaque saisie (oninput) : affiche l'erreur en temps réel
const controlerSaisie = () => {
    document.querySelector("#message-erreur").textContent = verifierSaisie(false);
    sauvegarderBrouillon();
};

const CLE_BROUILLON = "brouillonFormulaire";

// Appelée à chaque saisie : on mémorise l'état du formulaire pour cet onglet
const sauvegarderBrouillon = () => {
    sessionStorage.setItem(CLE_BROUILLON, JSON.stringify(lireFormulaire()));
};

// Au chargement : on remet les champs comme l'utilisateur les avait laissés
const restaurerBrouillon = () => {
    const texte = sessionStorage.getItem(CLE_BROUILLON);
    if (!texte) {
        return;
    }

    try {
        const [nom, prenom, age, discipline] = JSON.parse(texte);

        document.querySelector("#nom").value = nom;
        document.querySelector("#prenom").value = prenom;
        document.querySelector("#age").value = age;

        // On reconstruit d'abord la liste des disciplines selon l'âge...
        mettreAJourDisciplines();
        // ...puis seulement on re-sélectionne la discipline
        document.querySelector("#discipline").value = discipline;
        controlerSaisie();
    } catch (erreur) {
        sessionStorage.removeItem(CLE_BROUILLON);
    }
};

// ===== Message de confirmation =====

// Délai avant fermeture automatique du message (en ms)
let minuteurConfirmation;

// Affiche le message de confirmation au milieu de l'écran, puis le masque tout seul
const afficherConfirmation = () => {
    const confirmation = document.querySelector("#confirmation");
    confirmation.classList.add("visible");

    clearTimeout(minuteurConfirmation);
    minuteurConfirmation = setTimeout(fermerConfirmation, 3000);
};

// Masque le message (appelée aussi au clic sur le message)
const fermerConfirmation = () => {
    document.querySelector("#confirmation").classList.remove("visible");
};

// ===== Enregistrement =====

// Appelée à la soumission du formulaire (onsubmit) : valide, ajoute aux tableaux, puis affiche
const EnregistrerDemande = (event) => {
    event.preventDefault();

    const messageErreur = document.querySelector("#message-erreur");

    // Validation complète : on affiche la première erreur rencontrée
    const erreur = verifierSaisie(true);
    messageErreur.textContent = erreur;

    if (erreur !== "") {
        return;
    }

    // Tout est valide : on récupère les valeurs par déstructuration
    const [nom, prenom, ageTexte, discipline] = lireFormulaire();

    // Instanciation : new appelle le constructeur de la classe Demande
    // Opérateur Spread : le tableau est recréé avec la nouvelle demande (pas de push, donc pas de mutation)
    const nouvelleDemande = new Demande(nom, prenom, ageTexte, discipline);
    demandes.push(nouvelleDemande);
    sauvegarderDemandes();

    // Réinitialisation du formulaire
    document.querySelector("#nom").value = "";
    document.querySelector("#prenom").value = "";
    document.querySelector("#age").value = "";
    document.querySelector("#discipline").value = "";
    mettreAJourDisciplines();

    sessionStorage.removeItem(CLE_BROUILLON);

    afficherDemandes();
    afficherConfirmation();
};

// Affichage initial
afficherDateDuJour();
chargerDemandes();
afficherDemandes();
afficherEquipe();
restaurerBrouillon();