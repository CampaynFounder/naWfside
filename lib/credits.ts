import { supabaseAdmin, isSupabaseConfigured } from './supabase/server';

export async function getCreditBalance(userId: string) {
  if (!isSupabaseConfigured) return 0;
  const { data, error } = await supabaseAdmin
    .from('credits_ledger')
    .select('amount')
    .eq('user_id', userId);
  if (error) throw error;
  const total = (data || []).reduce((s: number, row: any) => s + Number(row.amount), 0);
  return total;
}

export async function chargeCredits(userId: string, amount: number, reference?: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured; set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }
  const { error } = await supabaseAdmin.from('credits_ledger').insert({
    user_id: userId,
    amount: -Math.abs(amount),
    transaction_type: 'generation',
    reference_id: null
  });
  if (error) throw error;
  return true;
}

