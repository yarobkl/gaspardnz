# Réparation des e-mails GaspardNZ — 19 octobre 2026

## Diagnostic confirmé
- Le 21 et le 24 septembre, Supabase a enregistré des échecs SMTP Google 535 (identifiants refusés).
- La version de production consultée contient `EMAIL_NOTIFICATIONS_ENABLED = false` : les e-mails de partenaires sont désactivés.
- La liste des variables Vercel est actuellement inaccessible au connecteur (403), donc l'état des secrets de production n'est pas confirmé.
- Calendly apparaît déconnecté dans `integration_settings`; le lien WhatsApp n'est pas une preuve de message envoyé.

## Séquence de rétablissement sans fausse confirmation
1. **Vercel** : vérifier les noms et l'environnement Production de `EMAIL_FROM`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SUPABASE_SERVICE_ROLE_KEY`. Remplacer le mot de passe d'application invalide dans le coffre Vercel. Ne jamais publier les valeurs.
2. **Serveur** : après déploiement du diagnostic, ouvrir Admin > Emails avec un compte owner/admin, cliquer « Tester SMTP ». `ready` confirme la connexion SMTP, pas l'arrivée en boîte. Utiliser un test d'envoi explicite, contrôlé et non factice pour confirmer l'acceptation puis la réception.
3. **GitHub** : quand l'envoi est prouvé, réactiver `EMAIL_NOTIFICATIONS_ENABLED` dans une PR séparée. Lancer les suites de tests, inspecter les conflits avec PR #24 et déployer avec possibilité de retour arrière.
4. **Réservations** : vérifier l'accès Calendly et une synchronisation autorisée idempotente avant de notifier les réservations confirmées. Pour WhatsApp, ne journaliser qu'une intention tant que le message n'est pas prouvé envoyé.
5. **CRM** : journaliser identifiant de demande, tentative et état de notification; éviter les doublons et permettre des relances contrôlées.

Aucun secret, e-mail client, migration ni déploiement de production n'est nécessaire pour cette PR. Ne pas considérer le chantier achevé sans preuve réelle d'envoi.
