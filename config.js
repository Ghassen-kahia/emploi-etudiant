/*
 * ============================================================
 *  FICHIER DE CONFIGURATION — le seul fichier à modifier
 * ============================================================
 *
 *  Toutes les informations variables du site sont ici :
 *  contact, CV, disponibilités, langues.
 *
 *  Règle simple : une valeur vide ("" ou null) est MASQUÉE sur le
 *  site en ligne. En local (localhost), elle apparaît sous forme
 *  d'encadré « À compléter » pour que vous sachiez quoi remplir.
 *
 *  N'inscrivez ici que des informations que vous acceptez de rendre
 *  publiques (pas d'adresse postale, pas de numéro de titre de séjour).
 */
window.PROFIL = {

  /* ---------- Contact ---------- */
  contact: {
    email: "ghassenkahya@gmail.com",
    telephone: "+33 7 46 50 35 73",   // déjà visible dans le CV ; mettre "" pour le retirer du site
    linkedin: "",       // ex. "https://www.linkedin.com/in/votre-profil/"
    github: "https://github.com/Ghassen-kahia",
    portfolio: "https://ghassen-kahia.github.io/",
    ville: "Dijon",
    zone: "Dijon et alentours"   // ex. "Dijon, Chenôve, Quetigny, Talant…"
  },

  /* ---------- Photo (facultatif) ----------
   * Photo professionnelle, cadrée épaules, fond neutre, format carré
   * (ex. 600 × 600 px, JPG < 150 Ko). Placez-la dans assets/img/.
   * Laisser "" pour afficher le monogramme « GK » à la place.
   */
  photo: "assets/img/photo.jpg",

  /* ---------- Mobilité (facultatif) ----------
   * Rassure sur les horaires matinaux ou tardifs. Uniquement si c'est exact.
   * ex. "Tram et bus Divia" · "Vélo" · "Permis B"
   */
  mobilite: "Titulaire du permis B",

  /* ---------- Date de mise à jour de la page ----------
   * Affichée en bas de page : montre au recruteur que les informations sont à jour.
   */
  miseAJourPage: "11 octobre 2026",

  /* ---------- CV ----------
   * Déposez votre fichier PDF dans le dossier /cv/ et indiquez son nom ici.
   * Le site détecte automatiquement sa présence : tant qu'il est absent,
   * le bouton affiche « CV disponible sur demande ».
   */
  cv: {
    fichier: "cv/Ghassen_Kahia_CVJob_Etudiant.pdf",
    miseAJour: ""       // ex. "octobre 2026" — affiché sous le bouton si renseigné
  },

  /* ---------- Libellé de disponibilité (en-tête de page) ----------
   * Court et honnête. Exemples :
   *   "Disponibilités à confirmer"
   *   "Disponible à partir du 3 novembre"
   *   "Disponible soirs et week-ends"
   */
  libelleDisponibilite: "Disponible immédiatement",

  /* ---------- Disponibilités hebdomadaires ----------
   * confirme : passez à true UNIQUEMENT quand votre emploi du temps est connu.
   *            Tant que c'est false, le site affiche un message
   *            « en cours de confirmation » au lieu d'un planning.
   *
   * statut de chaque jour :
   *   "disponible"    → journée entière ou créneaux listés
   *   "partiel"       → seulement les créneaux listés
   *   "indisponible"  → aucun créneau
   *   "a-confirmer"   → pas encore connu
   *
   * creneaux : liste de plages horaires, ex. ["18h00 – 22h00"]
   */
  disponibilites: {
    confirme: true,
    jours: {
      lundi:    { statut: "partiel",    creneaux: ["À partir de 18h00"] },
      mardi:    { statut: "partiel",    creneaux: ["À partir de 18h00"] },
      mercredi: { statut: "partiel",    creneaux: ["À partir de 18h00"] },
      jeudi:    { statut: "partiel",    creneaux: ["À partir de 18h00"] },
      vendredi: { statut: "partiel",    creneaux: ["À partir de 18h00"] },
      samedi:   { statut: "disponible", creneaux: [] },
      dimanche: { statut: "disponible", creneaux: [] }
    },
    // Résumés affichés sous le planning (laisser "" pour masquer)
    matins: "",            // ex. "Ouvertures possibles dès 6h le samedi" (utile en grande distribution)
    soirs: "En semaine, à partir de 18h",
    weekends: "Samedi et dimanche, toute la journée",
    vacances: "Disponible pendant les vacances scolaires",
    heuresParSemaine: "15 à 20 heures par semaine",
    debut: "Immédiatement, jusqu’à fin février 2027"
  },

  /* ---------- Langues ----------
   * N'indiquez que des niveaux que vous pouvez justifier en entretien.
   * ex. { langue: "Français", niveau: "Courant" }
   */
  langues: [
    { langue: "Français", niveau: "Courant (B2)" },
    { langue: "Anglais",  niveau: "Courant (B2)" },
    { langue: "Arabe",    niveau: "Langue maternelle" }
  ],

  /* ---------- Autorisation de travail ----------
   * Phrase optionnelle pour rassurer l'employeur, à rédiger vous-même
   * selon votre situation exacte. Ne mentionnez aucun numéro de document.
   * ex. "Titre de séjour étudiant autorisant une activité salariée à temps partiel"
   */
  autorisationTravail: "Titre de séjour étudiant, autorisé à travailler (jusqu’à 964 h/an)"
};
