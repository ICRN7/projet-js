// Calcule un âge (en années) à partir d'une date de naissance
function calculerAge(dateNaissance) {
    const naissance = new Date(dateNaissance);
    const aujourdHui = new Date();

    let age = aujourdHui.getFullYear() - naissance.getFullYear();

    // On vérifie si l'anniversaire est déjà passé cette année
    const moisEcart = aujourdHui.getMonth() - naissance.getMonth();
    if (moisEcart < 0 || (moisEcart === 0 && aujourdHui.getDate() < naissance.getDate())) {
        age = age - 1;
    }

    return age;
}

// Reconstruit la liste des disciplines proposées en fonction de l'âge minimum requis pour chacune
function filtrerDisciplines() {
    const champDateNaissance = document.querySelector("#dateNaissance");
    const selectDiscipline = document.querySelector("#discipline");

    // Si aucune date n'est encore saisie, on ne fait rien
    if (champDateNaissance.value === "") {
        return;
    }

    const age = calculerAge(champDateNaissance.value);

    // Deux tableaux en parallèle : le nom de chaque discipline et son âge minimum requis
    const nomsDisciplines = ["Savate Boxe Française", "Savate Défense", "Savate Training", "Savate Forme"];
    const agesMinimum = [7, 12, 14, 16];

    // On repart d'un select vide avant de le remplir
    selectDiscipline.innerHTML = "<option value=''>-- Sélectionner une discipline --</option>";

    // On parcourt les disciplines et on ajoute uniquement celles accessibles à cet âge
    for (let i = 0; i < nomsDisciplines.length; i++) {
        if (age >= agesMinimum[i]) {
            selectDiscipline.innerHTML += `<option value="${nomsDisciplines[i]}">${nomsDisciplines[i]}</option>`;
        }
    }
}

// Fonction d'affichage : reçoit des données et les écrit dans la page
function afficherDonnees(nom, prenom, age, discipline) {
    const carteNom = document.querySelector("#carte-nom");
    const cartePrenom = document.querySelector("#carte-prenom");
    const carteAge = document.querySelector("#carte-age");
    const carteDiscipline = document.querySelector("#carte-discipline");

    carteNom.textContent = "Nom : " + nom;
    cartePrenom.textContent = "Prénom : " + prenom;
    carteAge.textContent = "Âge : " + age + " ans";
    carteDiscipline.textContent = "Discipline : " + discipline;
}

// Appelée à la soumission du formulaire
function EnregistrerDemande(event) {
    event.preventDefault(); // empêche le rechargement de la page

    const champNom = document.querySelector("#nom");
    const champPrenom = document.querySelector("#prenom");
    const champDateNaissance = document.querySelector("#dateNaissance");
    const champDiscipline = document.querySelector("#discipline");

    const nom = champNom.value;
    const prenom = champPrenom.value;
    const age = calculerAge(champDateNaissance.value);
    const discipline = champDiscipline.value;

    afficherDonnees(nom, prenom, age, discipline);

    // Réinitialiser le formulaire
    champNom.value = "";
    champPrenom.value = "";
    champDateNaissance.value = "";
    champDiscipline.value = "";
}

