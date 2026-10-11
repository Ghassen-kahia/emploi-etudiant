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
  var LANGS = ["fr", "en", "de", "es"];
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

    var age = tr(P.age).trim();
    $all("[data-age]").forEach(function (el) {
      el.textContent = "";
      if (age) el.textContent = ui("age").replace("{n}", age);
      else if (IS_LOCAL) el.appendChild(todo("age"));
    });

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

  /* ---------- Logos (config.js → logos), sinon badge texte ---------- */
  var logos = P.logos || {};
  $all("[data-logo]").forEach(function (box) {
    var src = tr(logos[box.getAttribute("data-logo")]).trim();
    if (!src) return;
    var img = new Image();
    img.alt = "";
    img.decoding = "async";
    // Le badge n'est remplacé qu'une fois l'image chargée : un fichier manquant laisse le badge.
    img.onload = function () {
      box.textContent = "";
      box.classList.remove("tl-logo-text");
      box.appendChild(img);
    };
    img.src = src;
  });

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

  // Remplissage de la jauge d'après le niveau indiqué dans config.js (CECRL ou « langue maternelle »).
  function levelOf(niveau) {
    var t = (niveau && typeof niveau === "object" ? niveau.fr || "" : String(niveau || "")).toLowerCase();
    if (/matern|natif|native|mutter/.test(t)) return 100;
    var cefr = { c2: 95, c1: 86, b2: 74, b1: 58, a2: 40, a1: 24 };
    var m = t.match(/\b([abc][12])\b/);
    return m ? cefr[m[1]] : 60;
  }

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
        var bar = document.createElement("span");
        a.textContent = tr(l.langue);
        b.textContent = tr(l.niveau);
        bar.className = "lang-bar";
        bar.setAttribute("aria-hidden", "true");
        li.style.setProperty("--lvl", levelOf(l.niveau) + "%");
        li.appendChild(a);
        li.appendChild(b);
        li.appendChild(bar);
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

  /* ---------- Menu des langues (drapeaux) ---------- */
  var langMenu = document.querySelector("[data-lang-menu]");
  if (langMenu) {
    var langBtn = langMenu.querySelector("[data-lang-current]");
    var langOpts = langMenu.querySelector(".lang-options");
    var openLang = function (open) {
      langBtn.setAttribute("aria-expanded", String(open));
      langOpts.hidden = !open;
    };
    var syncLang = function () {
      var cur = langMenu.querySelector('[data-set-lang="' + lang + '"] .flag svg');
      var flag = langMenu.querySelector("[data-lang-flag]");
      if (cur && flag) { flag.textContent = ""; flag.appendChild(cur.cloneNode(true)); }
      langMenu.querySelector("[data-lang-code]").textContent = lang.toUpperCase();
    };
    langBtn.addEventListener("click", function () { openLang(langOpts.hidden); });
    langOpts.addEventListener("click", function (e) {
      if (e.target.closest("[data-set-lang]")) { openLang(false); langBtn.focus(); }
    });
    document.addEventListener("click", function (e) { if (!langMenu.contains(e.target)) openLang(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !langOpts.hidden) { openLang(false); langBtn.focus(); }
    });
    document.addEventListener("langchange", syncLang);
    syncLang();
  }

  /* ---------- Présentation vidéo (fenêtre modale) ---------- */
  var videoModal = document.querySelector("[data-video-modal]");
  if (videoModal && typeof videoModal.showModal === "function") {
    var videoEl = videoModal.querySelector("[data-video]");
    var closeVideo = function () { if (videoModal.open) videoModal.close(); };
    // La vidéo existe en FR / EN / DE / ES : on charge celle de la langue affichée.
    var syncVideo = function () {
      var src = "assets/video/presentation-" + lang + ".mp4";
      if (videoEl.getAttribute("src") === src) return;
      videoEl.pause();
      videoEl.setAttribute("src", src);
      videoEl.setAttribute("poster", "assets/video/presentation-poster-" + lang + ".jpg");
    };
    syncVideo();
    document.addEventListener("langchange", syncVideo);
    $all("[data-video-open]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (toggle) setMenu(false);
        videoModal.showModal();
        var p = videoEl.play();
        if (p && p.catch) p.catch(function () { /* lecture bloquée : les commandes restent disponibles */ });
      });
    });
    videoModal.querySelector("[data-video-close]").addEventListener("click", closeVideo);
    // Clic sur le fond assombri : fermeture
    videoModal.addEventListener("click", function (e) { if (e.target === videoModal) closeVideo(); });
    videoModal.addEventListener("close", function () { videoEl.pause(); });
  }

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

  /* ---------- Effets visuels (désactivés si l'utilisateur réduit les animations) ---------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Thème clair / sombre (le thème initial est posé par le script du <head>) ---------- */
  var root = document.documentElement;
  var themeBtn = document.querySelector("[data-theme-toggle]");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) themeBtn.setAttribute("aria-pressed", String(theme === "light"));
    if (themeMeta) themeMeta.setAttribute("content", theme === "light" ? "#f6f6fb" : "#06081a");
  }
  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch (e) { /* sans importance */ }

      if (!document.startViewTransition || reduceMotion) { applyTheme(next); return; }
      // Le nouveau thème s'étend en cercle depuis le bouton.
      var r = themeBtn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(function () { applyTheme(next); }).ready.then(function () {
        root.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
          { duration: 650, easing: "cubic-bezier(.2, .7, .2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      }).catch(function () { /* transition interrompue par un double clic : le thème est déjà appliqué */ });
    });
  }

  // Sans choix mémorisé, on suit le réglage du système s'il change.
  if (window.matchMedia) {
    var sysLight = window.matchMedia("(prefers-color-scheme: light)");
    var onSys = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) { /* ignoré */ }
      if (!saved) applyTheme(e.matches ? "light" : "dark");
    };
    if (sysLight.addEventListener) sysLight.addEventListener("change", onSys);
  }
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Barre de progression de lecture
  var progress = document.querySelector(".scroll-progress");
  if (progress) {
    var setProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
    };
    window.addEventListener("scroll", setProgress, { passive: true });
    window.addEventListener("resize", setProgress);
    setProgress();
  }

  // Bandeau « à la une » : reprend les postes et les atouts (icône + intitulé), dans la langue courante
  var marquee = document.querySelector("[data-marquee]");
  function fillMarquee() {
    if (!marquee) return;
    var items = $all(".sector, .cards .card").map(function (el) {
      return {
        text: el.querySelector("h4, h3").textContent.replace(/^.*:\s*/, "").trim(),
        icon: el.querySelector("svg")
      };
    });
    marquee.textContent = "";
    // Deux copies identiques : l'animation glisse de -50 % pour une boucle sans à-coup.
    for (var k = 0; k < 2; k++) {
      var group = document.createElement("div");
      group.className = "marquee-group";
      items.forEach(function (it) {
        var span = document.createElement("span");
        if (it.icon) {
          var ic = it.icon.cloneNode(true);
          ic.setAttribute("class", "tk-icon");
          span.appendChild(ic);
        }
        span.appendChild(document.createTextNode(it.text));
        group.appendChild(span);
      });
      marquee.appendChild(group);
    }
  }
  fillMarquee();
  document.addEventListener("langchange", fillMarquee);

  var ticker = document.querySelector("[data-ticker]");
  var tickerBtn = document.querySelector("[data-ticker-toggle]");
  if (ticker && tickerBtn) {
    tickerBtn.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      tickerBtn.setAttribute("aria-pressed", String(paused));
    });
  }

  // Atouts : grande icône en filigrane dans chaque carte
  $all(".cards .card").forEach(function (card) {
    var icon = card.querySelector(".card-icon");
    if (!icon || card.querySelector(".card-watermark")) return;
    var mark = icon.cloneNode(true);
    mark.setAttribute("class", "card-watermark");
    card.appendChild(mark);
  });

  // Halo lumineux qui suit le curseur sur les cartes
  if (finePointer) {
    $all(".card, .sector, .fiche, .cv-block, .week, .dispo-notes > div").forEach(function (el) {
      el.classList.add("has-spot");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // Légère inclinaison 3D de la fiche « En bref »
  var fiche = document.querySelector(".fiche");
  if (fiche && finePointer && !reduceMotion) {
    fiche.addEventListener("pointermove", function (e) {
      var r = fiche.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      fiche.style.transform = "perspective(1000px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg)";
    });
    fiche.addEventListener("pointerleave", function () { fiche.style.transform = ""; });
  }

  // Compteurs animés (0 → valeur) à l'apparition
  var counters = $all("[data-count]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countObs.unobserve(en.target);
        var el = en.target, end = +el.getAttribute("data-count"), t0 = null;
        var step = function (t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = "0";
        requestAnimationFrame(step);
      });
    });
    counters.forEach(function (el) { countObs.observe(el); });
  }

  /* ---------- Carte interactive (Leaflet + CARTO), chargée à l'approche ---------- */
  var mapBox = document.querySelector("[data-map]");
  var LEAFLET = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
  function loadAsset(tag, attrs) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement(tag);
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }
  function initMap() {
    var lat = +mapBox.dataset.lat, lng = +mapBox.dataset.lng, radius = +mapBox.dataset.radius;
    var small = mapBox.clientWidth < 560;
    var map = L.map(mapBox, { zoomControl: false, scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], small ? 11 : 12);
    map.attributionControl.setPrefix(false);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    // Tuiles OpenStreetMap ; leur style clair / sombre est appliqué en CSS (.map-tiles) selon le thème.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map);

    var area = L.circle([lat, lng], {
      radius: radius, color: "#6fd3ff", weight: 1.5, opacity: .9, dashArray: "6 8",
      fillColor: "#7c6cff", fillOpacity: .1, interactive: false
    }).addTo(map);
    var photo = tr(P.photo).trim();
    var pin = L.divIcon({
      className: "map-pin",
      html: '<span class="map-pin-ring"></span><span class="map-pin-ring r2"></span>' +
        (photo ? '<img src="' + photo + '" alt="">' : "<b>GK</b>"),
      iconSize: [58, 58],
      iconAnchor: [29, 29]
    });
    L.marker([lat, lng], { icon: pin, keyboard: false, interactive: false }).addTo(map);
    // Zoom entier (tuiles nettes, sans jointures) ; vue décalée pour que l'encart ne masque pas l'épingle.
    map.panBy([0, small ? -28 : -36], { animate: false });
    // Molette active seulement après un clic sur la carte (le défilement de la page n'est pas capturé).
    map.on("click focus", function () { map.scrollWheelZoom.enable(); });
    mapBox.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });
    mapBox.classList.add("is-ready");
  }
  if (mapBox && "IntersectionObserver" in window) {
    var mapObs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      mapObs.disconnect();
      Promise.all([
        loadAsset("link", { rel: "stylesheet", href: LEAFLET + "leaflet.min.css", crossorigin: "anonymous",
          integrity: "sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==" }),
        loadAsset("script", { src: LEAFLET + "leaflet.min.js", crossorigin: "anonymous",
          integrity: "sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g==" })
      ]).then(initMap).catch(function (err) {
        // Hors ligne ou CDN indisponible : le lien « Agrandir la carte » reste disponible.
        if (window.console) console.warn("Carte indisponible :", err && err.message ? err.message : err);
      });
    }, { rootMargin: "300px 0px" });
    mapObs.observe(mapBox);
  }

  /* ---------- Année du pied de page ---------- */
  $all("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
