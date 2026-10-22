# Le Lien Numérique Solidaire — maquette « Le Fil »

Site statique (HTML, CSS, JavaScript), sans étape de construction, prêt pour Vercel.

- `index.html` : accueil
- `services.html` : services et tarifs
- `reinsertion.html` : accompagnement en réinsertion
- `assets/css/site.css` : styles et jetons de couleur
- `assets/js/site.js` : fil, animations, simulateur, formulaire simulé
- `assets/js/persienne.js` : lumière de persienne en WebGL (OGL)
- `assets/vendor/` : GSAP, Lenis, OGL hébergés avec le site
- `assets/fonts/` : Fraunces et Atkinson Hyperlegible Next (licence OFL)

## Images

Chaque emplacement porte un nom (`data-img`). Tant qu'une image manque, un visuel provisoire est dessiné en code.
Pour en ajouter une : déposer `nom-800.webp` et `nom-1600.webp` dans `assets/img/`, puis déclarer le nom dans
`assets/img/images.js`, par exemple `"accueil-heros": [800, 1600]`.

## Démonstration

Formulaire de rendez-vous et simulateur de coût sans envoi réel. Les éléments marqués « à confirmer »,
« à compléter » ou « à préciser » doivent être validés avec Florent avant la mise en ligne.
