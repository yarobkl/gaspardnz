# Refonte GaspardNZ iOS — état et critères de validation

## Isolation
- La refonte reste sur la branche `feature/ios-premium-interface`, via la PR brouillon #28.
- `App.jsx` affiche `NativeExperience` seulement sur `Capacitor.getPlatform() === "ios"`, hors administration.
- Le site public et l'application Android ne basculent pas sur la nouvelle interface. La vidéo du site n'est pas remplacée.
- Aucune fusion ni publication App Store / TestFlight automatique.

## Identité et interface
- Image originale fournie sur GitHub : `public/images/Photo application .JPG` (attention à l'espace avant `.JPG`).
- Accueil natif : `/images/Photo%20application%20.JPG`. L'image entière est préservée (`object-fit:contain`).
- Vérification visuelle de la photo : Gaspard en costume noir, devant le logo bleu de son showroom.
- Couleurs : ivoire `#FAF8F4`, beige `#EDE1D0`, brun `#8A5A2B`.
- Barre inférieure : Accueil, Services, Galerie, Réserver, Plus, libellés traduits FR/EN/ES/ZH.
- En haut : bandeau clair et statut iOS en caractères sombres (`StatusBar.setStyle({style: Style.Light})`).
- Assistant virtuel repositionné au-dessus des onglets et du bas d'écran sécurisé.
- Les sections issues du site (services, actualités, showroom, etc.) réutilisent leurs composants existants. Certains écrans conservent leur style sombre historique et nécessitent encore une validation visuelle sur iPhone.

## Parcours clients
- Tous les boutons de contact principaux natifs ainsi que les demandes issues des formules et du showroom ouvrent `WhatsappContactModal`.
- Le formulaire valide le prénom, téléphone avec pays et type de projet, puis envoie la demande au CRM avant l'ouverture de WhatsApp.
- L'onglet « Réserver » présente une **demande de rendez-vous**, pas une réservation confirmée. Aucun créneau temps réel n'est promis.
- Le chatbot existant renvoie vers les pages de la navigation native ou le formulaire de contact.
- Une erreur de téléchargement du Lookbook n'est plus silencieuse.

## Contrôles automatisés
- `npm run test:unit -- tests/component/NativeExperience.test.jsx` : navigation des cinq onglets, photo, langues, galerie, CTA vers CRM.
- `npm run build:app` : build Vite des assets Capacitor.
- Le workflow `.github/workflows/ios-ui-validation.yml` vérifie aussi la présence de `dist/images/Photo application .JPG`.
- La validation générale du projet doit aussi passer (script `validate-admin-auth.mjs` mis à jour pour la séparation du hook `useAdminSession`).

## À valider manuellement avant distribution
1. Démarrer sur iPhone réel et vérifier la photo complète, logo visible, boutons lisibles, safe areas et barre d'état.
2. Tester toutes les pages, les langues et les transitions en orientation portrait et avec tailles de police augmentées.
3. Tester le formulaire avec données de test : création CRM réellement enregistrée, puis passage correct vers WhatsApp, et retour à l'application.
4. Tester les demandes de rendez-vous, le Lookbook et les données chargées depuis Supabase.
5. Tester clavier, accessibilité VoiceOver, connexion lente/hors ligne et assistant virtuel.
6. Produire et signer un binaire iOS avec Xcode/CI habilitée, puis diffuser sur TestFlight seulement après validation explicite.

**Une compilation et des tests WebView simulés ne remplacent pas une recette iPhone réelle.**
