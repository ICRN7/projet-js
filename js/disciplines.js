class Disciplines {
    nom;
    ageMinimum;

    constructor(nom, ageMinimum) {
        this.nom = nom;
        this.ageMinimum = ageMinimum;
    }

    getNom() {
        return this.nom;
    }

    getAgeMinimum() {
        return this.ageMinimum;
    }

    accessiblePour(age) {
        return age >= this.ageMinimum;
    }
}