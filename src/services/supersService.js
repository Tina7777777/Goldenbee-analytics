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

export async function listSupersByHive(hiveId) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('supers')
    .select('*')
    .eq('hive_id', hiveId)
    .eq('owner_id', userId)
    .order('installed_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function installSuper({ hive_id, position, notes }) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('supers')
    .insert({
      hive_id,
      owner_id: userId,
      position,
      notes: String(notes || '').trim() || null
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function removeSuper(superId) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('supers')
    .update({ removed_at: new Date().toISOString() })
    .eq('id', superId)
    .eq('owner_id', userId)
    .is('removed_at', null)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
