# GNZ PARIS — Cal.com et rendez-vous iOS

## Ce qui est prêt dans cette branche

- `POST /api/cal/webhook` accepte uniquement des événements Cal.com dont la signature HMAC-SHA256 `X-Cal-Signature-256` correspond au **corps brut**.
- Les événements vérifiés `BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_REQUESTED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED` et `BOOKING_REJECTED` alimentent le CRM par RPC Supabase côté service.
- Les demandes en attente restent `requested` ; seuls les événements acceptés sont `confirmed`.
- Une réservation Cal.com dispose d'un UID unique. La migration utilise une ligne de verrouillage pour neutraliser les doublons et les livraisons hors ordre.
- Aucune donnée client n'est exposée dans les attributs de la Live Activity. Le titre stocké vient du **type de prestation**, pas du titre libre Cal.com.

## Activation (administrateur uniquement)

1. Déployer la migration `20261118140000_cal_verified_booking_ingestion.sql` sur la bonne instance Supabase **après revue**, sans la lancer sur la base par mégarde.
2. Configurer dans Vercel la variable serveur `CAL_WEBHOOK_SECRET` (un secret unique de longueur >= 16 caractères). Ne jamais mettre ce secret dans le code, le navigateur ou le bundle iOS.
3. Dans le compte Cal.com qui héberge l'événement `gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous`, créer un webhook vers `https://gaspardnz.style/api/cal/webhook`. Cocher les six événements reconnus et saisir **exactement le même secret**. Garder le corps JSON Cal.com par défaut, sans modèle personnalisé.
4. Vérifier dans les livraisons Cal.com qu'une réservation **réelle et consentie** renvoie HTTP 200, puis la retrouver dans `bookings` avec `provider=calcom` et `source=Cal.com`. Les erreurs 401 signifient signature incorrecte, 422 format non pris en charge, 503 intégration non prête.
5. Contrôler un déplacement et une annulation réels, sans créer un faux rendez-vous client. L'annulation ne doit plus apparaître comme confirmée.

## Étape nécessaire avant la Dynamic Island sur l'iPhone du client

Le widget WidgetKit / ActivityKit existe déjà, mais **le webhook ne lance volontairement aucune Live Activity** : recevoir une réservation authentique ne prouve pas à quel iPhone elle appartient. Il reste à établir un lien client-appareil avec consentement et preuve à usage unique, puis à enregistrer/actualiser les jetons APNs ActivityKit et traiter les rappels, déplacements, annulations et expirations. Ne jamais associer un appareil à une réservation à partir du nom, de l'email saisi ou du simple UID récupéré côté WebView.

Le webhook traite les événements par UID et horodatage Cal.com. Si un changement de réservation attribue un **nouvel** UID, il faudra vérifier le champ de corrélation renvoyé par le compte Cal.com avant d'automatiser la fermeture de l'ancien événement.

**Aucun secret, déploiement de production, migration distante, rendez-vous fictif ou envoi TestFlight n'est effectué par ce code.**
