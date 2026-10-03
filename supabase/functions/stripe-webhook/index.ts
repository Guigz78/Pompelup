// Pompelup — webhook Stripe : crédite les achats de jetons même si le joueur
// ferme la page avant le retour. Authentifié par la signature Stripe (pas de JWT).
import { markPaid } from '../_shared/stripe.ts';

const enc = new TextEncoder();
async function hmacHex(secret: string, msg: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function verify(payload: string, header: string, secret: string) {
  const parts = header.split(',').map(x => x.trim().split('='));
  const t = parts.find(([k]) => k === 't')?.[1];
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = await hmacHex(secret, `${t}.${payload}`);
  return sigs.some(s => safeEqual(s, expected));
}

Deno.serve(async req => {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret) return new Response('not configured', { status: 503 });
  const payload = await req.text();
  if (!(await verify(payload, req.headers.get('stripe-signature') || '', secret))) return new Response('bad signature', { status: 400 });
  const event = JSON.parse(payload);
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') await markPaid(event.data.object);
  } catch (e) {
    console.error('[stripe-webhook]', e);
    return new Response('error', { status: 500 });
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});
