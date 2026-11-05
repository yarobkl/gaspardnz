# GaspardNZ iOS — préparation App Store (build 25)

## Portée
Application `com.gaspardnz.app`, version TestFlight cible `1.0.14 (25)`. Ce document prépare une **soumission publique** ; l'envoi TestFlight ne vaut ni révision ni approbation App Store.

## Vérifications livrées dans le code
- Navigation native à cinq onglets, haptique et options de réduction des mouvements conservées.
- Galerie : catégorie et cadrage vertical définissables dans l'administration, aperçus visuels avant enregistrement, photos des clients publiés uniquement.
- Actualités : mode « photo entière » ou « plein cadre » et position verticale configurables depuis l'administration ; les cartes restent de dimensions uniformes.
- Conversion : formulaire de contact CRM accessible depuis les prestations, les photos et les articles, avec sujet prérempli ; prénom, téléphone, e-mail natif et consentement informatif déjà présents dans le formulaire.
- Réservation : créneaux publiés depuis l'admin ; horaires expirés filtrés ; demande et créneau enregistrés dans le CRM pour confirmation manuelle. **Ne pas présenter un créneau demandé comme réservé.**
- Outils internes Push : masqués hors builds iOS internes explicitement configurés. **Ils ne sont pas un produit public** ; leur disponibilité en TestFlight ne confirme pas le fonctionnement APNs.
- Images : chargement progressif des vignettes, décodage asynchrone, préchargement limité aux voisines dans le lecteur ; animation désactivable selon les préférences d'accessibilité.

## À faire avant la soumission grand public
1. Installer et tester le dernier build sur un iPhone réel, y compris écran compact, connexion lente et VoiceOver.
2. Contrôler les parcours : contact CRM, photos avec et sans catégories, actualités, liens légaux, favoris, partage, rendez-vous et états vides.
3. Vérifier que les créneaux de rendez-vous sont réellement publiés, que les demandes arrivent au CRM et qu'aucun créneau n'est promis automatiquement.
4. Vérifier l'activation APNs et une vraie notification iPhone après livraison Vercel du module admin séparé ; aucun succès Push n'est présumé avant un reçu confirmé.
5. Préparer les captures App Store avec les vraies photos GaspardNZ : Accueil, Services, Galerie, Actualités, Plus, et Réserver/Showroom. **Ne pas exposer l'écran technique d'appairage Push.**
6. Vérifier la description, le nom, les mots-clés, la catégorie, l'e-mail d'assistance, l'URL de confidentialité et les déclarations App Privacy dans App Store Connect.
7. Tester les liens de confidentialité, CGV, mentions légales, assistance et préférences cookies depuis l'application.
8. Désactiver `VITE_GNZ_INTERNAL_BUILD` pour le build destiné à l'App Store (la CI de TestFlight peut l'activer uniquement pour la branche interne).
9. Valider les droits de publication de chaque photographie client, notamment les portraits des mariages.
10. Ne soumettre qu'après tests manuels sur iPhone + validation des métadonnées et des captures.

## Limites assumées
- Les demandes de créneaux sont des prospects CRM **à confirmer manuellement**, pas encore un moteur de réservation atomique (gestion de disponibilités concurrentes et confirmation serveur à intégrer à une livraison backend dédiée).
- Les commandes de cadrage et de catégorie de l'administration nécessitent le déploiement de la branche web correspondante. La compilation iOS et l'envoi TestFlight **ne déploient pas l'administration**.
- Les résultats des tests automatiques ne prouvent pas à eux seuls le ressenti haptique ni le cadrage sur tous les modèles d'iPhone.
