// Stage-based snapshot data for the Beds visualizer tab.
// Extracted from 2026-full-garden.md (Zone 7b garden plan).
// bed1/bed2 content is now computed dynamically via stageUtils.computeBedsAtDate.

export const VIZ_CROPS = {
  thyme:    { name: 'Thyme',            color: '#9b8ea0', note: 'Removed May 5, 2026 from Bed 1 trellis zone.' },
  rosemary: { name: 'Rosemary',         color: '#607b99', note: 'Permanent perennial. Bed 2 Strip 2 west side. Trim to footprint each spring. Prevents shading of chard and melons. Mulch base if temps drop below 10°F.' },
  oregano:  { name: 'Oregano',          color: '#a07850', note: 'Permanent perennial. NW corner of Bed 2. Trim firmly to 1 sq ft each spring. Flowers are excellent pollinator magnets.' },
  kale:     { name: 'Kale',             color: '#4a7c59', note: 'Cut-and-come-again. 2 succession rounds per season. Bolt-resistant. Goes at north end — tall leaves shade nothing south.' },
  chard:    { name: 'Swiss Chard',      color: '#c8553d', note: 'Cut-and-come-again. Very long producing season. 2 succession rounds. Tolerates light frost.' },
  snaps:    { name: 'Sugar Snaps',      color: '#8db580', note: 'Bed 1 trellis zone, SW side in a tall cage — positioned to leave trellis clear for cucumbers. Planted ~Apr 14.' },
  bokchoy:  { name: 'Bok Choy',         color: '#6b9b7e', note: '4 succession rounds. Partial PM shade in Bed 1 south slows bolting. Sow next round at first bolt signal.' },
  cilantro: { name: 'Cilantro',         color: '#b5c99a', note: '4 succession rounds. Bolts fast in warmth. Benefits greatly from partial shade. Dense broadcast sowing.' },
  dill:     { name: 'Dill',             color: '#d4e09b', note: '4 succession rounds. Bolts moderately fast. Flowering dill attracts pollinators and beneficial insects for melons.' },
  cucumber: { name: 'Persian Cucumber', color: '#3d7a4f', note: '2× Persian baby cucumbers on Bed 1 trellis. Train to trellis every few days. Direct sow at last frost (~May 12).' },
  cherry:   { name: 'Cherry Tomato',    color: '#e05c38', note: 'Indeterminate — SINGLE LEADER ONLY. Remove every sucker weekly. Aggressive grower; will overwhelm a 2.75 ft bed.' },
  roma:     { name: 'Roma Tomato',      color: '#c0392b', note: 'Semi-determinate. Prune to 1–2 leaders. Stake and tie to Bed 2 north trellis. Relatively self-limiting.' },
  zucchini: { name: 'Zucchini',         color: '#5d8233', note: '1 plant only — will massively overproduce. Leaves will sprawl over south edge. Remove aging lower leaves for airflow.' },
  melon:    { name: 'Midget Melon',     color: '#d4a843', note: '2× Minnesota Midget. Train vertically on stakes/string. Support developing fruits in mesh bags. Hand-pollinate if needed.' },
  fresno:   { name: 'Fresno Chili',     color: '#e85d04', note: '1× plant. Bed 1 Strip C. Planted May 5. Fruity heat — hotter than jalapeño when red. Productive through fall.' },
  basil:    { name: 'Basil',            color: '#84cc16', note: '1× plant. Bed 2 Strip 2. Planted May 5. Pinch flowers to extend harvest. Good companion for nearby tomatoes.' },
};

export const BED1_ZONES = [
  { id: 'trellis', label: 'Trellis · 0–24"',   trellis: true,  h: 147 },
  { id: 'stripA',  label: 'Strip A · 24–51"',  trellis: false, h: 165 },
  { id: 'stripB',  label: 'Strip B · 51–78"',  trellis: false, h: 165 },
  { id: 'stripC',  label: 'Strip C · 78–108"', trellis: false, h: 183 },
];

export const BED2_ZONES = [
  { id: 'strip1', label: 'Strip 1 · 0–27"',   trellis: true,  h: 165 },
  { id: 'strip2', label: 'Strip 2 · 27–54"',  trellis: false, h: 165 },
  { id: 'strip3', label: 'Strip 3 · 54–81"',  trellis: false, h: 165 },
  { id: 'strip4', label: 'Strip 4 · 81–108"', trellis: false, h: 165 },
];

// Permanent herbs that appear in every stage
export const PERMANENT_HERBS = {
  bed1: {
    trellis: [],
  },
  bed2: {
    strip1: [ { crop: 'oregano',  label: 'Oregano',  permanent: true } ],
    strip2: [ { crop: 'rosemary', label: 'Rosemary', permanent: true } ],
  },
};

// cropId (from seedData) → VIZ_CROPS key
export const CROP_ID_TO_VIZ_KEY = {
  'snappeas':     'snaps',
  'bok-choy':     'bokchoy',
  'tomato-roma':  'roma',
  'tomato-cherry':'cherry',
  'fresno-chili': 'fresno',
};

// Days after daysToMaturity that a crop remains in the bed (harvest window)
export const HARVEST_BUFFER = {
  'cilantro':     14,
  'dill':         14,
  'bok-choy':     14,
  'kale':         14,
  'chard':        14,
  'snappeas':     14,
  'cucumber':     100,
  'zucchini':     90,
  'melon':        60,
  'tomato-roma':  150,
  'tomato-cherry':150,
  'fresno-chili': 150,
  'basil':        120,
};

export const STAGES = [
  // ── STAGE 0: Permanent Herbs ─────────────────────────
  {
    label: 'Permanent Herbs',
    dateDisplay: 'Year-round foundation',
    stageDate: null,
    season: 'year',
    notes: 'Thyme, Rosemary, and Oregano anchor both beds year-round. They are never pulled at season transitions.',
  },

  // ── STAGE 1: Spring S1 ───────────────────────────────
  {
    label: 'Spring S1',
    dateDisplay: 'Mar 14 — First spring sow',
    stageDate: '2026-03-14',
    season: 'spring',
    notes: 'Sow: Kale, Swiss Chard, Sugar Snap Peas, Bok Choy. Sugar snaps on Bed 1 trellis — pull hard deadline May 10 to hand off to cucumbers.',
  },

  // ── STAGE 2: Spring S2 ───────────────────────────────
  {
    label: 'Spring S2',
    dateDisplay: 'Mar 28 — Second spring sow',
    stageDate: '2026-03-28',
    season: 'spring',
    notes: 'Sow: Cilantro, Dill, Bok Choy. Sugar snaps now on Bed 2 new trellis (install before this date). Cilantro & Dill go in Bed 1 south — PM shade slows bolting.',
  },

  // ── STAGE 3: Spring S3 ───────────────────────────────
  {
    label: 'Spring S3',
    dateDisplay: 'Apr 11 — Third spring sow',
    stageDate: '2026-04-11',
    season: 'spring',
    notes: 'Sow: Kale 2nd, Swiss Chard 2nd, Bok Choy, Cilantro, Dill. Triggered by first bolt signals on S1 plantings. Succession strips filling up.',
  },

  // ── STAGE 4: Spring S4 ───────────────────────────────
  {
    label: 'Spring S4',
    dateDisplay: 'Apr 25 — Final cool-season push',
    stageDate: '2026-04-25',
    season: 'spring',
    notes: '⚠ Sugar snaps on Bed 1 trellis approaching pull deadline (May 10). Last cool-season sow: Cilantro, Dill, Bok Choy. Beds at peak spring density.',
  },

  // ── STAGE 5: Cucumbers In ────────────────────────────
  {
    label: 'Cucumbers In',
    dateDisplay: 'May 12 — Trellis handoff',
    stageDate: '2026-05-12',
    season: 'spring',
    notes: 'Sugar snaps pulled from Bed 1 trellis (May 10). 2× Persian cucumbers planted at last frost. Late spring crops still active in remaining strips.',
  },

  // ── STAGE 6: Full Summer ─────────────────────────────
  {
    label: 'Full Summer',
    dateDisplay: 'June — Summer planting',
    stageDate: '2026-06-15',
    season: 'summer',
    notes: 'Spring crops cleared. All summer transplants in place. Cucumbers on Bed 1 trellis. Bed 2: full-sun heavy feeders — tomato, melons, zucchini.',
  },

  // ── STAGE 7: Fall F1 ─────────────────────────────────
  {
    label: 'Fall F1',
    dateDisplay: 'Jul 31 — Fall first sow',
    stageDate: '2026-07-31',
    season: 'fall',
    notes: 'Sow fall crops in Bed 2 south — zucchini winds down first. Tomatoes and peppers stay productive through fall. Start in south end first.',
  },

  // ── STAGE 8: Fall F2 ─────────────────────────────────
  {
    label: 'Fall F2',
    dateDisplay: 'Aug 14 — Fall second sow',
    stageDate: '2026-08-14',
    season: 'fall',
    notes: 'Sow: Cilantro, Dill, Bok Choy. Zucchini and melons likely finishing. Tomatoes and peppers remain highly productive through fall.',
  },

  // ── STAGE 9: Fall F3–F4 ──────────────────────────────
  {
    label: 'Fall F3–F4',
    dateDisplay: 'Aug 28 – Sep 11 — Final fall rounds',
    stageDate: '2026-09-11',
    season: 'fall',
    notes: 'Last succession rounds before first frost (~Oct 24). Cilantro & Dill can still mature. Bonus: cucumbers cleared Bed 1 trellis — fall kale moves in.',
  },
];
