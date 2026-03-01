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

function toNullableNumber(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);
  return Number.isNaN(numericValue) ? null : numericValue;
}

export async function listInspectionsByHive(hiveId, limit = 5) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('owner_id', userId)
    .order('inspected_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createInspection(payload) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('inspections')
    .insert({
      hive_id: payload.hive_id,
      owner_id: userId,
      brood_frames: toNullableNumber(payload.brood_frames),
      honey_pollen_frames: toNullableNumber(payload.honey_pollen_frames),
      total_frames: toNullableNumber(payload.total_frames),
      eggs_present: Boolean(payload.eggs_present),
      queen_seen: Boolean(payload.queen_seen),
      swarming_state: String(payload.swarming_state || 'none'),
      important: Boolean(payload.important),
      notes: String(payload.notes || '').trim() || null
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteInspection(id) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('inspections')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId);

  if (error) {
    throw error;
  }
}
