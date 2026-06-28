# Modèle workflow Android

À créer dans le repo avec le chemin exact :

```txt
.github/workflows/android-build.yml
```

Contenu recommandé :

```yaml
name: Android Capacitor Build

on:
  workflow_dispatch:

jobs:
  build-android:
    name: Build Android APK/AAB
    runs-on: ubuntu-latest

    steps:
      - name: Checkout du code
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Setup Java 21
        uses: actions/setup-java@v4
        with:
          distribution: "temurin"
          java-version: "21"

      - name: Installer les dépendances
        run: npm install

      - name: Build web Capacitor
        run: npm run build:app

      - name: Ajouter ou synchroniser Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          else
            npx cap sync android
          fi

      - name: Générer APK debug
        run: |
          cd android
          chmod +x ./gradlew
          ./gradlew assembleDebug

      - name: Générer AAB release non signé
        run: |
          cd android
          ./gradlew bundleRelease

      - name: Publier les fichiers Android
        uses: actions/upload-artifact@v4
        with:
          name: gaspardnz-android-builds
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/bundle/release/*.aab
```
