// Pompelup — Supabase integration
const SUPABASE_URL = 'https://bplagnxryyxqwumhrxco.supabase.co';
const SUPABASE_ANON = 'sb_publishable_ynAVmoK3cLsEX2UvPO2ltQ_jeVCQShY';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let _sbUser = null;
let _sbProfile = null;
let _roomChannel = null;
let _isHost = false;
let _roomPlayers = {};
let _onRoomEvent = null;

// ---- Auth ----
async function sbInit() {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    _sbUser = session.user;
    _sbProfile = await sbFetchProfile(_sbUser.id);
    if (!_sbProfile) await sbAutoCreateProfile(session.user);
  }
  sb.auth.onAuthStateChange(async (_e, session) => {
    _sbUser = session?.user || null;
    if (_sbUser && !_sbProfile) {
      _sbProfile = await sbFetchProfile(_sbUser.id);
      if (!_sbProfile) await sbAutoCreateProfile(_sbUser);
    }
  });
  return !!_sbUser;
}

async function sbAutoCreateProfile(user) {
  const base = user.user_metadata?.full_name?.split(' ')[0]
    || user.email?.split('@')[0]
    || 'Joueur';
  const seed = 'user' + Math.random().toString(36).slice(2, 6);
  for (let suffix of ['', Math.floor(Math.random()*9999), Math.floor(Math.random()*9999)]) {
    const username = base + suffix;
    const { error } = await sb.from('profiles').insert({ id: user.id, username, avatar_seed: seed });
    if (!error) { _sbProfile = await sbFetchProfile(user.id); return; }
  }
}

async function sbSignUp(email, password, username) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  _sbUser = data.user;
  if (_sbUser) {
    const seed = 'user' + Math.random().toString(36).slice(2, 6);
    const { error: pe } = await sb.from('profiles').insert({ id: _sbUser.id, username, avatar_seed: seed });
    if (pe) throw new Error(pe.message);
    _sbProfile = { id: _sbUser.id, username, avatar_seed: seed, level: 1, xp: 0, tokens: 100, wins: 0, games_played: 0 };
  }
}

async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  _sbUser = data.user;
  _sbProfile = await sbFetchProfile(_sbUser.id);
}

async function sbSignOut() {
  await sb.auth.signOut();
  _sbUser = null; _sbProfile = null;
}

async function sbSignInWithProvider(provider) {
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin }
  });
  if (error) throw new Error(error.message);
}

async function sbResetPassword(email) {
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });
  if (error) throw new Error(error.message);
}

async function sbFetchProfile(id) {
  const { data } = await sb.from('profiles').select('*').eq('id', id).single();
  return data;
}

async function sbSaveProfile(updates) {
  if (!_sbUser) return;
  await sb.from('profiles').update(updates).eq('id', _sbUser.id);
  if (_sbProfile) Object.assign(_sbProfile, updates);
}

async function sbSaveMatch(roomCode, score, rank, playersCount) {
  if (!_sbUser) return;
  try {
    await sb.from('match_history').insert({
      user_id: _sbUser.id, room_code: roomCode,
      score, rank, players_count: playersCount
    });
    const xpGain = Math.floor(score / 10) + (rank === 1 ? 100 : rank === 2 ? 50 : 20);
    await sbSaveProfile({
      xp: (_sbProfile?.xp || 0) + xpGain,
      games_played: (_sbProfile?.games_played || 0) + 1,
      wins: (_sbProfile?.wins || 0) + (rank === 1 ? 1 : 0)
    });
  } catch(e) { console.warn('sbSaveMatch:', e); }
}

function sbMyId() { return _sbUser?.id || null; }
function sbGetProfile() { return _sbProfile; }

function sbPlayerPayload(isHost) {
  const colors = ['#3B4FE8', '#22C55E', '#F472B6', '#F97316', '#8B5CF6', '#FBBF24'];
  const ci = _sbUser
    ? Math.abs([..._sbUser.id].reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length
    : 0;
  return {
    id: _sbUser?.id || ('guest-' + Date.now()),
    name: _sbProfile?.username || 'Joueur',
    avatar: _sbProfile?.avatar_seed || 'guest',
    level: _sbProfile?.level || 1,
    color: colors[ci],
    isHost: !!isHost
  };
}

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ---- Room management ----
function _setupChannel(code, selfMode) {
  if (_roomChannel) {
    try { _roomChannel.unsubscribe(); } catch(e) {}
    _roomChannel = null;
  }
  _roomPlayers = {};
  _roomChannel = sb.channel('room:' + code, { config: { broadcast: { self: selfMode } } });
  _roomChannel
    .on('broadcast', { event: 'join' }, ({ payload }) => {
      _roomPlayers[payload.p.id] = payload.p;
      _onRoomEvent?.('join', payload.p);
    })
    .on('broadcast', { event: 'leave' }, ({ payload }) => {
      const leaving = _roomPlayers[payload.id];
      delete _roomPlayers[payload.id];
      _onRoomEvent?.('leave', leaving || { id: payload.id });
    })
    .on('broadcast', { event: 'chat' }, ({ payload }) => {
      _onRoomEvent?.('chat', payload);
    })
    .on('broadcast', { event: 'sound' }, ({ payload }) => {
      _onRoomEvent?.('sound', payload);
    })
    .on('broadcast', { event: 'sync' }, ({ payload }) => {
      _onRoomEvent?.('sync', payload);
    })
    .on('broadcast', { event: 'game' }, ({ payload }) => {
      _onRoomEvent?.('game', payload);
    });
}

function sbCreateRoom(code, onEvent) {
  _isHost = true;
  _onRoomEvent = onEvent;
  _setupChannel(code, false);
  _roomChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const me = sbPlayerPayload(true);
      _roomPlayers[me.id] = me;
      await _roomChannel.send({ type: 'broadcast', event: 'join', payload: { p: me } });
      onEvent('ready', null);
    }
  });
}

function sbJoinRoom(code, onEvent) {
  _isHost = false;
  _onRoomEvent = onEvent;
  _setupChannel(code, false);
  _roomChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const me = sbPlayerPayload(false);
      _roomPlayers[me.id] = me;
      await _roomChannel.send({ type: 'broadcast', event: 'join', payload: { p: me } });
      onEvent('ready', null);
    }
  });
}

async function sbBroadcast(event, payload) {
  if (!_roomChannel) return;
  return _roomChannel.send({ type: 'broadcast', event, payload });
}

function sbLeaveRoom() {
  if (_roomChannel) {
    try {
      const me = sbPlayerPayload();
      _roomChannel.send({ type: 'broadcast', event: 'leave', payload: { id: me.id } });
      _roomChannel.unsubscribe();
    } catch(e) {}
    _roomChannel = null;
  }
  _isHost = false;
  _roomPlayers = {};
  _onRoomEvent = null;
}

function sbRoomPlayers() { return Object.values(_roomPlayers); }
function sbIsHost() { return _isHost; }
function sbHasRoom() { return !!_roomChannel; }
