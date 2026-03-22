// Seed data derived from 2026-full-garden.md (Zone 7b garden plan)
// Dates are for 2026. Last frost ~Apr 20, first frost ~Oct 24.

export const CROPS = [
  { id: 'kale',        name: 'Kale',               daysToMaturity: 55, color: '#16a34a' },
  { id: 'chard',       name: 'Swiss Chard',         daysToMaturity: 50, color: '#15803d' },
  { id: 'bok-choy',    name: 'Bok Choy',            daysToMaturity: 45, color: '#4ade80' },
  { id: 'cilantro',    name: 'Cilantro',            daysToMaturity: 35, color: '#86efac' },
  { id: 'dill',        name: 'Dill',                daysToMaturity: 40, color: '#bbf7d0' },
  { id: 'snappeas',    name: 'Sugar Snap Peas',     daysToMaturity: 60, color: '#22d3ee' },
  { id: 'cucumber',    name: 'Persian Cucumber',    daysToMaturity: 55, color: '#06b6d4' },
  { id: 'tomato-roma', name: 'Roma Tomato',         daysToMaturity: 75, color: '#ef4444' },
  { id: 'tomato-cherry','name': 'Cherry Tomato',    daysToMaturity: 65, color: '#f87171' },
  { id: 'zucchini',    name: 'Zucchini',            daysToMaturity: 50, color: '#f59e0b' },
  { id: 'melon',       name: 'MN Midget Melon',     daysToMaturity: 75, color: '#fbbf24' },
  { id: 'thai-chili',  name: 'Thai Chili',          daysToMaturity: 80, color: '#fb923c' },
  { id: 'jalapeno',    name: 'Jalapeño',            daysToMaturity: 75, color: '#f97316' },
];

// Helper
function iso(month, day) {
  return `2026-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

// Each entry = one sow batch (succession rounds generate sibling entries sharing a groupId)
export const EVENTS = [
  // ── SPRING ──────────────────────────────────────────────────────
  // S1 Mar 14
  { id: 's1-kale',       cropId: 'kale',        bed: 1, strip: 'A', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-kale' },
  { id: 's1-chard',      cropId: 'chard',       bed: 1, strip: 'B', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-chard' },
  { id: 's1-snappeas',   cropId: 'snappeas',    bed: 1, strip: 'trellis', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-snappeas' },
  { id: 's1-bokchoy',    cropId: 'bok-choy',    bed: 1, strip: 'C', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-bokchoy' },
  { id: 's1-kale-b2',    cropId: 'kale',        bed: 2, strip: '1', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-kale-b2' },
  { id: 's1-chard-b2',   cropId: 'chard',       bed: 2, strip: '2', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-chard-b2' },
  { id: 's1-bokchoy-b2', cropId: 'bok-choy',    bed: 2, strip: '3', sowDate: iso(3,14), season: 'spring', successionRound: 1, groupId: 'g-bokchoy-b2' },

  // S2 Mar 28
  { id: 's2-cilantro',   cropId: 'cilantro',    bed: 1, strip: 'C', sowDate: iso(3,28), season: 'spring', successionRound: 2, groupId: 'g-cilantro' },
  { id: 's2-dill',       cropId: 'dill',        bed: 1, strip: 'C', sowDate: iso(3,28), season: 'spring', successionRound: 2, groupId: 'g-dill' },
  { id: 's2-bokchoy2',   cropId: 'bok-choy',    bed: 1, strip: 'C', sowDate: iso(3,28), season: 'spring', successionRound: 2, groupId: 'g-bokchoy' },
  { id: 's2-cilantro-b2',cropId: 'cilantro',    bed: 2, strip: '4', sowDate: iso(3,28), season: 'spring', successionRound: 2, groupId: 'g-cilantro-b2' },
  { id: 's2-dill-b2',    cropId: 'dill',        bed: 2, strip: '4', sowDate: iso(3,28), season: 'spring', successionRound: 2, groupId: 'g-dill-b2' },

  // S3 Apr 11
  { id: 's3-kale',       cropId: 'kale',        bed: 1, strip: 'A', sowDate: iso(4,11), season: 'spring', successionRound: 2, groupId: 'g-kale' },
  { id: 's3-chard',      cropId: 'chard',       bed: 1, strip: 'B', sowDate: iso(4,11), season: 'spring', successionRound: 2, groupId: 'g-chard' },
  { id: 's3-cilantro2',  cropId: 'cilantro',    bed: 1, strip: 'C', sowDate: iso(4,11), season: 'spring', successionRound: 3, groupId: 'g-cilantro' },
  { id: 's3-dill2',      cropId: 'dill',        bed: 1, strip: 'C', sowDate: iso(4,11), season: 'spring', successionRound: 3, groupId: 'g-dill' },
  { id: 's3-bokchoy3',   cropId: 'bok-choy',    bed: 2, strip: '3', sowDate: iso(4,11), season: 'spring', successionRound: 3, groupId: 'g-bokchoy-b2' },

  // S4 Apr 25
  { id: 's4-cilantro',   cropId: 'cilantro',    bed: 1, strip: 'C', sowDate: iso(4,25), season: 'spring', successionRound: 4, groupId: 'g-cilantro' },
  { id: 's4-dill',       cropId: 'dill',        bed: 1, strip: 'C', sowDate: iso(4,25), season: 'spring', successionRound: 4, groupId: 'g-dill' },
  { id: 's4-bokchoy',    cropId: 'bok-choy',    bed: 2, strip: '3', sowDate: iso(4,25), season: 'spring', successionRound: 4, groupId: 'g-bokchoy-b2' },

  // Cucumbers May 12
  { id: 'cucumber1',     cropId: 'cucumber',    bed: 1, strip: 'trellis', sowDate: iso(5,12), season: 'spring', successionRound: 1, groupId: 'g-cucumber' },

  // ── SUMMER ──────────────────────────────────────────────────────
  { id: 'sum-roma',      cropId: 'tomato-roma',  bed: 2, strip: '1', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-roma' },
  { id: 'sum-cherry',    cropId: 'tomato-cherry',bed: 1, strip: 'A', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-cherry' },
  { id: 'sum-zucchini',  cropId: 'zucchini',     bed: 2, strip: '4', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-zucchini' },
  { id: 'sum-melon1',    cropId: 'melon',        bed: 2, strip: '2', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-melon' },
  { id: 'sum-melon2',    cropId: 'melon',        bed: 2, strip: '3', sowDate: iso(5,15), season: 'summer', successionRound: 2, groupId: 'g-melon' },
  { id: 'sum-thai1',     cropId: 'thai-chili',   bed: 1, strip: 'B', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-thai' },
  { id: 'sum-thai2',     cropId: 'thai-chili',   bed: 1, strip: 'B', sowDate: iso(5,15), season: 'summer', successionRound: 2, groupId: 'g-thai' },
  { id: 'sum-jalapeno',  cropId: 'jalapeno',     bed: 1, strip: 'C', sowDate: iso(5,15), season: 'summer', successionRound: 1, groupId: 'g-jalapeno' },

  // ── FALL ────────────────────────────────────────────────────────
  // F1 Jul 31
  { id: 'f1-kale',       cropId: 'kale',     bed: 2, strip: '1', sowDate: iso(7,31), season: 'fall', successionRound: 1, groupId: 'g-fall-kale' },
  { id: 'f1-chard',      cropId: 'chard',    bed: 2, strip: '2', sowDate: iso(7,31), season: 'fall', successionRound: 1, groupId: 'g-fall-chard' },
  { id: 'f1-snappeas',   cropId: 'snappeas', bed: 2, strip: '2', sowDate: iso(7,31), season: 'fall', successionRound: 1, groupId: 'g-fall-snappeas' },
  { id: 'f1-bokchoy',    cropId: 'bok-choy', bed: 2, strip: '3', sowDate: iso(7,31), season: 'fall', successionRound: 1, groupId: 'g-fall-bokchoy' },

  // F2 Aug 14
  { id: 'f2-cilantro',   cropId: 'cilantro', bed: 2, strip: '4', sowDate: iso(8,14), season: 'fall', successionRound: 2, groupId: 'g-fall-cilantro' },
  { id: 'f2-dill',       cropId: 'dill',     bed: 2, strip: '4', sowDate: iso(8,14), season: 'fall', successionRound: 2, groupId: 'g-fall-dill' },
  { id: 'f2-bokchoy',    cropId: 'bok-choy', bed: 2, strip: '3', sowDate: iso(8,14), season: 'fall', successionRound: 2, groupId: 'g-fall-bokchoy' },

  // F3 Aug 28
  { id: 'f3-cilantro',   cropId: 'cilantro', bed: 1, strip: 'C', sowDate: iso(8,28), season: 'fall', successionRound: 3, groupId: 'g-fall-cilantro' },
  { id: 'f3-dill',       cropId: 'dill',     bed: 1, strip: 'C', sowDate: iso(8,28), season: 'fall', successionRound: 3, groupId: 'g-fall-dill' },
  { id: 'f3-bokchoy',    cropId: 'bok-choy', bed: 1, strip: 'C', sowDate: iso(8,28), season: 'fall', successionRound: 3, groupId: 'g-fall-bokchoy' },
  { id: 'f3-kale',       cropId: 'kale',     bed: 1, strip: 'trellis', sowDate: iso(8,28), season: 'fall', successionRound: 2, groupId: 'g-fall-kale' },

  // F4 Sep 11
  { id: 'f4-cilantro',   cropId: 'cilantro', bed: 2, strip: '4', sowDate: iso(9,11), season: 'fall', successionRound: 4, groupId: 'g-fall-cilantro' },
  { id: 'f4-dill',       cropId: 'dill',     bed: 2, strip: '4', sowDate: iso(9,11), season: 'fall', successionRound: 4, groupId: 'g-fall-dill' },
];
