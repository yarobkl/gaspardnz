# Suite E2E (Playwright)

Vrais parcours utilisateur du site public, rejoués dans un vrai navigateur
(pas de mock de fetch/DOM) : menu, réservation, chatbot, pages SEO, mise en
page desktop. Complète les tests composants (`tests/component/`, `vitest`,
qui simulent Supabase) sans les remplacer — ici, c'est l'application réelle
qui tourne, avec ses vrais appels réseau (repliés sur les données statiques
quand Supabase n'est pas joignable, comportement volontaire du site).

## Lancer

```bash
npm run test:e2e:playwright
```

Le serveur de dev (`npm run dev`) est démarré et arrêté automatiquement par
Playwright (voir `webServer` dans `playwright.config.js`). Aucune étape
manuelle nécessaire.

Pour un fichier précis ou un mode interactif :

```bash
npx playwright test tests/e2e/navigation.spec.js
npx playwright test --ui
npx playwright show-report
```

## Environnement sandbox

En environnement sandbox (voir la documentation d'environnement du dépôt),
Chromium est pré-installé à un chemin fixe pour éviter un téléchargement
bloqué par le réseau restreint. `playwright.config.js` détecte ce chemin
automatiquement (`existsSync`) et s'en sert s'il existe ; ailleurs (poste de
dev, CI standard), Playwright retombe sur son propre Chromium managé,
installé via `npx playwright install` (à faire une fois, pas nécessaire ici).

## Couverture

| Fichier | Scénarios |
|---|---|
| `smoke.spec.js` | La page d'accueil charge sans erreur console |
| `navigation.spec.js` | Menu principal (contenu, traduction), bascules contraste/jour-nuit sur téléphone étroit |
| `booking-modal.spec.js` | Validation native sur champs vides, parcours complet (Calendly/WhatsApp), clic sur le fond sans perte de saisie |
| `chatbot.spec.js` | Réponse + bouton WhatsApp, navigation vers une section du site |
| `seo-pages.spec.js` | Chaque page SEO dédiée charge directement et renvoie vers les pages légales |
| `desktop-layout.spec.js` | Sections contenues en largeur à 1440px (pas de régression du type "plus de grille desktop") |

Ceci ne couvre pas (encore) l'admin — voir `scripts/browser-checks/` pour les
scénarios de sécurité et RBAC de l'admin, qui restent sur `playwright-core`
brut pour l'instant.
