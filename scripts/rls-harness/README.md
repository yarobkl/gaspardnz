# Harnais RLS local (phases 10–12)

Rejoue les migrations RBAC/audit/CRM sur une base PostgreSQL locale jetable,
puis vérifie rôle par rôle les autorisations. Rien n'est écrit sur Supabase.

```bash
sudo -u postgres bash scripts/rls-harness/run.sh
```

Le script crée `gnz_rls_test`, applique le contrat de schéma, la baseline RLS,
les migrations, les tests comportementaux, les rollbacks, puis supprime la base.

## Source du contrat

Depuis la revue indépendante du 10 septembre 2026, le harness ne repose plus sur
une baseline imaginée à partir du frontend.

Les fichiers `01-app-schema.sql` et `02-baseline-policies.sql` ont été réalignés
sur des lectures directes du catalogue du projet Supabase GaspardNZ :

- PostgreSQL 17 ;
- `admin_access.role` = enum `public.admin_role` ;
- `activity_log.id` = bigint et `entity_id` = text ;
- relations CRM réelles (`customer_id`, `lead_id`, `booking_id`) ;
- familles de policies RLS réellement présentes ;
- policies Storage du bucket `site-media`.

Le schéma local reste volontairement **minimal** : seules les colonnes utiles aux
migrations/tests sont reproduites. Il ne remplace donc pas un test transactionnel
contre le vrai schéma de préproduction/production.

## Ce que le harness doit prouver

- migrations applicables et idempotentes ;
- un `viewer` garde les lectures nécessaires mais ne peut plus écrire les données
  CRM, le contenu ou le bucket `site-media` ;
- un `editor` peut gérer le contenu et les médias mais pas les paramètres/CRM ;
- un `admin` peut gérer CRM/paramètres mais pas `admin_access` ;
- seul un `owner` peut gérer les accès administrateurs ;
- `admin_access` conserve le self-read nécessaire à la connexion ;
- le site public reste lisible pour `anon` et pour un utilisateur authentifié
  qui n'est pas administrateur ;
- l'audit serveur produit des identifiants textuels compatibles avec le schéma
  réel et ne journalise pas les valeurs sensibles ;
- les vues CRM utilisent les FK réelles et `security_invoker = true` ;
- les rollbacks retirent uniquement les objets créés par le durcissement.

## Point de contrôle production

Avant application réelle, refaire une lecture du catalogue Supabase et exécuter
les migrations dans une transaction rollback ou sur une branche de
préproduction. Les migrations ne doivent jamais être appliquées directement à
la production uniquement parce que le harness local est vert.

## Pourquoi des policies RESTRICTIVES

Les policies `PERMISSIVE` se combinent en **OU**. Les policies `RESTRICTIVE` se
combinent en **ET** avec les permissives existantes. Le durcissement peut donc
resserrer les droits sans supprimer les policies historiques, tout en restant
réversible.

Attention aux lignes publiques : la restriction de lecture autorise
`current_admin_role() is null` afin qu'un utilisateur `authenticated` non-admin
ne perde pas les contenus que la policy publique existante lui autorise déjà.
