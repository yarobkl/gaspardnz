# GNZ PARIS — livraison iOS suivante et dossier Apple

**Préparation du 18 novembre 2026 — pas une preuve de livraison.**

Application : `com.gaspardnz.app` · Nom affiché : **GNZ PARIS** · Dépôt : `yarobkl/gaspardnz`.

## État vérifiable

- Branches successives en revue : navigation flottante, galerie native, retours haptiques, App Intents, widgets, ActivityKit, calendrier Cal.com et rappels locaux. **Les PR ne sont pas fusionnées ; ce travail ne constitue pas un build disponible sur TestFlight.**
- Sur **iOS 26+**, ActivityKit peut préprogrammer l'affichage H-2 d'une Live Activity après **acceptation d'un rendez-vous dans le calendrier Cal.com intégré**. Le système peut alors la démarrer lorsque l'app est fermée. Cela exige que les Live Activities soient autorisées et reste soumis aux limites iOS. Sur iOS 16.2–25, le démarrage Live Activity nécessite de rouvrir l'app à proximité du rendez-vous ; les notifications locales restent programmables.
- Les réservations réalisées via le lien de navigateur externe ne sont **pas** enregistrées dans ce mécanisme natif. Les annulations ou modifications effectuées dans un autre canal ne sont **pas** synchronisées sans activation de l'intégration Cal.com serveur.
- Référence Apple : <https://developer.apple.com/documentation/activitykit/activity/request(attributes:content:pushtype:style:alertconfiguration:start:)>

## Prochaine livraison TestFlight : séquence

1. Terminer la revue et les tests des PR empilées ; fusionner **dans leur ordre de dépendance** après les contrôles et éviter la branche de production tant que tout n'est pas validé.
2. Contrôler le **dernier numéro de build reçu dans App Store Connect** avant d'en choisir un strictement supérieur. Le workflow `.github/workflows/ios-testflight.yml` accepte `version`, `buildNumber` et `uploadToTestFlight` en déclenchement manuel. Ne jamais présumer un numéro disponible.
3. Exécuter `npm ci`, tests unitaires/composants, build Vite/Capacitor, puis **compilation Xcode sur macOS cloud**, y compris l'extension WidgetKit. Vérifier la signature, l'archive, l'IPA, les artefacts et le journal de téléversement.
4. Téléverser sur **TestFlight seulement après validation du build**, puis confirmer son état « prêt à tester » dans App Store Connect et installer ce build sur un iPhone réel. Un succès de compilation n'est pas un succès de livraison Apple.
5. Réaliser le contrôle sur iPhone réel : navigation à cinq onglets et barre flottante, galerie à transition progressive, Services, Actualités, favoris, liens externes, demandes de contact, notifications, gestion des autorisations et réservation Cal.com. Vérifier aussi VoiceOver, Réduire les animations, connexion lente et iPad.
6. Pour ActivityKit, réserver **un véritable créneau accepté** depuis le calendrier intégré ; vérifier l'écran verrouillé / Dynamic Island à H-2 **avec l'application fermée** sur iOS 26+, l'alerte, la date et l'absence de double rappel H-2. Vérifier statut en attente, notifications refusées, redémarrage de l'iPhone et fonctionnement sur iPhone sans Dynamic Island. Ne pas créer de faux rendez-vous publics.
7. Une fois la vidéo et les réponses Apple vérifiées, compléter **Notes** dans App Store Connect, ajouter les captures réglementaires et répondre à la demande Guideline 2.1. L'utilisateur garde le choix de la **publication manuelle**, distincte de TestFlight.

## Notes pour App Review — brouillon anglais

Les **six rubriques ci-dessous sont une synthèse de préparation**, pas une transcription certifiée des six questions spécifiques d'Apple. Compléter les champs entre crochets avant de les coller dans « App Review Information → Notes » ; le champ est limité à **4 000 octets**.

> **1. Physical-device recording** — Video URL: **[INSERT WORKING, REVIEWER-ACCESSIBLE VIDEO LINK]**. Captured on **[ACTUAL IPHONE MODEL / IOS VERSION / TEST DATE]**. The recording starts with a fresh app launch and demonstrates the public navigation, gallery, editorial content, services, booking and contact flows. **[CONFIRM ANY OTHER APPLE-REQUESTED SCREENS ARE SHOWN.]**
>
> **2. App concept and audience** — GNZ PARIS presents Gaspard NZ's personal styling, formalwear, wedding and ceremony services. Visitors discover genuine editorial content and client looks, explore services, contact the stylist and request an appointment.
>
> **3. Business model and access** — The public experience is browsable without a consumer login. GNZ PARIS does not sell digital content or subscriptions through in-app purchases. Services are arranged with the stylist; third-party links may lead to WhatsApp, Cal.com or an external shop. The editorial administration is restricted to authorized staff. **[VERIFY REVIEWER ACCESS IF APPLE REQUESTS IT.]**
>
> **4. External services** — Supabase (content, database and restricted administration), Vercel (hosting and backend), Cal.com (appointment availability and booking), WhatsApp (client communication), SMTP/email delivery, Apple APNs and ActivityKit (notifications / Live Activities), and Google Analytics 4 subject to analytics consent. Google Gemini may be used for staff-side administration, not as a public AI styling service. **[VERIFY CURRENT PRODUCTION CONFIGURATION.]**
>
> **5. iPhone-specific experience** — Native tab navigation and haptics, optimized photography transitions, widgets and App Intents. On supported iOS 26+ devices, an accepted in-app Cal.com booking can schedule a Lock Screen Live Activity in advance, with Dynamic Island presentation on compatible iPhones. Reviewers should enable Live Activities and notifications in Settings. **[ONLY INCLUDE AFTER A SUCCESSFUL PHYSICAL-DEVICE TEST.]**
>
> **6. Verification and content permissions** — Tested devices: **[REAL MODELS / OS VERSIONS]**. The gallery and editorial media are curated by the stylist, not an open user-posting social network. **[CONFIRM CLIENT PHOTO RIGHTS AND PROVIDE DOCUMENTATION IF ASKED.]** Regional behavior: **[VERIFY]**. Reviewer contact: **[NAME / EMAIL / INTERNATIONAL PHONE]**.

### Vidéo de démonstration demandée par Apple

- Capturer **l'application réellement installée sur un iPhone physique**, sur le build qui sera soumis, en commençant par son ouverture ; ne pas remplacer par des captures, une maquette ou un simulateur.
- Montrer tous les parcours publics et une **vraie réservation** (ou les étapes réellement disponibles si le calendrier ne permet pas une réservation consentie). Ne pas exposer les coordonnées privées d'un client dans la vidéo.
- Montrer le fonctionnement des notifications/Live Activities après avoir obtenu l'autorisation. La vidéo d'un rendez-vous H-2 peut nécessiter une seconde séquence ; expliquer honnêtement toute limite de démonstration.
- Si l'app offre inscription, connexion, suppression de compte ou contenu utilisateur, inclure les parcours que l'équipe App Review a explicitement réclamés. Ne pas déclarer de parcours absents.
- Héberger la vidéo à une URL **accessible sans connexion ni expiration courte** et l'ajouter au champ Notes, pas seulement dans la réponse aux messages Apple.

## Métadonnées et autres pièces à vérifier

| Élément | Condition avant soumission |
| --- | --- |
| Captures iPhone et iPad 13 pouces | Écrans réels du **build soumis**, pas des mockups ; vérifier résolutions acceptées par ASC. |
| Politique de confidentialité et App Privacy | Vérifier URL publique, consentement GA4, collecte CRM, Supabase, services externes ; déclarations conformes au code déployé. |
| Visuels de clients / marque | Vérifier les autorisations d'utilisation et la cohérence de la marque GNZ PARIS / GaspardNZ. |
| Notes, vidéo et coordonnées | Insérer les **six réponses exactes** demandées dans le dernier message Apple avec le lien vidéo fonctionnel et les appareils réellement testés. |
| Version / build / chiffrement | Numéro de build ASC vérifié, export signé, déclaration de chiffrement conforme à l'application. |
| Tests de réservation | Pas de promesse de synchronisation Cal.com hors app tant que l'accès propriétaire/webhook n'est pas configuré. |

## Notes de version proposées

**FR — TestFlight :** « GNZ PARIS gagne une navigation flottante plus élégante, une galerie plus fluide, des retours haptiques discrets, de nouveaux raccourcis iPhone et des rappels de rendez-vous natifs. Sur iOS 26 et les appareils compatibles, le suivi d'un rendez-vous confirmé dans l'app peut apparaître automatiquement sur l'écran verrouillé et dans la Dynamic Island. »

**EN — TestFlight :** “A more fluid GNZ PARIS experience: floating navigation, refined photo browsing, subtle haptics, iPhone shortcuts and native appointment reminders. On supported iOS 26 devices, confirmed in-app bookings can automatically display a scheduled Lock Screen Live Activity and Dynamic Island status.”

**Ne pas publier ces notes ni déclarer la fonctionnalité livrée avant validation du vrai build sur un appareil.**
