import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

const PUBLIC_PROFILES_CACHE_TTL_MS = 45_000;

let publicProfilesCache = {
  data: null,
  expiresAt: 0
};
let publicProfilesRequestPromise = null;

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

function clonePublicProfiles(profiles) {
  return (profiles || []).map((profile) => ({ ...profile }));
}

function clearPublicProfilesCache() {
  publicProfilesCache = {
    data: null,
    expiresAt: 0
  };
}

function getCachedPublicProfiles() {
  const now = Date.now();
  if (!publicProfilesCache.data || publicProfilesCache.expiresAt <= now) {
    return null;
  }

  return clonePublicProfiles(publicProfilesCache.data);
}

function setCachedPublicProfiles(profiles) {
  publicProfilesCache = {
    data: clonePublicProfiles(profiles),
    expiresAt: Date.now() + PUBLIC_PROFILES_CACHE_TTL_MS
  };
}

async function fetchPublicProfilesFromDb() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,display_name,about,location_text,contacts,public_hive_count,show_location,show_hive_count,show_contacts,is_public_profile')
    .eq('is_public_profile', true)
    .order('display_name', { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  const publicProfiles = data || [];
  if (!publicProfiles.length) {
    return [];
  }

  const profileIds = publicProfiles.map((profile) => profile.id).filter(Boolean);

  const { data: photoRows, error: photoError } = await supabase
    .from('photos')
    .select('profile_id,bucket_id,object_path,created_at')
    .in('profile_id', profileIds)
    .order('created_at', { ascending: false });

  if (photoError) {
    throw photoError;
  }

  const latestPhotoRowsByProfileId = new Map();
  for (const row of photoRows || []) {
    if (!row?.profile_id || latestPhotoRowsByProfileId.has(row.profile_id)) {
      continue;
    }

    latestPhotoRowsByProfileId.set(row.profile_id, row);
  }

  const latestPhotoByProfileId = new Map();
  await Promise.all(
    Array.from(latestPhotoRowsByProfileId.entries()).map(async ([profileId, row]) => {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(row.bucket_id || 'profile-photos')
        .createSignedUrl(row.object_path || '', 3600);

      if (signedError) {
        latestPhotoByProfileId.set(profileId, '');
        return;
      }

      latestPhotoByProfileId.set(profileId, signedData?.signedUrl || '');
    })
  );

  return publicProfiles.map((profile) => ({
    ...profile,
    photo_url: latestPhotoByProfileId.get(profile.id) || ''
  }));
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
    clearPublicProfilesCache();
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

  clearPublicProfilesCache();

  return insertedProfile;
}

export async function getPublicProfiles() {
  ensureSupabaseClient();
  const cachedProfiles = getCachedPublicProfiles();
  if (cachedProfiles) {
    return cachedProfiles;
  }

  if (!publicProfilesRequestPromise) {
    publicProfilesRequestPromise = fetchPublicProfilesFromDb();
  }

  try {
    const profiles = await publicProfilesRequestPromise;
    setCachedPublicProfiles(profiles);
    return clonePublicProfiles(profiles);
  } finally {
    publicProfilesRequestPromise = null;
  }
}

export async function adminUnpublishProfile(profileId) {
  ensureSupabaseClient();
  await getCurrentUserId();
  const normalizedProfileId = normalizeProfileId(profileId);

  const { error } = await supabase
    .rpc('admin_unpublish_profile', { target_profile_id: normalizedProfileId });

  if (error) {
    throw error;
  }

  clearPublicProfilesCache();

  return { id: normalizedProfileId, is_public_profile: false };
}