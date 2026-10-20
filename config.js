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
 *
 *  TRADUCTIONS : un texte peut être écrit simplement ("…"), il sera
 *  alors identique dans les trois langues, ou sous la forme
 *  { fr: "…", en: "…", de: "…", es: "…" } pour être traduit (FR / EN / DE / ES).
 *  Les autres textes du site se traduisent dans assets/js/i18n.js.
 */
window.PROFIL = {

  /* ---------- Contact ---------- */
  contact: {
    email: "ghassenkahia.pro@gmail.com",
    telephone: "+33 7 46 50 35 73",   // déjà visible dans le CV ; mettre "" pour le retirer du site
    linkedin: "",       // ex. "https://www.linkedin.com/in/votre-profil/"
    github: "https://github.com/Ghassen-kahia",
    portfolio: "https://ghassen-kahia.github.io/",
    ville: "Dijon",
    zone: { fr: "Dijon et alentours", en: "Dijon and surrounding area", de: "Dijon und Umgebung", es: "Dijon y alrededores" }
  },

  /* ---------- Photo (facultatif) ----------
   * Photo professionnelle, cadrée épaules, fond neutre, format carré
   * (ex. 600 × 600 px, JPG < 150 Ko). Placez-la dans assets/img/.
   * Laisser "" pour afficher le monogramme « GK » à la place.
   */
  photo: "assets/img/me.jpeg",

  /* ---------- Logos des établissements et entreprises (facultatif) ----------
   * Déposez le fichier (SVG ou PNG, fond transparent ou blanc) dans
   * assets/img/logos/ et indiquez son chemin, ex. "assets/img/logos/act.png".
   * Laisser "" : un badge avec le nom s'affiche à la place.
   */
  logos: {
    issat: "assets/img/logos/issat.jpg",
    rif: "assets/img/logos/rif.png",
    act: "assets/img/logos/act.svg",
    espritEntreprise: "assets/img/logos/esprit.svg",   // ESPRIT Entreprise utilise le logo ESPRIT
    horizonData: "assets/img/logos/horizon-data.png",
    res2boost: "assets/img/logos/res2boost.jpg",
    tunisieTelecom: "assets/img/logos/tunisie-telecom.png"
  },

  /* ---------- Âge (facultatif) ----------
   * Un simple nombre, à mettre à jour après votre anniversaire.
   * Mettre "" pour ne pas l'afficher.
   */
  age: 25,

  /* ---------- Mobilité (facultatif) ----------
   * Rassure sur les horaires matinaux ou tardifs. Uniquement si c'est exact.
   * ex. "Tram et bus Divia" · "Vélo" · "Permis B"
   */
  mobilite: { fr: "Titulaire du permis B", en: "Full driving licence (category B)", de: "Führerschein Klasse B", es: "Carnet de conducir B" },

  /* ---------- Date de mise à jour de la page ----------
   * Affichée en bas de page : montre au recruteur que les informations sont à jour.
   */
  miseAJourPage: { fr: "11 octobre 2026", en: "11 October 2026", de: "11. Oktober 2026", es: "11 de octubre de 2026" },

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
  libelleDisponibilite: { fr: "Disponible immédiatement", en: "Available immediately", de: "Ab sofort verfügbar", es: "Disponible de inmediato" },

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
      lundi:    { statut: "partiel",    creneaux: [{ fr: "À partir de 18h00", en: "From 6 pm", de: "Ab 18:00 Uhr", es: "A partir de las 18:00" }] },
      mardi:    { statut: "partiel",    creneaux: [{ fr: "À partir de 18h00", en: "From 6 pm", de: "Ab 18:00 Uhr", es: "A partir de las 18:00" }] },
      mercredi: { statut: "partiel",    creneaux: [{ fr: "À partir de 18h00", en: "From 6 pm", de: "Ab 18:00 Uhr", es: "A partir de las 18:00" }] },
      jeudi:    { statut: "partiel",    creneaux: [{ fr: "À partir de 18h00", en: "From 6 pm", de: "Ab 18:00 Uhr", es: "A partir de las 18:00" }] },
      vendredi: { statut: "partiel",    creneaux: [{ fr: "À partir de 18h00", en: "From 6 pm", de: "Ab 18:00 Uhr", es: "A partir de las 18:00" }] },
      samedi:   { statut: "disponible", creneaux: [] },
      dimanche: { statut: "disponible", creneaux: [] }
    },
    // Résumés affichés sous le planning (laisser "" pour masquer)
    matins: "",            // ex. "Ouvertures possibles dès 6h le samedi" (utile en grande distribution)
    soirs: { fr: "En semaine, à partir de 18h", en: "Weekdays from 6 pm", de: "Werktags ab 18 Uhr", es: "Entre semana, a partir de las 18:00" },
    weekends: { fr: "Samedi et dimanche, toute la journée", en: "Saturday and Sunday, all day", de: "Samstag und Sonntag, ganztägig", es: "Sábado y domingo, todo el día" },
    vacances: { fr: "Disponible pendant les vacances scolaires", en: "Available during school holidays", de: "In den Schulferien verfügbar", es: "Disponible durante las vacaciones escolares" },
    heuresParSemaine: { fr: "15 à 20 heures par semaine", en: "15 to 20 hours per week", de: "15 bis 20 Stunden pro Woche", es: "De 15 a 20 horas semanales" },
    debut: { fr: "Immédiatement, jusqu’à fin février 2027", en: "Immediately, until the end of February 2027", de: "Ab sofort bis Ende Februar 2027", es: "De inmediato, hasta finales de febrero de 2027" }
  },

  /* ---------- Langues ----------
   * N'indiquez que des niveaux que vous pouvez justifier en entretien.
   * ex. { langue: "Français", niveau: "Courant" }
   */
  langues: [
    {
      langue: { fr: "Français", en: "French", de: "Französisch", es: "Francés" },
      niveau: { fr: "Courant (B2)", en: "Fluent (B2)", de: "Fließend (B2)", es: "Fluido (B2)" }
    },
    {
      langue: { fr: "Anglais", en: "English", de: "Englisch", es: "Inglés" },
      niveau: { fr: "Courant (B2)", en: "Fluent (B2)", de: "Fließend (B2)", es: "Fluido (B2)" }
    },
    {
      langue: { fr: "Arabe", en: "Arabic", de: "Arabisch", es: "Árabe" },
      niveau: { fr: "Langue maternelle", en: "Native", de: "Muttersprache", es: "Lengua materna" }
    }
  ],

  /* ---------- Autorisation de travail ----------
   * Phrase optionnelle pour rassurer l'employeur, à rédiger vous-même
   * selon votre situation exacte. Ne mentionnez aucun numéro de document.
   * ex. "Titre de séjour étudiant autorisant une activité salariée à temps partiel"
   */
  autorisationTravail: {
    fr: "Titre de séjour étudiant, autorisé à travailler (jusqu’à 964 h/an)",
    en: "Student residence permit, authorised to work (up to 964 h/year)",
    de: "Studentischer Aufenthaltstitel mit Arbeitserlaubnis (bis zu 964 Std./Jahr)",
    es: "Permiso de residencia de estudiante, autorizado a trabajar (hasta 964 h/año)"
  }
};
