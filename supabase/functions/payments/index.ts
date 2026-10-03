// Pompelup — achat de jetons avec Stripe Checkout
//   { action: 'checkout', pack, returnUrl } → { url }   (page de paiement Stripe)
//   { action: 'confirm', sessionId }        → { paid }  (au retour, sans attendre le webhook)
import { PACKS, admin, stripe, markPaid } from '../_shared/stripe.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Retour uniquement vers une page web (https, ou localhost pour les tests)
function safeReturn(u: unknown) {
  try {
    const url = new URL(String(u));
    if (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) { url.hash = ''; url.search = ''; return url.toString(); }
  } catch (_) { /* invalide */ }
  return null;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!Deno.env.get('STRIPE_SECRET_KEY')) return json({ error: 'not_configured' }, 503);

  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await admin().auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: 'auth' }, 401);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch (_) { /* vide */ }

  try {
    if (body.action === 'checkout') {
      const packId = String(body.pack || ''), pack = PACKS[packId];
      const back = safeReturn(body.returnUrl);
      if (!pack) return json({ error: 'pack' }, 400);
      if (!back) return json({ error: 'return_url' }, 400);
      const p = new URLSearchParams({
        mode: 'payment',
        locale: 'fr',
        client_reference_id: user.id,
        success_url: `${back}?pay=ok&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${back}?pay=cancel`,
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][unit_amount]': String(pack.cents),
        'line_items[0][price_data][product_data][name]': pack.name,
        'metadata[user_id]': user.id,
        'metadata[pack_id]': packId,
        'metadata[coins]': String(pack.coins),
        'payment_intent_data[metadata][user_id]': user.id,
        'payment_intent_data[metadata][pack_id]': packId,
      });
      if (user.email) p.set('customer_email', user.email);
      const s = await stripe('checkout/sessions', { method: 'POST', body: p });
      const { error } = await admin().from('coin_purchases').insert({
        stripe_session_id: s.id, user_id: user.id, pack_id: packId, coins: pack.coins, amount_cents: pack.cents, currency: 'eur',
      });
      if (error) throw error;
      return json({ url: s.url });
    }

    if (body.action === 'confirm') {
      const id = String(body.sessionId || '');
      if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return json({ error: 'session' }, 400);
      const s = await stripe(`checkout/sessions/${id}`);
      if (s.client_reference_id !== user.id || s.metadata?.user_id !== user.id) return json({ error: 'forbidden' }, 403);
      return json({ paid: await markPaid(s) });
    }
    return json({ error: 'action' }, 400);
  } catch (e) {
    console.error('[payments]', e);
    return json({ error: 'stripe', message: String((e as Error)?.message || e) }, 502);
  }
});
