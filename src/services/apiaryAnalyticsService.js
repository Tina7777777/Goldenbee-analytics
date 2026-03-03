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
      supersWithSnapshotsCount: 0,
      lastSnapshotAt: null
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

  let lastSnapshotAt = null;
  latestSnapshotBySuperId.forEach((snapshot) => {
    if (!snapshot?.snapshot_at) {
      return;
    }

    if (!lastSnapshotAt || new Date(snapshot.snapshot_at) > new Date(lastSnapshotAt)) {
      lastSnapshotAt = snapshot.snapshot_at;
    }
  });

  return {
    totalKg,
    supersCount: superIds.length,
    supersWithSnapshotsCount: latestSnapshotBySuperId.size,
    lastSnapshotAt
  };
}

function createDefaultApiaryCardStats() {
  return {
    hivesCount: 0,
    hivesWithActiveSupersCount: 0,
    activeSupersCount: 0,
    latestTotalHoneyKg: 0,
    lastSnapshotAt: null
  };
}

export async function getMyApiariesCardStats() {
  ensureSupabaseClient();
  await ensureAuthenticatedUser();

  const statsByApiaryId = new Map();

  const { data: hives, error: hivesError } = await supabase
    .from('hives')
    .select('id, apiary_id');

  if (hivesError) {
    throw hivesError;
  }

  const hiveToApiaryMap = new Map();
  (hives || []).forEach((hive) => {
    if (!hive?.id || !hive?.apiary_id) {
      return;
    }

    hiveToApiaryMap.set(hive.id, hive.apiary_id);

    if (!statsByApiaryId.has(hive.apiary_id)) {
      statsByApiaryId.set(hive.apiary_id, createDefaultApiaryCardStats());
    }

    statsByApiaryId.get(hive.apiary_id).hivesCount += 1;
  });

  if (!hiveToApiaryMap.size) {
    return statsByApiaryId;
  }

  const hiveIds = Array.from(hiveToApiaryMap.keys());
  const { data: supers, error: supersError } = await supabase
    .from('supers')
    .select('id, hive_id, removed_at')
    .in('hive_id', hiveIds);

  if (supersError) {
    throw supersError;
  }

  const activeSuperIds = [];
  const hivesWithActiveSupersByApiary = new Map();

  (supers || []).forEach((superItem) => {
    if (superItem?.removed_at) {
      return;
    }

    const apiaryId = hiveToApiaryMap.get(superItem.hive_id);
    if (!apiaryId) {
      return;
    }

    if (!statsByApiaryId.has(apiaryId)) {
      statsByApiaryId.set(apiaryId, createDefaultApiaryCardStats());
    }

    statsByApiaryId.get(apiaryId).activeSupersCount += 1;
    activeSuperIds.push(superItem.id);

    if (!hivesWithActiveSupersByApiary.has(apiaryId)) {
      hivesWithActiveSupersByApiary.set(apiaryId, new Set());
    }

    hivesWithActiveSupersByApiary.get(apiaryId).add(superItem.hive_id);
  });

  hivesWithActiveSupersByApiary.forEach((hiveIdsSet, apiaryId) => {
    if (!statsByApiaryId.has(apiaryId)) {
      statsByApiaryId.set(apiaryId, createDefaultApiaryCardStats());
    }

    statsByApiaryId.get(apiaryId).hivesWithActiveSupersCount = hiveIdsSet.size;
  });

  if (!activeSuperIds.length) {
    return statsByApiaryId;
  }

  const { data: snapshots, error: snapshotsError } = await supabase
    .from('super_snapshots')
    .select('super_id, honey_fullness, snapshot_at')
    .in('super_id', activeSuperIds)
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

  const superToApiaryMap = new Map();
  (supers || []).forEach((superItem) => {
    if (superItem?.removed_at || !superItem?.id) {
      return;
    }

    const apiaryId = hiveToApiaryMap.get(superItem.hive_id);
    if (apiaryId) {
      superToApiaryMap.set(superItem.id, apiaryId);
    }
  });

  latestSnapshotBySuperId.forEach((snapshot, superId) => {
    const apiaryId = superToApiaryMap.get(superId);
    if (!apiaryId) {
      return;
    }

    if (!statsByApiaryId.has(apiaryId)) {
      statsByApiaryId.set(apiaryId, createDefaultApiaryCardStats());
    }

    const fullness = Number(snapshot?.honey_fullness || 0);
    const currentStats = statsByApiaryId.get(apiaryId);
    currentStats.latestTotalHoneyKg += fullness / 10;

    if (snapshot?.snapshot_at) {
      if (!currentStats.lastSnapshotAt || new Date(snapshot.snapshot_at) > new Date(currentStats.lastSnapshotAt)) {
        currentStats.lastSnapshotAt = snapshot.snapshot_at;
      }
    }
  });

  return statsByApiaryId;
}
