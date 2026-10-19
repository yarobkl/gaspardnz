# GaspardNZ — restauration des notifications (19/10/2026)

## Incident factuel
- Derniers succès d'envoi journalisés : 21 juillet 2026.
- 21 et 24 septembre : `535 5.7.8 Username and Password not accepted` côté Gmail SMTP.
- 24 septembre : notifications volontairement désactivées dans `src/constants.js`, commit `995d8e5`.
- Des demandes sont enregistrées dans Supabase ; cela ne prouve pas qu'un email a été envoyé.
- Le connecteur Vercel autorise la lecture du projet mais refuse la liste des variables d'environnement (403). Les valeurs de production ne sont donc pas vérifiées.

## Correction incluse dans cette branche
- Un nouveau diagnostic SMTP `GET /api/email-health`, uniquement pour une session admin active, utilise `nodemailer.verify()` sans envoyer d'email. Le résultat n'expose ni secret ni message SMTP brut.
- Bouton **Tester le serveur email** dans Admin > Emails, avec états explicites.
- Formulaire partenaire : n'annonce un succès qu'après une réponse confirmant l'enregistrement CRM. L'échec laisse les champs et affiche une erreur ; l'e-mail est un événement distinct.
- Réactivation des appels aux notifications dans le code de la branche. **Ne pas publier avant un test SMTP vert en production** et une vérification de réception sur un compte autorisé.

## Prérequis bloquants avant publication
1. Vérifier dans Vercel **Production** les noms de variables `EMAIL_FROM`, `EMAIL_PASSWORD`, `SMTP_HOST`, `SMTP_PORT`, `SUPABASE_SERVICE_ROLE_KEY` et les cibles correspondantes. Ne jamais publier leurs valeurs.
2. Sur le compte SMTP, générer si nécessaire un **mot de passe d'application** adapté ; ne pas utiliser le mot de passe Gmail classique. Le connecter côté Vercel, redéployer.
3. Dans Admin > Emails, lancer le diagnostic ; exiger `ok=true`.
4. Soumettre une demande de test consentie via un compte appartenant à l'administrateur ; confirmer le statut `sent` côté CRM puis réception de la notification et de l'accusé client.
5. Vérifier le fonctionnement sur les parcours partenaire et candidature, puis le calendrier avec le compte Calendly connecté.
6. Les mails historiques en échec ne sont **pas** rejoués automatiquement : leurs destinataires et le contexte ne suffisent pas toujours à reconstruire un email sûr. Éviter les doubles messages.

## Remarque sur les réservations
Le composant de réservation public actuellement déployé redirige vers Calendly/WhatsApp ; il n'enregistre pas à lui seul une réservation confirmée. La PR #24 contient un nouveau parcours d'intention de contact sécurisé, encore non fusionné et requérant une migration en production. Ne pas fusionner sans validations Supabase / Vercel. Calendly reste déconnecté dans `integration_settings` (19/10).

## Import Calendly
La synchronisation administrateur conserve les réservations même si SMTP échoue. Les nouvelles réservations futures confirmées créent une notification interne liée à `booking_id` et journalisée. Une synchronisation répétée ne doit pas renvoyer les notifications réussies. Les anciennes réservations et clics WhatsApp ne sont pas transformés en réservations confirmées ni notifiés abusivement. La synchronisation nécessite toujours un jeton Calendly autorisé ; la connexion était `disconnected` lors du diagnostic.

## Relance CRM sécurisée
Les nouvelles tentatives du formulaire partenaire peuvent enregistrer `lead_id` si le backend confirme l'identité du lead (nom et email cohérents) ; le navigateur ne peut pas lier arbitrairement un autre client. Dans Admin > Emails, un compte admin/owner peut relancer **une notification interne échouée** liée à un lead ou à une réservation, avec une limite de trois relances et un verrou de statut côté SQL. Une relance n'est jamais assimilée à une délivrance réelle. Les accusés clients ne sont jamais renvoyés par cette interface ; les anciens journaux sans référence CRM ne peuvent pas être reconstitués de façon sûre.
