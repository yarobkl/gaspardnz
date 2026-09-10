# Harnais RLS local (phase 10)

Rejoue les migrations RBAC sur une base **PostgreSQL locale et jetable**, puis
vérifie rôle par rôle ce qui est réellement autorisé. Rien n'est exécuté sur
Supabase.

```bash
sudo -u postgres bash scripts/rls-harness/run.sh
```

Le script crée la base `gnz_rls_test`, applique le harnais puis les migrations,
exécute la matrice de droits, rejoue les rollbacks et supprime la base.

## Ce que le harnais prouve — et ce qu'il ne prouve pas

**Il prouve** que les migrations de `supabase/migrations/` :

- s'appliquent sans erreur et sont **rejouables** (idempotentes) ;
- transforment un `viewer` capable de s'octroyer le rôle `owner` en un `viewer`
  qui ne peut ni écrire ni lire `admin_access` (l'étape « démonstration de la
  faille » exécute l'attaque avant migration, pour que la comparaison soit
  réelle et non supposée) ;
- **ne cassent pas** la lecture publique du site vitrine par le rôle `anon` ;
- se **désappliquent intégralement** (0 politique `rbac_*` restante).

**Il ne prouve pas** que la production se comporte ainsi. Le fichier
`02-baseline-policies.sql` est une **hypothèse** : il reproduit le cas le plus
défavorable et le plus probable au vu du code (une politique permissive unique
« est-ce un admin ? », sans distinction de rôle), parce que les politiques
réelles n'ont pas pu être relues — ce conteneur n'a aucun accès à la base.

Avant toute application en production, exécuter
`inspect-production-policies.sql` (lecture seule) dans le SQL Editor Supabase et
comparer le résultat à cette hypothèse.

## Pourquoi des politiques RESTRICTIVES

Les politiques `PERMISSIVE` se combinent en **OU** : ajouter « il faut être
editor » à côté d'une politique existante « il faut être admin » n'interdit
rien. Les politiques `RESTRICTIVE` se combinent en **ET** : elles ne peuvent que
resserrer. Le correctif peut donc être appliqué **sans supprimer ni même
connaître** les politiques déjà en place, et se retire sans toucher à
l'existant. C'est ce qui le rend additif, non destructif et réversible.

## Différence de version

Local : PostgreSQL 16. Production Supabase : PostgreSQL 17. La sémantique RLS
utilisée ici (permissive/restrictive, `security definer`, triggers) est identique
sur les deux versions.
