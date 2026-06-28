# GaspardNZ — préparation publication mobile

Le projet est préparé pour Capacitor iOS et Android.

## Liens directs officiels

- Capacitor Android : https://capacitorjs.com/docs/android
- Capacitor iOS : https://capacitorjs.com/docs/ios
- Google Play Console : https://play.google.com/console/signup
- Aide officielle Play Console : https://support.google.com/googleplay/android-developer/answer/6112435
- Apple Developer Program : https://developer.apple.com/programs/enroll/
- App Store Connect : https://appstoreconnect.apple.com/

## État du projet

- App name : Gaspardnz
- App ID Capacitor : com.gaspardnz.app
- Web dir : dist
- Stack : Vite + React + Capacitor

## Android — préparation sans payer Google Play

Tu peux déjà générer un APK testable sans compte Google Play.

```bash
npm install
npm run build:app
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

Le fichier APK de test sera dans :

```txt
android/app/build/outputs/apk/debug/app-debug.apk
```

## Android — publication Google Play plus tard

Quand le compte Google Play sera payé :

1. Créer l’application dans Play Console.
2. Générer un fichier AAB.
3. Signer l’AAB avec une clé de production.
4. Uploader l’AAB dans une piste de test interne.
5. Remplir la fiche Play Store.
6. Passer en production après validation.

Commande AAB :

```bash
cd android
./gradlew bundleRelease
```

Le fichier AAB sera dans :

```txt
android/app/build/outputs/bundle/release/app-release.aab
```

## iOS

Pour iOS, il faut :

1. Compte Apple Developer.
2. Build cloud ou Mac récent avec Xcode.
3. Certificats/provisioning Apple.
4. Upload vers App Store Connect.
5. TestFlight.
6. Validation App Store.

## Commandes utiles

```bash
npm run build:app
npm run cap:sync
npm run cap:sync:android
npm run cap:sync:ios
npm run cap:open:android
npm run cap:open:ios
```
