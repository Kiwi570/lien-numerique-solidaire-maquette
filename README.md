# Le Lien Numérique Solidaire — maquette « Le Fil »

Site statique (HTML, CSS, JavaScript), sans étape de construction, prêt pour Vercel.

- `index.html` : accueil · `services.html` : services et tarifs · `reinsertion.html` : réinsertion · `404.html` : page introuvable
- `assets/css/site.css` : styles et jetons de couleur
- `assets/js/site.js` : fil, animations, simulateur, formulaires simulés
- `assets/js/persienne.js` : lumière de persienne en WebGL (sans bibliothèque)
- `assets/vendor/` : GSAP et ses extensions, Lenis
- `assets/fonts/` : Fraunces et Atkinson Hyperlegible Next en WOFF2 (licence OFL)
- `assets/img/` : images WebP en deux tailles, image de partage `partage.jpg`

## Images

Chaque photo est écrite directement dans le HTML (`<picture>`, deux tailles, point focal réglé).
Pour remplacer une image, garder le même nom de fichier et les mêmes largeurs.

## Démonstration

Formulaires et simulateur sans envoi réel. Le site est marqué `noindex` tant qu'il s'agit d'une maquette.
Les éléments marqués « à confirmer », « à compléter » ou « à préciser » sont à valider avec Florent.
