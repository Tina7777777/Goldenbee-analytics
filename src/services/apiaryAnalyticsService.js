import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
}

async function ensureAuthenticatedUser() {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('User not authenticated.');
  }
}

export async function getApiaryCurrentHoneyKg(apiaryId) {
  ensureSupabaseClient();
  await ensureAuthenticatedUser();

  const { data: activeSupers, error: activeSupersError } = await supabase
    .from('supers')
    .select('id, hives!inner(apiary_id)')
    .is('removed_at', null)
    .eq('hives.apiary_id', apiaryId);

  if (activeSupersError) {
    throw activeSupersError;
  }

  const superIds = (activeSupers || []).map((superItem) => superItem.id);
  if (!superIds.length) {
    return {
      totalKg: 0,
      supersCount: 0,
      supersWithSnapshotsCount: 0
    };
  }

  const { data: snapshots, error: snapshotsError } = await supabase
    .from('super_snapshots')
    .select('super_id, honey_fullness, snapshot_at')
    .in('super_id', superIds)
    .order('super_id', { ascending: true })
    .order('snapshot_at', { ascending: false });

  if (snapshotsError) {
    throw snapshotsError;
  }

  const latestSnapshotBySuperId = new Map();
  (snapshots || []).forEach((snapshot) => {
    if (!latestSnapshotBySuperId.has(snapshot.super_id)) {
      latestSnapshotBySuperId.set(snapshot.super_id, snapshot);
    }
  });

  const totalKg = superIds.reduce((sum, superId) => {
    const latestSnapshot = latestSnapshotBySuperId.get(superId);
    const fullness = Number(latestSnapshot?.honey_fullness || 0);
    return sum + fullness / 10;
  }, 0);

  return {
    totalKg,
    supersCount: superIds.length,
    supersWithSnapshotsCount: latestSnapshotBySuperId.size
  };
}
