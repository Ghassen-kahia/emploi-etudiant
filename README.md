# Ghassen Kahia — Emploi étudiant (Dijon)

Page de candidature en ligne destinée aux recruteurs et responsables de magasin
(grande distribution, restauration, logistique, commerce) à Dijon.

**En ligne :** https://ghassen-kahia.github.io/emploi-etudiant/

Site statique en HTML, CSS et JavaScript, sans framework ni étape de compilation.
C'est la même approche que le portfolio technique (https://ghassen-kahia.github.io/), que ce site ne remplace pas.

---

## Structure

```
.
├── index.html              Page unique (contenu en français)
├── config.js               ← LE fichier à modifier : contact, CV, disponibilités, langues
├── 404.html                Page d'erreur autonome
├── carte.html              Cartes de candidature imprimables avec QR code (outil, non lié)
├── cv/
│   └── Ghassen_Kahia_CVJob_Etudiant.pdf   ← votre CV
├── assets/
│   ├── css/style.css       Styles (mobile d'abord, + feuille d'impression)
│   ├── js/main.js          Remplit la page depuis config.js, menu, copie e-mail
│   ├── fonts/              Newsreader + Public Sans, auto-hébergées (licence OFL)
│   └── img/                favicon, icône iOS, aperçu des liens (og-image.png), qr-site.svg
├── robots.txt, sitemap.xml
├── .nojekyll
└── .github/workflows/deploy.yml   Déploiement automatique sur GitHub Pages
```

## Mettre à jour le site

Toutes les informations variables se trouvent dans **`config.js`**. Une valeur vide (`""`) est
**masquée** sur le site en ligne. En local, elle apparaît en rouge (« À compléter ») pour
vous rappeler de la remplir. Pour voir la page comme un visiteur, ajoutez `?public` à l'adresse locale :
http://localhost:8000/?public

### 1. Coordonnées

```js
contact: {
  email: "prenom.nom@exemple.fr",
  telephone: "+33 6 12 34 56 78",   // ou "" pour ne pas l'afficher
  linkedin: "https://www.linkedin.com/in/votre-profil/",
  ...
}
```

Le bouton « Envoyer un e-mail » ouvre la messagerie avec l'objet *Proposition d'emploi étudiant*.
Le bouton « Copier l'adresse » sert aux recruteurs qui n'ont pas de messagerie configurée.

> Tant que `email` est vide, la section Contact n'affiche que GitHub et la ville.
> **Renseignez-le avant de diffuser le lien.**

### 2. Remplacer le CV

1. Exportez votre CV en PDF.
2. Placez-le dans `cv/`. S'il porte le même nom que l'actuel (`Ghassen_Kahia_CVJob_Etudiant.pdf`),
   il suffit d'écraser l'ancien. Sinon, mettez le nouveau nom dans `cv.fichier` de `config.js`.
3. Publiez (voir plus bas).

Le site détecte le fichier automatiquement. Sans PDF valide, les boutons affichent « CV disponible sur demande ».
Avec un PDF, « Consulter mon CV » l'ouvre directement. Pour changer le nom du fichier, modifiez seulement
`cv.fichier`. Vous pouvez aussi renseigner `cv.miseAJour: "octobre 2026"`.

⚠️ Le PDF est public : retirez-en l'adresse postale, la date de naissance et tout numéro
de document d'identité ou de titre de séjour.

### 3. Disponibilités

```js
libelleDisponibilite: "Disponible soirs et week-ends",   // badge en haut de page

disponibilites: {
  confirme: true,      // ← passer à true seulement quand l'emploi du temps est connu
  jours: {
    lundi:  { statut: "partiel",    creneaux: ["18h00 – 22h00"] },
    samedi: { statut: "disponible", creneaux: [] },          // affiche « Toute la journée »
    dimanche: { statut: "indisponible", creneaux: [] },
    ...
  },
  soirs: "En semaine à partir de 18h",
  weekends: "Samedi toute la journée",
  vacances: "Temps plein possible pendant les vacances universitaires",
  heuresParSemaine: "15 à 20 heures par semaine",
  debut: "À partir du 3 novembre 2026"
}
```

Statuts possibles : `disponible`, `partiel`, `indisponible`, `a-confirmer`.

Tant que `confirme` vaut `false`, le planning n'est **pas** affiché en ligne. Les visiteurs voient
« Emploi du temps en cours de confirmation », ce qui évite d'annoncer une disponibilité inexacte.

### 4. Langues et autorisation de travail (facultatif)

```js
langues: [
  { langue: "Français", niveau: "…" },
  { langue: "Anglais",  niveau: "…" }
],
autorisationTravail: "Titre de séjour étudiant autorisant une activité salariée à temps partiel"
```

N'indiquez que ce que vous pouvez justifier. Aucun numéro de document.

### 5. Photo, mobilité, date de mise à jour (facultatif)

```js
photo: "assets/img/photo.jpg",          // carrée, ~600 px, < 150 Ko ; sinon monogramme « GK »
mobilite: "Tram et bus Divia",          // ligne « Mobilité » dans la fiche En bref
miseAJourPage: "11 octobre 2026",       // affichée en pied de page
disponibilites: { matins: "Ouvertures possibles dès 6h le samedi", ... }
```

En France, une photo est courante sur les candidatures en commerce, mais elle reste facultative.
Choisissez un fond neutre et une tenue simple.

### 6. Cartes de candidature à imprimer

Quand vous déposez un CV en magasin, joignez une petite carte avec un QR code qui renvoie vers ce site.
Le responsable retrouve ainsi vos disponibilités à jour, même si votre CV papier date un peu.

1. Ouvrez http://localhost:8000/carte.html (ou `/emploi-etudiant/carte.html` en ligne).
2. Cliquez « Imprimer » : A4, marges « Aucune », échelle 100 %.
3. Découpez les 4 cartes le long des pointillés.

L'e-mail, le téléphone et les disponibilités viennent de `config.js`. Le QR code est une image fixe
(`assets/img/qr-site.svg`). Si l'adresse du site change, régénérez-le :

```bash
pip install segno
python -c "import segno; segno.make('https://ghassen-kahia.github.io/emploi-etudiant/', error='m').save('assets/img/qr-site.svg', scale=1, border=0, dark='#14213d', xmldecl=False)"
```

(Puis remplacez `width="33" height="33"` par `viewBox="0 0 33 33"` dans le fichier pour qu'il s'agrandisse correctement.)

### 7. Textes

Les textes fixes (présentation, atouts, « Pourquoi me recruter ? ») se trouvent directement dans
`index.html`. Chaque section est repérée par un commentaire `<!-- ============ NOM ============ -->`.

---

## Lancer en local

Le site doit être servi par un petit serveur, car la détection du CV ne fonctionne pas en ouvrant le
fichier directement :

```bash
cd Job_etudian_website
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Alternative : `npx serve .`)

## Déploiement sur GitHub Pages

Le site est publié comme **site de projet** : `https://ghassen-kahia.github.io/emploi-etudiant/`.
Votre portfolio existant (`ghassen-kahia.github.io`) reste inchangé.

### Première mise en ligne

1. Sur GitHub, créez un dépôt **public** nommé `emploi-etudiant`, **sans** README.
2. Dans ce dossier :

   ```bash
   git add .
   git commit -m "Site emploi étudiant"
   git branch -M main
   git remote add origin https://github.com/Ghassen-kahia/emploi-etudiant.git
   git push -u origin main
   ```

3. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
4. Onglet **Actions** : attendez que « Déploiement GitHub Pages » soit vert (environ 1 minute).
5. Ouvrez https://ghassen-kahia.github.io/emploi-etudiant/

> Si vous choisissez un autre nom de dépôt, remplacez `emploi-etudiant` dans les URL de
> `index.html` (balises `canonical` et `og:`), `robots.txt` et `sitemap.xml`.

### Mises à jour suivantes

```bash
git add .
git commit -m "Mise à jour disponibilités"
git push
```

Le site est republié automatiquement à chaque `push` sur `main`.

### Optionnel : lien depuis le portfolio

Ajoutez dans le portfolio technique un lien « Recherche d'emploi étudiant →
/emploi-etudiant/ » pour relier les deux sites.

---

## Pourquoi il n'y a pas de formulaire de contact

GitHub Pages ne sert que des fichiers statiques. Un formulaire ne peut donc pas envoyer de message
sans service externe. Le site utilise un lien e-mail direct et un bouton de copie, ce qui est fiable
et ne collecte aucune donnée. Pour ajouter un formulaire plus tard, il faut un service tiers comme
Formspree ou Web3Forms (offre gratuite limitée, inscription requise), qui reçoit les messages et les
transfère par e-mail.

## Confidentialité

- Polices hébergées sur le site : aucune requête vers Google ou un autre tiers. Pas de traceur ni de cookie.
- Ne publiez jamais d'adresse postale, de pièce d'identité ou de document de séjour.

---

## Liste de vérification avant diffusion

**Contenu**
- [ ] `email` renseigné dans `config.js` ; le bouton « Envoyer un e-mail » ouvre bien la messagerie
- [ ] `telephone` et `linkedin` renseignés, ou laissés vides volontairement
- [ ] CV PDF ajouté dans `cv/`, s'ouvre et se télécharge depuis le site en ligne
- [ ] Disponibilités exactes, `confirme: true` seulement si l'emploi du temps est connu
- [ ] Aucune trace « À compléter » avec `?public` en local
- [ ] Relecture des textes (orthographe, exactitude)

**Mobile et affichage**
- [ ] Testé sur un vrai téléphone (Android et/ou iPhone) : aucun défilement horizontal
- [ ] Le menu mobile s'ouvre, se ferme et chaque lien mène à la bonne section
- [ ] Chrome DevTools → mode appareil : 360 px, 768 px (tablette), 1280 px
- [ ] Sur mobile, la barre « Mon CV / Me contacter » apparaît après l'introduction et disparaît sur Contact
- [ ] « Ajouter à mes contacts » importe bien la fiche sur Android et iPhone
- [ ] QR code des cartes imprimées scanné avec un téléphone → ouvre le site en ligne
- [ ] Impression (Ctrl+P) : la page donne une fiche lisible

**Liens**
- [ ] E-mail, téléphone (`tel:`), LinkedIn, GitHub, portfolio
- [ ] Une URL inexistante (`/emploi-etudiant/xyz`) affiche la page 404 avec un retour fonctionnel

**Accessibilité**
- [ ] Navigation au clavier (Tab) : lien d'évitement visible, contour de focus sur chaque élément
- [ ] Échap ferme le menu mobile
- [ ] Lighthouse (Chrome DevTools → Lighthouse) : Accessibilité ≥ 95

**Performance et SEO**
- [ ] Lighthouse Performance ≥ 95 sur mobile
- [ ] Aperçu du lien vérifié (collez l'URL dans WhatsApp ou LinkedIn → image + titre)

**Déploiement**
- [ ] Settings → Pages → Source : GitHub Actions
- [ ] Workflow « Déploiement GitHub Pages » en vert dans l'onglet Actions

---

Polices : Newsreader et Public Sans, sous licence SIL Open Font License (voir `assets/fonts/`).
