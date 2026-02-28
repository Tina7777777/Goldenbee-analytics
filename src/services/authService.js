import { supabase } from './supabaseClient.js';

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
}

export async function signUp(email, password) {
  ensureSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signIn(email, password) {
  ensureSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

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

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    return () => {};
  }

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback?.(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function hasAdminRole(session = null) {
  if (!supabase) {
    return false;
  }

  const activeSession = session ?? (await getSession());
  const userId = activeSession?.user?.id;

  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data?.role === 'admin';
}