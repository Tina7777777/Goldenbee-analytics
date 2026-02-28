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

function normalizeApiaryPayload({ name, location_text, notes }) {
  return {
    name: String(name || '').trim(),
    location_text: String(location_text || '').trim() || null,
    notes: String(notes || '').trim() || null
  };
}

export async function listMyApiaries() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('apiaries')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getApiaryById(id) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('apiaries')
    .select('*')
    .eq('id', id)
    .eq('owner_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createApiary(payload) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();
  const normalized = normalizeApiaryPayload(payload);

  const { data, error } = await supabase
    .from('apiaries')
    .insert({
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

export async function updateApiary(id, payload) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();
  const normalized = normalizeApiaryPayload(payload);

  const { data, error } = await supabase
    .from('apiaries')
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

export async function deleteApiary(id) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('apiaries')
    .delete()
    .eq('id', id)
    .eq('owner_id', userId);

  if (error) {
    throw error;
  }
}