// Ajoute Google Cast à la config Expo (app.json reste la base).
// L'identifiant du récepteur Pompelup se règle dans EXPO_PUBLIC_CAST_APP_ID (eas.json / .env) ;
// sans lui, on garde le récepteur par défaut de Google et le bouton propose AirPlay / l'adresse.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    ['react-native-google-cast', {
      receiverAppId: process.env.EXPO_PUBLIC_CAST_APP_ID || 'CC1AD845',
      iosStartDiscoveryAfterFirstTapOnCastButton: false,
      expandedController: false,
    }],
  ],
});
