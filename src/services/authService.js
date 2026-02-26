import { supabase } from './supabaseClient.js';

export async function getSession() {
  if (!supabase) {
    return null;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

export function hasAdminRole() {
  return false;
}