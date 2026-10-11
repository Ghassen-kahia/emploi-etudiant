/*
 * Assistant « Questions fréquentes » — sans IA, sans serveur.
 *
 * Il répond uniquement à partir de config.js et des faits déjà publiés
 * sur la page : il ne peut donc rien inventer. Les questions tapées sont
 * reconnues par mots-clés (français, anglais, allemand et espagnol), quelle que
 * soit la langue affichée. Rien n'est envoyé ni enregistré.
 *
 * Pour modifier une réponse : section TEXTES ci-dessous.
 * Pour mieux reconnaître une question : section MOTS-CLÉS.
 */
(function () {
  "use strict";

  var S = window.SITE;
  if (!S) return;
  var P = S.profil;
  var C = P.contact || {};

  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function val(v) { return esc(S.tr(v)); }
  function list(rows) {
    rows = rows.filter(function (r) { return r[1]; });
    if (!rows.length) return "";
    return "<ul>" + rows.map(function (r) {
      return "<li><span>" + r[0] + "</span> " + r[1] + "</li>";
    }).join("") + "</ul>";
  }
  function link(href, label, external) {
    return '<a href="' + esc(href) + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" + label + "</a>";
  }
  function contactLinks(t) {
    var email = S.tr(C.email), phone = S.tr(C.telephone);
    return list([
      [t.lEmail, email ? link("mailto:" + email, esc(email)) : ""],
      [t.lTel, phone ? link("tel:" + phone.replace(/[^\d+]/g, ""), esc(phone)) : ""]
    ]);
  }

  /* ============================== TEXTES ============================== */
  var T = {
    fr: {
      launcher: "Une question ?",
      title: "Questions fréquentes",
      sub: "Assistant automatique · réponses tirées de cette page",
      close: "Fermer",
      placeholder: "Posez votre question…",
      inputLabel: "Votre question",
      send: "Envoyer",
      greet: "Bonjour ! Je réponds aux questions fréquentes sur la candidature de Ghassen, à partir des informations de cette page. Choisissez un sujet ou posez votre question.",
      chips: { dispo: "Disponibilités", duree: "Jusqu’à quand ?", cv: "Voir le CV", contact: "Contacter Ghassen", langues: "Langues", permis: "Autorisation de travail", experience: "Expérience", postes: "Postes recherchés" },
      lStart: "Début :", lHours: "Volume :", lMorn: "Matins :", lEve: "Soirs :", lWe: "Week-ends :", lHol: "Vacances :",
      lEmail: "E-mail :", lTel: "Téléphone :",
      dispo: "Disponibilités de Ghassen :",
      dispoLink: "Voir le planning détaillé",
      dispoPending: "Son emploi du temps est en cours de confirmation. Le plus simple est de le contacter pour convenir d’horaires.",
      duree: function (d) { return (d ? "Ghassen peut commencer : <strong>" + d + "</strong>. " : "") + "Il recherche un emploi à temps partiel : CDD, extras ou renforts de fin d’année."; },
      cvYes: "Voici le CV de Ghassen (PDF, en français) :",
      cvOpen: "Ouvrir le CV",
      cvNo: "Le CV est disponible sur demande : écrivez à Ghassen et il vous l’enverra par e-mail.",
      contact: "Vous pouvez joindre Ghassen :",
      contactEnd: "Précisez le poste et les horaires proposés ; il vous répondra rapidement.",
      langues: "Ghassen parle :",
      permisNone: "Pour toute question administrative, contactez Ghassen directement.",
      experience: "Ghassen a effectué <strong>7 stages en entreprise</strong> entre 2023 et 2026 : <strong>Res2Boost</strong> (marketing digital et contenu IA pour une start-up qui digitalise les restaurants : sites vitrines pour restaurants et cafés, réseaux sociaux), 4 stages en informatique (RIF, ACT, Esprit Entreprise, Horizon-Data) et 2 stages d’été chez <strong>Tunisie Télécom</strong> (activation de cartes SIM, déploiement de la fibre optique). Il y a appris à respecter des procédures précises, à travailler en équipe et à tenir des délais.",
      postes: "Ghassen recherche un emploi étudiant à temps partiel en <strong>grande distribution</strong> (mise en rayon, caisse), <strong>restauration</strong>, <strong>logistique</strong> ou <strong>commerce</strong>. Il est ouvert à d’autres postes étudiants.",
      lieu: function (z, m) { return "Ghassen est basé à Dijon et cherche un poste à " + (z || "Dijon") + "." + (m ? " " + m + "." : ""); },
      etudes: "Ghassen est élève ingénieur en informatique à l’ESPRIT (Tunisie), spécialité Cloud Computing, en semestre d’échange à l’ESEO Dijon jusqu’en février 2027. Il est titulaire d’une licence en systèmes informatiques (major de promotion).",
      hello: "Bonjour ! Que souhaitez-vous savoir ?",
      thanks: "Avec plaisir ! N’hésitez pas à contacter Ghassen directement.",
      age: function (n) { return "Ghassen a " + n + " ans."; },
      fallback: "Je n’ai pas cette information. Le plus simple est d’écrire directement à Ghassen :"
    },
    en: {
      launcher: "Any questions?",
      title: "Frequently asked questions",
      sub: "Automatic assistant · answers taken from this page",
      close: "Close",
      placeholder: "Ask your question…",
      inputLabel: "Your question",
      send: "Send",
      greet: "Hello! I answer common questions about Ghassen’s application, using the information on this page. Pick a topic or type your question.",
      chips: { dispo: "Availability", duree: "Until when?", cv: "View CV", contact: "Contact Ghassen", langues: "Languages", permis: "Work permit", experience: "Experience", postes: "Positions sought" },
      lStart: "Start:", lHours: "Hours:", lMorn: "Mornings:", lEve: "Evenings:", lWe: "Weekends:", lHol: "Holidays:",
      lEmail: "Email:", lTel: "Phone:",
      dispo: "Ghassen’s availability:",
      dispoLink: "See the detailed schedule",
      dispoPending: "His timetable is still being confirmed. The easiest way is to contact him to agree on hours.",
      duree: function (d) { return (d ? "Ghassen can start: <strong>" + d + "</strong>. " : "") + "He is looking for a part-time job: fixed-term contract, extra shifts or end-of-year peak."; },
      cvYes: "Here is Ghassen’s CV (PDF, in French):",
      cvOpen: "Open the CV",
      cvNo: "The CV is available on request: write to Ghassen and he will email it to you.",
      contact: "You can reach Ghassen:",
      contactEnd: "Mention the position and hours offered; he will get back to you quickly.",
      langues: "Ghassen speaks:",
      permisNone: "For any administrative question, please contact Ghassen directly.",
      experience: "Ghassen has completed <strong>7 company internships</strong> between 2023 and 2026: <strong>Res2Boost</strong> (digital marketing and AI content for a start-up digitalising restaurants: websites for restaurants and cafés, social media), 4 IT internships (RIF, ACT, Esprit Entreprise, Horizon-Data) and 2 summer internships at <strong>Tunisie Telecom</strong> (SIM card activation, fibre-optic deployment). There he learned to follow precise procedures, work in a team and meet deadlines.",
      postes: "Ghassen is looking for a part-time student job in <strong>supermarkets</strong> (shelf stocking, checkout), <strong>food service</strong>, <strong>logistics</strong> or <strong>retail</strong>. He is open to other student positions.",
      lieu: function (z, m) { return "Ghassen is based in Dijon and is looking for a job in " + (z || "Dijon") + "." + (m ? " " + m + "." : ""); },
      etudes: "Ghassen is a computer engineering student at ESPRIT (Tunisia), specialising in Cloud Computing, on an exchange semester at ESEO Dijon until February 2027. He holds a bachelor’s degree in computer systems (top of his class).",
      hello: "Hello! What would you like to know?",
      thanks: "You’re welcome! Feel free to contact Ghassen directly.",
      age: function (n) { return "Ghassen is " + n + " years old."; },
      fallback: "I don’t have that information. The easiest way is to write to Ghassen directly:"
    },
    de: {
      launcher: "Fragen?",
      title: "Häufige Fragen",
      sub: "Automatischer Assistent · Antworten aus dieser Seite",
      close: "Schließen",
      placeholder: "Stellen Sie Ihre Frage…",
      inputLabel: "Ihre Frage",
      send: "Senden",
      greet: "Hallo! Ich beantworte häufige Fragen zu Ghassens Bewerbung, anhand der Informationen auf dieser Seite. Wählen Sie ein Thema oder stellen Sie Ihre Frage.",
      chips: { dispo: "Verfügbarkeit", duree: "Bis wann?", cv: "Lebenslauf", contact: "Kontakt", langues: "Sprachen", permis: "Arbeitserlaubnis", experience: "Erfahrung", postes: "Gesuchte Stellen" },
      lStart: "Beginn:", lHours: "Umfang:", lMorn: "Morgens:", lEve: "Abends:", lWe: "Wochenende:", lHol: "Ferien:",
      lEmail: "E-Mail:", lTel: "Telefon:",
      dispo: "Ghassens Verfügbarkeit:",
      dispoLink: "Detaillierten Wochenplan ansehen",
      dispoPending: "Sein Stundenplan wird noch bestätigt. Am einfachsten kontaktieren Sie ihn, um Arbeitszeiten abzustimmen.",
      duree: function (d) { return (d ? "Ghassen kann beginnen: <strong>" + d + "</strong>. " : "") + "Er sucht eine Teilzeitstelle: befristet, als Aushilfe oder für das Jahresendgeschäft."; },
      cvYes: "Hier ist Ghassens Lebenslauf (PDF, auf Französisch):",
      cvOpen: "Lebenslauf öffnen",
      cvNo: "Der Lebenslauf ist auf Anfrage erhältlich: Schreiben Sie Ghassen, er schickt ihn per E-Mail.",
      contact: "So erreichen Sie Ghassen:",
      contactEnd: "Nennen Sie die Stelle und die Arbeitszeiten; er antwortet schnell.",
      langues: "Ghassen spricht:",
      permisNone: "Bei Verwaltungsfragen wenden Sie sich bitte direkt an Ghassen.",
      experience: "Ghassen hat zwischen 2023 und 2026 <strong>7 Praktika in Unternehmen</strong> absolviert: <strong>Res2Boost</strong> (Digital Marketing und KI-Content für ein Start-up, das Restaurants digitalisiert: Websites für Restaurants und Cafés, Social Media), 4 IT-Praktika (RIF, ACT, Esprit Entreprise, Horizon-Data) und 2 Sommerpraktika bei <strong>Tunisie Telecom</strong> (Aktivierung von SIM-Karten, Glasfaserausbau). Dort hat er gelernt, genaue Abläufe einzuhalten, im Team zu arbeiten und Fristen einzuhalten.",
      postes: "Ghassen sucht einen Studentenjob in Teilzeit im <strong>Lebensmittelhandel</strong> (Regale auffüllen, Kasse), in der <strong>Gastronomie</strong>, <strong>Logistik</strong> oder im <strong>Einzelhandel</strong>. Er ist auch für andere Studentenjobs offen.",
      lieu: function (z, m) { return "Ghassen wohnt in Dijon und sucht eine Stelle in " + (z || "Dijon") + "." + (m ? " " + m + "." : ""); },
      etudes: "Ghassen studiert Informatik (Ingenieurstudium) an der ESPRIT (Tunesien), Schwerpunkt Cloud Computing, und ist bis Februar 2027 im Austauschsemester an der ESEO Dijon. Er hat einen Bachelor in Informatiksystemen (Jahrgangsbester).",
      hello: "Hallo! Was möchten Sie wissen?",
      thanks: "Gern geschehen! Kontaktieren Sie Ghassen gerne direkt.",
      age: function (n) { return "Ghassen ist " + n + " Jahre alt."; },
      fallback: "Diese Information habe ich leider nicht. Am einfachsten schreiben Sie Ghassen direkt:"
    },
    es: {
      launcher: "¿Alguna pregunta?",
      title: "Preguntas frecuentes",
      sub: "Asistente automático · respuestas sacadas de esta página",
      close: "Cerrar",
      placeholder: "Escriba su pregunta…",
      inputLabel: "Su pregunta",
      send: "Enviar",
      greet: "¡Hola! Respondo a las preguntas frecuentes sobre la candidatura de Ghassen, con la información de esta página. Elija un tema o escriba su pregunta.",
      chips: { dispo: "Disponibilidad", duree: "¿Hasta cuándo?", cv: "Ver el CV", contact: "Contactar con Ghassen", langues: "Idiomas", permis: "Permiso de trabajo", experience: "Experiencia", postes: "Puestos buscados" },
      lStart: "Inicio:", lHours: "Horas:", lMorn: "Mañanas:", lEve: "Tardes:", lWe: "Fines de semana:", lHol: "Vacaciones:",
      lEmail: "Correo:", lTel: "Teléfono:",
      dispo: "Disponibilidad de Ghassen:",
      dispoLink: "Ver el horario detallado",
      dispoPending: "Su horario está pendiente de confirmación. Lo más sencillo es contactarle para acordar un horario.",
      duree: function (d) { return (d ? "Ghassen puede empezar: <strong>" + d + "</strong>. " : "") + "Busca un empleo a tiempo parcial: contrato temporal, extras o refuerzos de fin de año."; },
      cvYes: "Aquí está el CV de Ghassen (PDF, en francés):",
      cvOpen: "Abrir el CV",
      cvNo: "El CV está disponible bajo petición: escriba a Ghassen y se lo enviará por correo.",
      contact: "Puede contactar con Ghassen:",
      contactEnd: "Indique el puesto y el horario propuestos; le responderá rápidamente.",
      langues: "Ghassen habla:",
      permisNone: "Para cualquier cuestión administrativa, contacte directamente con Ghassen.",
      experience: "Ghassen ha realizado <strong>7 prácticas en empresa</strong> entre 2023 y 2026: <strong>Res2Boost</strong> (marketing digital y contenido con IA para una start-up que digitaliza restaurantes: webs para restaurantes y cafeterías, redes sociales), 4 prácticas en informática (RIF, ACT, Esprit Entreprise, Horizon-Data) y 2 prácticas de verano en <strong>Tunisie Telecom</strong> (activación de tarjetas SIM, despliegue de fibra óptica). Allí aprendió a seguir procedimientos precisos, a trabajar en equipo y a cumplir plazos.",
      postes: "Ghassen busca un empleo a tiempo parcial en <strong>supermercados</strong> (reposición, caja), <strong>hostelería</strong>, <strong>logística</strong> o <strong>comercio</strong>. Está abierto a otros puestos para estudiantes.",
      lieu: function (z, m) { return "Ghassen vive en Dijon y busca un puesto en " + (z || "Dijon") + "." + (m ? " " + m + "." : ""); },
      etudes: "Ghassen estudia ingeniería informática en ESPRIT (Túnez), especialidad Cloud Computing, y está de intercambio en la ESEO de Dijon hasta febrero de 2027. Es licenciado en sistemas informáticos (número uno de su promoción).",
      hello: "¡Hola! ¿Qué desea saber?",
      thanks: "¡Con mucho gusto! No dude en contactar directamente con Ghassen.",
      age: function (n) { return "Ghassen tiene " + n + " años."; },
      fallback: "No tengo esa información. Lo más sencillo es escribir directamente a Ghassen:"
    }
  };

  /* ============================== RÉPONSES ============================== */
  var D = P.disponibilites || {};
  var ANSWERS = {
    dispo: function (t) {
      if (D.confirme !== true) return t.dispoPending + contactLinks(t);
      return "<p><strong>" + val(P.libelleDisponibilite) + "</strong>. " + t.dispo + "</p>" + list([
        [t.lHours, val(D.heuresParSemaine)],
        [t.lMorn, val(D.matins)],
        [t.lEve, val(D.soirs)],
        [t.lWe, val(D.weekends)],
        [t.lHol, val(D.vacances)],
        [t.lStart, val(D.debut)]
      ]) + "<p>" + link("#disponibilites", t.dispoLink) + "</p>";
    },
    duree: function (t) { return t.duree(val(D.debut)); },
    cv: function (t) {
      if (S.cv.available) return t.cvYes + '<p><a class="chat-btn" href="' + esc(S.cv.path) + '" target="_blank" rel="noopener">' + t.cvOpen + "</a></p>";
      return t.cvNo + contactLinks(t);
    },
    contact: function (t) { return t.contact + contactLinks(t) + "<p>" + t.contactEnd + "</p>"; },
    langues: function (t) {
      return t.langues + list((P.langues || []).map(function (l) { return [val(l.langue), val(l.niveau)]; }));
    },
    permis: function (t) {
      var a = val(P.autorisationTravail);
      return a ? a + "." : t.permisNone + contactLinks(t);
    },
    experience: function (t) { return t.experience; },
    postes: function (t) { return t.postes; },
    lieu: function (t) { return t.lieu(val(C.zone), val(P.mobilite)); },
    etudes: function (t) { return t.etudes; },
    age: function (t) {
      var n = val(P.age);
      return n ? t.age(n) : ANSWERS.fallback(t);
    },
    hello: function (t) { return t.hello; },
    thanks: function (t) { return t.thanks; },
    fallback: function (t) { return t.fallback + contactLinks(t); }
  };

  /* ============================== MOTS-CLÉS ==============================
   * Texte comparé en minuscules, sans accents. Le sujet dont les mots-clés
   * couvrent le plus de caractères l'emporte (les expressions longues gagnent).
   */
  var KEYWORDS = {
    permis: ["permiso de trabajo", "residencia", "papeles", "titre de sejour", "sejour", "autoris", "visa", "papiers", "permis de travail", "droit de travailler",
      "work permit", "right to work", "allowed to work", "authori", "residence", "legal",
      "arbeitserlaubnis", "aufenthalt", "erlaubt", "darf", "964"],
    lieu: ["donde vive", "ciudad", "carnet", "coche", "habite", "ville", "lieu", "adresse", "permis", "voiture", "vehicule", "conduire", "transport", "deplac",
      "where", "location", "based", "live", "driving", " car", "drive",
      "wohn", "stadt", " wo ", "fuhrerschein", "fuehrerschein", " auto", "mobil"],
    dispo: ["disponib", "horario", "cuando", "fin de semana", "sabado", "domingo", "turno", "dispo", "horaire", "quand", "heure", "planning", "emploi du temps", "soir", "week", "samedi", "dimanche", "vacance", "matin",
      "available", "availab", "hours", "when", "schedule", "evening", "saturday", "sunday", "morning", "shift",
      "verfugbar", "zeiten", "wann", "stunden", "abend", "wochenende", "samstag", "sonntag", "ferien", "morgen", "schicht", "dienstplan"],
    duree: ["hasta cuando", "cuanto tiempo", "contrato", "empezar", "jusqu a quand", "jusqu", "combien de temps", "duree", "contrat", "cdd", "cdi", "extra", "renfort", "commencer", "debut", "demarrer",
      "until", "how long", "contract", "start", "fixed-term", "temporary",
      "wie lange", "bis wann", "vertrag", "befrist", "aushilfe", "anfangen", "beginn", "ab wann"],
    cv: ["cv", "resume", "curriculum", "lebenslauf", "pdf"],
    contact: ["contacto", "correo", "llamar", "contact", "joindre", "mail", "telephone", " tel", "numero", "appeler",
      "phone", "call", "reach", "number", "kontakt", "telefon", "anruf", "erreich", "nummer"],
    langues: ["idioma", "habla", "ingles", "frances", "aleman", "langue", "parle", "anglais", "arabe", "francais", "allemand",
      "language", "speak", "english", "arabic", "french", "german",
      "sprache", "sprich", "englisch", "arabisch", "franzosisch", "deutsch"],
    experience: ["experiencia", "practicas", "trabajado", "experience", "stage", "res2boost", "horizon-data", "horizon data", "tunisie telecom", "telecom", "fibre", "fiber", "deja travaille", "internship", "worked", "work experience",
      "erfahrung", "praktik", "gearbeitet"],
    postes: ["puesto", "cajero", "reponedor", "almacen", "hosteleria", "tienda", "poste", "secteur", "caisse", "rayon", "restau", "logisti", "magasin", "supermarch", "vente", "metier",
      "position", "role", "sector", "cashier", "shelf", "warehouse", "retail",
      "stelle", "branche", "kasse", "lager", "verkauf", "gastro", "supermarkt"],
    etudes: ["estudi", "ingeniero", "universidad", "carrera", "etudie", "etude", "ecole", "eseo", "esprit", "formation", "diplome", "ingenieur", "universit", "licence",
      "study", "studies", "school", "degree", "engineer", "bachelor",
      "studium", "studier", "hochschule", "ausbildung"],
    age: ["cuantos anos", "edad", "quel age", " age ", "ans a-t-il", "how old", " age?", "wie alt", " alter "],
    hello: ["hola", "buenos dias", "bonjour", "salut", "coucou", "bonsoir", "hello", " hi ", "hey", "hallo", "guten tag", "servus", "moin"],
    thanks: ["gracias", "merci", "thank", "thx", "danke"]
  };

  function normalize(s) {
    return " " + s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/ß/g, "ss").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim() + " ";
  }
  function detect(text) {
    var q = normalize(text), best = "fallback", bestScore = 0;
    Object.keys(KEYWORDS).forEach(function (intent) {
      var score = 0;
      KEYWORDS[intent].forEach(function (k) { if (q.indexOf(k) !== -1) score += k.length; });
      if (score > bestScore) { best = intent; bestScore = score; }
    });
    return best;
  }

  /* ============================== INTERFACE ============================== */
  var CHIP_ORDER = ["dispo", "cv", "contact", "duree", "langues", "permis", "experience", "postes"];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Avatar de l'assistant : la photo de config.js, sinon le monogramme.
  function chatAvatar() {
    var photo = S.tr(S.profil.photo || "").trim();
    return photo
      ? '<span class="chat-avatar has-photo" aria-hidden="true"><img src="' + esc(photo) + '" alt="" width="76" height="76"></span>'
      : '<span class="chat-avatar" aria-hidden="true">GK</span>';
  }

  var launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "chat-launcher";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "chat-panel");
  launcher.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-7.5L7 20.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
    '<span class="chat-launcher-label"></span>';

  var panel = document.createElement("section");
  panel.id = "chat-panel";
  panel.className = "chat-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "chat-title");
  panel.innerHTML =
    '<header class="chat-head">' +
      chatAvatar() +
      '<div><h2 id="chat-title" class="chat-title"></h2><p class="chat-sub"></p></div>' +
      '<button type="button" class="chat-close"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
    "</header>" +
    '<div class="chat-log" role="log" aria-live="polite"></div>' +
    '<div class="chat-chips"></div>' +
    '<form class="chat-form" autocomplete="off">' +
      '<label class="visually-hidden" for="chat-input"></label>' +
      '<input id="chat-input" class="chat-input" type="text" maxlength="200">' +
      '<button type="submit" class="chat-send"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="visually-hidden"></span></button>' +
    "</form>";

  document.body.appendChild(panel);
  document.body.appendChild(launcher);

  var log = panel.querySelector(".chat-log");
  var chips = panel.querySelector(".chat-chips");
  var form = panel.querySelector(".chat-form");
  var input = panel.querySelector(".chat-input");
  var closeBtn = panel.querySelector(".chat-close");

  function t() { return T[S.lang] || T.fr; }

  function addMessage(html, who) {
    var m = document.createElement("div");
    m.className = "chat-msg chat-msg-" + who;
    if (who === "user") m.textContent = html; else m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }

  function reply(intent) {
    var typing = addMessage('<span class="chat-typing" aria-label="…"><i></i><i></i><i></i></span>', "bot");
    setTimeout(function () {
      typing.innerHTML = (ANSWERS[intent] || ANSWERS.fallback)(t());
      log.scrollTop = log.scrollHeight;
    }, reduceMotion ? 0 : 450);
  }

  function ask(text, intent) {
    if (!text.trim()) return;
    addMessage(text, "user");
    reply(intent || detect(text));
  }

  function renderChrome() {
    var x = t();
    launcher.querySelector(".chat-launcher-label").textContent = x.launcher;
    launcher.setAttribute("aria-label", x.launcher);
    panel.querySelector(".chat-title").textContent = x.title;
    panel.querySelector(".chat-sub").textContent = x.sub;
    closeBtn.setAttribute("aria-label", x.close);
    panel.querySelector('label[for="chat-input"]').textContent = x.inputLabel;
    panel.querySelector(".chat-send .visually-hidden").textContent = x.send;
    input.placeholder = x.placeholder;
    panel.setAttribute("lang", S.lang);

    chips.textContent = "";
    CHIP_ORDER.forEach(function (intent) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = x.chips[intent];
      b.addEventListener("click", function () { ask(x.chips[intent], intent); });
      chips.appendChild(b);
    });

    log.textContent = "";
    addMessage(x.greet, "bot");
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("chat-open", open);
    if (open) {
      // Sur mobile, ne pas ouvrir le clavier automatiquement.
      if (window.matchMedia("(min-width: 700px)").matches) input.focus();
      else closeBtn.focus();
    } else {
      launcher.focus();
    }
  }

  launcher.addEventListener("click", function () { setOpen(panel.hidden); });
  closeBtn.addEventListener("click", function () { setOpen(false); });
  panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
    input.value = "";
  });
  log.addEventListener("click", function (e) {
    // Un lien interne (#disponibilites) ferme l'assistant sur mobile pour laisser voir la section.
    var a = e.target.closest('a[href^="#"]');
    if (a && !window.matchMedia("(min-width: 700px)").matches) setOpen(false);
  });

  document.addEventListener("langchange", renderChrome);
  renderChrome();
})();
