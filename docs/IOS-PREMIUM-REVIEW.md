# Refonte GaspardNZ iOS — état et critères de validation

## Isolation
- Branche `feature/ios-premium-interface`, basée sur `feature/ios-hero-photo`.
- `App.jsx` rend `NativeExperience` uniquement lorsque `Capacitor.isNativePlatform()` et hors administration.
- Le site public conserve `NavMobile`, `HeroMobile`, `MobileHomeCompact` et ses sections.
- Aucun changement de design ne doit être fusionné avant une revue visuelle sur iPhone.

## Design
- Fond : #FAF8F4 ; cartes : #EDE1D0 ; accents : #8A5A2B.
- Barre inférieure : Accueil, Services, Galerie, Réserver, Plus.
- Les contenus existants sont réutilisés pour les formules, galerie, actualités, showroom, journal, mariage, vidéos, partenaires, VIP, style du mois, communauté et contact.
- Les modules de contenu héritent encore de styles web historiques : leur harmonisation native reste à tester.

## Photo d'accueil — point bloquant
- L'utilisateur a choisi un portrait précis au showroom (costume noir, logo bleu en arrière-plan).
- Le code actuel référence `/images/veste-orange.jpg` hérité d'une branche précédente, **ce n'est pas la photo validée**.
- Ne pas publier le build avant d'ajouter le fichier original au dépôt sous `public/images/gnz-accueil-ios.jpg` et d'ajuster le chemin.
- La photo ne doit pas être modifiée ou recréée par IA.
- La vidéo du site web doit rester intacte.

## Validation avant TestFlight
1. CI `BUILD_TARGET=capacitor npm run build` réussie.
2. Vérifier les images locales, y compris l'image d'accueil.
3. Tester les 5 onglets et le bouton retour.
4. Vérifier les langues FR/EN/ES/ZH et les libellés non traduits.
5. Tester le parcours « Parler à Gaspard » avec enregistrement CRM et WhatsApp.
6. Tester les réservations, le Lookbook, les actualités et les sections alimentées par Supabase.
7. Vérifier safe areas iPhone, clavier, VoiceOver, tailles de police et contraste.
8. Aucun changement de l'accueil vidéo public, du site, de l'administration ni de la version TestFlight en cours.

**Ne pas fusionner ni publier tant que ces contrôles ne sont pas satisfaits.**
