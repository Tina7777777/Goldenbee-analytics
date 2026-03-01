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

function normalizeHiveCode(value) {
  return String(value || '')
    .trim()
    .replaceAll(',', '.')
    .replace(/\s+/g, ' ');
}

function normalizeHivePayload({ code, notes }) {
  return {
    code: normalizeHiveCode(code),
    notes: String(notes || '').trim() || null
  };
}

export async function listHivesByApiary(apiaryId) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('hives')
    .select('*')
    .eq('apiary_id', apiaryId)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createHive({ apiary_id, code, notes }) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();
  const normalized = normalizeHivePayload({ code, notes });

  const { data, error } = await supabase
    .from('hives')
    .insert({
      apiary_id,
      owner_id: userId,
      ...normalized
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateHive(id, { code, notes }) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();
  const normalized = normalizeHivePayload({ code, notes });

  const { data, error } = await supabase
    .from('hives')
    .update(normalized)
    .eq('id', id)
    .eq('owner_id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteHive(id) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('hives')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId);

  if (error) {
    throw error;
  }
}