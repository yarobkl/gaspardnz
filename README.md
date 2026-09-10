# GaspardNZ

Plateforme web et mobile de GaspardNZ, styliste et habilleur parisien. Le projet réunit le site public, la prise de contact et de rendez-vous, un espace d'administration métier, des intégrations Google/Calendly/email, un suivi analytics et un wrapper mobile Capacitor.

- Production : <https://gaspardnz.style>
- Dépôt : `yarobkl/gaspardnz`
- Branche de production : `main`
- Hébergement : Vercel
- Backend, authentification et données : Supabase

## Architecture

| Chemin | Responsabilité |
| --- | --- |
| `src/App.jsx` | Shell React, navigation publique et routage de l'administration |
| `src/components/` | Composants du site public, formulaires, cookies et interface utilisateur |
| `src/components/Admin/` | Dashboard, CRM, réservations, emails, contenus, médias, SEO et utilisateurs |
| `src/services/` | Accès Supabase, authentification, données admin, analytics et tracking |
| `api/` | Fonctions Vercel côté serveur : email, Google OAuth/GA4/GSC et Calendly |
| `scripts/` | Génération et validation des routes SEO, validation de la sécurité email |
| `public/` | Médias publics, manifeste, service worker, robots, sitemap et pages légales |
| `ios/` | Projet natif iOS généré et synchronisé avec Capacitor |
| `.github/workflows/` | Validation web et builds Android manuels |
| `vercel.json` | Build, rewrites, cache et en-têtes de sécurité Vercel |
| `capacitor.config.json` | Identité et configuration du wrapper mobile |

Le frontend est une application React/Vite. Les routes publiques sont rendues côté client, avec des fichiers HTML statiques générés pendant le build pour les principales URL SEO. Les opérations nécessitant un secret passent par `api/` ou par une Edge Function Supabase ; aucun secret serveur ne doit être importé dans `src/`.

## Prérequis

- Node.js 22 ou plus récent. Les workflows GitHub utilisent Node 22 et le projet Vercel est actuellement configuré avec Node 24.
- npm et un `package-lock.json` cohérent.
- Accès au projet Vercel `gaspardnz` pour les variables et les déploiements.
- Accès au projet Supabase `gaspardnz` pour les opérations backend.
- Pour le mobile : Xcode sur macOS pour iOS, ou Android Studio avec Java 21 pour Android.

## Installation locale

```bash
git clone https://github.com/yarobkl/gaspardnz.git
cd gaspardnz
npm ci
cp .env.example .env.local
npm run dev
```

Vite affiche ensuite l'URL locale. Ne lancez aucune migration ou synchronisation de données de production simplement pour démarrer le frontend.

Commandes utiles :

```bash
npm run dev
npm run build
npm run preview
npm run test:seo
npm run test:email-security
```

Le build exécute Vite puis `scripts/generate-static-seo-routes.mjs`. Le dossier `dist/` est généré et ne doit pas être commité.

## Variables d'environnement

Copier `.env.example` vers `.env.local` pour le développement. Les valeurs réelles sont stockées dans Vercel ou dans le gestionnaire de secrets de la plateforme concernée, jamais dans GitHub.

### Frontend Vite

| Variable | Usage | Obligatoire |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL publique du projet Supabase | Recommandée ; fallback public présent |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé Supabase publiable destinée au navigateur | Recommandée ; jamais une clé `service_role` |
| `VITE_LOOKBOOK_STRIPE_URL` | Lien Stripe hébergé pour l'achat du lookbook | Seulement si le paiement est activé |

Toute variable préfixée par `VITE_` est intégrée au bundle public. Elle ne doit donc contenir aucun secret.

### Fonctions serveur Vercel

| Variable | Usage | Obligatoire pour |
| --- | --- | --- |
| `SITE_URL` | Origine canonique du site | Production et redirections |
| `ALLOWED_ORIGINS` | Origines autorisées, séparées par des virgules | API email en production |
| `SUPABASE_URL` | URL du projet Supabase | APIs serveur |
| `SUPABASE_SERVICE_ROLE_KEY` | Accès serveur privilégié | APIs Google, Calendly et email |
| `GOOGLE_CLIENT_ID` | OAuth Google | Connexion GA4/GSC |
| `GOOGLE_CLIENT_SECRET` | Secret OAuth Google | Connexion GA4/GSC |
| `GOOGLE_REDIRECT_URI` | Callback OAuth enregistré chez Google | Connexion GA4/GSC |
| `CALENDLY_PERSONAL_ACCESS_TOKEN` | Lecture des événements et invités | Synchronisation Calendly |
| `EMAIL_FROM` | Expéditeur SMTP | Envoi d'emails |
| `EMAIL_PASSWORD` | Mot de passe ou clé SMTP | Envoi d'emails |
| `SMTP_HOST` | Hôte SMTP | Envoi d'emails |
| `SMTP_PORT` | Port SMTP | Envoi d'emails |
| `SMTP_SECURE` | Active TLS implicite selon le port | Envoi d'emails |
| `ALLOWED_EMAIL_RECIPIENTS` | Allowlist des destinataires | Envoi d'emails |
| `EMAIL_TO` | Destinataire historique de secours | Optionnel |

Après toute modification de variables Vercel, créer une nouvelle preview et vérifier les fonctions concernées. Ne copier aucune valeur sensible dans un ticket, un log, une capture d'écran ou un fichier Markdown.

## Supabase

Supabase fournit :

- l'authentification de l'administration ;
- la table d'autorisation `admin_access` ;
- les contenus, médias, packages, promotions, partenaires et données VIP ;
- les leads, clients, réservations, notes CRM et emails ;
- les événements analytics et sessions ;
- les paramètres et identifiants d'intégration chiffrés/privés ;
- les journaux d'activité et d'audit ;
- le rate limiting public ;
- les Edge Functions `public-event` et `admin-temp-password-reset`.

Toutes les tables exposées dans le schéma `public` doivent conserver RLS activée. Les permissions sensibles doivent être validées par les politiques RLS, une fonction serveur ou une Edge Function ; masquer un bouton React n'est jamais une autorisation.

Le dépôt ne contient actuellement pas de dossier local `supabase/migrations`. Avant toute évolution de schéma :

1. vérifier l'identité du projet distant ;
2. récupérer ou reconstruire l'historique de migrations dans une branche dédiée ;
3. examiner les policies, fonctions et triggers ;
4. exécuter les advisors sécurité et performance ;
5. appliquer une migration additive et réversible ;
6. tester avec les rôles `anon`, `authenticated`, `viewer`, `editor`, `admin` et `owner` selon le cas.

Ne jamais exécuter de suppression ou de réinitialisation sur la base de production depuis un poste local.

## Administration

L'entrée de l'administration est `/admin`. Les modules présents couvrent notamment le dashboard, l'analytics, le CRM, les réservations, les emails, le contenu, les textes, les médias, les albums, les promotions, le style du mois, les clients VIP, Wedding Inspiration, les utilisateurs et les paramètres.

Le modèle d'accès attendu est :

1. session Supabase réelle ;
2. utilisateur authentifié ;
3. entrée active dans `admin_access` ;
4. rôle autorisé ;
5. contrôle RLS ou serveur sur chaque opération.

Le profil mémorisé dans le navigateur peut accélérer l'affichage, mais ne doit jamais servir de preuve d'authentification. Après un changement d'accès, tester au minimum la connexion, le rafraîchissement, l'expiration de session, la déconnexion et la réinitialisation du mot de passe.

## Vercel

Le projet Vercel détecte Vite, exécute `npm run build` et publie `dist/`. `vercel.json` contient les rewrites SPA, les règles de cache et les en-têtes de sécurité.

L'intégration GitHub crée normalement :

- une preview pour chaque branche ou pull request ;
- un déploiement de production après intégration dans `main`.

Toujours vérifier que le SHA affiché par Vercel est celui du commit attendu et que `gitDirty` est absent. Un déploiement manuel depuis un répertoire modifié n'est pas une source de production reproductible.

## GitHub Actions

Les workflows sont répartis ainsi :

- `validate.yml` : installation déterministe, build et validations web ;
- `android-build.yml` : APK debug et AAB non signé, déclenchés manuellement ;
- `android-release-signed.yml` : AAB signé depuis des secrets GitHub, déclenché manuellement ;
- `deploy.yml` : point d'entrée manuel informatif ;
- `vercel-deploy.yml` : solution manuelle de secours, l'intégration Git Vercel restant le chemin normal.

Une CI de validation ne doit jamais modifier ni pousser `package-lock.json`. Toute mise à jour de dépendance et de lockfile doit être réalisée et vérifiée dans une branche dédiée.

## Capacitor

L'application utilise l'identifiant `com.gaspardnz.app` et le dossier web `dist`.

```bash
npm ci
npm run build:app
npm run cap:sync
```

Commandes ciblées :

```bash
npm run cap:sync:ios
npm run cap:open:ios
npm run cap:sync:android
npm run cap:open:android
```

La génération Android peut aussi être lancée depuis GitHub Actions. Les APK, AAB, archives Xcode, keystores et profils de signature sont des artefacts de release ; ils ne doivent pas être versionnés avec le code ni exposés dans les logs.

## Sécurité et confidentialité

- Ne jamais placer de clé `service_role`, mot de passe SMTP, secret OAuth, token Calendly, token Vercel ou keystore dans le frontend ou Git.
- Conserver une allowlist stricte pour les destinataires email et les origines CORS.
- Valider et assainir toutes les entrées publiques côté serveur.
- Appliquer un rate limit persistant aux APIs publiques ; la mémoire d'une fonction serverless n'est pas une protection suffisante.
- Ne déclencher GA4, le tracking Supabase ou tout marketing non essentiel qu'après le consentement correspondant.
- Journaliser les actions administratives sensibles côté base ou serveur.
- Garder RLS activée et tester les refus d'accès, pas seulement les scénarios autorisés.
- Révoquer et remplacer immédiatement tout secret découvert dans un historique ou un log.

## Procédure de validation et de déploiement

Créer une branche à partir d'un `main` à jour :

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b type/description-courte
npm ci
npm run build
npm run test:seo
npm run test:email-security
```

Puis :

1. commiter une correction cohérente ;
2. pousser la branche et attendre une preview Vercel `READY` ;
3. tester les routes concernées sur desktop et mobile ;
4. contrôler les erreurs de build et de runtime ;
5. ouvrir une pull request ;
6. fusionner seulement après validations vertes ;
7. confirmer le SHA, le domaine et les parcours critiques en production.

Pour une modification Supabase, appliquer d'abord une migration additive compatible avec l'ancienne version du frontend. Déployer ensuite le code. Les migrations destructives nécessitent un plan de sauvegarde, de restauration et une validation humaine explicite.

## Rollback

### Incident frontend ou fonctions Vercel

1. Identifier le dernier déploiement sain et son SHA.
2. Réattribuer temporairement le domaine à ce déploiement depuis Vercel ou avec `vercel rollback <deployment>`.
3. Créer un `git revert` du commit défectueux sur `main` au lieu de réécrire l'historique.
4. Attendre le nouveau déploiement reproductible et retester les parcours critiques.
5. Documenter l'incident et la cause racine.

### Incident Supabase

1. Stopper le déploiement applicatif concerné.
2. Désactiver uniquement le chemin fautif si un feature flag sûr existe.
3. Restaurer avec une migration corrective préparée et testée ; ne jamais lancer de reset de production.
4. Vérifier l'intégrité des données, RLS, fonctions, Storage et authentification.

## Suivi du durcissement

Le checkpoint opérationnel et la prochaine action exacte sont consignés dans `WORK_PROGRESS.md`. Le rapport final sera publié dans `FINAL_HARDENING_REPORT.md` une fois toutes les phases réellement testées.
