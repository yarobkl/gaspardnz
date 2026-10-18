---
name: pragmatic-design-patterns
description: Use for implementing, reviewing or refactoring TypeScript, React, Vite, Next.js and Supabase applications when maintainability, duplication, module boundaries, business workflows or design pattern selection matters. Prefer the simplest reliable design and avoid unnecessary abstractions.
---

# Pragmatic Design Patterns — skill Codex

## Mission

Produire un code clair, testable, evolutif et adapte au metier, sans sur-ingenierie. S'appuyer sur les principes des design patterns (voir `references/pattern-selection.md`) et sur le code effectivement present dans le projet. Ce skill est un guide de travail, pas une instruction de refondre automatiquement le logiciel.

## Quand l'utiliser

- Ajout de fonctionnalites non triviales, refactoring, audit de maintenabilite, revue de PR, integration d'un prestataire externe.
- Plusieurs variantes d'un meme workflow (paiement, commande, notification, produits), transitions d'etats, couplage eleve ou logique dupliquee.
- Pour une correction localisee, privilegier une correction localisee : ne pas introduire un pattern sans besoin reel.

## Procedure obligatoire

1. **Observer avant de modifier.** Lire les fichiers concernes, les schemas et tests existants, et identifier le flux utilisateur/metier. Respecter les conventions du depot.
2. **Exprimer le probleme.** Expliquer concretement la duplication, la fragilite ou le besoin de variabilite. Distinguer une complexite actuelle d'une hypothese future.
3. **Comparer les options.** Commencer par fonctions/modules simples; comparer avec composition, separation des responsabilites et au maximum un pattern utile. Utiliser la table de `references/pattern-selection.md`.
4. **Choisir le minimum necessaire.** Ne pas creer de Factory, Strategy, Repository, Event Bus, singleton ou nouvelle dependance pour un seul cas sans justification. Eviter les hierarchies de classes gratuites.
5. **Modifier par petites etapes.** Garder les API et donnees existantes compatibles, sauf demande explicite. Ne pas changer le comportement metier dans un simple refactoring.
6. **Verrouiller les invariants metier.** Montants, taxes, arrondis, stock, etats, droits d'acces et suivi des operations doivent etre precis. Pour l'argent, utiliser une representation decimale fiable ou les plus petites unites monetaires entieres, jamais des calculs financiers approximatifs en flottants. Veiller aux cas limites, operations concurrentes et doublons.
7. **Verifier.** Ajouter ou ajuster des tests ciblant le resultat observable, les cas limites et les transitions invalides. Executer les commandes existantes de lint, typecheck, test et build lorsqu'elles sont pertinentes et disponibles. Rapporter honnetement tout test non lance.
8. **Conclure clairement.** Fournir : probleme resolu, choix retenu et pourquoi, fichiers modifies, tests effectues/resultats, risques ou points restant a controler.

## Contraintes de securite et de produit

- Respecter les permissions, le cloisonnement entre clients/organisations et les regles de securite existantes (Supabase RLS, RBAC, authentification, validations serveur).
- Ne jamais considerer un clic WhatsApp, une reference externe ou une requete comme une preuve de paiement ou de message recu. Toute validation financiere repose sur une preuve verifiable.
- Respecter la direction artistique et l'accessibilite, en particulier sur mobile. Pas de refonte visuelle non sollicitee.
- Ne pas exposer de secrets, desactiver des controles de securite ou publier/deployer automatiquement pour satisfaire cette procedure.
- Les regles locales du depot et les demandes explicites de l'utilisateur priment sur les exemples generiques de ce skill.

## Adaptation par projet

- **COVI :** ventes, approvisionnements, lots/ballons, stock, caisse, montants et benefices exacts; codes caissiers, liens/QR et paiement verifie; isolation boutique/proprietaire.
- **GaspardNZ :** parcours de contact/reservation, CRM, permissions admin, preservation SEO et identite graphique; clic WhatsApp different d'une conversation effectivement envoyee.
- **EduCongo :** separation des etablissements via schoolId, roles, classes/eleves, notes, coefficients et bulletins; aucune fuite de donnees entre ecoles.
- **Autres projets :** identifier d'abord leurs regles propres, puis appliquer la meme methode sans copier aveuglement les exemples precedents.

## References

- Guide de choix local : `references/pattern-selection.md`.
- Pour approfondir les concepts sans recopier les contenus : https://refactoring.guru/design-patterns
