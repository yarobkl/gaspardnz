# Notifications GaspardNZ — installation et sécurité

## État
- Centre de rédaction des campagnes et API admin intégré à la branche premium iOS.
- Module APNs serveur aligné sur les secrets configurés ce matin.
- L’envoi réel nécessite encore l’enregistrement d’un token APNs par appareil et le consentement de l’utilisateur.
- Aucun abonnement client n’est créé automatiquement par cette fondation.

## Configuration Apple réalisée
- Bundle ID : `com.gaspardnz.app`
- Team ID : `UK4UQCQ57G`
- Clé APNs : `AuthKey_CS9M7GKXTH.p8`
- Secrets utilisés : `APNS_PRIVATE_KEY`, `APNS_KEY_ID`, `APNS_ISSUER_ID`, `APNS_BUNDLE_ID`, `APNS_ENVIRONMENT`
- Pour TestFlight, l’environnement doit être `production`.

## Sécurité
- Ne jamais committer la clé `.p8` ni un token utilisateur.
- Les secrets restent côté serveur (Supabase/Vercel), jamais dans une variable `VITE_`.
- Les endpoints admin vérifient la session Supabase et le rôle administrateur.

## À terminer avant la mise en production du push
- Ajouter l’enregistrement sécurisé des tokens APNs depuis l’application iOS.
- Demander et gérer l’autorisation utilisateur, le retrait et la révocation.
- Ajouter le traitement des réponses APNs `410` / `BadDeviceToken`.
- Construire l’envoi batché, idempotent, historisé et limité en débit.
- Tester premier plan, arrière-plan, clic profond et opt-in/opt-out sur un iPhone TestFlight réel.

## Test serveur
`POST /api/admin-notification-test` avec une session admin et un token APNs valide.
Cet endpoint sert uniquement au test ciblé ; il ne diffuse pas encore une campagne à tous les clients.
