// Pompelup — outils partagés pour les paiements Stripe (fonctions Edge Supabase)
import { createClient } from 'npm:@supabase/supabase-js@2';

// Les packs sont définis côté serveur : le client n'envoie que l'identifiant.
export const PACKS: Record<string, { coins: number; cents: number; name: string }> = {
  p500: { coins: 500, cents: 99, name: '500 jetons Pompelup' },
  p1200: { coins: 1200, cents: 199, name: '1 200 jetons Pompelup' },
  p3000: { coins: 3000, cents: 499, name: '3 000 jetons Pompelup' },
  p6500: { coins: 6500, cents: 999, name: '6 500 jetons Pompelup' },
  // Pass de saison Or (coins = 1 : ligne d'achat, pas des jetons ; encaissé par claim_pass_purchases)
  pass: { coins: 1, cents: 99, name: 'Pass de saison Or — Pompelup' },
};

export const admin = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

export async function stripe(path: string, init: { method?: string; body?: URLSearchParams } = {}) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method || 'GET',
    headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: init.body,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data;
}

// Session Checkout payée : on enregistre l'achat (idempotent, une ligne par session).
// La colonne « credited » n'est jamais touchée ici : seul claim_coin_purchases() la passe à vrai.
// deno-lint-ignore no-explicit-any
export async function markPaid(s: any) {
  if (s.payment_status !== 'paid') return false;
  const m = s.metadata || {}, pack = PACKS[m.pack_id];
  if (!m.user_id || !pack) return false;
  const { error } = await admin().from('coin_purchases').upsert({
    stripe_session_id: s.id, user_id: m.user_id, pack_id: m.pack_id, coins: pack.coins,
    amount_cents: s.amount_total ?? pack.cents, currency: s.currency || 'eur', status: 'paid', paid_at: new Date().toISOString(),
  }, { onConflict: 'stripe_session_id' });
  if (error) throw error;
  return true;
}
