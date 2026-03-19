import { PERMANENT_HERBS, CROP_ID_TO_VIZ_KEY, HARVEST_BUFFER } from '../data/stageData';

const MS_PER_DAY = 86400000;

/**
 * Compute the bed1/bed2 contents for a given stage date by filtering
 * active EVENTS and mapping them to VIZ_CROPS keys and zone slots.
 *
 * @param {Array} events - EVENTS array from seedData / state
 * @param {Array} crops  - CROPS array from seedData / state
 * @param {string|null} stageDate - ISO date string, or null for permanent-only
 * @returns {{ bed1: object, bed2: object }}
 */
export function computeBedsAtDate(events, crops, stageDate) {
  const bed1 = { trellis: [], stripA: [], stripB: [], stripC: [] };
  const bed2 = { strip1: [], strip2: [], strip3: [], strip4: [] };

  if (stageDate !== null) {
    const stageDateMs = new Date(stageDate).getTime();
    const cropMap = Object.fromEntries(crops.map(c => [c.id, c]));

    for (const event of events) {
      const crop = cropMap[event.cropId];
      if (!crop) continue;

      const sowMs = new Date(event.sowDate).getTime();
      const buffer = HARVEST_BUFFER[event.cropId] ?? 14;
      const endMs = sowMs + (crop.daysToMaturity + buffer) * MS_PER_DAY;

      if (sowMs > stageDateMs || stageDateMs > endMs) continue;

      const vizKey = CROP_ID_TO_VIZ_KEY[event.cropId] ?? event.cropId;

      let label;
      if (event.season === 'summer') {
        label = crop.name;
      } else if (event.season === 'fall') {
        label = `${crop.name} F${event.successionRound}`;
      } else {
        label = `${crop.name} S${event.successionRound}`;
      }

      const item = { crop: vizKey, label };

      if (event.bed === 1) {
        const zone =
          event.strip === 'trellis' ? 'trellis' :
          event.strip === 'A'       ? 'stripA'  :
          event.strip === 'B'       ? 'stripB'  :
          event.strip === 'C'       ? 'stripC'  : null;
        if (zone) bed1[zone].push(item);
      } else if (event.bed === 2) {
        const zone =
          event.strip === '1' ? 'strip1' :
          event.strip === '2' ? 'strip2' :
          event.strip === '3' ? 'strip3' :
          event.strip === '4' ? 'strip4' : null;
        if (zone) bed2[zone].push(item);
      }
    }
  }

  // Merge permanent herbs (prepended so they always appear first)
  bed1.trellis.unshift(...PERMANENT_HERBS.bed1.trellis);
  bed2.strip1.unshift(...PERMANENT_HERBS.bed2.strip1);
  bed2.strip2.unshift(...PERMANENT_HERBS.bed2.strip2);

  return { bed1, bed2 };
}
