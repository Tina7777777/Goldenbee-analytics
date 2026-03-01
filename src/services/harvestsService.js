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

function toNullableNumber(value) {
  const normalized = String(value ?? '').trim().replaceAll(',', '.');
  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function toPositiveInteger(value) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return null;
  }

  return Math.trunc(numericValue);
}

function normalizeFillLevel(value) {
  const normalized = String(value || '').trim();
  return Object.hasOwn(FILL_LEVEL_COEFFICIENTS, normalized) ? normalized : null;
}

function estimateItemKg(framesCount, fillLevel) {
  const coefficient = FILL_LEVEL_COEFFICIENTS[fillLevel] ?? 0;
  return Number((framesCount * coefficient).toFixed(3));
}

export async function listHarvestsByHive(hiveId, limit = 5) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('harvests')
    .select(
      `
      *,
      harvest_items (*)
    `
    )
    .eq('hive_id', hiveId)
    .eq('owner_id', userId)
    .order('harvested_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []).map((harvest) => ({
    ...harvest,
    harvest_items: harvest.harvest_items || []
  }));
}

export async function createHarvestWithItems({
  hive_id,
  notes,
  actual_kg_total,
  items = []
}) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const normalizedItems = items
    .map((item) => {
      const framesCount = toPositiveInteger(item.frames_count);
      const fillLevel = normalizeFillLevel(item.fill_level);
      if (!framesCount || !fillLevel) {
        return null;
      }

      const explicitEstimate = toNullableNumber(item.estimated_kg);
      const estimatedKg = explicitEstimate ?? estimateItemKg(framesCount, fillLevel);

      return {
        owner_id: userId,
        frames_count: framesCount,
        fill_level: fillLevel,
        estimated_kg: estimatedKg,
        notes: String(item.notes || '').trim() || null
      };
    })
    .filter(Boolean);

  if (!normalizedItems.length) {
    throw new Error('At least one harvest item is required.');
  }

  const { data: harvest, error: harvestError } = await supabase
    .from('harvests')
    .insert({
      hive_id,
      owner_id: userId,
      notes: String(notes || '').trim() || null,
      actual_kg_total: toNullableNumber(actual_kg_total)
    })
    .select('*')
    .single();

  if (harvestError) {
    throw harvestError;
  }

  const itemsPayload = normalizedItems.map((item) => ({
    ...item,
    harvest_id: harvest.id
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from('harvest_items')
    .insert(itemsPayload)
    .select('*');

  if (itemsError) {
    await supabase.from('harvests').delete().eq('id', harvest.id).eq('owner_id', userId);
    throw itemsError;
  }

  return {
    ...harvest,
    harvest_items: insertedItems || []
  };
}

export async function deleteHarvest(harvestId) {
  ensureSupabaseClient();
  const userId = await getCurrentUserId();

  const tryDeleteHarvest = async () =>
    supabase.from('harvests').delete().eq('id', harvestId).eq('owner_id', userId);

  const { error } = await tryDeleteHarvest();
  if (!error) {
    return;
  }

  const isForeignKeyError = error?.code === '23503';
  if (!isForeignKeyError) {
    throw error;
  }

  const { error: deleteItemsError } = await supabase
    .from('harvest_items')
    .delete()
    .eq('harvest_id', harvestId)
    .eq('owner_id', userId);

  if (deleteItemsError) {
    throw deleteItemsError;
  }

  const { error: deleteHarvestError } = await tryDeleteHarvest();
  if (deleteHarvestError) {
    throw deleteHarvestError;
  }
}
