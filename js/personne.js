class Personne {
    #nom;
    #prenom;

    constructor(nom, prenom) {
        this.nom = nom;
        this.prenom = prenom;
    }

    get nom() {
        return this.#nom.toUpperCase();
    }

    set nom(nom) {
        this.#nom = nom.trim();
    }

    get prenom() {
        return this.#prenom.charAt(0).toUpperCase() + this.#prenom.slice(1);
    }

    set prenom(prenom) {
        this.#prenom = prenom.trim();
    }

    get initiales() {
        return this.prenom[0] + this.nom[0];
    }

    afficher() {
        return `${this.prenom} ${this.nom}`;
    }
}
class Coach extends Personne {
    #fonction;
    #cours;
    #categorieBoxe;
    #occasionnel;

    constructor(nom, prenom, fonction, cours, categorieBoxe, occasionnel) {
        super(nom, prenom); // Appel obligatoire du constructeur parent, avant d'utiliser this
        this.#fonction = fonction;
        this.#cours = cours;
        this.#categorieBoxe = categorieBoxe;
        this.#occasionnel = occasionnel;
    }

    get fonction() {
        return this.#fonction;
    }

    get cours() {
        return [...this.#cours];
    }

    get categorieBoxe() {
        return this.#categorieBoxe;
    }

    get occasionnel() {
        return this.#occasionnel;
    }

    get estPresident() {
        return this.#fonction === "Président du club";
    }

    afficher() {
        return `${super.afficher()} – ${this.#fonction}`;
    }
}

class Demande extends Personne {
    static ageMajorite = 18;
    static MS_PAR_JOUR = 1000 * 60 * 60 * 24; // Une journée en millisecondes

    #age;
    #discipline;
    #horodatage;

    constructor(nom, prenom, age, discipline, horodatage) {
        super(nom, prenom);
        this.age = age;
        this.#discipline = discipline;
        this.#horodatage = horodatage || Date.now();
    }

    get age() {
        return this.#age;
    }

    set age(age) {
        this.#age = Number(age);
    }

    get discipline() {
        return this.#discipline;
    }

    get horodatage() {
        return this.#horodatage;
    }

    #estMineur() {
        return this.#age < Demande.ageMajorite;
    }

    get statut() {
        return this.#estMineur() ? "Mineur" : "Majeur";
    }

    // Objet Date : date de la demande au format français
    get dateFormatee() {
        const date = new Date(this.#horodatage);
        return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    }

    // Écart entre maintenant et la demande (soustraction de timestamps), converti en jours entiers
    get joursEcoules() {
        const maintenant = new Date();
        const dateDemande = new Date(this.#horodatage);
        const ecartMs = maintenant.getTime() - dateDemande.getTime();
        return Math.floor(ecartMs / Demande.MS_PAR_JOUR);
    }

    get anciennete() {
        const jours = this.joursEcoules;
        if (jours === 0) {
            return "Reçue aujourd'hui";
        }
        return "Reçue il y a " + jours + " jour" + (jours > 1 ? "s" : "");
    }

    // Méthode statique : recrée une Demande à partir d'un objet lu dans le localStorage
    static depuisSauvegarde(objet) {
        return new Demande(objet.nom, objet.prenom, objet.age, objet.discipline, objet.horodatage);
    }

    // Méthode statique : statistiques sur une liste de demandes (Math.min / Math.max / Math.round)
    // Retourne null si la liste est vide (Math.min() d'un tableau vide donnerait Infinity)
    static statistiques(liste) {
        if (liste.length === 0) {
            return null;
        }

        let ages = [];
        let somme = 0;
        for (let i = 0; i < liste.length; i++) {
            ages.push(liste[i].age);
            somme += liste[i].age;
        }

        return {
            plusJeune: Math.min(...ages),
            plusAge: Math.max(...ages),
            moyenne: Math.round((somme / ages.length) * 100) / 100 // arrondi à 2 décimales
        };
    }
}