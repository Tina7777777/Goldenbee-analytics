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

function toNullableText(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function toBoolean(value) {
  return Boolean(value);
}

function normalizeProfilePayload(payload = {}) {
  const normalized = {};

  if (Object.hasOwn(payload, 'display_name')) {
    normalized.display_name = toNullableText(payload.display_name);
  }

  if (Object.hasOwn(payload, 'about')) {
    normalized.about = toNullableText(payload.about);
  }

  if (Object.hasOwn(payload, 'location_text')) {
    normalized.location_text = toNullableText(payload.location_text);
  }

  if (Object.hasOwn(payload, 'contacts')) {
    normalized.contacts = toNullableText(payload.contacts);
  }

  if (Object.hasOwn(payload, 'is_public_profile')) {
    normalized.is_public_profile = toBoolean(payload.is_public_profile);
  }

  if (Object.hasOwn(payload, 'show_location')) {
    normalized.show_location = toBoolean(payload.show_location);
  }

  if (Object.hasOwn(payload, 'show_hive_count')) {
    normalized.show_hive_count = toBoolean(payload.show_hive_count);
  }

  if (Object.hasOwn(payload, 'show_contacts')) {
    normalized.show_contacts = toBoolean(payload.show_contacts);
  }

  return normalized;
}

function normalizeProfileId(profileId) {
  const normalized = String(profileId || '').trim();
  if (!normalized) {
    throw new Error('Profile id is required.');
  }

  return normalized;
}

export async function getMyProfile() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertMyProfile(payload = {}) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();
  const normalized = normalizeProfilePayload(payload);

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update(normalized)
    .eq('id', userId)
    .select('*')
    .maybeSingle();

  if (updateError) {
    throw updateError;
  }

  if (updatedProfile) {
    return updatedProfile;
  }

  const { data: insertedProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      ...normalized
    })
    .select('*')
    .single();

  if (insertError) {
    throw insertError;
  }

  return insertedProfile;
}

export async function getPublicProfiles() {
  ensureSupabaseClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name,about,location_text,contacts,public_hive_count,show_location,show_hive_count,show_contacts,is_public_profile')
    .eq('is_public_profile', true)
    .order('display_name', { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function adminUnpublishProfile(profileId) {
  ensureSupabaseClient();
  await getCurrentUserId();
  const normalizedProfileId = normalizeProfileId(profileId);

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_public_profile: false })
    .eq('id', normalizedProfileId)
    .eq('is_public_profile', true)
    .select('id,is_public_profile')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}