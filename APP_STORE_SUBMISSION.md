# GaspardNZ — fiche App Store (France)

## Identité

- Nom : `GaspardNZ`
- Bundle ID : `com.gaspardnz.app`
- SKU : `gaspardnz-ios-001`
- Version TestFlight disponible : `1.0.4 (15)` (la version soumise à l’App Store reste à confirmer)
- Catégorie principale : `Style de vie`
- Catégorie secondaire : `Shopping`
- Classement d’âge visé : `4+`

## Métadonnées

### Sous-titre

`Élégance masculine sur mesure`

### Texte promotionnel

`Découvrez l’univers GaspardNZ : inspirations, looks, prestations, partenaires et prise de rendez-vous pour construire une élégance qui vous ressemble.`

### Description

`GaspardNZ vous accompagne dans la création d’une allure élégante, personnelle et maîtrisée.`

`Découvrez ses inspirations, ses conseils de style, ses looks, son showroom et ses prestations pour les mariages, cérémonies, galas et grands événements.`

`L’application permet notamment de :`

`• explorer l’univers et le parcours de GaspardNZ ;`
`• consulter les galeries, actualités et inspirations ;`
`• découvrir les formules et prestations proposées ;`
`• retrouver les partenaires recommandés ;`
`• prendre rendez-vous ou contacter directement l’équipe ;`
`• accéder à une expérience disponible en français, anglais, espagnol et chinois.`

`GaspardNZ défend une vision moderne de l’élégance masculine, attentive aux détails, aux occasions et à la personnalité de chacun.`

### Mots-clés

`styliste,homme,mode,élégance,costume,mariage,conseil,image,Paris,showroom,look`

### URL

- URL marketing : `https://gaspardnz.style/`
- URL d’assistance : `https://gaspardnz.style/contact`
- Politique de confidentialité : `https://gaspardnz.style/confidentialite.html`

## Notes pour l’équipe de validation Apple

`L’application GaspardNZ présente l’univers, les prestations et les contenus éditoriaux d’un styliste et créateur de contenu. Les visiteurs peuvent consulter les galeries, les inspirations, les partenaires et contacter l’équipe ou demander un rendez-vous. Aucun compte n’est requis pour utiliser les fonctions publiques. L’espace d’administration est réservé au personnel autorisé et n’est pas nécessaire à la validation des fonctions destinées au public. L’application ne vend aucun contenu numérique dans l’application.`

## Confidentialité App Store Connect

Déclarations à vérifier dans App Store Connect :

- Nom, adresse e-mail et numéro de téléphone : collectés uniquement lorsque l’utilisateur envoie volontairement un formulaire ; finalité « Fonctionnalité de l’app ».
- Autre contenu utilisateur : message libre d’une demande de contact, de réservation ou de partenariat ; finalité « Fonctionnalité de l’app ».
- Interaction avec le produit : mesure d’audience uniquement après consentement ; finalité « Analyses » ; non utilisée pour le suivi publicitaire inter-apps.
- Aucun accès natif à la localisation, aux contacts, aux photos, au microphone ou à la caméra.
- Aucun identifiant publicitaire et aucun suivi au sens de l’autorisation ATT.

## Publication

- Copyright : `© 2026 GaspardNZ`
- Coordonnées de validation : à renseigner avec la personne habilitée du compte Apple Developer.
- Publication : manuelle après approbation Apple, afin de contrôler la date de mise en ligne.

## Conformité App Store — contrôle préparatoire du 4 novembre 2026

**Statut : préparation, pas approbation de la distribution publique.** Le build TestFlight `1.0.4 (15)` reste inchangé. Les améliorations décrites ci-dessous existent uniquement dans la branche `feature/build15-journal-editorial` jusqu'à un nouveau build iOS signé et testé.

### Éléments intégrés dans le code

- [x] Politique de confidentialité rédigée dans `public/confidentialite.html`.
- [x] Mentions légales et conditions générales de vente présentes dans `public/mentions-legales.html` et `public/cgv.html`.
- [x] Liens dédiés dans la rubrique native « Plus » vers ces trois pages et vers l'assistance, en quatre langues.
- [x] Accès natif permanent au réglage des préférences de consentement via le mécanisme existant.
- [x] Tests automatisés ajoutés pour les liens natifs, les préférences et la langue.
- [ ] Tester les liens en conditions réelles sur iPhone ; confirmer leur ouverture dans le navigateur et le retour à l'application.
- [ ] Vérifier avec le responsable de GaspardNZ l'exactitude et la mise à jour des données juridiques (identité, activité, SIRET, conservation, bases légales et destinataires).

### Vérifications obligatoires dans App Store Connect (non confirmées)

- [ ] URL de politique de confidentialité renseignée dans App Privacy et publiquement accessible.
- [ ] URL d'assistance utilisable, présentant une méthode de contact fonctionnelle.
- [ ] Déclarations App Privacy reflétant **toutes** les données réellement collectées : formulaires (prénom, téléphone, e-mail éventuel et message), rendez-vous, préférences de notification, identifiant/token de notification Push lorsqu'il est enregistré, informations analytiques et outils tiers (y compris les WebViews).
- [ ] Finalités, lien aux utilisateurs, éventuel suivi et partage avec les prestataires déclarés conformément aux flux réellement observés ; aucune case cochée sans vérification.
- [ ] Questionnaire de classification d'âge réellement complété : `4+` est une hypothèse, pas une classification validée.
- [ ] Captures d'écran, description, mots-clés et coordonnées pour App Review complétés.
- [ ] Notes App Review : fonctions publiques sans compte client, fonction admin réservée ; vérifier si un accès de démonstration est requis pour une fonction examinable.
- [ ] Vérifier le modèle de paiement réellement proposé ; les services réalisés hors application ne sont pas automatiquement des achats numériques intégrés.

### Contrôles avant soumission publique

- [ ] Tester la navigation complète, la galerie, les actualités, le journal, les services, le showroom, les réservations et les retours haptiques sur iPhone.
- [ ] Associer un iPhone aux notifications et confirmer **une réception APNs réelle**, pas seulement une signature `aps-environment=production`.
- [ ] Reprendre les **11 tests en échec** signalés dans le précédent bilan, en distinguant les anciens échecs des régressions.
- [ ] Vérifier le consentement analytics et son retrait effectif sur iOS ainsi que les informations de la politique de confidentialité.
- [ ] Si la création de comptes utilisateurs est proposée plus tard, prévoir la suppression du compte depuis l'application selon la règle Apple 5.1.1(v).

Références Apple : App Review Guidelines 2.1 et 5.1.1 ; App Store Connect « App Privacy ». La présence de fichiers et liens dans GitHub ne prouve pas leur disponibilité publique ni leur saisie dans App Store Connect.
