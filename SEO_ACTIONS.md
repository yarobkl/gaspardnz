# Actions SEO externes pour GaspardNZ

Objectif : faire comprendre à Google que le site officiel de GaspardNZ est :

https://gaspardnz.style

Un ancien site apparaît encore dans Google :

https://gaspardnz.ipcjagency.com/a-propos

Ce domaine ne semble pas dépendre du projet actuel. Les actions ci-dessous doivent donc être faites côté propriétaire ou hébergeur de `ipcjagency.com`.

## Priorité 1 : redirection 301

Demander au propriétaire de `ipcjagency.com` de mettre une redirection permanente :

`https://gaspardnz.ipcjagency.com/*` vers `https://gaspardnz.style/`

Exemples :

- `https://gaspardnz.ipcjagency.com/` vers `https://gaspardnz.style/`
- `https://gaspardnz.ipcjagency.com/a-propos` vers `https://gaspardnz.style/a-propos`
- `https://gaspardnz.ipcjagency.com/services` vers `https://gaspardnz.style/services`

Cette solution est la meilleure : elle transfère progressivement le signal SEO vers le domaine officiel.

## Priorité 2 : noindex si la redirection n'est pas possible

Si l'ancien site doit rester accessible temporairement, ajouter dans le `<head>` de toutes ses pages :

```html
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://gaspardnz.style/">
```

Cela demande à Google de retirer l'ancien site des résultats et de considérer le site officiel.

## Priorité 3 : suppression Search Console

Si un accès Google Search Console existe pour `ipcjagency.com`, utiliser l'outil de suppression d'URL pour demander le retrait temporaire des pages :

- `https://gaspardnz.ipcjagency.com/`
- `https://gaspardnz.ipcjagency.com/a-propos`

La suppression Search Console seule ne remplace pas une redirection 301 ou un `noindex`. Elle doit accompagner une correction technique.

## Priorité 4 : retirer le nom GaspardNZ de l'ancien site

Si l'ancien site ne peut pas être supprimé rapidement :

- remplacer les titres qui contiennent `GaspardNZ`
- retirer les descriptions SEO liées à GaspardNZ
- retirer les images et textes qui créent une confusion avec le site officiel
- éviter tout lien interne qui renforce l'ancien domaine

## À vérifier après action

1. Lancer une recherche Google : `site:gaspardnz.ipcjagency.com gaspardnz`.
2. Vérifier que les anciennes pages disparaissent progressivement.
3. Dans Google Search Console du domaine officiel, soumettre :
   - `https://gaspardnz.style/`
   - `https://gaspardnz.style/sitemap.xml`
4. Demander une nouvelle indexation de la page d'accueil officielle.

Note : Google peut mettre plusieurs jours à plusieurs semaines avant de mettre à jour complètement ses résultats.
