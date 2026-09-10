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
- **Statut** : 🔄 MIGRATIONS PRÊTES ET TESTÉES LOCALEMENT — non appliquées

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

### Phase 11 — Audit log serveur
- **Statut** : ⏳ NON DÉMARRÉ

### Phase 12 — CRM unifié
- **Statut** : ⏳ NON DÉMARRÉ

### Phase 13 — Tests automatisés
- **Statut** : ⏳ NON DÉMARRÉ

### Phase 14 — Capacitor / mobile
- **Statut** : ⏳ NON DÉMARRÉ

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

Appliquer le modèle de rôles **côté interface** (défense en profondeur) :
`AdminLayout` doit masquer les sections hors du rôle de l'utilisateur, et
`AdminUsers` ne doit pas proposer d'attribuer un rôle supérieur au sien. Puis
enchaîner sur la **phase 11 (journal d'audit serveur)**, qui doit être livrée
avec la migration RLS puisque celle-ci ferme l'écriture cliente d'`activity_log`.
