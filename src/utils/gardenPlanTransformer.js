/**
 * Validates and transforms the raw JSON from /api/generate into the
 * internal data structures consumed by all app components.
 */

export function validateGeneratedPlan(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Plan response is not an object');
  if (!Array.isArray(raw.crops) || raw.crops.length === 0)
    throw new Error('Generated plan is missing crops array');
  if (!Array.isArray(raw.events) || raw.events.length === 0)
    throw new Error('Generated plan is missing events array');
  if (!raw.bedZones || Object.keys(raw.bedZones).length === 0)
    throw new Error('Generated plan is missing bedZones');
  if (!Array.isArray(raw.stages) || raw.stages.length === 0)
    throw new Error('Generated plan is missing stages array');
  if (!raw.vizCrops || typeof raw.vizCrops !== 'object')
    throw new Error('Generated plan is missing vizCrops');
}

export function transformGeneratedPlan(raw) {
  validateGeneratedPlan(raw);

  // crops — pass through directly
  const crops = raw.crops;

  // events — ensure each has an id
  const events = (raw.events ?? []).map((e, i) => ({
    ...e,
    id: e.id ?? `gen-${e.cropId}-${e.bed}-${e.successionRound ?? i}`,
  }));

  // bedZones — keyed by bed number string "1", "2", etc.
  const bed1Zones = raw.bedZones['1'] ?? [];
  const bed2Zones = raw.bedZones['2'] ?? null;

  // stages — pass through
  const stages = raw.stages ?? [];

  // permanentHerbs — fallback to empty
  const permanentHerbs = raw.permanentHerbs && typeof raw.permanentHerbs === 'object'
    ? raw.permanentHerbs
    : {};

  // vizCrops — merge permanent herb crops; synthesize missing entries from crops array
  const vizCrops = { ...(raw.vizCrops ?? {}) };
  for (const crop of crops) {
    if (!vizCrops[crop.id]) {
      vizCrops[crop.id] = { name: crop.name, color: crop.color, note: '' };
    }
  }
  // Ensure permanent herb vizCrop entries exist
  for (const bedKey of Object.keys(permanentHerbs)) {
    for (const zoneKey of Object.keys(permanentHerbs[bedKey] ?? {})) {
      for (const herb of permanentHerbs[bedKey][zoneKey] ?? []) {
        if (herb.crop && !vizCrops[herb.crop]) {
          vizCrops[herb.crop] = { name: herb.label ?? herb.crop, color: '#9b8ea0', note: 'Permanent perennial.' };
        }
      }
    }
  }

  // harvestBuffer — default 21 for any missing keys
  const harvestBuffer = raw.harvestBuffer && typeof raw.harvestBuffer === 'object'
    ? raw.harvestBuffer
    : {};

  // cropIdToVizKey — pass through (identity mapping by default)
  const cropIdToVizKey = raw.cropIdToVizKey && typeof raw.cropIdToVizKey === 'object'
    ? raw.cropIdToVizKey
    : {};

  // gardenMeta — pass through
  const gardenMeta = raw.gardenMeta ?? {};

  return {
    crops,
    events,
    bed1Zones,
    bed2Zones,
    stages,
    permanentHerbs,
    vizCrops,
    harvestBuffer,
    cropIdToVizKey,
    gardenMeta,
  };
}
