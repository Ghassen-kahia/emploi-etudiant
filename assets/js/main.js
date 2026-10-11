/*
 * Remplit la page à partir de config.js, gère la langue (FR / EN / DE)
 * et les petites interactions (menu mobile, copie de l'e-mail, détection
 * du CV, animations discrètes). Aucune dépendance externe.
 *
 * Expose window.SITE pour chat.js (langue courante, traduction, état du CV).
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var P = window.PROFIL || {};
  var I18N = window.I18N || { ui: {} };
  var LANGS = ["fr", "en", "de"];
  var host = location.hostname;
  // En local, les champs vides s'affichent comme « À compléter » ; en ligne, ils sont masqués.
  // Ajoutez ?public à l'adresse locale pour voir la page exactement comme les visiteurs.
  var IS_LOCAL = (location.protocol === "file:" || host === "localhost" || host === "127.0.0.1" || host === "")
    && !/[?&]public\b/.test(location.search);
  var JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  /* ---------- Utilitaires ---------- */
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, P);
  }
  // Une valeur de config.js peut être un texte simple ou { fr: "…", en: "…", de: "…" }.
  function tr(v) {
    if (v && typeof v === "object" && !Array.isArray(v)) return v[lang] || v.fr || "";
    return v == null ? "" : String(v);
  }
  function isEmpty(v) {
    if (Array.isArray(v)) return v.length === 0;
    return tr(v).trim() === "";
  }
  function ui(key) {
    var d = I18N.ui[lang] || {};
    return d[key] != null ? d[key] : (I18N.ui.fr || {})[key];
  }
  function todo(label) {
    var s = document.createElement("span");
    s.className = "todo";
    s.textContent = ui("todo") + label;
    return s;
  }
  function storage(action, value) {
    try {
      if (action === "get") return localStorage.getItem("lang");
      localStorage.setItem("lang", value);
    } catch (e) { /* stockage indisponible : sans importance */ }
    return null;
  }

  /* ---------- Langue initiale : ?lang=… puis choix mémorisé, sinon français ---------- */
  var params = new URLSearchParams(location.search);
  var lang = params.get("lang");
  if (LANGS.indexOf(lang) === -1) lang = storage("get");
  if (LANGS.indexOf(lang) === -1) lang = "fr";

  /* ---------- Textes fixes (data-i18n) ---------- */
  var staticEls = $all("[data-i18n]");
  var attrEls = $all("[data-i18n-attr]");
  // Le français d'origine est mémorisé une fois pour pouvoir y revenir.
  staticEls.forEach(function (el) { el._fr = el.innerHTML; });
  attrEls.forEach(function (el) {
    el._frAttr = {};
    el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var attr = pair.split(":")[0];
      el._frAttr[attr] = el.getAttribute(attr);
    });
  });

  function applyStatic() {
    var dict = I18N[lang] || {};
    staticEls.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      el.innerHTML = lang !== "fr" && dict[key] != null ? dict[key] : el._fr;
    });
    attrEls.forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        var v = lang !== "fr" && dict[parts[1]] != null ? dict[parts[1]] : el._frAttr[parts[0]];
        if (v != null) el.setAttribute(parts[0], v);
      });
    });
    document.documentElement.lang = lang;
    document.title = ui("meta.title");
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", ui("meta.desc"));
    $all("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
  }

  /* ---------- Textes issus de config.js ---------- */
  function renderData() {
    $all("[data-text]").forEach(function (el) {
      var path = el.getAttribute("data-text");
      var v = tr(get(path));
      el.textContent = "";
      if (v.trim()) el.textContent = v;
      else if (IS_LOCAL) el.appendChild(todo(path));
    });

    $all("[data-show-if]").forEach(function (el) {
      el.hidden = isEmpty(get(el.getAttribute("data-show-if"))) && !IS_LOCAL;
    });

    if (email) {
      var subject = encodeURIComponent(ui("mailSubject"));
      $all("[data-mailto]").forEach(function (a) { a.href = "mailto:" + email + "?subject=" + subject; });
    }

    $all("[data-photo] img").forEach(function (img) { img.alt = ui("photoAlt"); });

    renderWeek();
    renderLanguages();
  }

  /* ---------- Liens ---------- */
  $all("[data-href]").forEach(function (el) {
    var v = get(el.getAttribute("data-href"));
    if (!isEmpty(v)) el.setAttribute("href", tr(v));
  });

  var email = tr(P.contact && P.contact.email).trim();
  var phone = tr(P.contact && P.contact.telephone).trim();
  if (email) $all("[data-mailto-plain]").forEach(function (a) { a.href = "mailto:" + email; });
  if (phone) $all("[data-tel]").forEach(function (a) { a.href = "tel:" + phone.replace(/[^\d+]/g, ""); });

  /* ---------- Copie de l'adresse e-mail ---------- */
  var copyBtn = document.querySelector("[data-copy-email]");
  var copyStatus = document.querySelector("[data-copy-status]");
  if (copyBtn) {
    if (!email) copyBtn.hidden = true;
    copyBtn.addEventListener("click", function () {
      var done = function () {
        copyStatus.textContent = ui("copied");
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
  var photo = tr(P.photo).trim();
  if (photo) {
    $all("[data-photo]").forEach(function (box) {
      var img = new Image();
      img.alt = ui("photoAlt");
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
        "ADR;TYPE=HOME:;;;" + esc(tr(P.contact && P.contact.ville) || "Dijon") + ";;;France",
        "URL:" + siteUrl,
        P.contact && P.contact.linkedin ? "X-SOCIALPROFILE;TYPE=linkedin:" + P.contact.linkedin : "",
        "NOTE:" + esc("Candidature emploi étudiant – " + tr(P.libelleDisponibilite)),
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
  var weekBody = document.querySelector("[data-week-body]");

  if (pending) pending.hidden = confirme;
  // Tant que l'emploi du temps n'est pas confirmé, le planning n'est montré qu'en local (pour prévisualiser).
  if (week && !confirme && !IS_LOCAL) week.hidden = true;

  function renderWeek() {
    if (!weekBody) return;
    var days = ui("days");
    var statuses = ui("status");
    weekBody.textContent = "";
    JOURS.forEach(function (key, i) {
      var d = (dispo.jours && dispo.jours[key]) || {};
      var statut = statuses[d.statut] ? d.statut : "a-confirmer";
      var row = document.createElement("tr");
      if (i >= 5) row.className = "is-weekend";

      var th = document.createElement("th");
      th.scope = "row";
      th.textContent = days[i];

      var tdS = document.createElement("td");
      var badge = document.createElement("span");
      badge.className = "badge badge-" + statut;
      badge.textContent = statuses[statut];
      tdS.appendChild(badge);

      var tdC = document.createElement("td");
      (d.creneaux || []).forEach(function (c) {
        var s = document.createElement("span");
        s.className = "slot";
        s.textContent = tr(c);
        tdC.appendChild(s);
      });
      if (!tdC.childNodes.length && statut === "disponible") tdC.textContent = ui("allDay");

      row.appendChild(th);
      row.appendChild(tdS);
      row.appendChild(tdC);
      weekBody.appendChild(row);
    });
  }

  var pill = document.querySelector(".status-pill");
  if (pill && confirme) pill.setAttribute("data-state", "confirme");

  /* ---------- Langues parlées ---------- */
  var langs = Array.isArray(P.langues) ? P.langues : [];
  var langBox = document.querySelector("[data-languages]");
  var langList = document.querySelector("[data-languages-list]");

  function renderLanguages() {
    $all("[data-languages-inline]").forEach(function (el) {
      el.textContent = langs.map(function (l) { return tr(l.langue); }).join(", ");
    });
    if (!langBox || !langList) return;
    langList.textContent = "";
    if (langs.length) {
      langs.forEach(function (l) {
        var li = document.createElement("li");
        var a = document.createElement("span");
        var b = document.createElement("span");
        a.textContent = tr(l.langue);
        b.textContent = tr(l.niveau);
        li.appendChild(a);
        li.appendChild(b);
        langList.appendChild(li);
      });
      langBox.hidden = false;
    } else if (IS_LOCAL) {
      var li = document.createElement("li");
      li.appendChild(todo("langues"));
      langList.appendChild(li);
      langBox.hidden = false;
    }
  }

  /* ---------- CV : détection automatique du fichier PDF ---------- */
  var cvPath = tr(P.cv && P.cv.fichier);
  var cvReady = document.querySelector("[data-cv-ready]");
  var cvMissing = document.querySelector("[data-cv-missing]");

  function showCv(available) {
    SITE.cv.available = available;
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

  /* ---------- API partagée avec chat.js ---------- */
  var SITE = window.SITE = {
    profil: P,
    isLocal: IS_LOCAL,
    cv: { path: cvPath, available: false },
    get lang() { return lang; },
    tr: tr,
    ui: ui,
    setLang: setLang
  };

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

  /* ---------- Changement de langue ---------- */
  function setLang(next, remember) {
    if (LANGS.indexOf(next) === -1) return;
    lang = next;
    applyStatic();
    renderData();
    if (remember) {
      storage("set", lang);
      // L'adresse reflète la langue, pour partager un lien directement en anglais ou en allemand.
      var p = new URLSearchParams(location.search);
      if (lang === "fr") p.delete("lang"); else p.set("lang", lang);
      var q = p.toString();
      history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
    }
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  $all("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang"), true); });
  });

  if (lang === "fr") {
    renderData();
    applyStatic();
  } else {
    setLang(lang, false);
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
