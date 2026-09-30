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
