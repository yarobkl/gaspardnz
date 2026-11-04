# Notifications GaspardNZ — installation et sécurité

## État
- Centre de rédaction des campagnes et API admin : code en branche feature/notifications-client.
- Fournisseur APNs direct sans abonnement : module serveur prêt pour tests, **non activé**.
- Aucun envoi réel, aucun cron, aucun abonnement client encore actif.
- Ne pas fusionner ni déployer tant que les tests et contrôles ci-dessous ne sont pas terminés.

## Coûts
APNs ne facture pas les notifications. L'adhésion Apple Developer Program (requise pour signer et distribuer l'app) et les éventuels dépassements des quotas Supabase/Vercel ne sont pas gratuits. Aucune dépense supplémentaire ne doit être engagée sans validation.

## Préparation Apple
1. Apple Developer > Identifiers : activer Push Notifications sur com.gaspardnz.app.
2. Keys : créer une clé APNs (.p8), relever Key ID et Team ID.
3. Mettre à jour le provisioning profile et ajouter l'entitlement aps-environment pour la signature iOS.
4. Vercel variables serveur uniquement : APNS_KEY_ID, APPLE_TEAM_ID, APNS_PRIVATE_KEY (clé privée, jamais en VITE_), APNS_TOPIC=com.gaspardnz.app, APNS_ENV=production pour TestFlight.
5. Ne jamais committer la clé .p8 ni un token utilisateur.

## À terminer avant mise en production
- Ajouter l'intégration Capacitor Push Notifications côté application iOS et les callbacks AppDelegate APNs.
- Demander explicitement l'autorisation, expliquer le consentement marketing, et permettre son retrait.
- Concevoir un endpoint d'enregistrement des tokens sécurisé pour clients anonymes : éviter de permettre à n'importe qui d'inscrire le token d'un tiers.
- Configurer une désinscription et gérer les réponses APNs 410 / BadDeviceToken.
- Construire le worker d'envoi idempotent, batché, avec limitation de débit, historique et reprise.
- Protéger les rappels de rendez-vous contre les envois à l'ensemble des clients.
- Déployer et vérifier la migration SQL après sauvegarde et audit des politiques RLS.
- Tests : build CI, TestFlight iPhone réel, opt-in/opt-out, notification au premier plan/arrière-plan, clic profond, suppression des tokens, refus permission, contrôle des coûts.

## Test serveur
POST /api/admin-notification-test (auth Bearer Supabase owner/admin) : {deviceToken,title,body}.
L'endpoint est un outil de test, pas une fonction d'envoi aux clients. Il ne fonctionne qu'après configuration Apple et obtention d'un token de test valide.
