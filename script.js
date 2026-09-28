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
function afficherEquipe() {
    const grille = document.querySelector("#liste-equipe");
    let htmlCartes = "";

    for (let i = 0; i < nomsCoachs.length; i++) {
        // Initiales pour le badge : première lettre du prénom + première lettre du nom
        const morceaux = nomsCoachs[i].split(" ");
        const initiales = morceaux[0][0] + morceaux[1][0];

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
}

// Demandes enregistrées : tableaux parallèles (même position = même demande)
const noms = [];
const prenoms = [];
const ages = [];
const disciplines = [];

// Fonction d'affichage : génère une carte par demande et l'injecte dans la page
function afficherDemandes() {
    const liste = document.querySelector("#liste-demandes");
    const compteur = document.querySelector("#compteur");

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

        htmlContenu += `
            <article class="carte-demande">
                <h3 class="${classeDiscipline}">${disciplines[i]}</h3>
                <p class="identite">${prenoms[i]} ${noms[i]}</p>
                <p class="details">${ages[i]} ans · ${statut}</p>
            </article>
        `;
    }

    liste.innerHTML = htmlContenu;
}

// Met à jour la liste déroulante selon l'âge saisi : seules les disciplines accessibles sont proposées
function mettreAJourDisciplines() {
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
}

// À chaque frappe dans le champ âge, la liste des disciplines est recalculée
document.querySelector("#age").addEventListener("input", mettreAJourDisciplines);

// Appelée à la soumission du formulaire : valide, ajoute aux tableaux, puis affiche
function EnregistrerDemande(event) {
    event.preventDefault();

    const champNom = document.querySelector("#nom");
    const champPrenom = document.querySelector("#prenom");
    const champAge = document.querySelector("#age");
    const champDiscipline = document.querySelector("#discipline");
    const messageErreur = document.querySelector("#message-erreur");

    const nom = champNom.value;
    const prenom = champPrenom.value;
    const age = Number(champAge.value);
    const discipline = champDiscipline.value;

    // Recherche de l'âge minimum de la discipline choisie dans les tableaux parallèles
    let ageRequis = 0;
    for (let i = 0; i < nomsDisciplines.length; i++) {
        if (nomsDisciplines[i] === discipline) {
            ageRequis = agesMinimum[i];
        }
    }

    // Validation : on garde le premier message d'erreur rencontré
    let erreur = "";
    if (!nom) {
        erreur = "Veuillez renseigner le nom.";
    } else if (!prenom) {
        erreur = "Veuillez renseigner le prénom.";
    } else if (!champAge.value) {
        erreur = "Veuillez renseigner l'âge.";
    } else if (age < agesMinimum[0]) {
        erreur = "L'âge minimum pour une séance d'essai est de " + agesMinimum[0] + " ans.";
    } else if (!discipline) {
        erreur = "Veuillez choisir une discipline.";
    } else if (age < ageRequis) {
        erreur = discipline + " est accessible à partir de " + ageRequis + " ans.";
    }

    if (erreur !== "") {
        messageErreur.textContent = erreur;
        return;
    }

    // Tout est valide : on ajoute la demande dans chaque tableau
    noms.push(nom);
    prenoms.push(prenom);
    ages.push(age);
    disciplines.push(discipline);

    // Réinitialisation du formulaire
    messageErreur.textContent = "";
    champNom.value = "";
    champPrenom.value = "";
    champAge.value = "";
    champDiscipline.value = "";
    mettreAJourDisciplines();

    afficherDemandes();
}

// Affichage initial (liste vide)
afficherDemandes();
afficherEquipe();