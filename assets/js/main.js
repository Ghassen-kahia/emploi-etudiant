/*
 * Remplit la page à partir de config.js et gère les petites interactions
 * (menu mobile, copie de l'e-mail, détection du CV, animations discrètes).
 * Aucune dépendance externe.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var P = window.PROFIL || {};
  var host = location.hostname;
  // En local, les champs vides s'affichent comme « À compléter » ; en ligne, ils sont masqués.
  // Ajoutez ?public à l'adresse locale pour voir la page exactement comme les visiteurs.
  var IS_LOCAL = (location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "")
    && !/[?&]public\b/.test(location.search);

  var JOURS = [
    ["lundi", "Lundi"], ["mardi", "Mardi"], ["mercredi", "Mercredi"], ["jeudi", "Jeudi"],
    ["vendredi", "Vendredi"], ["samedi", "Samedi"], ["dimanche", "Dimanche"]
  ];
  var STATUTS = {
    "disponible": "Disponible",
    "partiel": "Partiel",
    "indisponible": "Indisponible",
    "a-confirmer": "À confirmer"
  };

  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, P);
  }
  function isEmpty(v) {
    return v == null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0);
  }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function todo(label) {
    var s = document.createElement("span");
    s.className = "todo";
    s.textContent = "À compléter : " + label;
    return s;
  }

  /* ---------- Texte, liens et blocs conditionnels ---------- */
  $all("[data-text]").forEach(function (el) {
    var path = el.getAttribute("data-text");
    var v = get(path);
    if (!isEmpty(v)) {
      el.textContent = v;
    } else if (IS_LOCAL) {
      el.textContent = "";
      el.appendChild(todo(path));
    }
  });

  $all("[data-href]").forEach(function (el) {
    var v = get(el.getAttribute("data-href"));
    if (!isEmpty(v)) el.setAttribute("href", v);
  });

  $all("[data-show-if]").forEach(function (el) {
    if (isEmpty(get(el.getAttribute("data-show-if"))) && !IS_LOCAL) el.hidden = true;
  });

  /* ---------- E-mail et téléphone ---------- */
  var email = (P.contact && P.contact.email || "").trim();
  var phone = (P.contact && P.contact.telephone || "").trim();

  if (email) {
    var subject = encodeURIComponent("Proposition d'emploi étudiant");
    $all("[data-mailto]").forEach(function (a) { a.href = "mailto:" + email + "?subject=" + subject; });
    $all("[data-mailto-plain]").forEach(function (a) { a.href = "mailto:" + email; });
  }
  if (phone) {
    $all("[data-tel]").forEach(function (a) { a.href = "tel:" + phone.replace(/[^\d+]/g, ""); });
  }

  var copyBtn = document.querySelector("[data-copy-email]");
  var copyStatus = document.querySelector("[data-copy-status]");
  if (copyBtn) {
    if (!email) copyBtn.hidden = true;
    copyBtn.addEventListener("click", function () {
      var done = function () {
        copyStatus.textContent = "Adresse copiée";
        setTimeout(function () { copyStatus.textContent = ""; }, 2500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(done, function () { fallbackCopy(email); done(); });
      } else {
        fallbackCopy(email);
        done();
      }
    });
  }
  function fallbackCopy(text) {
    var t = document.createElement("textarea");
    t.value = text;
    t.setAttribute("readonly", "");
    t.style.position = "absolute";
    t.style.left = "-9999px";
    document.body.appendChild(t);
    t.select();
    try { document.execCommand("copy"); } catch (e) { /* ignoré */ }
    document.body.removeChild(t);
  }

  /* ---------- Photo (sinon monogramme) ---------- */
  var photo = (P.photo || "").trim();
  if (photo) {
    $all("[data-photo]").forEach(function (box) {
      var img = new Image();
      img.alt = "Photo de Ghassen Kahia";
      img.width = 128;
      img.height = 128;
      img.decoding = "async";
      img.onload = function () { box.textContent = ""; box.appendChild(img); };
      img.src = photo;
    });
  }

  /* ---------- Fiche contact (.vcf) ---------- */
  var vcardRow = document.querySelector("[data-vcard-row]");
  var vcardBtn = document.querySelector("[data-vcard]");
  if (vcardRow && vcardBtn && (email || phone || IS_LOCAL)) {
    vcardRow.hidden = false;
    vcardBtn.addEventListener("click", function () {
      var esc = function (v) { return String(v).replace(/([\\;,])/g, "\\$1"); };
      var siteUrl = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
      var lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Kahia;Ghassen;;;",
        "FN:Ghassen Kahia",
        "TITLE:" + esc("Étudiant ingénieur – recherche emploi étudiant"),
        email ? "EMAIL;TYPE=INTERNET:" + email : "",
        phone ? "TEL;TYPE=CELL:" + phone : "",
        "ADR;TYPE=HOME:;;;" + esc((P.contact && P.contact.ville) || "Dijon") + ";;;France",
        "URL:" + siteUrl,
        P.contact && P.contact.linkedin ? "X-SOCIALPROFILE;TYPE=linkedin:" + P.contact.linkedin : "",
        "NOTE:" + esc("Candidature emploi étudiant – " + (P.libelleDisponibilite || "")),
        "END:VCARD"
      ].filter(Boolean);
      var blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/vcard;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Ghassen-Kahia.vcf";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });
  }

  /* ---------- Disponibilités ---------- */
  var dispo = P.disponibilites || {};
  var confirme = dispo.confirme === true;
  var pending = document.querySelector("[data-dispo-pending]");
  var week = document.querySelector("[data-week]");
  var body = document.querySelector("[data-week-body]");

  if (pending) pending.hidden = confirme;
  // Tant que l'emploi du temps n'est pas confirmé, le planning n'est montré qu'en local (pour prévisualiser).
  if (week && !confirme && !IS_LOCAL) week.hidden = true;

  if (body) {
    JOURS.forEach(function (j, i) {
      var d = (dispo.jours && dispo.jours[j[0]]) || {};
      var statut = STATUTS[d.statut] ? d.statut : "a-confirmer";
      var tr = document.createElement("tr");
      if (i >= 5) tr.className = "is-weekend";

      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = j[1];

      var tdS = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge badge-" + statut;
      badge.textContent = STATUTS[statut];
      tdS.appendChild(badge);

      var tdC = document.createElement("td");
      (d.creneaux || []).forEach(function (c) {
        var s = document.createElement("span");
        s.className = "slot";
        s.textContent = c;
        tdC.appendChild(s);
      });
      if (!tdC.childNodes.length && statut === "disponible") tdC.textContent = "Toute la journée";

      tr.appendChild(th);
      tr.appendChild(tdS);
      tr.appendChild(tdC);
      body.appendChild(tr);
    });
  }

  var pill = document.querySelector(".status-pill");
  if (pill && confirme) pill.setAttribute("data-state", "confirme");

  /* ---------- Langues ---------- */
  var langs = Array.isArray(P.langues) ? P.langues : [];
  $all("[data-languages-inline]").forEach(function (el) {
    if (langs.length) el.textContent = langs.map(function (l) { return l.langue; }).join(", ");
  });
  var langBox = document.querySelector("[data-languages]");
  var langList = document.querySelector("[data-languages-list]");
  if (langBox && langList && langs.length) {
    langs.forEach(function (l) {
      var li = document.createElement("li");
      var a = document.createElement("span");
      var b = document.createElement("span");
      a.textContent = l.langue || "";
      b.textContent = l.niveau || "";
      li.appendChild(a);
      li.appendChild(b);
      langList.appendChild(li);
    });
    langBox.hidden = false;
  } else if (langBox && langList && IS_LOCAL) {
    var li = document.createElement("li");
    li.appendChild(todo("langues"));
    langList.appendChild(li);
    langBox.hidden = false;
  }

  /* ---------- CV : détection automatique du fichier PDF ---------- */
  var cvPath = (P.cv && P.cv.fichier) || "";
  var cvReady = document.querySelector("[data-cv-ready]");
  var cvMissing = document.querySelector("[data-cv-missing]");

  function showCv(available) {
    if (cvReady) cvReady.hidden = !available;
    if (cvMissing) cvMissing.hidden = available;
    if (!available) return;
    $all("[data-cv-download]").forEach(function (a) {
      a.href = cvPath;
      a.setAttribute("download", cvPath.split("/").pop());
    });
    $all("[data-cv-open]").forEach(function (a) { a.href = cvPath; });
    // Le bouton principal de l'introduction ouvre directement le PDF.
    $all("[data-cv-link]").forEach(function (a) {
      a.href = cvPath;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  if (cvPath && window.fetch && location.protocol !== "file:") {
    fetch(cvPath, { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        var type = r.headers.get("content-type") || "";
        showCv(r.ok && type.indexOf("text/html") === -1);
      })
      .catch(function () { showCv(false); });
  } else {
    showCv(false);
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("menu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".site-header")) setMenu(false);
    });
  }

  /* ---------- En-tête : bordure au défilement ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Lien actif dans la navigation + apparitions ---------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    $all('.site-nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute("aria-current"); });
        if (links[en.target.id]) links[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $all("main section[id]").forEach(function (s) { spy.observe(s); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          reveal.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $all(".reveal").forEach(function (el) { reveal.observe(el); });
  } else {
    $all(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Barre d'actions mobile : visible hors introduction et hors contact ---------- */
  var bar = document.querySelector("[data-mobile-bar]");
  var heroEl = document.querySelector(".hero");
  var contactEl = document.getElementById("contact");
  if (bar && heroEl && contactEl && "IntersectionObserver" in window) {
    var seen = { hero: true, contact: false };
    var update = function () {
      var show = !seen.hero && !seen.contact;
      bar.classList.toggle("is-visible", show);
      document.body.classList.toggle("has-mobile-bar", show);
    };
    var barObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target === heroEl ? "hero" : "contact"] = en.isIntersecting; });
      update();
    });
    barObs.observe(heroEl);
    barObs.observe(contactEl);
  }

  // Avant impression, tout afficher (les éléments pas encore apparus resteraient invisibles).
  window.addEventListener("beforeprint", function () {
    $all(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  });

  /* ---------- Année du pied de page ---------- */
  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
