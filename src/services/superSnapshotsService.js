import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
}

async function getCurrentUserId() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated.');
  }

  return userId;
}

function normalizeFullness(value) {
  return Number(String(value || '').trim().replaceAll(',', '.'));
}

export async function listSnapshotsBySuper(superId, limit = 5) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('super_snapshots')
    .select('*')
    .eq('super_id', superId)
    .eq('owner_id', userId)
    .order('snapshot_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createSnapshot({ super_id, honey_fullness, notes }) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('super_snapshots')
    .insert({
      super_id,
      owner_id: userId,
      honey_fullness: normalizeFullness(honey_fullness),
      notes: String(notes || '').trim() || null
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
