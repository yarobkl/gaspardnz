# CLAUDE HEAVY HARDENING — PROGRESS

Suivi des **phases lourdes** du durcissement GaspardNZ, pilotées par Claude Code.
Ce fichier **ne remplace pas** `WORK_PROGRESS.md` (source de vérité du chantier, tenue par Work).

---

## Checkpoint de démarrage

| Élément | Valeur |
|---|---|
| Date/heure (UTC) | 2026-09-10 20:05 |
| Branche Claude | `claude/heavy-hardening-2026-09` |
| SHA de base (HEAD Work) | `2e1d0de` — `fix(privacy): enforce consent before analytics` |
| Branche Work suivie | `origin/hardening/gaspardnz-2026-09` |
| `origin/main` au démarrage | `9ef4c27` — `feat(admin): manage Stripe payment link` |
| Écart Work → main | 7 commits d'avance, 0 de retard |
| Version de `WORK_PROGRESS.md` lue | Celle du commit `2e1d0de` (checkpoint Work daté 2026-09-10 18:20:09 UTC) |
| Working tree au démarrage | Propre |

### État du chantier Work (lu dans WORK_PROGRESS.md)

- **Terminées** : phases 0, 1, 2, 3, 4
- **En cours** : phase 5 (RGPD / consentement) — correctif implémenté et validé localement, vérifications navigateur restantes
- **Restantes côté Work** : phases 6 (SEO), 7 (emails/anti-bot), 8 (réconciliation Vercel), 15 (nettoyage), rapport final

### Contrainte de séquencement retenue

`WORK_PROGRESS.md` indique que la **phase 8 (réconciliation GitHub / main / déploiement Vercel sale) n'est pas faite**.
Conformément à la mission, les phases 9+ sont donc traitées en **mode préparation** :

- analyse, cartographie, tests et migrations **locales** autorisées ;
- **aucune** modification de production ;
- **aucune** réconciliation Vercel entreprise de mon côté ;
- **aucun** push sur `main` ni sur la branche Work.

---

## Baseline technique (exécutée avant toute modification)

| Contrôle | Résultat |
|---|---|
| `npm ci` | ✅ Réussi (depuis lockfile) |
| `npm run build` | ✅ Réussi — build Vite + 9 routes SEO statiques générées |
| `npm run test:seo` | ✅ PASS |
| `npm run test:email-security` | ✅ PASS |
| `npm run test:video-accessibility` | ✅ PASS |
| `npm run test:consent` | ✅ PASS |
| `git diff --check` | ✅ Propre |
| Working tree | ✅ Propre |

**Conclusion baseline : aucune erreur préexistante.** Toute régression détectée par la suite sera donc imputable à mes changements.

**Constat** : il n'existe **aucun framework de tests** (ni Vitest, ni React Testing Library, ni Playwright). Les 4 scripts `test:*` sont des validateurs Node maison. C'est l'objet de la phase 13.

---

## Journal des phases

### Phase A — Synchronisation avec Work
- **Statut** : ✅ TERMINÉ
- Branche `claude/heavy-hardening-2026-09` créée depuis le HEAD réel de Work (`2e1d0de`), pas depuis un SHA figé.
- Aucun commit Work modifié, aucun force-push, `WORK_PROGRESS.md` intact.

### Phase 9 — Authentification admin
- **Statut** : ✅ CORRECTIF IMPLÉMENTÉ ET VÉRIFIÉ (revue Work requise avant intégration)

#### Vulnérabilité confirmée (reproduite en navigateur, pas seulement lue)

`App.jsx` déterminait l'état « admin connecté » à partir d'un profil stocké dans
`localStorage` (`gnz-admin-profile`), donc **entièrement modifiable par le visiteur**.

Reproduction avant correctif, sur build de production :

| Scénario | Résultat observé avant correctif |
|---|---|
| D — `gnz-admin-profile` forgé, **aucune** session Supabase | Interface admin rendue, rôle affiché `owner`, nom `ATTAQUANT` |
| C — session Supabase expirée + profil en cache | Interface admin rendue |

`refreshSession()` et `onAuthStateChange()` existaient déjà mais **n'étaient
appelés nulle part** : ni détection d'expiration, ni propagation d'une
déconnexion faite dans un autre onglet.

#### Correctif

1. **Suppression totale de la persistance du profil.** Le profil admin n'est plus
   jamais écrit dans `localStorage` : il n'existe donc plus d'artefact falsifiable.
   `initAdminUsers()` purge l'ancienne clé laissée par les versions précédentes
   sur les navigateurs déjà venus sur le site.
2. **Autorité unique** : `refreshSession()` = session Supabase vérifiée **puis**
   relecture de `admin_access` avec `active = true`. Un compte Supabase valide
   mais absent de `admin_access` est déconnecté.
3. **Vérification réellement branchée** : `App.jsx` appelle `refreshSession()` au
   montage et s'abonne à `onAuthStateChange` (expiration, refresh de jeton,
   déconnexion dans un autre onglet).
4. **Aucun flash d'interface** : `adminAuthChecking` démarre à `true` ; rien
   n'est rendu tant que la vérification n'a pas répondu.
5. **Garde anti-régression sur la récupération de mot de passe** : avec
   `detectSessionInUrl: true`, un lien de reset ouvre une **vraie** session
   Supabase. Sans garde, le correctif aurait remplacé le formulaire de nouveau
   mot de passe par l'interface admin et cassé la récupération. L'état du flux
   est figé une seule fois par chargement de page (`recoveryFlowRef`).

#### Fichiers modifiés

| Fichier | Nature |
|---|---|
| `src/services/adminAuth.js` | Suppression du cache de profil, purge de l'ancienne clé, `refreshSession` seule autorité |
| `src/App.jsx` | Gating asynchrone vérifié + garde récupération + garde anti-flash |
| `src/components/Admin/AdminSettings.jsx` | Lit le profil vérifié au lieu du cache |
| `src/services/supabaseClient.js` | `import.meta.env?.` — rend le module importable hors Vite, pour les tests |
| `package.json` | Ajout de `npm run test:admin-auth` |
| `scripts/validate-admin-auth.mjs` | **Nouveau** — invariants statiques + comportement |
| `scripts/browser-checks/` | **Nouveau** — scénarios navigateur rejouables + README |

Migrations : aucune. Aucune donnée de production touchée, aucun réglage projet
Supabase modifié.

#### Vérifications exécutées

| Contrôle | Résultat |
|---|---|
| `npm run build` | ✅ Réussi — 9 routes SEO générées |
| `npm run test:seo` / `test:email-security` / `test:video-accessibility` / `test:consent` | ✅ 4/4 PASS (aucune régression) |
| `npm run test:admin-auth` | ✅ PASS (nouveau) |
| Scénarios auth en navigateur (A, C, D) | ✅ 3/3 conformes — accès refusé dans tous les cas |
| Scénarios récupération / non-régression (J, J2, L, PUB) | ✅ 4/4 conformes — 0 erreur JS |
| Purge de l'ancien cache (`/` et `/admin`) | ✅ 2/2 — clé supprimée au chargement |

**Le test a été validé par mutation** : cinq régressions ont été réintroduites une
à une dans le code corrigé, `test:admin-auth` les a **toutes** détectées
(5/5), puis l'état corrigé repasse au vert. Le test n'est donc pas un test
complaisant.

#### Réserves explicites

- Les scénarios exigeant un **vrai compte Supabase** ne sont pas couverts : B
  (session valide), E (compte Supabase hors `admin_access`), F
  (`admin_access.active = false`), G (déconnexion), K (lien de récupération
  expiré). Ils demandent des identifiants de test que je n'ai pas ; la logique
  correspondante est en revanche couverte par les invariants statiques.
- L'autorisation reste ici **binaire** (admin ou non). La granularité par rôle
  et son application côté serveur relèvent de la **phase 10 (RBAC/RLS)** : tant
  que les politiques RLS ne distinguent pas les rôles, `hasPermission()` n'est
  qu'un contrôle d'affichage.
- Conformément à la mission, je ne déclare pas ce travail « prêt pour la
  production » : il attend la revue de Work et la stabilisation de la phase 8.

### Phase 10 — RBAC / rôles / RLS
- **Statut** : 🔄 CORRECTIF INTERFACE LIVRÉ — migrations prêtes et testées localement, **non appliquées**

#### Contrainte d'accès

Ce conteneur n'a **aucun accès** à la base Supabase : pas de CLI `supabase`, pas
de credentials, pas de serveur MCP Supabase, et le dépôt ne contenait **aucune
migration locale**. Je n'ai donc pas pu relire les politiques RLS réelles.
Conformément à la mission, la phase 10 est livrée en **mode préparation** :
migrations écrites, testées **localement**, non appliquées.

#### Constat vérifié dans le code

Le modèle de rôles existe (`owner` / `admin` / `editor` / `viewer` dans
`admin_access`, fonction `hasPermission()` dans `adminAuth.js`) mais **il n'est
appliqué nulle part** :

- `hasPermission()` est exporté et **n'est appelé par aucun composant** ;
- `AdminLayout.jsx` construit sa navigation depuis un `NAV_GROUPS` **statique** :
  tout compte authentifié voit toutes les sections, y compris « Utilisateurs » ;
- `AdminUsers.jsx` laisse choisir le rôle dans un `<select>` et appelle
  `createUser()` → `INSERT` direct dans `admin_access` avec la clé publishable ;
- la règle « le dernier propriétaire ne peut pas être désactivé » n'existe que
  dans le navigateur : un appel REST direct la contourne.

**Conséquence** : la seule barrière possible est RLS. Si les politiques ne
distinguent pas les rôles, un compte `viewer` peut s'octroyer `owner`.

#### Démonstration (exécutée, pas supposée)

Sur une base PostgreSQL locale reproduisant l'hypothèse la plus probable — une
politique permissive unique « est-ce un admin ? » — **avant** migration :

```
AVANT : un viewer a pu écrire dans leads
AVANT : un viewer a pu créer un compte OWNER (élévation de privilège)
```

#### Correctif préparé

Trois migrations **additives, idempotentes et réversibles** dans
`supabase/migrations/` :

| Migration | Contenu |
|---|---|
| `20260910120000_rbac_role_functions.sql` | `private.admin_role_rank()`, `private.current_admin_role()`, `private.has_admin_role()` |
| `20260910120100_rbac_restrictive_policies.sql` | Politiques **RESTRICTIVES** par table et par opération |
| `20260910120200_admin_access_integrity.sql` | Rôle contraint au modèle, dernier propriétaire protégé, email normalisé |

Rollback correspondant dans `supabase/rollback/`.

**Choix de conception : politiques `RESTRICTIVE`, pas `PERMISSIVE`.** Les
politiques permissives se combinent en **OU** — en ajouter une ne restreint
rien. Les restrictives se combinent en **ET**. Le correctif resserre donc
l'accès **sans supprimer ni même connaître** les politiques existantes. C'est ce
qui le rend applicable sans risque de destruction et retirable sans trace.

#### Matrice de droits appliquée

| Table | Lecture | Écriture |
|---|---|---|
| `leads`, `bookings`, `crm_notes` | viewer | editor |
| `site_content` | viewer | editor |
| `site_settings` | viewer | admin |
| `activity_log` | admin | owner |
| `admin_access` | admin | **owner** |

Le rôle `anon` n'est visé par aucune de ces politiques : la lecture publique du
site vitrine est inchangée (vérifié).

#### Vérifications exécutées (PostgreSQL 16 local)

`sudo -u postgres bash scripts/rls-harness/run.sh`

| Contrôle | Résultat |
|---|---|
| Faille reproduite sur la baseline (viewer → owner) | ✅ Reproduite |
| Application des 3 migrations | ✅ Sans erreur |
| Idempotence (seconde application) | ✅ Rejouables |
| Matrice de droits, 5 rôles × 6 tables × SELECT/INSERT/UPDATE/DELETE | ✅ Toutes conformes |
| Compte désactivé (`active = false`) | ✅ Aucun droit |
| Élévation viewer/editor/admin → owner | ✅ Refusée |
| Écriture client dans `activity_log` | ✅ Refusée (prépare la phase 11) |
| Lecture publique `anon` du site vitrine | ✅ Préservée |
| Dernier propriétaire actif | ✅ Désactivation refusée côté serveur |
| Rôle inconnu (`superadmin`) | ✅ Refusé |
| Normalisation de l'email | ✅ `  MiXeD@Test.Local  ` → `mixed@test.local` |
| Rollback complet | ✅ 0 politique `rbac_*` restante |

**Un bug de ma migration a été trouvé par ce harnais** : `authenticated` recevait
`EXECUTE` sur les fonctions mais pas `USAGE` sur le schéma `private`. Toutes les
vérifications de rôle échouaient, ce qui aurait rendu l'administration
**totalement inaccessible** en production. Corrigé, retesté.

#### Application côté interface (défense en profondeur)

Le modèle de rôles est désormais aussi appliqué dans l'interface — **sans jamais
être présenté comme la sécurité** : masquer un écran n'empêche pas d'appeler
l'API, seule la base refuse.

- chaque entrée de `NAV_GROUPS` déclare un rôle minimal (`min`) ;
- la navigation rendue est la version filtrée par `hasPermission()` ;
- une section atteinte **par URL directe** hors du rôle affiche un refus et ne
  monte aucun module.

`hasPermission()` était exporté mais appelé nulle part : il est enfin branché.

| Section | Rôle minimal |
|---|---|
| Tableau de bord, Analytics, CRM, Réservations, Emails | viewer |
| SEO, Contenu, Textes, Médias, Galerie, Promotions, Style, VIP, Wedding | editor |
| Paramètres | admin |
| Utilisateurs | owner |

Vérifié **dans un vrai navigateur**, réponses Supabase simulées (8/8) :

| Contrôle | Résultat |
|---|---|
| Navigation vue par owner / admin / editor / viewer | ✅ 16 / 15 / 14 / 5 entrées, aucune fuite |
| `/admin/users` en URL directe — viewer, editor, admin | ✅ Refus affiché, module non monté |
| `/admin/users` — owner | ✅ Module rendu, aucun refus |

Ce test couvre au passage le **scénario B de la phase 9** (session valide →
interface admin rendue), qui restait non exercé.

Nouveau test statique `npm run test:rbac`, lui aussi **validé par mutation** :
six régressions réintroduites, six détectées (rôle minimal retiré, navigation
non filtrée, module rendu malgré le refus, politique repassée en permissive,
lecture de sa propre ligne supprimée, `DROP TABLE` ajouté dans une migration).

#### Un second défaut trouvé par les tests

La première version de la migration exigeait le rôle `admin` pour **toute**
lecture de `admin_access`. Or `getAccessProfile()` lit cette table pour établir
le profil **au moment de la connexion** : les rôles `viewer` et `editor`
n'auraient plus pu se connecter du tout. Corrigé — chaque compte peut lire sa
propre ligne, la liste complète reste réservée à `admin` et plus — puis
retesté (`select propre ligne` → OK, `select ligne d'autrui` → DENY).

#### Réserves explicites

- **Le harnais ne prouve rien sur la production.**
  `scripts/rls-harness/02-baseline-policies.sql` est une **hypothèse** de départ.
  Avant toute application, exécuter
  `scripts/rls-harness/inspect-production-policies.sql` (lecture seule) dans le
  SQL Editor Supabase et comparer.
- Si la production comporte des politiques permissives **plus larges** que
  l'hypothèse, les restrictives les couvrent quand même — c'est leur intérêt. Si
  elle en comporte de **plus strictes**, la migration pourrait retirer des droits
  à des comptes légitimes : d'où la vérification préalable obligatoire.
- Version : tests sur PostgreSQL 16, production en 17. Sémantique RLS identique.
- `activity_log` est volontairement fermé en écriture côté client, ce qui
  **cassera** l'appel `INSERT` présent dans `adminData.js`. C'est intentionnel :
  un journal d'audit écrit par le client est falsifiable. Le remplacement par une
  écriture serveur est l'objet de la **phase 11**, qui doit donc être livrée
  **avec** cette migration, pas après.

### Phase 11 — Journal d'audit serveur
- **Statut** : 🔄 MIGRATION PRÊTE ET TESTÉE LOCALEMENT — non appliquée

#### Constat vérifié

`activity_log` n'était alimenté que par **deux** appels depuis le navigateur
(`adminData.js`), et **aucun des deux ne renseignait `actor_email`** : le journal
ne disait pas qui avait agi. Son contenu étant entièrement choisi par le client,
il était falsifiable — donc sans valeur de preuve. Les opérations réellement
sensibles (réservations, paramètres, médias, **attributions d'accès**,
suppressions) n'y laissaient **aucune trace**.

#### Correctif préparé

`supabase/migrations/20260910120300_audit_log_server_side.sql` :

- trigger générique `private.audit_row_change()` en `SECURITY DEFINER`, posé sur
  `leads`, `bookings`, `promotions`, `site_settings`, `site_content`,
  `admin_access`, `media_assets`, `content_albums`, `crm_notes` ;
- **l'acteur est lu dans le JWT** (`auth.email()`), jamais dans la requête :
  il ne peut donc pas être usurpé ;
- **journal en ajout seul** : un trigger refuse `UPDATE` et `DELETE` sur
  `activity_log`, y compris au propriétaire. Une trace réécrivable ne prouve rien ;
- **écriture cliente fermée** par politiques restrictives `false` — seul le
  trigger écrit, ce qui est possible parce qu'il est `SECURITY DEFINER` ;
- **aucun secret journalisé** : les valeurs ne sont jamais copiées. Une liste
  blanche fournit un libellé lisible, et une modification journalise les **noms**
  des champs changés, jamais leurs valeurs. Un filtre reconnaît en plus les
  colonnes sensibles (mot de passe, jeton, clé d'API, empreinte, signature, SMTP).

Côté client, les deux `INSERT` dans `activity_log` sont retirés d'`adminData.js`
(la lecture par le tableau de bord est conservée).

#### Vérifications exécutées (PostgreSQL 16 local)

| Contrôle | Résultat |
|---|---|
| Une écriture métier produit une trace attribuée au bon acteur | ✅ `leads_insert` / `editor@test.local` |
| Usurpation d'acteur | ✅ Impossible (acteur pris dans le JWT) |
| Écriture directe du journal par le client, propriétaire inclus | ✅ Refusée |
| Réécriture / suppression d'une trace | ✅ Refusées (ajout seul) |
| Secret présent dans une colonne (`smtp_password`) | ✅ Non journalisé |
| Reconnaissance des colonnes sensibles | ✅ mot de passe, jeton, clé d'API, empreinte |
| Modification : champs journalisés, valeurs exclues | ✅ `champs : status`, sans la valeur |
| Mise à jour sans changement réel | ✅ Aucune trace parasite |
| Suppression et attribution d'accès | ✅ Tracées |
| Rollback | ✅ Triggers retirés, **traces conservées** |

Nouveau test statique `npm run test:audit`, **validé par mutation** : sept
régressions réintroduites, sept détectées (écriture cliente réintroduite, acteur
repris du client, `token` retiré du filtre, protection ajout-seul supprimée,
insertion cliente rouverte, `SECURITY DEFINER` retiré, `search_path` non fixé).

Les deux dernières n'étaient **pas** détectées par ma première version du test,
qui cherchait `security definer` n'importe où dans le fichier : l'assertion a été
resserrée sur la fonction concernée.

#### Réserve

Même réserve que la phase 10 : testé contre une baseline reconstruite, **pas**
contre la production. Le schéma réel d'`activity_log` doit être confirmé avant
application — la migration suppose les colonnes `event_type`, `entity_type`,
`entity_id`, `title`, `description`, `actor_email`, telles que lues par
`adminData.js`.

### Phase 12 — CRM unifié
- **Statut** : 🔄 VUES PRÊTES ET TESTÉES LOCALEMENT — non appliquées, interface non branchée

#### Cartographie réelle (déduite du code, faute d'accès à la base)

| Table | Rôle réel | Rattachement |
|---|---|---|
| `leads` | Demandes venues du formulaire | — |
| `bookings` | Réservations | `bookings.lead_id` → `leads.id` (FK réelle, déjà jointe dans `adminData.js`) |
| `crm_notes` | Notes internes | `crm_notes.lead_id` → `leads.id` |
| `email_messages` | Emails envoyés | **aucun rattachement** — seulement une adresse `recipient` |
| `vip_clients` | **Pas du CRM** | Contenus de vitrine (`album`, `photo_url`, `sort_order`) : des visuels, pas des clients |
| `visitors` | Statistiques de fréquentation | Anonyme |

**Le point de rupture** : `email_messages` n'est relié à rien. Un même contact
existe donc en plusieurs exemplaires — plusieurs `leads` pour la même adresse,
des emails orphelins — et l'écran CRM n'affiche aujourd'hui que `leads`.

#### Choix : unifier par des VUES, pas par une migration de données

Une fusion de lignes exigerait de décider quels doublons écraser — une décision
irréversible, prise sans accès aux données réelles et sans arbitrage métier.
Deux vues en **lecture seule** font le rapprochement sur l'email normalisé :

- `crm_contacts` — un contact par adresse, avec nom et téléphone les plus
  récemment renseignés, statut courant et compteurs (demandes, réservations,
  notes, emails) ;
- `crm_timeline` — historique unifié des quatre sources.

Aucune ligne n'est déplacée, fusionnée ni supprimée. Si le regroupement se
révèle imparfait, rien n'est perdu et le rollback est un `drop view`.

#### Le piège évité

Une vue PostgreSQL s'exécute **par défaut avec les droits de son propriétaire**
et **contourne les politiques RLS** des tables sous-jacentes. Livrée ainsi, une
vue CRM aurait été une porte dérobée exposant tout le fichier client à n'importe
quel compte. Les deux vues déclarent donc `security_invoker = true`.

**Contre-preuve exécutée** : la même requête dans une vue sans cette option laisse
un compte désactivé voir 4 contacts ; avec l'option, il en voit 0.

#### Vérifications exécutées (PostgreSQL 16 local)

| Contrôle | Résultat |
|---|---|
| Regroupement malgré casse et doublons (`Claire.Martin@` / `claire.martin@`) | ✅ 1 contact, 2 demandes |
| Nom et statut les plus récents retenus | ✅ « Claire M. », `qualifie` |
| Téléphone présent uniquement sur l'ancienne fiche | ✅ Conservé |
| Historique unifié des 4 sources | ✅ 5 évènements (`booking, email, lead, note`) |
| Réservation sans email propre | ✅ Rattachée via `lead_id` |
| Compte désactivé | ✅ 0 contact visible |
| Viewer légitime | ✅ Contacts visibles |
| Écriture dans une vue | ✅ Refusée (lecture seule) |
| Contre-preuve `security_invoker` | ✅ Sans l'option : fuite confirmée |
| Tables sources après coup | ✅ Intactes |
| Rollback | ✅ Propre |

**Un bug de rollback trouvé par le harnais** : `email_messages`, ajouté à la
migration RLS, manquait dans son rollback, qui échouait sur une dépendance. Le
rollback **déduit désormais la liste du catalogue** au lieu de la recopier —
une liste recopiée finit toujours par diverger.

#### Ce qui n'est pas fait, et pourquoi

L'écran `AdminCRM` **n'est pas branché** sur ces vues. Le brancher maintenant
ferait échouer l'interface en production, puisque les vues n'y existent pas
encore. Le branchement doit suivre l'application de la migration, pas la
précéder.

Question métier laissée ouverte : le rapprochement se fait sur l'email. Un même
client avec deux adresses restera vu comme deux contacts. Résoudre cela suppose
un identifiant client stable — décision qui ne se déduit pas du projet.

### Phase 13 — Tests automatisés
- **Statut** : ✅ HARNAIS EN PLACE ET VERT

#### Point de départ

Aucun framework de tests. Les quatre `test:*` existants étaient des validateurs
Node maison. Surtout : `validate.yml` appelait `npm test --if-present` alors
qu'**aucun script `test` n'existait** — l'étape « Run unit tests » de la CI ne
faisait donc rien, en silence, depuis le début.

#### Mis en place

| Outil | Usage |
|---|---|
| Vitest 3 + jsdom | tests unitaires et de composants |
| Testing Library (React + user-event + jest-dom) | rendu et interrogation par rôle accessible |
| Playwright-core | vérifications navigateur, désormais exécutables |

- `vitest.config.js`, `tests/setup.js` (nettoyage entre tests, shims
  `IntersectionObserver` / `matchMedia`, et **`console.error` transformé en
  échec** pour qu'un avertissement React ne se perde pas dans la sortie) ;
- `tests/unit/adminAuth.test.js` — **36 tests** : matrice complète des rôles
  (4 × 4), rôles non reconnus, refus sans session, refus hors `admin_access`,
  refus si la lecture échoue, non-persistance du profil, normalisation de
  l'email, purge de l'ancien cache ;
- `tests/component/AdminLayout.test.jsx` — **10 tests** : navigation filtrée par
  rôle, rôle absent ou inconnu ne donnant accès à rien, monotonie des droits
  (un rôle élevé voit au moins autant qu'un rôle bas), refus des accès par URL
  directe ;
- `scripts/browser-checks/run-all.mjs` — démarre la preview, exécute les
  quatre scripts, arrête la preview ;
- `npm test` enchaîne désormais Vitest **et** les huit validateurs statiques.

#### Ce qui a été corrigé au passage

- **JSX non transformé** : les tests échouaient sur « React is not defined ».
  Le plugin React ne s'appliquait pas aux fichiers de test ; réglé par
  `esbuild: { jsx: "automatic" }` dans `vitest.config.js`.
- **Vérifications navigateur très lentes** : chaque chargement attendait des
  polices et scripts externes injoignables depuis le conteneur. Les pages sont
  désormais isolées du réseau (`_helpers.mjs`), la suite passe de plusieurs
  minutes à quelques secondes.

#### Résultats

| Suite | Résultat |
|---|---|
| `npm test` (Vitest + 8 validateurs) | ✅ **46 tests + 8 validateurs**, en ~4 s |
| `npm run test:e2e` (4 scripts navigateur) | ✅ **17 vérifications conformes** |

### Phase 14 — Capacitor / mobile
- **Statut** : ✅ DURCISSEMENT LIVRÉ ET TESTÉ

Aucune publication sur les stores, aucun changement d'`appId` : l'application
est déjà publiée, changer son identifiant la déréférencerait.

#### Corrigé

| Point | Avant | Après |
|---|---|---|
| Contenu distant (`server.url`) | non défini (implicite) | absent **et vérifié par un test** |
| Schéma Android | implicite | `https` explicite |
| Trafic en clair | implicite | `cleartext: false` |
| Contenu mixte | implicite | `allowMixedContent: false` |
| Débogage distant de la WebView | implicite | `webContentsDebuggingEnabled: false` |
| Keystore / provisioning dans git | **aucune règle d'exclusion** | `*.jks`, `*.keystore`, `*.p12`, `*.mobileprovision`, `key.properties`, `google-services.json`, `GoogleService-Info.plist` |

Les valeurs implicites correspondaient déjà aux bons défauts de Capacitor 8 ;
les rendre explicites protège d'un changement de défaut à la prochaine montée de
version, et un test échoue désormais si quelqu'un les inverse.

L'absence de règle d'exclusion pour le keystore était le point le plus lourd :
c'est le secret dont la fuite permet de publier des mises à jour sous l'identité
de l'application. Aucun fichier de ce type n'était versionné — rien à révoquer —
mais rien n'empêchait de le faire.

#### Vérifications

`tests/unit/mobile.test.js` (16 tests) et `tests/bundle/no-secrets.test.js`
(6 tests) :

| Contrôle | Résultat |
|---|---|
| `server.url` absent, `webDir = dist` | ✅ |
| Schéma HTTPS, pas de clair, pas de contenu mixte | ✅ |
| Débogage WebView désactivé | ✅ |
| `appId` publié inchangé | ✅ |
| Motifs de signature ignorés par git | ✅ 5/5 |
| Aucun fichier de signature suivi par git | ✅ |
| Aucune `VITE_*` exposant un secret serveur | ✅ 4/4 |
| **Bundle construit** : aucune clé secrète, aucun jeton `service_role`, aucun mot de passe SMTP, aucune clé privée | ✅ |
| Bundle : clé publishable présente (seule clé légitime) | ✅ |

**Mutations vérifiées** : `server.url` pointant vers une machine de
développement → détecté ; débogage WebView réactivé → détecté ; clé secrète
plantée dans le bundle → détectée ; clé privée plantée → détectée.

**Faux positif corrigé** : ma première version du scanner signalait `sb_secret_`
dans le bundle. Vérification faite **sans afficher la valeur** : il s'agissait de
`startsWith("sb_secret_")`, du code de `@supabase/supabase-js` qui reconnaît le
type d'une clé. Aucun secret n'est embarqué. Les motifs cherchent désormais une
**clé** (préfixe suivi d'au moins 10 caractères), pas une mention — un scanner
qui crie au loup finit ignoré.

#### Constats laissés à Work

- **L'interface d'administration est embarquée dans le bundle mobile.** Ce n'est
  pas une faille — l'accès reste soumis à la session Supabase et aux politiques
  RLS — mais c'est du poids et de la surface inutiles **si** l'administration
  depuis le téléphone n'est pas voulue. C'est une décision produit : je ne l'ai
  pas tranchée.
- **`android/` n'est ni versionné ni ignoré**, alors qu'`ios/` est versionné.
  Les workflows régénèrent `android/` à chaque build. L'incohérence mérite une
  décision explicite.
- **`validate.yml` ne se déclenche que sur `main` et `hardening/**`** : ma branche
  ne passe pas la CI. C'est du ressort de Work (CI/CD).
- **`npm test` est désormais réel.** L'étape « Run unit tests » de `validate.yml`
  ne faisait rien jusqu'ici. Elle exécutera maintenant 62 tests — à surveiller
  au premier passage.
- **Ajouter `npm run test:bundle` à la CI après le build** : ces vérifications
  exigent un `dist/` à jour et ne peuvent donc pas vivre dans `npm test`, que la
  CI lance avant le build.

---

## Risques identifiés

- **Production Vercel non reproductible** (constat Work, phase 0) : le déploiement actif provient d'un working tree sale dont le SHA n'existe plus sur GitHub. Aucune promotion production ne sera tentée.
- **Protection Supabase contre mots de passe compromis désactivée** (advisor sécurité relevé par Work) : à traiter dans le périmètre auth (phase 9/10), mais toute activation touche un réglage projet → validation requise avant application.

## Blocages

- **Scénarios auth nécessitant un compte Supabase de test** (B, E, F, G, K) : non
  exécutables sans identifiants dédiés. Non bloquant pour la phase 9 (couverts
  statiquement), à rejouer par Work ou lors de la phase 13.
- **Aucun accès à la base Supabase depuis ce conteneur** (ni CLI, ni credentials,
  ni serveur MCP). Les politiques RLS réelles n'ont pas pu être relues : les
  migrations de la phase 10 sont testées contre une baseline **reconstruite**.
  Une lecture de la production (`inspect-production-policies.sql`) est un
  **prérequis obligatoire** avant application.

## Prochaine action exacte

Terminer la **phase 14 (Capacitor / mobile)** : durcir `capacitor.config.json`
(schéma HTTPS, contenu mixte, débogage WebView), vérifier ce que le bundle
mobile embarque réellement, et figer ces garanties dans un test. Puis rédiger
`CLAUDE_HEAVY_REPORT.md` et remettre la branche à Work.
