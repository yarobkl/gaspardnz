# Intégration contact et CRM — 16 octobre 2026

Branche : `feat/secure-contact-crm-20261016`. PR : https://github.com/yarobkl/gaspardnz/pull/24.

## Comportement

Le formulaire conserve deux étapes et les animations existantes. Il propose les prestations, « Autre », un besoin facultatif, tous les pays téléphoniques pris en charge (245), France +33 par défaut, et une information sur l’enregistrement. La validation produit un téléphone international E.164.

Les boutons WhatsApp et calendrier attendent une réponse positive du serveur avant de naviguer. Une erreur garde la saisie et propose de réessayer. La requête conserve son UUID pendant les nouvelles tentatives. La transaction SQL sérialise les requêtes concurrentes, réutilise le prospect correspondant pendant 24 heures et évite une seconde intention pour ce prospect/canal pendant cette fenêtre. Elle ne prétend jamais qu’un message WhatsApp a été envoyé.

Le calendrier, les URL de réservation et les réservations historiques ne sont pas modifiés. Les anciens clics restent des événements anonymes. Ils ne produisent plus automatiquement une ligne de réservation.

## Indicateurs

Les cartes commerciales, analytiques et CRM ouvrent les lignes qui composent leur compteur. Les lignes disposent du lien CRM lorsqu’un identifiant de prospect existe. Les dates des événements sont présentées à l’heure de Paris. Les statistiques commerciales excluent les cinq identifiants de test audités ; les fiches restent accessibles dans le CRM avec un badge.

- Intentions : clics historiques et nouvelles intentions enregistrées, sans présomption d’envoi.
- Prospects : personnes distinctes parmi les demandes créées dans la période, hors tests.
- Rendez-vous confirmés : uniquement les réservations au statut `confirmed`, créées dans la période.
- Clients acquis : fiches clients créées dans la période, hors tests.
- Conversion site : visiteurs suivis reliés à une demande créée pendant la période / visiteurs suivis distincts pendant cette période. Les visiteurs sans consentement analytique ne sont pas inclus dans cette mesure.
- Conversion commerciale : prospects de la période reliés à un client avant la fin de cette période / prospects de cette cohorte.
- Une base nulle donne « — », pas un taux inventé.
- La valeur des clients est leur valeur cumulée enregistrée, pas le chiffre d’affaires encaissé pendant la période.

Les bornes sont inclusives au début, exclusives à la fin. Les numérateurs et leurs listes détaillées sont calculés à partir des mêmes lignes. Les anciens RPC de reporting sont conservés pour compatibilité ; les cartes utilisent les nouveaux calculs.

## Sécurité et données

La migration est additive : `commercial_exclusions`, `contact_requests`, `contact_intents` et `save_contact_intent`. Aucun enregistrement historique n’est supprimé ou réécrit. Les nouvelles tables sont sous RLS ; seuls les comptes validés par `private.is_admin()` peuvent les consulter. La fonction d’enregistrement n’est exécutable que par `service_role`, avec `security invoker` et un `search_path` vide. Le navigateur ne reçoit aucune clé privilégiée ni identifiant de prospect.

L’API applique validation, contrôle d’origine, taille maximale et limitation de débit. Les liens analytiques sont privés de leur query string pour éviter d’y recopier des coordonnées. Le rollback retire le droit d’exécution de la fonction sans supprimer les nouvelles données.

## Vérifications et prérequis de publication

Les suites unitaires/API, le scénario SQL isolé de sécurité et déduplication, le build et le harness PostgreSQL existant ont passé sur les révisions intermédiaires. Les contrôles GitHub de la dernière révision font foi ; ne pas publier sur la seule base de ce document. Les tests navigateur couvrent les étapes du formulaire, la navigation mobile, le téléphone, l’échec d’enregistrement, le retry et le double clic. Le rendu desktop de l’aperçu a été comparé au site actuel ; les captures mobiles sont jointes aux artefacts GitHub.

Blocage vérifié sur l’aperçu : `SUPABASE_SERVICE_ROLE_KEY` manque dans l’environnement serveur. Le connecteur Vercel refuse la lecture des variables (403). Configurer cette variable côté serveur dans Vercel pour l’environnement Preview autorisé, et vérifier Production, sans jamais utiliser un préfixe `VITE_` ni placer la clé dans le dépôt ou la conversation. `SUPABASE_URL` peut être renseignée explicitement ; le code conserve l’URL du projet existant par défaut.

La migration `20261016052907_secure_contact_requests.sql` n’a pas été appliquée en production. La PR n’a pas été fusionnée. Avant publication : contrôles GitHub et Vercel verts, conformité des captures mobiles, configuration serveur vérifiée, migration appliquée et RLS contrôlée sur le projet réel. Ne pas fusionner tant que ces conditions ne sont pas réunies.
