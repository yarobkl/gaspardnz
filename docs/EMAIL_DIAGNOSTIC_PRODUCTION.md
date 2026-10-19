# GaspardNZ — diagnostic SMTP sans envoi

**Contexte (19/10/2026)** : l'API d'envoi SMTP a échoué avec le code 535 en septembre 2026 ; le site a ensuite désactivé ses notifications. Aucun mot de passe n'est inclus dans ce dépôt.

## Ce qui est livré indépendamment du chantier de réparation
- `GET /api/email-health` : route Vercel réservée aux rôles admin/owner actifs vérifiés dans Supabase.
- Cette route vérifie les noms de variables serveur requises et lance uniquement la connexion/authentification SMTP via `nodemailer.verify()`. Elle n'envoie pas de message et ne renvoie jamais de secret.
- Admin > Emails : bouton **Tester le serveur email** qui affiche le résultat, ou la raison générique de refus.
- Scripts de validation adaptés à la structure admin actuelle (hook de session, inventaire RBAC centralisé). Aucun assouplissement de permissions.
- L'activation des notifications reste **à false** en production, tant que la configuration SMTP n'a pas été réparée et réellement testée.

## Étapes non réalisables sans accès de configuration Vercel
1. Vérifier `EMAIL_FROM`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SUPABASE_SERVICE_ROLE_KEY` sous Production. Le connecteur actuel renvoie 403 sur leur inventaire.
2. Vérifier depuis l'admin que SMTP est authentifié, puis soumettre un formulaire de test avec compte autorisé.
3. Après réussite, intégrer les correctifs du chantier complet dans la PR #25. Ne pas réactiver avant preuve réelle.

La présence d'un déploiement Vercel `READY` ou d'une ligne `status=sent` ne suffit pas à prouver qu'un e-mail est arrivé dans la boîte de réception.
