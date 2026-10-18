# Choisir un pattern — aide-memoire pragmatique

Avant de choisir, ecrire : **probleme reel**, **alternatives simples**, **benefice attendu**, **cout de maintenance**, **test qui prouve le resultat**.

| Situation observee | Option a considerer | Ne pas utiliser si... |
| --- | --- | --- |
| Plusieurs algorithmes interchangeables (calculs, tarification) | Strategy / fonctions injectees | Un seul chemin simple existe; un if clair suffit. |
| Plusieurs API de prestataires externes | Adapter | Aucun fournisseur n'est a integrer ou les interfaces sont deja uniformes. |
| Creation de variantes d'un objet necessitant des invariants | Factory Method / fonction fabrique | Un constructeur simple suffit. |
| Cycle d'etats explicite avec transitions et refus | State ou table de transitions | Deux booleens lisibles suffisent; preferer d'abord une union TypeScript. |
| Coordination de composants complexes avec interface simple | Facade / fonction d'orchestration | Cacher l'orchestration masquerait des erreurs ou des transactions critiques. |
| Reactions a un evenement metier | Observer / evenement domaine et handler | Un appel direct synchrone est plus simple et fiable. Prevoir idempotence/rejeu. |
| Extensions facultatives d'un comportement | Decorator / composition | Une fonction enveloppante est deja suffisante. |
| Faciliter les tests d'une dependance externe | Injection de dependances | Cela ajoute une couche sans point de substitution reel. |

## Anti-patterns frequents

- Ajouter trois couches `service -> manager -> helper` pour une fonction triviale.
- Introduire des classes et interfaces juste pour « avoir un pattern ».
- Faire un refactoring transversal pendant la correction d'un bug urgent.
- Dupliquer des schemas/type guards pour contourner les types existants.
- Deplacer l'autorisation serveur vers une verification uniquement cote client.
- Ajouter des evenements asynchrones sans gerer les repetitions, echec/retry et ordre.
- Declarer un paiement confirme a partir d'un clic, d'un statut UI ou d'une reference saisie.

## Checklist de revue

- [ ] Les regles metier et droits restent identiques ou evoluent sur demande explicite.
- [ ] Le design choisi resout un probleme observable, avec moins de cout que sa solution simple.
- [ ] Pas de dependance ou abstraction inutile.
- [ ] Tests sur cas nominal, erreurs, doublons, permissions et cas limites utiles.
- [ ] Montants/quantites/arrondis et concurrents traites si le sujet les implique.
- [ ] Types et erreurs explicites; aucun secret dans le code.
- [ ] Tests réellement executes documentes; toute verification impossible est signalee.
