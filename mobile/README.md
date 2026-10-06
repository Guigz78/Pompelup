# Pompelup — app iOS / Android (Expo SDK 57)

L'app native embarque le jeu web du dépôt (`../index.html`, `quiz.js`, `quiz.css`…)
dans un seul fichier HTML, affiché en plein écran dans une WebView. Le jeu marche
donc hors ligne ; seuls les extraits audio et les pochettes demandent du réseau.
Le natif ajoute les vibrations (expo-haptics), l'écran de démarrage, l'icône et
la couleur de la barre d'état.

## Lancer en développement

```bash
cd mobile
npm install
npx expo run:ios        # ou : npx expo run:android (build de dev local)
```

`react-native-webview` contient du code natif : l'app ne tourne pas dans Expo Go,
il faut un build de développement (`npx expo run:ios`, ou `npx eas-cli@latest build --profile development`).

Chaque lancement régénère `assets/web/index.html` à partir du jeu web
(`npm run build:web`). Après une modification du jeu, relance simplement.

## Publier sur l'App Store

1. Compte Apple Developer (99 $/an) et compte Expo.
2. `npx eas-cli@latest login`
3. `npm run build:ios` — build signé dans le cloud (EAS gère certificats et profils).
4. `npm run submit:ios` — envoi vers App Store Connect / TestFlight.

Identifiant de l'app : `app.pompelup.game` (à changer dans `app.json` si besoin).

## Avant la mise en ligne

- **Licence musicale** : les extraits iTunes / Deezer ne sont pas autorisés en
  usage commercial. Il faut un catalogue sous licence avant publication.
- **Règle 4.2 d'Apple** : une app qui n'est qu'un site web peut être refusée.
  Pompelup embarque le jeu hors ligne avec retours haptiques natifs, ce qui aide ;
  ajouter les notifications de défi quotidien et Game Center renforcerait le dossier.

## Caster sur la télé (Google Cast + AirPlay)

Le bouton « Sur la télé » du multijoueur fonctionne comme Netflix :

- **Chromecast / Google TV** : liste des télés du réseau, la télé ouvre la vue géante de la salle.
- **Apple TV (AirPlay)** : « Recopie de l'écran » depuis le Centre de contrôle ; l'appli détecte
  l'écran AirPlay et y affiche la vue télé (le téléphone reste la manette).

### Activer Google Cast (une seule fois)

1. Créer un compte sur la [Google Cast SDK Developer Console](https://cast.google.com/publish) (5 $ une fois).
2. « Add new application » → **Custom Receiver**, URL : `https://pompelup.vercel.app/?tv&cast`.
3. Copier l'**Application ID** obtenu, puis :
   - dans `quiz.js`, mettre `const CAST_APP_ID = 'XXXXXXXX';` (bouton Cast du site dans Chrome) ;
   - dans `eas.json`, ajouter `"env": { "EXPO_PUBLIC_CAST_APP_ID": "XXXXXXXX" }` au profil de build.
4. Tant que l'appli n'est pas publiée dans la console, seuls les Chromecast enregistrés comme
   appareils de test la voient ; « Publish » la rend disponible pour tout le monde.
5. Refaire une version de l'appli (`npm run build:ios`) : Google Cast et l'écran externe
   sont des modules natifs, ils ne marchent pas dans Expo Go.

## Tester sur iPhone avec Xcode

Prérequis : un Mac avec **Xcode 26 ou plus récent** (React Native 0.86 demande Swift 6.2),
Node.js 22 et CocoaPods (`brew install cocoapods`).

```bash
git clone https://github.com/Guigz78/Pompelup.git
cd Pompelup/mobile
npm install
npm run xcode        # prépare le jeu, génère le projet iOS et ouvre Xcode
```

Dans Xcode : cible **Pompelup** → onglet *Signing & Capabilities* → coche *Automatically manage signing*
et choisis ton équipe (un compte Apple gratuit suffit pour ton propre iPhone). Branche l'iPhone,
choisis-le en haut, puis ▶︎. La 1re fois, sur l'iPhone : Réglages → Général → VPN et gestion
de l'appareil → faire confiance au développeur.

La compilation est aussi vérifiée automatiquement sur un Mac de GitHub (workflow `ios-build`),
qui fournit l'appli pour le Simulateur iOS en téléchargement.
