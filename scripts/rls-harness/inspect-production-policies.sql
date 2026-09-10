-- LECTURE SEULE. À exécuter par une personne disposant d'un accès à la base
-- Supabase (SQL Editor), afin de comparer les politiques réelles à l'hypothèse
-- de départ du harnais local (scripts/rls-harness/02-baseline-policies.sql).
--
-- Ce script ne modifie rien : aucun CREATE, ALTER, DROP, INSERT ou UPDATE.

-- 1. Tables publiques et état de RLS.
select c.relname as "table",
       c.relrowsecurity as "rls_active",
       c.relforcerowsecurity as "rls_forcee"
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;

-- 2. Politiques existantes, avec leur type (permissive / restrictive).
select schemaname, tablename, policyname, permissive, roles, cmd,
       qual as "using", with_check as "with_check"
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. Tables RLS activé mais SANS aucune politique : elles sont inaccessibles
--    (sauf service_role), ce qui est souvent un oubli plutôt qu'un choix.
select c.relname as "table_sans_politique"
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
  and not exists (select 1 from pg_policies p
                  where p.schemaname = 'public' and p.tablename = c.relname)
order by c.relname;

-- 4. Fonctions du schéma private déjà utilisées par les politiques.
select p.proname, pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as "security_definer"
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private'
order by p.proname;

-- 5. Droits accordés à anon / authenticated sur les tables publiques.
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as droits
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;
