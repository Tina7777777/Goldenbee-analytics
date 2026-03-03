import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

const PROFILE_PHOTOS_BUCKET = 'profile-photos';
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

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

function normalizeFileName(fileName) {
  return String(fileName || 'photo')
    .trim()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase();
}

function assertValidImageFile(file) {
  if (!file) {
    throw new Error('Photo file is required.');
  }

  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('Invalid image file type.');
  }

  if (Number(file.size || 0) <= 0) {
    throw new Error('Image file is empty.');
  }

  if (Number(file.size || 0) > MAX_PHOTO_SIZE_BYTES) {
    throw new Error('Image file exceeds max size.');
  }
}

function buildObjectPath(userId, fileName) {
  const timestamp = Date.now();
  const normalizedFileName = normalizeFileName(fileName);
  return `${userId}/${timestamp}-${normalizedFileName || 'photo.jpg'}`;
}

export async function uploadMyProfilePhoto(file) {
  ensureSupabaseClient();
  assertValidImageFile(file);
  const userId = await getCurrentUserId();
  const objectPath = buildObjectPath(userId, file.name);

  const { error: uploadError } = await supabase.storage
    .from(PROFILE_PHOTOS_BUCKET)
    .upload(objectPath, file, {
      upsert: false,
      contentType: file.type || 'application/octet-stream'
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from('photos')
    .insert({
      owner_id: userId,
      profile_id: userId,
      bucket_id: PROFILE_PHOTOS_BUCKET,
      object_path: objectPath,
      mime_type: file.type || null,
      size_bytes: Number(file.size || 0)
    })
    .select('id,owner_id,profile_id,bucket_id,object_path,mime_type,size_bytes,created_at')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getMyLatestProfilePhotoUrl(expiresInSeconds = 3600) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .select('bucket_id,object_path,created_at')
    .eq('owner_id', userId)
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (photoError) {
    throw photoError;
  }

  if (!photo?.object_path) {
    return null;
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(photo.bucket_id || PROFILE_PHOTOS_BUCKET)
    .createSignedUrl(photo.object_path, expiresInSeconds);

  if (signedError) {
    throw signedError;
  }

  return {
    url: signedData?.signedUrl || '',
    created_at: photo.created_at
  };
}
