# CLAUDE HEAVY HARDENING — RAPPORT DE REMISE

Destinataire : **Work**, pour revue et intégration.
Branche : `claude/heavy-hardening-2026-09`, basée sur `2e1d0de` (HEAD Work).
Journal détaillé : `CLAUDE_HEAVY_PROGRESS.md`. `WORK_PROGRESS.md` n'a pas été touché.

---

## Ce que je ne dis pas

**Je ne déclare pas ce travail prêt pour la production.** Il attend votre revue.

- Aucun push sur `main` ni sur `hardening/gaspardnz-2026-09`.
- Aucun déploiement, aucune promotion, aucune modification de l'alias `gaspardnz.style`.
- **Aucune migration appliquée** : ce conteneur n'a aucun accès à la base Supabase.
- Aucun commit de Work modifié, aucune réécriture d'historique, aucun force-push.
- Aucune donnée de production lue, modifiée ou supprimée.

La phase 8 (réconciliation Vercel) n'étant pas faite, les phases 9+ ont été
traitées en mode préparation, conformément à la mission.

---

## La faille principale

L'accès à l'administration était déterminé par un profil stocké dans
`localStorage`, donc **modifiable par le visiteur**.

Reproduit dans un vrai navigateur, sur un build de production :

| Scénario | Avant | Après |
|---|---|---|
| Profil forgé, **aucune** session Supabase | Interface admin rendue, rôle `owner`, nom « ATTAQUANT » | Refusée |
| Session Supabase expirée + profil en cache | Interface admin rendue | Refusée |

`refreshSession()` et `onAuthStateChange()` existaient déjà dans le code mais
**n'étaient appelés nulle part** : aucune détection d'expiration, aucune
propagation d'une déconnexion faite dans un autre onglet.

Le profil n'est désormais plus persisté du tout — il n'y a donc plus d'artefact
falsifiable — et l'ancienne clé est purgée des navigateurs déjà venus sur le site.

---

## Les six chantiers

| Phase | Sujet | État | Commit |
|---|---|---|---|
| 9 | Authentification admin | ✅ **Livré et vérifié** | `0734eae` |
| 10 | RBAC / rôles / RLS | ⚠️ Migrations prêtes, **non appliquées** ; interface livrée | `968db96`, `f48e3ca` |
| 11 | Journal d'audit serveur | ⚠️ Migration prête, **non appliquée** | `4cbc114` |
| 12 | CRM unifié | ⚠️ Vues prêtes, **non appliquées**, interface non branchée | `32ec3ba` |
| 13 | Tests automatisés | ✅ **Livré** | `0efe5c0` |
| 14 | Capacitor / mobile | ✅ **Livré et vérifié** | `c7be259` |

### Ce qui est actif dès le merge (code frontend)

Phases 9, 13 et 14, plus le filtrage par rôle de l'interface (phase 10).

### Ce qui dort tant que les migrations ne sont pas appliquées

Phases 10 (RLS), 11 (audit) et 12 (vues CRM). Ces fichiers sont inertes : ils ne
s'exécutent pas au build et ne changent rien tant que personne ne les applique.

---

## Trois findings au-delà de la faille principale

1. **Le modèle de rôles n'était appliqué nulle part.** `hasPermission()` était
   exporté sans qu'aucun composant ne l'appelle, la navigation admin était
   statique, et `AdminUsers` laissait choisir le rôle dans un `<select>` avant
   un `INSERT` direct dans `admin_access`. Un compte `viewer` pouvait donc
   s'octroyer `owner` — démontré sur base locale.

2. **Le journal d'audit ne prouvait rien.** Deux écritures depuis le navigateur,
   aucune ne renseignant `actor_email`. Contenu choisi par le client, donc
   falsifiable. Les opérations réellement sensibles (réservations, paramètres,
   attributions d'accès, suppressions) n'y laissaient aucune trace.

3. **Le keystore Android n'était protégé par aucune règle d'exclusion.** Aucun
   fichier de signature n'était versionné — rien à révoquer — mais rien ne
   l'empêchait. C'est le secret dont la fuite permet de publier des mises à jour
   sous l'identité de l'application.

---

## Prérequis avant d'appliquer les migrations

**Obligatoire.** Les migrations ont été testées contre une baseline
**reconstruite**, pas contre la production. Avant toute application :

1. Exécuter `scripts/rls-harness/inspect-production-policies.sql` (**lecture
   seule**, aucun CREATE/ALTER/DROP) dans le SQL Editor Supabase.
2. Comparer le résultat à l'hypothèse de `scripts/rls-harness/02-baseline-policies.sql`.
3. Confirmer le schéma réel d'`activity_log` : la migration d'audit suppose les
   colonnes `event_type`, `entity_type`, `entity_id`, `title`, `description`,
   `actor_email`, telles que lues par `adminData.js`.
4. Appliquer dans l'ordre des préfixes, en environnement de préproduction d'abord.

Les politiques ajoutées sont **RESTRICTIVES** : elles se combinent en ET et ne
peuvent que resserrer l'accès. Elles n'exigent donc pas de connaître les
politiques existantes et se retirent sans y toucher. Un rollback est fourni pour
chaque migration, testé, et **ne supprime aucune trace d'audit**.

**Si la production comporte des politiques plus strictes que l'hypothèse**, la
migration pourrait retirer des droits à des comptes légitimes. D'où l'étape 1.

**La phase 11 doit être appliquée avec la phase 10**, ou juste après : la
migration RLS ferme l'écriture cliente d'`activity_log`, que la phase 11
remplace par des triggers.

---

## Ce que les tests couvrent

```bash
npm test              # 62 tests Vitest + 8 validateurs statiques  (~4 s)
npm run test:bundle   # build mobile + scan de secrets dans l'artefact
npm run test:e2e      # 17 vérifications dans un vrai navigateur
sudo -u postgres bash scripts/rls-harness/run.sh   # 54 assertions SQL
```

Tous verts au moment de la remise.

**Chaque test statique a été validé par mutation** : la régression correspondante
a été réintroduite dans le code corrigé pour vérifier que le test la détecte.
20 mutations, 20 détectées — deux ne l'étaient pas à la première tentative, les
assertions concernées ont été resserrées.

Le harnais SQL exécute l'attaque **avant** migration, pour que la comparaison
avant/après soit réelle et non supposée.

---

## Quatre défauts que les tests ont trouvés dans mon propre travail

Signalés parce qu'ils disent ce que les tests valent :

1. **`USAGE` manquant sur le schéma `private`** : `authenticated` recevait
   `EXECUTE` sur les fonctions de rôle mais pas l'accès au schéma. Toutes les
   vérifications échouaient → **l'administration serait devenue totalement
   inaccessible en production.**
2. **Verrouillage de `viewer` et `editor`** : exiger le rôle `admin` pour toute
   lecture d'`admin_access` empêchait ces comptes de se connecter, puisque la
   connexion lit cette table pour établir le profil.
3. **Rollback devenu faux** : `email_messages` avait été ajouté à la migration
   RLS sans l'être au rollback, qui échouait sur une dépendance. Le rollback
   déduit désormais sa liste du catalogue au lieu de la recopier.
4. **Faux positif du scanner de secrets** : il signalait `sb_secret_` dans le
   bundle. Vérifié **sans afficher la valeur** : c'était `startsWith("sb_secret_")`
   dans le code de `@supabase/supabase-js`. Aucun secret n'est embarqué.

---

## Vulnérabilité de dépendance — hors de mon périmètre

`npm audit --omit=dev` remonte **4 vulnérabilités en dépendances de production**
(3 hautes, 1 critique), préexistantes à mes changements :

| Paquet | Sévérité | Direct |
|---|---|---|
| `nodemailer` | Haute | **Oui** — 9.0.3 installé, 10.0.3 publié (**montée majeure**) |
| `tar` | Critique | Transitif |
| `@xmldom/xmldom` | Haute | Transitif |
| `brace-expansion` | Haute | Transitif |

`nodemailer` est utilisé par les fonctions serverless d'envoi d'email. La montée
étant majeure, je ne l'ai pas faite : l'hygiène des dépendances relève de votre
périmètre et une rupture d'API sur l'envoi d'email n'est pas un effet de bord
acceptable dans un commit de sécurité.

---

## Décisions que je n'ai pas prises

- **Rapprochement CRM par email.** Un même client avec deux adresses reste vu
  comme deux contacts. Résoudre cela suppose un identifiant client stable —
  décision métier.
- **Administration embarquée dans l'application mobile.** Pas une faille (l'accès
  reste soumis à la session et à RLS), mais du poids et de la surface inutiles si
  l'administration depuis le téléphone n'est pas voulue. Décision produit.
- **`android/` ni versionné ni ignoré**, alors qu'`ios/` est versionné.
  L'incohérence mérite un arbitrage explicite.
- **Protection Supabase contre les mots de passe compromis, désactivée**
  (advisor relevé dans `WORK_PROGRESS.md`). L'activer touche un réglage projet :
  je ne l'ai pas fait.

---

## Points d'attention CI

- **`npm test` est désormais réel.** `validate.yml` appelait
  `npm test --if-present` alors qu'aucun script `test` n'existait : l'étape
  « Run unit tests » ne faisait **rien**, en silence, depuis le début. Elle
  exécutera maintenant 62 tests — à surveiller au premier passage.
- **`validate.yml` ne se déclenche que sur `main` et `hardening/**`** : cette
  branche ne passe pas la CI.
- **Ajouter `npm run test:bundle` après l'étape de build.** Ces vérifications
  exigent un `dist/` à jour et ne peuvent donc pas vivre dans `npm test`, que la
  CI lance avant le build.
- `package.json` et `package-lock.json` changent (Vitest, Testing Library,
  Playwright, en **devDependencies**). L'étape « Verify dependency manifests stay
  unchanged » vérifie qu'un build ne les modifie pas, elle reste satisfaite.

---

## Secrets

Aucun secret n'a été affiché, copié dans un fichier de suivi, ni committé.
Aucune `service_role` key côté frontend — vérifié dans la source **et dans
l'artefact construit** : seule la clé publishable est embarquée, ce qui est son
usage prévu.

Aucun secret potentiel n'a été détecté durant ces travaux.
