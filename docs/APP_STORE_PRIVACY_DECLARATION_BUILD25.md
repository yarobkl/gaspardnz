# GaspardNZ iOS — Déclarations App Privacy (build 25 / 1.0.14)

**État : préparé dans le code ; non encore saisi/publié dans App Store Connect.**
Ce document fournit la correspondance entre le build 25 et les catégories Apple. Il ne certifie pas les réglages des consoles Google Analytics, Supabase ou Apple, ni les pratiques éventuelles de tous les SDK tiers.

## URL à déclarer
Politique de confidentialité publique : https://gaspardnz.style/confidentialite.html (ouverte et vérifiée le 5 novembre 2026).
La politique est aussi accessible depuis Plus > Informations légales de l'application.

## « Collectez-vous des données ? »
**OUI.** Les demandes CRM sont conservées côté serveur et les statistiques sont collectées avec consentement.

## Types de données (saisie App Store Connect)
| Catégorie Apple | Sous-type Apple | Usage principal | Lien à l'identité | Observation |
| --- | --- | --- | --- | --- |
| Coordonnées / Contact Info | Nom / Name | Fonctionnalités de l'app / App Functionality | Oui | Le prénom est sauvegardé avec le prospect CRM |
| Coordonnées / Contact Info | Adresse e-mail / Email Address | Fonctionnalités de l'app | Oui | Obligatoire dans le formulaire natif iOS |
| Coordonnées / Contact Info | Numéro de téléphone / Phone Number | Fonctionnalités de l'app | Oui | Prospect CRM et suivi du projet |
| Contenu utilisateur / User Content | Autres contenus utilisateur / Other User Content | Fonctionnalités de l'app | Oui | Détails du projet, souhait de rendez-vous, message |
| Données d'utilisation / Usage Data | Interactions avec le produit / Product Interaction | Analyse / Analytics | À confirmer : ID visiteur persistant | Pages, clics, parcours après consentement |
| Identifiants / Identifiers | Identifiant utilisateur / User ID | Analyse | À confirmer | UUID visiteur/session envoyé avec les événements consentis |
| Localisation / Location | Localisation approximative / Coarse Location | Analyse | À confirmer | Google Analytics 4 déduit par défaut un emplacement approximatif par l'IP ; confirmer les paramètres régionaux de collecte |
| Diagnostics / Diagnostics | Types effectivement collectés, le cas échéant | Performance / App Functionality | À confirmer | Ne pas déclarer une catégorie non collectée sans preuve ; vérifier Apple et SDK |
| Identifiants / Identifiers | Identifiant appareil / Device ID, le cas échéant | Fonctionnalités de l'app | À confirmer | Token APNs uniquement si appairage Push réellement enregistré côté serveur ; ne pas assimiler automatiquement un token APNs à IDFA |

## Liées à vous et suivi
- **Oui, liées à vous** pour les coordonnées et les informations envoyées volontairement au CRM.
- Pour les statistiques, ne déclarer « non liées à vous » qu'après vérification de l'anonymisation de bout en bout. Un identifiant persistant peut permettre un rattachement, même sans nom.
- **Tracking publicitaire n'est pas synonyme de statistiques.** Le code GA4 refuse `ad_storage`, `ad_user_data` et `ad_personalization`, mais vérifier dans Google Analytics les liaisons Ads, Google Signals et les pratiques des SDK avant de répondre définitivement « Non » au tracking.
- La collecte facultative et conditionnée au consentement doit quand même être divulguée si elle a lieu.

## Comment renseigner App Store Connect
1. Mes apps > GaspardNZ > Confidentialité de l'app > Commencer > Oui, nous collectons des données.
2. Cocher **Coordonnées : Nom, Adresse e-mail, Numéro de téléphone** et **Contenu utilisateur : Autres contenus utilisateur**.
3. Cocher **Données d'utilisation : Interactions avec le produit** et **Identifiants : Identifiant utilisateur** pour les analyses consenties.
4. Examiner la **localisation approximative** par Google Analytics (collectée par défaut sauf désactivation régionale). Ajouter si confirmée.
5. Enregistrer puis ouvrir chaque type pour choisir sa finalité et son association éventuelle à l'identité.
6. Vérifier Google Analytics et le comportement des SDK avant de répondre à la question « Utilisées à des fins de suivi ? ».
7. Renseigner l'URL de politique ci-dessus, prévisualiser puis publier la déclaration seulement après vérification des réponses.

## Sources / code vérifiés
- `src/components/WhatsappContactModal.jsx`
- `src/services/whatsappContact.js` (envoi des leads à `public-event`)
- `src/services/siteTracking.js` et `src/services/analytics.js` (analytics et consentement)
- `src/services/consent.js` (consentement analytics désactivé par défaut)
- `src/components/NativeExperience.jsx` (notifications Push pour build interne)

Documentation officielle :
- Apple : https://developer.apple.com/app-store/app-privacy-details/
- Apple App Store Connect : https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy
- Google Analytics : https://support.google.com/analytics/answer/11593727?hl=fr

**Cette préparation ne modifie ni l'application distribuée ni les déclarations Apple.** La saisie et la publication dans App Store Connect demandent un accès autorisé.
