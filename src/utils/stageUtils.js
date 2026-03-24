import {
  PERMANENT_HERBS as DEFAULT_HERBS,
  CROP_ID_TO_VIZ_KEY as DEFAULT_VIZ_KEY,
  HARVEST_BUFFER as DEFAULT_BUFFER,
  BED1_ZONES,
  BED2_ZONES,
} from '../data/stageData';

const MS_PER_DAY = 86400000;

/**
 * Compute the bed1/bed2 contents for a given stage date by filtering
 * active events and mapping them to vizCrops keys and zone slots.
 *
 * @param {Array} events - EVENTS array from seedData / state
 * @param {Array} crops  - CROPS array from seedData / state
 * @param {string|null} stageDate - ISO date string, or null for permanent-only
 * @param {object} options - Optional overrides for dynamic/generated plans
 * @returns {{ bed1: object, bed2: object }}
 */
export function computeBedsAtDate(events, crops, stageDate, {
  bed1Zones = BED1_ZONES,
  bed2Zones = BED2_ZONES,
  permanentHerbs = DEFAULT_HERBS,
  cropIdToVizKey = DEFAULT_VIZ_KEY,
  harvestBuffer = DEFAULT_BUFFER,
} = {}) {
  // Build zone containers dynamically from zone arrays
  const bed1 = Object.fromEntries(bed1Zones.map(z => [z.id, []]));
  const bed2 = bed2Zones ? Object.fromEntries(bed2Zones.map(z => [z.id, []])) : {};

  // Legacy strip name → zone id mappings for backward compat with seed data
  const legacyBed1Map = { trellis: 'trellis', A: 'stripA', B: 'stripB', C: 'stripC' };
  const legacyBed2Map = { 1: 'strip1', 2: 'strip2', 3: 'strip3', 4: 'strip4' };

  if (stageDate !== null) {
    const stageDateMs = new Date(stageDate).getTime();
    const cropMap = Object.fromEntries(crops.map(c => [c.id, c]));

    for (const event of events) {
      const crop = cropMap[event.cropId];
      if (!crop) continue;

      const sowMs = new Date(event.sowDate).getTime();
      const buffer = harvestBuffer[event.cropId] ?? 14;
      const endMs = sowMs + (crop.daysToMaturity + buffer) * MS_PER_DAY;

      if (sowMs > stageDateMs || stageDateMs > endMs) continue;

      const vizKey = cropIdToVizKey[event.cropId] ?? event.cropId;

      let label;
      if (event.season === 'summer') {
        label = crop.name;
      } else if (event.season === 'fall') {
        label = `${crop.name} F${event.successionRound}`;
      } else {
        label = `${crop.name} S${event.successionRound}`;
      }

      const item = { crop: vizKey, label };
      const strip = String(event.strip);

      if (event.bed === 1) {
        // Use strip directly if it's a known zone id, otherwise try legacy mapping
        const zoneId = strip in bed1 ? strip : (legacyBed1Map[strip] ?? null);
        if (zoneId && bed1[zoneId]) bed1[zoneId].push(item);
      } else if (event.bed === 2) {
        const zoneId = strip in bed2 ? strip : (legacyBed2Map[strip] ?? null);
        if (zoneId && bed2[zoneId]) bed2[zoneId].push(item);
      }
    }
  }

  // Merge permanent herbs dynamically
  for (const [bedKey, zones] of Object.entries(permanentHerbs)) {
    const bedContainer = bedKey === 'bed1' ? bed1 : bed2;
    for (const [zoneId, herbs] of Object.entries(zones ?? {})) {
      if (bedContainer[zoneId]) {
        bedContainer[zoneId].unshift(...herbs);
      }
    }
  }

  return { bed1, bed2 };
}
