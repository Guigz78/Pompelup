import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Origine donnée à la page : fixe l'espace de stockage (progression) et les requêtes réseau.
const ORIGIN = 'https://pompelup.app/';

// Pont page → natif : vibrations (navigator.vibrate n'existe pas sur iOS) et thème de la barre d'état.
const BRIDGE = `
  window.PompeNative = {
    post: (type, payload) => window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload })),
  };
  navigator.vibrate = pattern => { window.PompeNative.post('haptic', pattern); return true; };
  true;
`;

type Msg = { type: string; payload?: unknown };

function haptic(pattern: unknown) {
  const total = Array.isArray(pattern) ? pattern.reduce((a: number, b: number) => a + b, 0) : Number(pattern) || 0;
  if (Array.isArray(pattern) && pattern.length >= 3) return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (total >= 60) return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  if (total >= 30) return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export default function App() {
  const [html, setHtml] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const web = useRef<WebView>(null);

  // Connexion Google / Apple : feuille sécurisée du système (Google refuse les WebView),
  // puis on rend la session au jeu via pompelup://auth#access_token=…
  const oauth = useCallback(async (payload: unknown) => {
    const { url, redirect } = (payload || {}) as { url?: string; redirect?: string };
    if (!url || !redirect) return;
    const res = await WebBrowser.openAuthSessionAsync(url, redirect).catch(() => null);
    const back = res && res.type === 'success' ? res.url : `${redirect}#error_description=${encodeURIComponent('Connexion annulée.')}`;
    web.current?.injectJavaScript(`window.PompeAuth && window.PompeAuth.fromRedirect(${JSON.stringify(back)}); true;`);
  }, []);

  useEffect(() => {
    (async () => {
      const [asset] = await Asset.loadAsync(require('./assets/web/index.html'));
      setHtml(await new File(asset.localUri ?? asset.uri).text());
    })().catch(() => setHtml('<p style="font:16px sans-serif;padding:40px">Impossible de charger Pompelup.</p>'));
  }, []);

  const onMessage = useCallback((e: WebViewMessageEvent) => {
    let msg: Msg;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'haptic') haptic(msg.payload).catch(() => {});
    if (msg.type === 'theme') setDark(msg.payload === 'dark');
    if (msg.type === 'oauth') oauth(msg.payload);
  }, [oauth]);

  return (
    <View style={styles.root}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      {html == null ? (
        <ActivityIndicator style={styles.loader} color="#F97316" />
      ) : (
        <WebView
          ref={web}
          style={styles.web}
          originWhitelist={['*']}
          source={{ html, baseUrl: ORIGIN }}
          injectedJavaScriptBeforeContentLoaded={BRIDGE}
          onMessage={onMessage}
          onLoadEnd={() => SplashScreen.hideAsync().catch(() => {})}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          domStorageEnabled
          javaScriptEnabled
          bounces={false}
          overScrollMode="never"
          setSupportMultipleWindows={false}
          allowsBackForwardNavigationGestures={false}
          textZoom={100}
          onShouldStartLoadWithRequest={req => {
            // Les liens externes s'ouvrent dans le navigateur, le jeu reste dans l'app
            if (req.url.startsWith(ORIGIN) || req.url.startsWith('about:') || req.url.startsWith('data:')) return true;
            if (req.isTopFrame !== false && req.navigationType === 'click') { Linking.openURL(req.url); return false; }
            return true;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF4EA' },
  web: { flex: 1, backgroundColor: '#FFF4EA' },
  loader: { flex: 1 },
});
