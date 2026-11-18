# GNZ PARIS — Cal.com et rendez-vous iOS

## Rappels locaux iPhone et Live Activities (à valider sur iPhone réel)

Le calendrier **réel** reste `https://cal.com/gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous` : les dates ouvertes jusqu'en février proviennent directement de Cal.com. Aucun calendrier fictif, accès administrateur Cal.com ou compte client GNZ n'est nécessaire pour la partie suivante.

- Après une réservation effectuée **dans le calendrier intégré à l'application iPhone**, l'événement `bookingSuccessfulV2` de Cal.com renvoie un UID, une date et un statut. Seuls `ACCEPTED`/`CONFIRMED` sont traités comme confirmés sur cet appareil ; les autres statuts affichent « en attente de confirmation ».
- L'app Swift demande l'autorisation des notifications en contexte, puis utilise `UserNotifications` pour programmer **J-1** et, lorsque aucune Live Activity n'est programmée, **H-2**. Ces rappels locaux peuvent s'afficher sur l'écran verrouillé lorsque l'app est fermée. Aucun email, numéro, nom de client ou jeton APNs n'est transmis par le pont JavaScript → Swift.
- Les rendez-vous acceptés sont conservés **sur l'appareil uniquement** avec leur UID opaque et leur heure. **Sous iOS 26 ou plus récent**, GNZ PARIS demande à ActivityKit de **programmer à l'avance** une Live Activity avec démarrage **H-2**, accompagnée de l'alerte obligatoire d'Apple. Le système démarre ensuite l'activité à l'heure prévue même si l'app n'est plus ouverte, sous réserve des réglages de l'utilisateur et des limites système. Sur les appareils compatibles, la Live Activity apparaît sur l'écran verrouillé et dans la Dynamic Island lorsqu'elle existe.
- **Sous iOS 16.2 à 25**, ActivityKit ne dispose pas du déclenchement différé utilisé ici : GNZ PARIS ouvre la Live Activity si l'app revient au premier plan dans les deux heures précédant le rendez-vous. Les notifications locales J-1/H-2 restent autonomes. La programmation différée consomme une place dans la limite des activités simultanées d'Apple ; GNZ PARIS programme donc une file restreinte.
- La réservation effectuée via le lien externe de secours (navigateur) ne déclenche pas le pont natif. Cal.com fournit ses confirmations habituelles ; l'application ne prétend pas avoir programmé un rappel iOS qu'elle n'a pas reçu.

**Limite sans accès au Cal.com de l'organisateur :** l'application ne peut pas connaître automatiquement un déplacement, une annulation ou une validation tardive d'une demande faite hors de l'app. Dans ce cas les rappels et Live Activities déjà programmés peuvent devenir obsolètes. **Le déclenchement différé iOS 26 ne nécessite pas de webhook ni de jeton APNs**, mais la synchronisation fiable multi-appareils, les modifications/annulations à distance et la prise en charge de réservations faites dans un navigateur nécessitent le webhook authentifié décrit ci-dessous, le consentement et une association sécurisée réservation ↔ appareil.

Pour validation TestFlight : réserver soi-même un **vrai créneau futur** dans le calendrier intégré de l'app, constater la permission iOS, vérifier dans Réglages les notifications et Live Activities, puis **fermer l'app avant H-2** et confirmer à H-2 que le système affiche la Live Activity sans relancer l'app (iOS 26+). Vérifier J-1, l'absence de doublon H-2, le statut « en attente » et le refus de permission. Sur iOS plus ancien, ouvrir l'app dans les deux dernières heures pour observer la Live Activity. Ne pas créer de rendez-vous fictif sur le calendrier public.

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

## Étape nécessaire pour les mises à jour/annulations à distance

Le widget WidgetKit / ActivityKit est présent et l'application peut programmer localement son démarrage sous iOS 26+. **Le webhook ne lance ni ne met à jour de Live Activity à distance** : recevoir une réservation authentique ne prouve pas à quel iPhone elle appartient. Il reste à établir un lien client-appareil avec consentement et preuve à usage unique, puis à enregistrer/actualiser les jetons APNs ActivityKit et traiter les rappels, déplacements, annulations et expirations distants. Ne jamais associer un appareil à une réservation à partir du nom, de l'email saisi ou du simple UID récupéré côté WebView.

Le webhook traite les événements par UID et horodatage Cal.com. Si un changement de réservation attribue un **nouvel** UID, il faudra vérifier le champ de corrélation renvoyé par le compte Cal.com avant d'automatiser la fermeture de l'ancien événement.

**Aucun secret, déploiement de production, migration distante, rendez-vous fictif ou envoi TestFlight n'est effectué par ce code.**
