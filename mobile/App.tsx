import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, View } from 'react-native';
import { CastContext } from 'react-native-google-cast';
import ExternalDisplay, { useExternalDisplay } from 'react-native-external-display';
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
type Room = { code: string; url: string } | null;

// Caster comme Netflix : Google Cast (Chromecast, Google TV) et AirPlay (Apple TV).
// La télé ouvre la page « ?tv » du site et rejoint la salle comme écran géant.
const CAST_APP_ID = process.env.EXPO_PUBLIC_CAST_APP_ID || '';
const CAST_NS = 'urn:x-cast:app.pompelup.tv';

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
  const [room, setRoom] = useState<Room>(null);
  const roomRef = useRef<Room>(null);
  useEffect(() => { roomRef.current = room; }, [room]);
  // Écran externe (AirPlay / « Recopie de l'écran ») : on y affiche la vue télé au lieu du téléphone
  const screens = useExternalDisplay();
  const tvScreen = Object.keys(screens)[0];
  const say = useCallback((text: string) => {
    web.current?.injectJavaScript(`(function(){var t=document.getElementById('toast');if(t){t.textContent=${JSON.stringify(text)};t.classList.add('is-on');setTimeout(function(){t.classList.remove('is-on')},2600)}})(); true;`);
  }, []);

  // Une session Google Cast démarre : on envoie le code de la salle à la télé
  const sendRoom = useCallback(async (session: { addChannel: (ns: string) => Promise<{ sendMessage: (m: Record<string, unknown>) => Promise<void> }> }) => {
    const code = roomRef.current?.code;
    if (!code) return;
    try { const ch = await session.addChannel(CAST_NS); await ch.sendMessage({ code }); say('La salle s’affiche sur la télé 📺'); } catch { /* télé déconnectée */ }
  }, [say]);
  useEffect(() => {
    if (!CAST_APP_ID) return;
    const sm = CastContext.getSessionManager();
    const a = sm.onSessionStarted(s => { sendRoom(s as never); });
    const b = sm.onSessionResumed(s => { sendRoom(s as never); });
    return () => { a.remove(); b.remove(); };
  }, [sendRoom]);

  const castRoom = useCallback(async (payload: unknown) => {
    const r = payload as Room;
    if (!r?.code) return;
    setRoom(r);
    roomRef.current = r;
    const googleCast = async () => {
      const cur = await CastContext.getSessionManager().getCurrentCastSession().catch(() => null);
      if (cur) sendRoom(cur as never); else CastContext.showCastDialog().catch(() => {});
    };
    const airplay = () => Alert.alert('Apple TV (AirPlay)', 'Ouvre le Centre de contrôle (glisse depuis le coin en haut à droite), touche « Recopie de l’écran » puis ton Apple TV : la télé affichera la partie en grand, ton téléphone reste ta manette.');
    const buttons: { text: string; onPress?: () => void; style?: 'cancel' }[] = [];
    if (CAST_APP_ID) buttons.push({ text: 'Chromecast / Google TV', onPress: googleCast });
    if (Platform.OS === 'ios') buttons.push({ text: 'Apple TV (AirPlay)', onPress: airplay });
    else buttons.push({ text: 'Caster l’écran (Android)', onPress: () => Alert.alert('Caster l’écran', 'Ouvre les réglages rapides (glisse depuis le haut), touche « Caster l’écran » puis ta télé : elle affichera la partie en grand.') });
    buttons.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert('Afficher sur la télé', `Salle ${r.code}`, buttons);
  }, [sendRoom]);

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
    if (msg.type === 'cast') castRoom(msg.payload);
    if (msg.type === 'room') setRoom((msg.payload as Room) || null);
  }, [oauth, castRoom]);

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
      {room && tvScreen ? (
        <ExternalDisplay screen={tvScreen} style={styles.tv}>
          <WebView
            style={styles.tv}
            source={{ uri: `${room.url}&screen` }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            domStorageEnabled
            javaScriptEnabled
          />
        </ExternalDisplay>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF4EA' },
  web: { flex: 1, backgroundColor: '#FFF4EA' },
  loader: { flex: 1 },
  tv: { flex: 1, backgroundColor: '#150E33' },
});
