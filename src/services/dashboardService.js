import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

const DEFAULT_RECENT_LIMIT = 5;

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

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function loadLookupMaps(userId) {
  const [{ data: apiaries, error: apiariesError }, { data: hives, error: hivesError }, { data: supers, error: supersError }] =
    await Promise.all([
      supabase.from('apiaries').select('id, name').eq('owner_id', userId),
      supabase.from('hives').select('id, apiary_id, code').eq('owner_id', userId),
      supabase.from('supers').select('id, hive_id, position, removed_at').eq('owner_id', userId)
    ]);

  if (apiariesError) {
    throw apiariesError;
  }

  if (hivesError) {
    throw hivesError;
  }

  if (supersError) {
    throw supersError;
  }

  return {
    apiariesById: new Map((apiaries || []).map((item) => [item.id, item])),
    hivesById: new Map((hives || []).map((item) => [item.id, item])),
    supersById: new Map((supers || []).map((item) => [item.id, item]))
  };
}

function attachHiveApiaryInfo(item, maps) {
  const hive = item.hive_id ? maps.hivesById.get(item.hive_id) : null;
  const apiary = hive?.apiary_id ? maps.apiariesById.get(hive.apiary_id) : null;

  return {
    hive_id: hive?.id || item.hive_id || null,
    hive_code: hive?.code || null,
    apiary_id: apiary?.id || null,
    apiary_name: apiary?.name || null
  };
}

export async function getDashboardCounts() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const [{ count: apiariesCount, error: apiariesError }, { count: hivesCount, error: hivesError }] = await Promise.all([
    supabase.from('apiaries').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    supabase.from('hives').select('id', { count: 'exact', head: true }).eq('owner_id', userId)
  ]);

  if (apiariesError) {
    throw apiariesError;
  }

  if (hivesError) {
    throw hivesError;
  }

  return {
    apiariesCount: apiariesCount || 0,
    hivesCount: hivesCount || 0
  };
}

export async function getHoneySummary() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data: activeSupers, error: supersError } = await supabase
    .from('supers')
    .select('id')
    .eq('owner_id', userId)
    .is('removed_at', null);

  if (supersError) {
    throw supersError;
  }

  const superIds = (activeSupers || []).map((item) => item.id);
  if (!superIds.length) {
    return {
      currentHoneyKgTotal: 0,
      lastUpdatedAt: null
    };
  }

  const { data: snapshots, error: snapshotsError } = await supabase
    .from('super_snapshots')
    .select('id, super_id, snapshot_at, honey_fullness')
    .eq('owner_id', userId)
    .in('super_id', superIds)
    .order('snapshot_at', { ascending: false });

  if (snapshotsError) {
    throw snapshotsError;
  }

  const latestBySuperId = new Map();

  (snapshots || []).forEach((snapshot) => {
    if (!latestBySuperId.has(snapshot.super_id)) {
      latestBySuperId.set(snapshot.super_id, snapshot);
    }
  });

  let fullnessTotal = 0;
  let lastUpdatedAt = null;

  latestBySuperId.forEach((snapshot) => {
    fullnessTotal += toNumber(snapshot.honey_fullness, 0);

    if (!lastUpdatedAt || new Date(snapshot.snapshot_at) > new Date(lastUpdatedAt)) {
      lastUpdatedAt = snapshot.snapshot_at;
    }
  });

  return {
    currentHoneyKgTotal: Number(fullnessTotal.toFixed(1)),
    lastUpdatedAt
  };
}

export async function listRecentSnapshots(limit = DEFAULT_RECENT_LIMIT) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const [maps, { data: snapshots, error: snapshotsError }] = await Promise.all([
    loadLookupMaps(userId),
    supabase
      .from('super_snapshots')
      .select('id, super_id, snapshot_at, honey_fullness, notes')
      .eq('owner_id', userId)
      .order('snapshot_at', { ascending: false })
      .limit(limit)
  ]);

  if (snapshotsError) {
    throw snapshotsError;
  }

  return (snapshots || []).map((snapshot) => {
    const superRow = maps.supersById.get(snapshot.super_id);
    const info = attachHiveApiaryInfo({ hive_id: superRow?.hive_id || null }, maps);

    return {
      ...snapshot,
      super_position: superRow?.position ?? null,
      ...info
    };
  });
}

export async function listRecentInspections(limit = DEFAULT_RECENT_LIMIT) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const [maps, { data: inspections, error: inspectionsError }] = await Promise.all([
    loadLookupMaps(userId),
    supabase
      .from('inspections')
      .select('id, hive_id, inspected_at, important, notes')
      .eq('owner_id', userId)
      .order('inspected_at', { ascending: false })
      .limit(limit)
  ]);

  if (inspectionsError) {
    throw inspectionsError;
  }

  return (inspections || []).map((inspection) => ({
    ...inspection,
    ...attachHiveApiaryInfo(inspection, maps)
  }));
}

export async function listRecentHarvests(limit = DEFAULT_RECENT_LIMIT) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const [maps, { data: harvests, error: harvestsError }] = await Promise.all([
    loadLookupMaps(userId),
    supabase
      .from('harvests')
      .select('id, hive_id, harvested_at, actual_kg_total, notes')
      .eq('owner_id', userId)
      .order('harvested_at', { ascending: false })
      .limit(limit)
  ]);

  if (harvestsError) {
    throw harvestsError;
  }

  return (harvests || []).map((harvest) => ({
    ...harvest,
    ...attachHiveApiaryInfo(harvest, maps)
  }));
}

export async function getHomeDashboardData() {
  const [counts, honeySummary, recentSnapshots, recentInspections, recentHarvests] = await Promise.all([
    getDashboardCounts(),
    getHoneySummary(),
    listRecentSnapshots(DEFAULT_RECENT_LIMIT),
    listRecentInspections(DEFAULT_RECENT_LIMIT),
    listRecentHarvests(DEFAULT_RECENT_LIMIT)
  ]);

  return {
    ...counts,
    ...honeySummary,
    recentSnapshots,
    recentInspections,
    recentHarvests
  };
}

export async function listOwnedApiariesForDashboard() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('apiaries')
    .select('id, name')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getApiaryHivesLatestState(apiaryId) {
  ensureSupabaseClient();

  if (!apiaryId) {
    return [];
  }

  const userId = await getCurrentUserId();

  const { data: hives, error: hivesError } = await supabase
    .from('hives')
    .select('id, code, created_at')
    .eq('owner_id', userId)
    .eq('apiary_id', apiaryId)
    .order('created_at', { ascending: true });

  if (hivesError) {
    throw hivesError;
  }

  const safeHives = hives || [];
  if (!safeHives.length) {
    return [];
  }

  const hiveIds = safeHives.map((hive) => hive.id);

  const [
    { data: inspections, error: inspectionsError },
    { data: supers, error: supersError }
  ] = await Promise.all([
    supabase
      .from('inspections')
      .select('hive_id, inspected_at, brood_frames, honey_pollen_frames, total_frames, eggs_present, queen_seen')
      .eq('owner_id', userId)
      .in('hive_id', hiveIds)
      .order('inspected_at', { ascending: false }),
    supabase
      .from('supers')
      .select('id, hive_id, removed_at')
      .eq('owner_id', userId)
      .in('hive_id', hiveIds)
  ]);

  if (inspectionsError) {
    throw inspectionsError;
  }

  if (supersError) {
    throw supersError;
  }

  const safeInspections = inspections || [];
  const safeSupers = supers || [];
  const superIds = safeSupers.map((superRow) => superRow.id);

  let snapshots = [];
  if (superIds.length) {
    const { data: snapshotsData, error: snapshotsError } = await supabase
      .from('super_snapshots')
      .select('super_id, snapshot_at, honey_fullness')
      .eq('owner_id', userId)
      .in('super_id', superIds)
      .order('snapshot_at', { ascending: false });

    if (snapshotsError) {
      throw snapshotsError;
    }

    snapshots = snapshotsData || [];
  }

  const latestInspectionByHiveId = new Map();
  safeInspections.forEach((inspection) => {
    if (!latestInspectionByHiveId.has(inspection.hive_id)) {
      latestInspectionByHiveId.set(inspection.hive_id, inspection);
    }
  });

  const supersByHiveId = new Map();
  safeSupers.forEach((superRow) => {
    const current = supersByHiveId.get(superRow.hive_id) || [];
    current.push(superRow);
    supersByHiveId.set(superRow.hive_id, current);
  });

  const latestSnapshotBySuperId = new Map();
  const snapshotCountByHiveId = new Map();
  const lastSnapshotAtByHiveId = new Map();
  const superById = new Map(safeSupers.map((superRow) => [superRow.id, superRow]));

  snapshots.forEach((snapshot) => {
    if (!latestSnapshotBySuperId.has(snapshot.super_id)) {
      latestSnapshotBySuperId.set(snapshot.super_id, snapshot);
    }

    const superRow = superById.get(snapshot.super_id);
    if (!superRow?.hive_id) {
      return;
    }

    snapshotCountByHiveId.set(superRow.hive_id, Number(snapshotCountByHiveId.get(superRow.hive_id) || 0) + 1);

    const previousLast = lastSnapshotAtByHiveId.get(superRow.hive_id);
    if (!previousLast || new Date(snapshot.snapshot_at) > new Date(previousLast)) {
      lastSnapshotAtByHiveId.set(superRow.hive_id, snapshot.snapshot_at);
    }
  });

  return safeHives.map((hive) => {
    const latestInspection = latestInspectionByHiveId.get(hive.id) || null;
    const hiveSupers = supersByHiveId.get(hive.id) || [];
    const activeSupers = hiveSupers.filter((superRow) => !superRow.removed_at);

    const totalHoneyFromSupers = activeSupers.reduce((sum, superRow) => {
      const latestSnapshot = latestSnapshotBySuperId.get(superRow.id);
      if (!latestSnapshot) {
        return sum;
      }

      return sum + toNumber(latestSnapshot.honey_fullness, 0);
    }, 0);

    return {
      hive_id: hive.id,
      hive_code: hive.code || '',
      brood_frames: latestInspection?.brood_frames ?? null,
      honey_pollen_frames: latestInspection?.honey_pollen_frames ?? null,
      total_frames: latestInspection?.total_frames ?? null,
      eggs_present: latestInspection?.eggs_present ?? null,
      queen_seen: latestInspection?.queen_seen ?? null,
      supers_count: activeSupers.length,
      honey_kg_total: Number(totalHoneyFromSupers.toFixed(1)),
      snapshots_count: Number(snapshotCountByHiveId.get(hive.id) || 0),
      snapshots_last_at: lastSnapshotAtByHiveId.get(hive.id) || null
    };
  });
}