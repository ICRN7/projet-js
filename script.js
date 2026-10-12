// Disciplines du club : tableaux parallèles (même position = même discipline)
const nomsDisciplines = ["Savate Boxe Française", "Savate Défense", "Savate Training", "Savate Forme"];
const agesMinimum = [7, 12, 14, 16];

// Équipe du club : tableaux parallèles (même position = même moniteur)
const nomsCoachs = ["Philippe SUISSE", "Anne-Laure SUISSE", "Maëva CARON", "Damien DIEFFENBACH", "Julien WILLO", "Nicolas CHIUMMIENTO"];
const fonctionsCoachs = ["Président du club", "Monitrice", "Monitrice", "Moniteur", "Moniteur", "Moniteur"];
// Chaque case contient elle-même un tableau : les disciplines enseignées par le moniteur
const coursCoachs = [
    ["Savate Boxe Française", "Savate Forme", "Savate Défense", "Savate Training"],
    ["Savate Boxe Française", "Savate Forme"],
    ["Savate Boxe Française"],
    ["Savate Boxe Française", "Savate Training"],
    ["Savate Boxe Française"],
    ["Savate Boxe Française"]
];
// Catégorie d'âge des cours de Boxe Française du moniteur ("" = non précisée)
const categoriesBoxe = ["Cours enfants / ados / adultes", "Cours enfants", "Cours enfants", "Cours ados / adultes", "Cours ados / adultes", "Cours ados / adultes"];
// true = le moniteur n'intervient que de temps en temps
const occasionnels = [false, false, false, false, false, true];

// Affichage de l'équipe : une carte par moniteur
const afficherEquipe = () => {
    const grille = document.querySelector("#liste-equipe");
    let htmlCartes = "";

    for (let i = 0; i < nomsCoachs.length; i++) {
        // Déstructuration : on extrait directement le prénom et le nom du moniteur
        const [prenomCoach, nomCoach] = nomsCoachs[i].split(" ");
        const initiales = prenomCoach[0] + nomCoach[0];

        // Boucle imbriquée : une "puce" par discipline
        let puces = "";
        for (let j = 0; j < coursCoachs[i].length; j++) {
            puces += `<span class="puce">${coursCoachs[i][j]}</span>`;

            // Truthy / falsy : si une catégorie d'âge est renseignée, on la place après la Boxe Française
            if (coursCoachs[i][j] === "Savate Boxe Française" && categoriesBoxe[i]) {
                puces += `<span class="puce puce-cours">${categoriesBoxe[i]}</span>`;
            }
        }

        // Ternaire : la carte du président est mise en avant
        const classeCarte = fonctionsCoachs[i] === "Président du club" ? "carte-coach carte-president" : "carte-coach";

        // Ternaire : mention affichée uniquement pour les intervenants occasionnels
        const mention = occasionnels[i]
            ? '<p class="occasionnel">Intervient occasionnellement</p>'
            : "";

        htmlCartes += `
            <article class="${classeCarte} ${occasionnels[i] ? "carte-occasionnelle" : ""}">
                <div class="badge-coach couleur-${i % 4}">${initiales}</div>
                <div class="infos-coach">
                    <h3>${nomsCoachs[i]}</h3>
                    <p class="fonction">${fonctionsCoachs[i]}</p>
                    <div class="puces">${puces}</div>
                    ${mention}
                </div>
            </article>
        `;
    }

    grille.innerHTML = htmlCartes;
};

// Demandes enregistrées : tableaux parallèles (même position = même demande)
// "let" car on ne modifie jamais un tableau : on le remplace par une nouvelle copie (immutabilité)
let noms = [];
let prenoms = [];
let ages = [];
let disciplines = [];
// Horodatage de chaque demande : timestamp en millisecondes (Date.now()), même position que les autres tableaux
let horodatages = [];

// Retourne une copie du tableau sans l'élément à la position donnée (le tableau d'origine n'est pas modifié)
const retirerElement = (tableau, position) => [...tableau.slice(0, position), ...tableau.slice(position + 1)];

// Clé unique : on range les 4 tableaux parallèles dans un seul objet
const CLE_DEMANDES = "demandesBFC";

// Sérialisation : objet -> chaîne JSON -> localStorage
const sauvegarderDemandes = () => {
    const donnees = { noms, prenoms, ages, disciplines, horodatages };
    localStorage.setItem(CLE_DEMANDES, JSON.stringify(donnees));
};

// Désérialisation : localStorage -> chaîne JSON -> objet -> tableaux
const chargerDemandes = () => {
    const texte = localStorage.getItem(CLE_DEMANDES);

    // getItem renvoie null si la clé n'existe pas (null = falsy)
    if (!texte) {
        return;
    }

    // JSON.parse lève une SyntaxError si le texte est corrompu : try...catch obligatoire
    try {
        const donnees = JSON.parse(texte);
        ({ noms, prenoms, ages, disciplines, horodatages } = donnees);

        // Anciennes sauvegardes (sans horodatage) : on date les demandes existantes d'aujourd'hui, puis on resauvegarde
        if (!horodatages) {
            horodatages = noms.map(() => Date.now());
            sauvegarderDemandes();
        }
    } catch (erreur) {
        console.error("Données illisibles, remise à zéro :", erreur.message);
        localStorage.removeItem(CLE_DEMANDES);
    }
};

// ===== Objets du noyau : Math et Date =====

// Une journée en millisecondes (1000 ms x 60 s x 60 min x 24 h)
const MS_PAR_JOUR = 1000 * 60 * 60 * 24;

// Math.round : arrondi à 2 décimales (on décale la virgule, on arrondit, on la remet)
const arrondir2Decimales = (nombre) => Math.round(nombre * 100) / 100;

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

// Timestamp -> objet Date -> texte au format français
const formaterDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

// Écart entre maintenant et la demande : soustraction de timestamps (ms), puis conversion en jours entiers
const joursEcoules = (timestamp) => {
    const maintenant = new Date();
    const dateDemande = new Date(timestamp);
    const ecartMs = maintenant.getTime() - dateDemande.getTime();
    return Math.floor(ecartMs / MS_PAR_JOUR);
};

// Texte d'ancienneté d'une demande
const libelleAnciennete = (timestamp) => {
    const jours = joursEcoules(timestamp);
    if (jours === 0) {
        return "Reçue aujourd'hui";
    }
    return "Reçue il y a " + jours + " jour" + (jours > 1 ? "s" : "");
};

// Math.min / Math.max avec le Spread operator : extrêmes des âges ; moyenne arrondie avec Math.round
const afficherStatistiques = () => {
    const zone = document.querySelector("#statistiques");

    // Aucune demande : Math.min() / Math.max() d'un tableau vide donneraient Infinity, on n'affiche rien
    if (ages.length === 0) {
        zone.innerHTML = "";
        return;
    }

    let somme = 0;
    for (let i = 0; i < ages.length; i++) {
        somme += ages[i];
    }

    const moyenne = arrondir2Decimales(somme / ages.length);
    const plusJeune = Math.min(...ages);
    const plusAge = Math.max(...ages);

    zone.innerHTML = `
        <div class="stat">
            <span class="stat-valeur">${plusJeune} ans</span>
            <span class="stat-libelle">Plus jeune</span>
        </div>
        <div class="stat">
            <span class="stat-valeur">${plusAge} ans</span>
            <span class="stat-libelle">Plus âgé</span>
        </div>
        <div class="stat">
            <span class="stat-valeur">${moyenne.toLocaleString("fr-FR")} ans</span>
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
    compteur.textContent = noms.length + " demande" + (noms.length > 1 ? "s" : "");

    if (noms.length === 0) {
        liste.innerHTML = "<p class='vide'>Aucune demande enregistrée pour le moment.</p>";
        return;
    }

    let htmlContenu = "";

    for (let i = 0; i < noms.length; i++) {

        // Switch : une couleur d'en-tête différente selon la discipline
        let classeDiscipline;
        switch (disciplines[i]) {
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

        // Ternaire : mention mineur / majeur
        const statut = ages[i] < 18 ? "Mineur" : "Majeur";

        // onclick placé directement dans le HTML généré : il appelle supprimerDemande avec la position de la carte
        htmlContenu += `
            <article class="carte-demande">
                <h3 class="${classeDiscipline}">${disciplines[i]}</h3>
                <p class="identite">${prenoms[i]} ${noms[i]}</p>
                <p class="details">${ages[i]} ans · ${statut}</p>
                <p class="date-demande">${formaterDate(horodatages[i])}<br>${libelleAnciennete(horodatages[i])}</p>
                <button type="button" class="btn-supprimer" onclick="supprimerDemande(${i})">Supprimer</button>
            </article>
        `;
    }

    liste.innerHTML = htmlContenu;
};

// Suppression directe d'une demande : on remplace chaque tableau par une copie sans l'élément
const supprimerDemande = (position) => {
    noms = retirerElement(noms, position);
    prenoms = retirerElement(prenoms, position);
    ages = retirerElement(ages, position);
    disciplines = retirerElement(disciplines, position);
    horodatages = retirerElement(horodatages, position);
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

    for (let i = 0; i < nomsDisciplines.length; i++) {
        if (!filtrer || age >= agesMinimum[i]) {
            htmlOptions += `<option value="${nomsDisciplines[i]}">${nomsDisciplines[i]}</option>`;
            nbDisponibles++;
        }
    }

    // Ternaire : texte d'invite selon qu'il reste ou non des disciplines
    const invite = nbDisponibles === 0
        ? "-- Aucune discipline disponible à cet âge --"
        : "-- Sélectionner une discipline --";

    champDiscipline.innerHTML = `<option value="">${invite}</option>` + htmlOptions;

    // Si l'ancien choix est toujours proposé, on le re-sélectionne (sinon retour à l'invite)
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

// Retourne l'âge minimum de la discipline donnée (0 si aucune discipline choisie)
const trouverAgeRequis = (discipline) => {
    let ageRequis = 0;
    for (let i = 0; i < nomsDisciplines.length; i++) {
        if (nomsDisciplines[i] === discipline) {
            ageRequis = agesMinimum[i];
        }
    }
    return ageRequis;
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
    // Déstructuration : on ne garde que le premier âge minimum (celui de la Boxe Française)
    const [ageMinimumEssai] = agesMinimum;

    if (soumission) {
        const positionVide = trouverChampVide(nom, prenom, ageTexte);
        if (positionVide !== -1) {
            return messagesChamps[positionVide];
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

    const ageRequis = trouverAgeRequis(discipline);
    if (ageTexte !== "" && age < ageRequis) {
        return discipline + " est accessible à partir de " + ageRequis + " ans.";
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

    // Opérateur Spread : chaque tableau est recréé avec le nouvel élément (pas de push, donc pas de mutation)
    noms = [...noms, nom];
    prenoms = [...prenoms, prenom];
    ages = [...ages, Number(ageTexte)];
    disciplines = [...disciplines, discipline];
    // Date.now() : timestamp (ms depuis le 1er janvier 1970 UTC) de l'instant de l'enregistrement
    horodatages = [...horodatages, Date.now()];
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