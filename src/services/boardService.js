import { supabase } from './supabaseClient.js';
import { getSession } from './authService.js';

const IMPORTANT_INSPECTIONS_DAYS = 14;

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

function daysAgoIso(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function initializeApiarySummary(apiary) {
  return {
    apiary_id: apiary.id,
    apiary_name: apiary.name,
    hives_count: 0,
    current_honey_kg: 0,
    last_updated_at: null,
    important_inspections_14d_count: 0
  };
}

export async function getBoardData() {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const [
    { data: apiaries, error: apiariesError },
    { data: hives, error: hivesError },
    { data: activeSupers, error: supersError },
    { data: recentImportantInspections, error: inspectionsError }
  ] = await Promise.all([
    supabase.from('apiaries').select('id, name').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('hives').select('id, apiary_id').eq('owner_id', userId),
    supabase.from('supers').select('id, hive_id').eq('owner_id', userId).is('removed_at', null),
    supabase
      .from('inspections')
      .select('id, hive_id')
      .eq('owner_id', userId)
      .eq('important', true)
      .gte('inspected_at', daysAgoIso(IMPORTANT_INSPECTIONS_DAYS))
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

  if (inspectionsError) {
    throw inspectionsError;
  }

  const safeApiaries = apiaries || [];
  const safeHives = hives || [];
  const safeActiveSupers = activeSupers || [];
  const safeImportantInspections = recentImportantInspections || [];

  const hivesById = new Map(safeHives.map((hive) => [hive.id, hive]));
  const apiarySummariesById = new Map(safeApiaries.map((apiary) => [apiary.id, initializeApiarySummary(apiary)]));

  safeHives.forEach((hive) => {
    const summary = apiarySummariesById.get(hive.apiary_id);
    if (summary) {
      summary.hives_count += 1;
    }
  });

  safeImportantInspections.forEach((inspection) => {
    const hive = hivesById.get(inspection.hive_id);
    if (!hive) {
      return;
    }

    const summary = apiarySummariesById.get(hive.apiary_id);
    if (summary) {
      summary.important_inspections_14d_count += 1;
    }
  });

  const activeSuperIds = safeActiveSupers.map((superRow) => superRow.id);
  const supersById = new Map(safeActiveSupers.map((superRow) => [superRow.id, superRow]));

  if (activeSuperIds.length) {
    const { data: snapshots, error: snapshotsError } = await supabase
      .from('super_snapshots')
      .select('id, super_id, snapshot_at, honey_fullness')
      .eq('owner_id', userId)
      .in('super_id', activeSuperIds)
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

    latestBySuperId.forEach((snapshot, superId) => {
      const superRow = supersById.get(superId);
      if (!superRow) {
        return;
      }

      const hive = hivesById.get(superRow.hive_id);
      if (!hive) {
        return;
      }

      const summary = apiarySummariesById.get(hive.apiary_id);
      if (!summary) {
        return;
      }

      summary.current_honey_kg += toNumber(snapshot.honey_fullness, 0);

      if (!summary.last_updated_at || new Date(snapshot.snapshot_at) > new Date(summary.last_updated_at)) {
        summary.last_updated_at = snapshot.snapshot_at;
      }
    });
  }

  const apiarySummaries = safeApiaries.map((apiary) => {
    const summary = apiarySummariesById.get(apiary.id) || initializeApiarySummary(apiary);
    return {
      ...summary,
      current_honey_kg: Number(summary.current_honey_kg.toFixed(1))
    };
  });

  const totals = apiarySummaries.reduce(
    (accumulator, summary) => {
      accumulator.apiaries_count += 1;
      accumulator.hives_count += summary.hives_count;
      accumulator.current_honey_kg_total += summary.current_honey_kg;
      accumulator.important_inspections_14d_total += summary.important_inspections_14d_count;
      return accumulator;
    },
    {
      apiaries_count: 0,
      hives_count: 0,
      current_honey_kg_total: 0,
      important_inspections_14d_total: 0
    }
  );

  totals.current_honey_kg_total = Number(totals.current_honey_kg_total.toFixed(1));

  return {
    totals,
    apiaries: apiarySummaries
  };
}