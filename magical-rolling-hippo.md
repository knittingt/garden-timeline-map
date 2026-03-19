# Garden Planner Web App

## Context
The user has a vegetable garden plan (2026-veg-garden.md) with two raised beds in Zone 7b, covering spring/summer/fall seasons with succession planting. The goal is a local React app that lets them visually edit plants, adjust sow dates, and export an updated plan — replacing the manual markdown file workflow.

## Stack
- **React + Vite** (local dev server, `npm run dev`)
- **Tailwind CSS** (styling)
- **localStorage** (persistence — no backend)
- Data seeded from the existing garden plan on first load

---

## Data Model

```js
// Crop definition
{ id, name, type, daysToMaturity, footprintSqFt, lightNeeds, notes }

// Planting event (one sow date + succession)
{
  id, cropId, bed, strip,
  sowDate,          // ISO string
  harvestStart,     // derived: sowDate + daysToMaturity
  harvestEnd,       // derived
  successionRounds, // how many more follow
  successionInterval, // days between rounds
  season            // 'spring' | 'summer' | 'fall'
}
```

State lives in `App.jsx`, persisted to `localStorage` on every change.

---

## File Structure

```
garden-planner/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── App.jsx              ← root state + routing between views
│   ├── main.jsx
│   ├── data/
│   │   └── seedData.js      ← initial crops & events from foamy-yawning-globe.md
│   ├── utils/
│   │   ├── dateUtils.js     ← add days, format, derive harvest windows
│   │   └── exportUtils.js   ← serialize state → Markdown + JSON
│   └── components/
│       ├── Timeline.jsx     ← Gantt-style bar chart (x=weeks, y=planting events)
│       ├── CropList.jsx     ← table of all planting events; edit/delete rows
│       ├── CropForm.jsx     ← add/edit a single planting event (modal/drawer)
│       └── ExportPanel.jsx  ← preview + download MD or JSON
```

---

## Views (tab-based nav)

1. **Timeline** — horizontal Gantt bars across a 52-week year axis. Each bar = one planting event, colored by season (green/orange/purple). Click a bar to edit.
2. **Crops** — table listing all planting events with columns: Crop, Bed, Sow Date, Harvest Window, Succession Rounds. Inline edit or open CropForm modal.
3. **Export** — renders the markdown plan preview; buttons to copy or download as `.md` or `.json`.

---

## Key Implementation Details

### Timeline (Gantt)
- SVG or `<div>` bars — no external chart lib needed (keeps deps minimal)
- X-axis: Jan 1 → Dec 31 of current year (or configurable year)
- Each planting event = one bar from `sowDate` to `harvestEnd`
- Succession rounds rendered as sibling bars offset below the first

### CropForm
- Fields: crop name, bed (1/2), sow date (date picker), days to maturity, succession rounds, interval (days)
- Harvest start/end auto-calculated and shown as read-only preview
- Save updates localStorage and re-renders Timeline

### Export
- `exportUtils.js` reconstructs the markdown format matching the existing `2026-veg-garden.md` structure (sections: Spring, Summer, Fall, bed layout blocks, succession calendar table)
- Also supports raw JSON export for future import

### Seed Data
`seedData.js` pre-populates all planting events from the current plan so the user starts with real data, not blank state.

---

## Setup Commands

```bash
npm create vite@latest garden-planner -- --template react
cd garden-planner
npm install
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```

---

## Verification
1. `npm run dev` opens at localhost:5173 — Timeline loads with pre-seeded planting data
2. Edit a sow date → Timeline bars update immediately
3. Add a new crop → appears in Timeline and Crops table
4. Export tab → markdown output matches the expected plan format; download works
5. Refresh page → all edits persist (localStorage)
