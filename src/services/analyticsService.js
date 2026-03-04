import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

const FILL_LEVEL_COEFFICIENTS = {
  very_full: 1.3,
  full: 1.0,
  medium: 0.55,
  low: 0.35,
  almost_empty: 0.15
};

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

function estimateItemKg(item) {
  if (item?.estimated_kg !== null && item?.estimated_kg !== undefined) {
    return toNumber(item.estimated_kg, 0);
  }

  const framesCount = toNumber(item?.frames_count, 0);
  const coefficient = FILL_LEVEL_COEFFICIENTS[item?.fill_level] ?? 0;
  return framesCount * coefficient;
}

function daysAgoIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

async function loadLookupMaps(userId) {
  const [{ data: apiaries, error: apiariesError }, { data: hives, error: hivesError }, { data: supers, error: supersError }] =
    await Promise.all([
      supabase.from('apiaries').select('id, name').eq('owner_id', userId),
      supabase.from('hives').select('id, apiary_id, code').eq('owner_id', userId),
      supabase.from('supers').select('id, hive_id').eq('owner_id', userId)
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

export async function listRecentHarvestCalibration(limit = 20, days = null) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const fromDateIso = Number.isInteger(days) && days > 0 ? daysAgoIso(days) : null;

  let harvestsQuery = supabase
    .from('harvests')
    .select(
      `
      id,
      hive_id,
      harvested_at,
      actual_kg_total,
      harvest_items (
        estimated_kg,
        frames_count,
        fill_level
      )
    `
    )
    .eq('owner_id', userId)
    .order('harvested_at', { ascending: false })
    .limit(limit);

  if (fromDateIso) {
    harvestsQuery = harvestsQuery.gte('harvested_at', fromDateIso);
  }

  const [maps, { data: harvests, error: harvestsError }] = await Promise.all([
    loadLookupMaps(userId),
    harvestsQuery
  ]);

  if (harvestsError) {
    throw harvestsError;
  }

  return (harvests || []).map((harvest) => {
    const hive = maps.hivesById.get(harvest.hive_id);
    const apiary = hive?.apiary_id ? maps.apiariesById.get(hive.apiary_id) : null;
    const estimatedTotalKg = Number(
      (harvest.harvest_items || []).reduce((sum, item) => sum + estimateItemKg(item), 0).toFixed(1)
    );
    const hasActual = harvest.actual_kg_total !== null && harvest.actual_kg_total !== undefined;
    const actualKgTotal = hasActual ? Number(toNumber(harvest.actual_kg_total, 0).toFixed(1)) : null;

    return {
      id: harvest.id,
      harvested_at: harvest.harvested_at,
      apiary_id: apiary?.id || null,
      apiary_name: apiary?.name || null,
      hive_id: hive?.id || harvest.hive_id || null,
      hive_code: hive?.code || null,
      estimated_total_kg: estimatedTotalKg,
      actual_kg_total: actualKgTotal,
      delta_kg: hasActual ? Number((actualKgTotal - estimatedTotalKg).toFixed(1)) : null
    };
  });
}

export async function listRecentFullnessTrend(days = 14) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const fromDateIso = Number.isInteger(days) && days > 0 ? daysAgoIso(days) : null;

  let snapshotsQuery = supabase
    .from('super_snapshots')
    .select('id, super_id, snapshot_at, honey_fullness')
    .eq('owner_id', userId)
    .order('snapshot_at', { ascending: false });

  if (fromDateIso) {
    snapshotsQuery = snapshotsQuery.gte('snapshot_at', fromDateIso);
  }

  const [maps, { data: snapshots, error: snapshotsError }] = await Promise.all([
    loadLookupMaps(userId),
    snapshotsQuery
  ]);

  if (snapshotsError) {
    throw snapshotsError;
  }

  const groupedByApiaryId = new Map();

  (snapshots || []).forEach((snapshot) => {
    const superRow = maps.supersById.get(snapshot.super_id);
    if (!superRow) {
      return;
    }

    const hive = maps.hivesById.get(superRow.hive_id);
    if (!hive) {
      return;
    }

    const apiary = maps.apiariesById.get(hive.apiary_id);
    if (!apiary) {
      return;
    }

    if (!groupedByApiaryId.has(apiary.id)) {
      groupedByApiaryId.set(apiary.id, {
        apiary_id: apiary.id,
        apiary_name: apiary.name,
        snapshots_count: 0,
        fullness_count: 0,
        fullness_sum: 0,
        last_updated_at: null
      });
    }

    const group = groupedByApiaryId.get(apiary.id);
    group.snapshots_count += 1;

    if (snapshot.honey_fullness !== null && snapshot.honey_fullness !== undefined) {
      group.fullness_count += 1;
      group.fullness_sum += toNumber(snapshot.honey_fullness, 0);
    }

    if (!group.last_updated_at || new Date(snapshot.snapshot_at) > new Date(group.last_updated_at)) {
      group.last_updated_at = snapshot.snapshot_at;
    }
  });

  return Array.from(groupedByApiaryId.values())
    .map((group) => {
      const averageFullness = group.fullness_count ? group.fullness_sum / group.fullness_count : 0;

      return {
        apiary_id: group.apiary_id,
        apiary_name: group.apiary_name,
        snapshots_count: group.snapshots_count,
        average_honey_fullness: Number(averageFullness.toFixed(1)),
        average_kg_estimate: Number(averageFullness.toFixed(1)),
        last_updated_at: group.last_updated_at
      };
    })
    .sort((a, b) => new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime());
}

export async function listApiaryHiveYieldSummary(days = null) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const fromDateIso = Number.isInteger(days) && days > 0 ? daysAgoIso(days) : null;

  const [maps, { data: harvests, error: harvestsError }] = await Promise.all([
    loadLookupMaps(userId),
    (() => {
      let query = supabase
        .from('harvests')
        .select(
          `
          id,
          hive_id,
          harvested_at,
          actual_kg_total,
          harvest_items (
            estimated_kg,
            frames_count,
            fill_level
          )
        `
        )
        .eq('owner_id', userId);

      if (fromDateIso) {
        query = query.gte('harvested_at', fromDateIso);
      }

      return query;
    })()
  ]);

  if (harvestsError) {
    throw harvestsError;
  }

  const rowsByHiveId = new Map();

  maps.hivesById.forEach((hive) => {
    rowsByHiveId.set(hive.id, {
      hive_id: hive.id,
      hive_code: hive.code,
      apiary_id: hive.apiary_id,
      harvests_count: 0,
      total_yield_kg: 0,
      average_yield_kg: 0,
      last_harvested_at: null
    });
  });

  (harvests || []).forEach((harvest) => {
    const hive = maps.hivesById.get(harvest.hive_id);
    if (!hive) {
      return;
    }

    const row = rowsByHiveId.get(hive.id);
    if (!row) {
      return;
    }

    const hasActual = harvest.actual_kg_total !== null && harvest.actual_kg_total !== undefined;
    const estimatedKg = (harvest.harvest_items || []).reduce((sum, item) => sum + estimateItemKg(item), 0);
    const harvestKg = hasActual ? toNumber(harvest.actual_kg_total, 0) : estimatedKg;

    row.harvests_count += 1;
    row.total_yield_kg += harvestKg;

    if (!row.last_harvested_at || new Date(harvest.harvested_at) > new Date(row.last_harvested_at)) {
      row.last_harvested_at = harvest.harvested_at;
    }
  });

  const groupsByApiaryId = new Map();

  maps.apiariesById.forEach((apiary) => {
    groupsByApiaryId.set(apiary.id, {
      apiary_id: apiary.id,
      apiary_name: apiary.name,
      apiary_total_yield_kg: 0,
      apiary_harvests_count: 0,
      rows: []
    });
  });

  rowsByHiveId.forEach((row) => {
    const group = groupsByApiaryId.get(row.apiary_id);
    if (!group) {
      return;
    }

    const normalizedTotal = Number(row.total_yield_kg.toFixed(1));
    const normalizedAvg = row.harvests_count > 0 ? Number((row.total_yield_kg / row.harvests_count).toFixed(1)) : 0;

    const normalizedRow = {
      ...row,
      total_yield_kg: normalizedTotal,
      average_yield_kg: normalizedAvg
    };

    group.rows.push(normalizedRow);
    group.apiary_total_yield_kg += normalizedTotal;
    group.apiary_harvests_count += row.harvests_count;
  });

  return Array.from(groupsByApiaryId.values())
    .map((group) => ({
      ...group,
      apiary_total_yield_kg: Number(group.apiary_total_yield_kg.toFixed(1)),
      rows: group.rows.sort((a, b) => String(a.hive_code || '').localeCompare(String(b.hive_code || ''), 'bg'))
    }))
    .sort((a, b) => String(a.apiary_name || '').localeCompare(String(b.apiary_name || ''), 'bg'));
}