# CLAUDE.md — Pompelup

> Ce fichier est lu automatiquement par Claude Code à chaque session. Il contient tout ce qu'il faut savoir pour coder Pompelup sans poser de questions inutiles.

---

## 🎯 C'est quoi Pompelup ?

Application web de **blind test musical gamifié**, multijoueur, temps réel. Pense Gartic Phone + Kahoot + Pokémon TCG.

- Les joueurs devinent des extraits audio (titres/artistes)
- Ils collectionnent des vinyles (loot boxes musicales)
- Ils montent en niveau, font des tournois, déblokkent un passe de combat
- Plusieurs modes de jeu : Classic, Tune Rush (enchères), Piste par Piste (stems)

**Cible** : 18–40 ans, mobile-first, soirées entre amis.

---

## 🏗️ Stack — NE PAS DÉVIER

| Couche | Techno | Note |
|---|---|---|
| Frontend | HTML + CSS + JS **vanilla** | Pas de React, pas de Vue |
| Backend | **Node.js + Express** | Serveur HTTP + API REST |
| Temps réel | **Socket.io** | Jeu en direct, rooms |
| BDD | **SQLite** (dev) → PostgreSQL (prod) | `better-sqlite3` |
| Auth | **Google OAuth 2.0 + JWT** | Pas de bcrypt, pas d'email/password |
| Audio | **Firebase Storage** (MP3) | Les extraits sont hébergés là |
| Paiement | **Stripe** | Abo 3,99€/mois + in-app |
| Animations | **GSAP 3** via CDN | `https://cdn.jsdelivr.net/npm/gsap@3` |
| Avatars | **DiceBear Big Smile** | `https://api.dicebear.com/9.x/big-smile/svg?seed=NAME` |
| Spotify/Deezer | Analyse préférences **uniquement** | PAS pour la lecture audio |
| Fonts | **Bebas Neue** (display) + **Space Grotesk** (corps) | Google Fonts |

> ⚠️ Firebase Storage = uniquement pour les fichiers MP3. Pas de Firestore, pas d'auth Firebase, pas de SDK Firebase côté client. Juste les URLs publiques des fichiers audio.

---

## 📁 Structure du projet

```
pompelup/
├── server.js              ← Backend principal (Express + Socket.io)
├── package.json
├── .env                   ← Secrets (voir section variables d'env)
├── db/
│   └── database.js        ← Connexion SQLite / PostgreSQL
├── routes/
│   ├── auth.js            ← Google OAuth callback + JWT
│   ├── packs.js           ← Collection, ouverture packs, pack quotidien
│   └── payment.js         ← Stripe abonnement + achats in-app
├── data/
│   ├── packs.json         ← Catalogue des packs de vinyles
│   └── seasons.json       ← Saisons du passe de combat
└── public/
    ├── index.html         ← Homepage (GSAP, palette chaude, vinyles)
    ├── auth-callback.html ← Retour Google OAuth
    ├── lobby.html         ← Salle d'attente
    ├── vote.html          ← Vote catégorie
    ├── game.html          ← Jeu en cours
    ├── profile.html       ← Profil + collection
    ├── battlepass.html    ← Passe de combat
    ├── collection.html    ← Vinyles débloqués
    ├── css/
    │   └── style.css      ← Styles responsive, mobile-first
    └── js/
        ├── particles.js   ← Canvas notes de musique flottantes
        ├── home.js        ← Animations GSAP homepage
        ├── auth.js        ← JWT + Google OAuth + invité
        ├── lobby.js       ← Lobby + vote catégorie
        ├── game.js        ← Audio Firebase + émotes + jokers
        ├── profile.js     ← Collection + pack opening
        └── payment.js     ← Stripe checkout
```

---

## 🗄️ Schéma Base de Données

```sql
-- Joueurs (uniquement comptes Google — les invités ne sont PAS en BDD)
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id     TEXT UNIQUE NOT NULL,
  username      TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  google_avatar TEXT DEFAULT '',
  avatar_seed   TEXT DEFAULT '',
  avatar_opts   TEXT DEFAULT '{}',
  avatar_img    TEXT DEFAULT '',        -- base64 si photo perso
  xp            INTEGER DEFAULT 0,
  level         INTEGER DEFAULT 1,
  season_xp     INTEGER DEFAULT 0,
  season_pass   INTEGER DEFAULT 0,     -- 0=gratuit, 1=premium
  tokens        INTEGER DEFAULT 20,    -- monnaie virtuelle (jetons 🎤)
  streak_days   INTEGER DEFAULT 0,
  last_login    DATE DEFAULT NULL,
  last_daily    DATE DEFAULT NULL,
  friend_code   TEXT UNIQUE,           -- format: PSEUDO#XXXX
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chansons débloquées par joueur
CREATE TABLE user_songs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  song_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  artist      TEXT NOT NULL,
  audio_url   TEXT NOT NULL,           -- URL Firebase Storage
  album_art   TEXT,
  rarity      TEXT DEFAULT 'common',   -- common/uncommon/rare/legendary
  pack_id     TEXT,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Packs à ouvrir (en attente)
CREATE TABLE user_packs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  pack_id   TEXT NOT NULL,
  source    TEXT DEFAULT 'daily',      -- daily/reward/purchase/starter
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Passe de combat — récompenses réclamées
CREATE TABLE battlepass_claimed (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
  season_id  TEXT NOT NULL,
  tier       INTEGER NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, season_id, tier)
);

-- Saisons
CREATE TABLE seasons (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  theme      TEXT,
  start_date DATETIME NOT NULL,
  end_date   DATETIME NOT NULL,
  is_active  INTEGER DEFAULT 0
);

-- Paiements Stripe
CREATE TABLE payments (
  id                TEXT PRIMARY KEY,   -- Stripe payment intent ID
  user_id           INTEGER REFERENCES users(id),
  amount_cents      INTEGER NOT NULL,
  currency          TEXT DEFAULT 'eur',
  status            TEXT DEFAULT 'pending',
  stripe_customer   TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Amis
CREATE TABLE friendships (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id),
  friend_id  INTEGER REFERENCES users(id),
  status     TEXT DEFAULT 'pending',   -- pending/accepted/blocked
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id)
);

-- Événements (saisonniers, tournois, défis communautaires)
CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,           -- seasonal/tournament/community
  name        TEXT NOT NULL,
  description TEXT,
  start_date  DATETIME NOT NULL,
  end_date    DATETIME NOT NULL,
  is_active   INTEGER DEFAULT 0,
  config      TEXT DEFAULT '{}'        -- JSON params spécifiques
);

-- Inscriptions tournois
CREATE TABLE tournament_registrations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id      TEXT REFERENCES events(id),
  user_id       INTEGER REFERENCES users(id),
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contributions défis communautaires
CREATE TABLE community_contributions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id   TEXT REFERENCES events(id),
  user_id    INTEGER REFERENCES users(id),
  amount     INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentification

### Deux modes
- **Invité** : token temporaire en `sessionStorage` (expire 24h), peut jouer immédiatement, rien sauvegardé en BDD
- **Google** : OAuth 2.0 → JWT signé → `localStorage` (7 jours)

### Flow Google OAuth
```
1. GET /auth/google → redirect Google consent screen
   params: client_id, redirect_uri, response_type=code, scope=openid email profile

2. Google callback → GET /auth/google/callback?code=xxx
   Server: POST https://oauth2.googleapis.com/token
   → reçoit { access_token, id_token }

3. Server décode id_token → { sub, email, name, picture }
4. find_or_create user en BDD (google_id = sub)
   Si nouveau → pack Starter automatiquement ajouté
5. Server génère JWT: { userId, name, type:'google' } signé JWT_SECRET (7j)
6. Redirect → /auth-callback.html?token=JWT
7. Client: localStorage.setItem('pompelup_token', token)
```

### Token invité (client-side)
```javascript
// Généré côté client uniquement
const guestToken = {
  type: 'guest',
  name: pseudo,
  avatarSeed: seed,
  exp: Date.now() + 24 * 60 * 60 * 1000
};
sessionStorage.setItem('pompelup_guest', JSON.stringify(guestToken));
```

---

## 🔌 Socket.io — Événements complets

### Mode Classic

**Client → Serveur**
| Événement | Payload | Description |
|---|---|---|
| `create_room` | `{ playerName, avatarSeed, gameMode }` | Créer une salle |
| `join_room` | `{ playerName, avatarSeed, roomCode }` | Rejoindre |
| `vote_category` | `{ category }` | Voter catégorie |
| `start_game` | — | Hôte lance |
| `submit_answer` | `{ answer }` | Réponse joueur |
| `use_joker` | `{ jokerId }` | Utiliser un joker |
| `skip_round` | — | Hôte passe manche |
| `send_emote` | `{ emoteId }` | Envoyer une émote |

**Serveur → Client**
| Événement | Payload | Description |
|---|---|---|
| `room_created` | `{ roomCode, player, room }` | Confirmation |
| `room_joined` | `{ roomCode, player, room }` | Confirmation |
| `player_joined` | `{ player, players }` | Broadcast |
| `player_left` | `{ playerId, players, newHost }` | Déconnexion |
| `vote_update` | `{ votes }` | Votes temps réel |
| `category_selected` | `{ category }` | Catégorie gagnante |
| `game_started` | `{ totalRounds, mode }` | Partie lancée |
| `round_start` | `{ round, total, audioUrl, duration }` | Manche |
| `joker_effect` | `{ jokerId, data }` | Effet joker broadcast |
| `answer_result` | `{ correct, partial, points }` | Résultat (privé) |
| `player_correct` | `{ playerName, points, scores }` | Broadcast correct |
| `emote_received` | `{ playerId, emoteId }` | Émote broadcast |
| `round_end` | `{ song, scores, results }` | Fin manche |
| `xp_earned` | `{ xp, breakdown, newLevel }` | XP gagné (privé) |
| `game_over` | `{ podium }` | Fin partie |
| `room_error` | `{ message }` | Erreur |

### Mode Tune Rush — Événements supplémentaires

**Client → Serveur**
| Événement | Payload | Description |
|---|---|---|
| `place_bid` | `{ seconds }` | Enchérir |
| `pass_bid` | — | Abandonner enchère |
| `submit_rush_answer` | `{ answer }` | Réponse gagnant enchère |
| `challenge_answer` | `{ answer }` | Tentative des autres si gagnant échoue |

**Serveur → Client**
| Événement | Payload | Description |
|---|---|---|
| `bid_phase_start` | `{ round, total, category }` | Phase enchère |
| `bid_update` | `{ bids, currentLowest, timeLeft }` | État temps réel |
| `bid_won` | `{ playerId, playerName, seconds }` | Gagnant annoncé |
| `rush_audio_start` | `{ audioUrl, duration }` | Extrait joué |
| `rush_correct` | `{ playerName, points, answer }` | Gagnant a réussi |
| `rush_failed` | `{ playerName, penalty }` | Gagnant a échoué |
| `challenge_open` | `{ duration: 10 }` | Les autres tentent |

### Mode Piste par Piste — Événements supplémentaires

**Client → Serveur**
| Événement | Payload | Description |
|---|---|---|
| `submit_stem_answer` | `{ answer, currentLayer }` | Réponse + couche en cours |
| `use_stem_joker` | `{ jokerId }` | Joker (skip/replay/indice) |

**Serveur → Client**
| Événement | Payload | Description |
|---|---|---|
| `stem_round_start` | `{ round, total, layerUrls }` | Début + URLs pré-chargées |
| `layer_reveal` | `{ layer, stemName, audioUrl }` | Nouvelle piste révélée |
| `stem_correct` | `{ player, layer, points }` | Joueur a trouvé |
| `stem_round_end` | `{ song, results, scores }` | Fin manche |

---

## 🎮 Logique de jeu — Algorithmes clés

### Fuzzy matching des réponses

```javascript
function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // accents
    .replace(/[^a-z0-9\s]/g, '')                        // ponctuation
    .replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.9;
  // Levenshtein
  const al = a.length, bl = b.length;
  const mat = Array.from({length: bl + 1}, (_, i) =>
    Array.from({length: al + 1}, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= bl; i++)
    for (let j = 1; j <= al; j++)
      mat[i][j] = b[i-1] === a[j-1]
        ? mat[i-1][j-1]
        : 1 + Math.min(mat[i-1][j], mat[i][j-1], mat[i-1][j-1]);
  return 1 - mat[bl][al] / Math.max(al, bl, 1);
}

function checkAnswer(answer, song) {
  const sim = Math.max(
    similarity(answer, song.title),
    similarity(answer, song.artist),
    similarity(answer, `${song.title} ${song.artist}`)
  );
  if (sim >= 0.78) return { correct: true, points: calcPoints() };
  if (sim >= 0.50) return { correct: false, partial: true };
  return { correct: false, partial: false };
}
```

### Calcul des points (mode Classic)
```javascript
function calcPoints(position, timeLeft, totalTime = 30) {
  const base = position === 1 ? 1000 : position === 2 ? 700 : 500;
  const timeBonus = Math.floor((timeLeft / totalTime) * 400);
  return base + timeBonus;
}
```

### Courbe XP
```javascript
function xpRequired(level) {
  return Math.floor(150 * Math.pow(level, 1.6));
}
// Nv1→2: 150 XP | Nv10→11: ~3500 XP | Nv50→51: ~25000 XP
```

### Barème Tune Rush
```javascript
const RUSH_POINTS = { 15: 300, 10: 500, 7: 700, 5: 900, 3: 1200, 1: 2000 };
// Pénalité si mauvaise réponse : -50% du potentiel
```

### Barème Piste par Piste
```javascript
const STEM_POINTS = [2000, 1500, 1000, 700, 400, 200];
// index 0 = batterie seule, index 5 = mix complet
```

### Génération code salle
```javascript
function genCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}
```

### Code ami
```javascript
function genFriendCode(username) {
  const suffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${username.slice(0, 10)}#${suffix}`;
}
```

---

## 🎨 Design System — Respecter à la lettre

### Palette CSS

```css
:root {
  --bg-main:      #FAD9C1;   /* Pêche/corail — fond principal */
  --bg-card:      #FFFFFF;   /* Blanc — cartes */
  --bg-dark:      #1a1a2e;   /* Foncé — sections contrastées */

  --orange:       #F97316;   /* Accent principal — énergie */
  --blue-primary: #3B4FE8;   /* Bouton "Jouer" */
  --blue-dark:    #1e3a8a;   /* Sections info */
  --yellow:       #FBBF24;   /* XP, badges, récompenses */
  --green:        #22C55E;   /* Succès, correct */
  --red:          #EF4444;   /* Erreur, timer danger */

  --text-dark:    #1a1a1a;
  --text-white:   #FFFFFF;
  --text-muted:   #6B7280;

  --radius-card:  24px;
  --radius-btn:   16px;
  --shadow-soft:  0 4px 20px rgba(0,0,0,0.08);
}
```

### Règles visuelles OBLIGATOIRES
- ❌ Pas de dark/neon — palette chaude et joyeuse
- ✅ `border-radius` généreux (24px+ sur les cards)
- ✅ Ombres douces (pas de glow néon)
- ✅ Typographie bold, lisible en situation de jeu rapide
- ✅ Cartes vinyle : partie noire en haut (silhouette vinyle), illustration colorée par catégorie
- ✅ Mobile-first — tout doit fonctionner sur 375px de largeur

### Moodboard de référence
- Brawl Stars / Clash Royale — dynamique, coloré
- Kahoot — simple, ludique
- Gartic Phone — décontracté, participatif
- Pokémon TCG — ouverture de packs, rareté

### Animations GSAP (homepage)
```javascript
// Séquence d'entrée
0ms    → fond pêche (#FAD9C1) s'étale
200ms  → card profil glisse depuis le haut
500ms  → badge XP rebondit (scale 0 → 1.2 → 1)
700ms  → section vinyles en stagger (gauche → droite)
1000ms → bouton JOUER pulse une fois
1200ms → catégories scrollent en boucle horizontale lente
∞      → notes de musique flottent sur canvas
```

---

## 👤 Avatars — DiceBear Big Smile

```javascript
// URL de génération
function getAvatarUrl(seed, options = {}) {
  const params = new URLSearchParams({
    seed,
    size: 96,
    radius: 50,
    backgroundColor: 'b6e3f4,ffd5dc,c0aede',
    ...options
  });
  return `https://api.dicebear.com/9.x/big-smile/svg?${params}`;
}

// Options disponibles :
// eyes: angry, cheery, confused, normal, sad, sleepy, starstruck, winking
// hair: bangs, braids, mohawk, ...
// mouth: awkwardSmile, braces, gapSmile, kawaii, ...
// accessories: catEars, sunglasses, mustache, ...
```

- **Grille** : 9 avatars générés au chargement (seeds aléatoires)
- **Regénérer** : nouvelle grille (animation shuffle GSAP)
- **Photo perso** : `<input type="file">` → crop circulaire canvas 96×96px → base64

---

## 🎁 Packs de Vinyles

| Pack | Rareté | Contenu |
|---|---|---|
| Starter 🎵 | Gratuit | 3 communes |
| Années 80 📼 | Commun | 4 chansons |
| Pop FR 🇫🇷 | Commun | 4 chansons |
| Rap Gold 🏅 | Rare | 4 chansons |
| Hits du Moment 🔥 | Rare | 5 chansons |
| Légendes 👑 | Légendaire | 3 chansons |
| Mystère ❓ | Légendaire | 5 aléatoires |

### Raretés des chansons
```
⚪ Commune     60% des drops
🔵 Peu commune 25%
🟣 Rare        12%
🟡 Légendaire   3%
```

### Animation d'ouverture (GSAP)
1. Pochette tremble (anticipation)
2. Clic → déchirure + particules canvas
3. Vinyles s'élèvent un par un, rotation 3D (`rotationY`)
4. Chaque vinyle révèle la jaquette (flip)
5. Titre + artiste en effet "scramble" (lettres qui se forment)
6. Flash couleur selon rareté (blanc → violet → or)
7. Vinyles rejoignent la collection en arc GSAP MotionPath

---

## 🃏 Jokers

| Joker | Effet | Coût |
|---|---|---|
| 🎵 Indice tempo | Révèle BPM + décennie | 1 🎤 |
| 🔤 Première lettre | Révèle 1ère lettre du titre | 1 🎤 |
| 🎤 Artiste offert | Révèle le nom de l'artiste | 2 🎤 |
| ⏱️ +10 secondes | Ajoute 10s au timer | 1 🎤 |
| 🚫 Passe-droit | Skip manche sans pénalité | 2 🎤 |
| 👀 Espion | Voit la réponse d'un joueur | 3 🎤 |

- Max **2 jokers par manche** par joueur
- Jokers interdits pendant la phase d'enchère Tune Rush
- Jokers exclusifs Piste par Piste : ⏩ Skip piste · 🔁 Replay · 💡 Indice genre

---

## 🎤 Monnaie Virtuelle (Jetons)

### Gains
| Action | Jetons |
|---|---|
| Trouver une chanson | +2 🎤 |
| Finir 1er | +10 🎤 |
| Connexion quotidienne | +5 🎤 |
| Ouvrir un pack | +3 🎤 |
| Compléter un défi du jour | +15 🎤 |
| Regarder une pub | +2 🎤 |

### Dépenses (jetons)
- Joker 1-3 🎤 selon le type
- Pack Commun : 50 🎤
- Pack Rare : 150 🎤
- Pack Légendaire : 400 🎤

### Achat in-app (Stripe)
```
100 🎤  →  0,99€
300 🎤  →  2,49€
700 🎤  →  4,99€
2000 🎤 →  9,99€
```

---

## ⭐ Système XP & Niveaux

### Sources d'XP
| Action | XP |
|---|---|
| Participer jusqu'au bout | +50 |
| Trouver une chanson | +30 |
| Trouver en 1er | +50 bonus |
| Trouver en < 5 secondes | +40 bonus |
| Trouver 100% des chansons | +100 bonus |
| Finir 1er | +150 |
| Finir 2ème | +80 |
| Finir 3ème | +40 |
| Connexion quotidienne | +20 |
| Ouvrir un pack | +15 |
| Streak 3 jours | ×1.5 multiplicateur |
| Streak 7 jours | ×2.0 multiplicateur |

### Multiplicateurs XP par mode
| Mode | Multiplicateur |
|---|---|
| Classic | ×1 |
| Tune Rush Duel | ×1.5 |
| Tune Rush Équipe | ×1.2 |
| Tune Rush Battle Royale | ×2 |
| Tune Rush Tournoi | ×3 |
| Piste par Piste | ×1.8 |

---

## 🎫 Passe de Combat (Groovy Pass)

- **50 niveaux** par saison (6 semaines)
- **Free tier** : récompenses basiques (jetons, packs communs)
- **Premium** (3,99€/mois Stripe) : packs rares, skins exclusifs, émotes, badges
- Saisons thématiques : "Boogie Woogie" (juin), "Summer Vibes" (été), etc.
- XP saisonnière ≠ XP globale (la saison reset, le niveau global non)

---

## 👥 Système d'Amis

- Code ami format `PSEUDO#XXXX` (ex: `Guigz#4821`)
- Lien universel : `https://pompelup.app/add/PSEUDO#XXXX`
- Inviter en partie via Socket.io `invite_friend`
- Demande d'ami → notification push

---

## 🎉 Événements

3 types :
1. **Saisonniers** : catalogue temporaire thématique (Noël, Été, Halloween…)
2. **Tournois** : bracket 8/16/32 joueurs, inscriptions J-3 à J-1
3. **Défis communautaires** : objectif collectif avec compteur temps réel (Socket.io)

---

## 🎛️ Mode Piste par Piste — Technique

Les chansons sont séparées en stems avec **Demucs** (Meta, open-source) :
```bash
demucs "chanson.mp3"
# → drums.wav, bass.wav, piano.wav, guitar.wav, vocals.wav
```

On génère des **fichiers cumulatifs pré-mixés** avec PyDub :
```
layer_1.mp3 = drums seul
layer_2.mp3 = drums + bass
layer_3.mp3 = drums + bass + piano
layer_4.mp3 = drums + bass + piano + guitar
layer_5.mp3 = drums + bass + piano + guitar + vocals
layer_6.mp3 = mix complet
```

Stockés dans Firebase Storage :
```
gs://pompelup.appspot.com/songs/{song_id}/layer_{1-6}.mp3
```

Données Firestore song :
```json
{
  "stems_available": ["drums", "bass", "piano", "guitar", "vocals"],
  "layer_urls": { "1": "...", "2": "...", "3": "...", "4": "...", "5": "...", "6": "..." },
  "stem_mode_compatible": true
}
```

Le client **preload toutes les URLs** en début de manche → pas de latence à chaque révélation.

---

## 💳 Stripe

- **Abonnement** : 3,99€/mois (Groovy Pass Premium)
- **Achats in-app** : jetons (0,99€ → 9,99€)
- Variables : `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Tester : `stripe listen --forward-to localhost:3000/api/payment/webhook`

---

## 🔑 Variables d'environnement (.env)

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=une_chaine_longue_et_aleatoire_minimum_32_chars

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Spotify (préférences uniquement)
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

# App
PORT=3000
NODE_ENV=development
```

---

## 📦 package.json — Dépendances

```json
{
  "name": "pompelup",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "better-sqlite3": "^9.0.0",
    "jsonwebtoken": "^9.0.0",
    "axios": "^1.6.0",
    "uuid": "^9.0.0",
    "stripe": "^14.0.0",
    "dotenv": "^16.0.0",
    "multer": "^1.4.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

---

## 🚀 Lancer le projet

```bash
cd pompelup
npm install
npm run dev
# → http://localhost:3000
```

---

## 🧭 Navigation — SPA-like avec GSAP

Les pages sont des **fichiers HTML séparés** mais les transitions sont fluides via GSAP (pas de rechargement brutal). Chaque changement de page = slide/fade animé.

```javascript
// Transition de sortie (avant navigation)
function navigateTo(url) {
  gsap.to('#app', {
    opacity: 0,
    y: -20,
    duration: 0.3,
    onComplete: () => window.location.href = url
  });
}

// Transition d'entrée (au chargement de la page)
document.addEventListener('DOMContentLoaded', () => {
  gsap.from('#app', { opacity: 0, y: 20, duration: 0.4, ease: 'power2.out' });
});
```

L'élément `#app` est le wrapper principal de chaque page. Chaque HTML a son propre `#app`.

---

## 🎨 Ambiance Visuelle par Mode de Jeu

Chaque mode a ses propres variables CSS activées via une classe sur `<body>` :

```css
/* Mode Classic (défaut) */
body.mode-classic {
  --game-bg:      #FAD9C1;   /* pêche chaud */
  --game-accent:  #F97316;   /* orange */
  --game-card:    #FFFFFF;
}

/* Mode Tune Rush — tension, compétition */
body.mode-tune-rush {
  --game-bg:      #1a1a2e;   /* fond sombre */
  --game-accent:  #EF4444;   /* rouge vif */
  --game-card:    #16213e;
}

/* Mode Piste par Piste — mystérieux, musical */
body.mode-stem {
  --game-bg:      #1e1b4b;   /* fond indigo foncé */
  --game-accent:  #8B5CF6;   /* violet */
  --game-card:    #2d2a5e;
}
```

Ajout de la classe au chargement de `game.html` :
```javascript
document.body.classList.add(`mode-${gameMode}`); // classic / tune-rush / stem
```

---

## 🔌 Reconnexion Socket.io (30 secondes)

Si un joueur se déconnecte en pleine partie, il a **30 secondes** pour revenir.

```javascript
// Côté serveur — server.js
io.on('disconnect', (socket) => {
  const player = findPlayerBySocket(socket.id);
  if (!player || !player.roomCode) return;

  player.disconnected = true;
  player.disconnectTimer = setTimeout(() => {
    // Éjecte définitivement après 30s
    removePlayerFromRoom(player);
    io.to(player.roomCode).emit('player_left', {
      playerId: player.id,
      players: getRoomPlayers(player.roomCode),
      newHost: getNewHost(player.roomCode)
    });
  }, 30_000);

  // Notifier les autres
  io.to(player.roomCode).emit('player_disconnected', {
    playerId: player.id,
    playerName: player.name,
    reconnectWindow: 30
  });
});

// À la reconnexion
socket.on('rejoin_room', ({ roomCode, playerId }) => {
  const player = findPlayerById(playerId);
  if (player && player.disconnected) {
    clearTimeout(player.disconnectTimer);
    player.disconnected = false;
    player.socketId = socket.id;
    socket.join(roomCode);
    socket.emit('rejoin_success', { room: getRoom(roomCode), player });
    io.to(roomCode).emit('player_reconnected', { playerId, playerName: player.name });
  }
});
```

**Règles :**
- Si l'hôte déconnecte → nouveau host attribué automatiquement au 1er joueur resté
- Score conservé intégralement à la reconnexion
- Si la manche en cours se termine pendant la déconnexion → 0 pts pour cette manche
- UI côté client : indicateur visuel `⏳ Guigz reconnecte...` sur les scores

---

## 🎮 Écran de Jeu — Layout (improvisation dans le style Kahoot/Brawl Stars)

```
┌────────────────────────────────────┐
│  Manche 3/10  ·  ⏱ 24s  [timer]  │  ← header (sticky)
├────────────────────────────────────┤
│                                    │
│   ████ ██ ███ ██ ████ ██ ███ ████  │  ← visualiseur barres (fake, canvas)
│                                    │
│         Points dispo : 1 000       │  ← décroit en temps réel
│                                    │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │  Titre ou artiste ?          │  │  ← input focus automatique
│  └──────────────────────────────┘  │
│         [ Valider → ]              │
├────────────────────────────────────┤
│  🟠 Guigz    1 840  ✅             │  ← scores temps réel (compact)
│  🔵 Cath     1 200                 │
│  🟢 Jules      750                 │
├────────────────────────────────────┤
│  [🔥] [😭] [🤯] [👀] [💀] [👏]   │  ← barre émotes (fixe en bas)
│  [Jokers ▲]                        │
└────────────────────────────────────┘
```

**Feedback réponse :**
- ✅ Correct → flash vert + confettis + `+1 000 pts` flottant animé GSAP
- ❌ Faux → shake horizontal de l'input (`gsap.to(input, { x: [-8,8,-6,6,0] })`)
- 🟡 Partiel → input bordure orange + message "Tu brûles… 🔥"

---

## ⚠️ Règles absolues — NE PAS VIOLER

1. **Pas de framework frontend** — HTML/CSS/JS vanilla uniquement
2. **Pas de Firebase côté client** — juste des URLs Firebase Storage en strings dans la BDD
3. **Audio via `<audio>` HTML** — pas d'iframe YouTube, pas de SDK tiers
4. **Mobile-first** — chaque composant pensé 375px d'abord
5. **Palette chaude** — fond pêche `#FAD9C1`, PAS dark neon
6. **GSAP via CDN** — pas de npm gsap
7. **Invités sans BDD** — `sessionStorage` uniquement, jamais en base
8. **JWT signé côté serveur** — jamais généré côté client pour les comptes Google
9. **Fuzzy matching côté serveur** — les réponses ne sont jamais validées côté client
10. **Seuil de similarité : 0.78** pour "correct", **0.50** pour "partiel"
11. **Navigation SPA-like** — toujours passer par `navigateTo(url)` avec fade GSAP, jamais `window.location.href` brut
12. **Classe body par mode** — `mode-classic` / `mode-tune-rush` / `mode-stem` sur `<body>` dans game.html
13. **Reconnexion 30s** — `player.disconnected = true` + `setTimeout 30_000` côté serveur, jamais éjecter immédiatement
