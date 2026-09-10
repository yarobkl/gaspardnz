# Vérifications navigateur — accès admin (phase 9)

Scénarios rejoués dans un vrai navigateur pour **prouver** — et non supposer —
que l'accès à l'administration exige une session Supabase vérifiée.

Ces scripts ne sont **pas** branchés sur les commandes `npm run test:*` : ils
nécessitent `playwright-core` et un Chromium, qui ne sont pas encore des
dépendances du projet. La mise en place d'un vrai harnais E2E est l'objet de la
**phase 13**.

## Rejouer

```bash
npm run build
npx vite preview --port 4210 --strictPort &
node scripts/browser-checks/admin-auth-scenarios.mjs
node scripts/browser-checks/admin-recovery-scenarios.mjs
node scripts/browser-checks/admin-legacy-cache-purge.mjs
```

Variables d'environnement : `BASE` (URL du serveur de preview) et
`CHROMIUM_PATH` (binaire Chromium).

## Couverture

| Scénario | Attendu |
|---|---|
| A | `/admin` sans connexion → écran de login |
| C | session Supabase expirée + profil en cache → accès refusé |
| D | `gnz-admin-profile` falsifié, aucune session → accès refusé |
| J | lien de récupération → formulaire de nouveau mot de passe |
| J2 | lien de récupération alors qu'un profil est en cache → formulaire quand même |
| L | écran de connexion standard intact |
| PUB | site public rendu, aucune erreur JS |
| PURGE | l'ancien cache `gnz-admin-profile` est supprimé au chargement |
| NAV-* | la navigation admin est filtrée selon le rôle (owner / admin / editor / viewer) |
| URL-* | une section atteinte par URL directe hors du rôle est refusée |

Les invariants statiques correspondants sont figés dans
`scripts/validate-admin-auth.mjs` (`npm run test:admin-auth`), qui tourne lui
sans navigateur et fait donc partie de la suite exécutée à chaque changement.
