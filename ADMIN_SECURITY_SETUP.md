# Configuration sécurisée de l’espace administrateur

L’authentification administrateur est exécutée par la fonction serveur `/api/admin-session`.
Le navigateur ne contient plus de compte, de mot de passe, de permission ou de jeton de session modifiable.

## Générer les accès

```bash
npm run admin:generate-config -- votre@email.fr
```

La commande affiche un mot de passe aléatoire ainsi que trois variables privées. Conservez le mot de passe dans un gestionnaire de mots de passe.

## Configurer Vercel

Dans les paramètres du projet Vercel, ajoutez les variables suivantes pour les environnements Production et Preview :

- `ADMIN_AUTH_EMAIL`
- `ADMIN_AUTH_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`

Redéployez ensuite le projet. Sans ces trois variables, l’espace administrateur reste volontairement verrouillé.

Le cookie de session est signé, limité à huit heures et utilise `HttpOnly`, `Secure` et `SameSite=Strict`.
