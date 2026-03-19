import { formatDate, addDays } from './dateUtils';

function getCropName(cropId, crops) {
  return crops.find(c => c.id === cropId)?.name ?? cropId;
}

function eventsBySeasonAndBed(events, season, bed) {
  return events.filter(e => e.season === season && e.bed === bed);
}

function successionTable(events, crops, season) {
  // Group by sow date for succession calendar rows
  const byDate = {};
  events.filter(e => e.season === season).forEach(e => {
    if (!byDate[e.sowDate]) byDate[e.sowDate] = new Set();
    byDate[e.sowDate].add(getCropName(e.cropId, crops));
  });
  const rows = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
  if (!rows.length) return '';
  const header = `| Round | Date | Crops to sow |\n|---|---|---|`;
  const body = rows.map(([date, cropSet], i) =>
    `| ${season[0].toUpperCase()}${i + 1} | **${formatDate(date)}** | ${[...cropSet].join(', ')} |`
  ).join('\n');
  return `${header}\n${body}`;
}

function bedSection(events, crops, season, bed) {
  const list = eventsBySeasonAndBed(events, season, bed);
  if (!list.length) return '';
  const lines = list.map(e => {
    const crop = crops.find(c => c.id === e.cropId);
    const harvest = crop ? addDays(e.sowDate, crop.daysToMaturity) : '?';
    return `- **${getCropName(e.cropId, crops)}** — Strip ${e.strip}, sow ${formatDate(e.sowDate)}, harvest ~${formatDate(harvest)}`;
  });
  return `**Bed ${bed}:**\n${lines.join('\n')}`;
}

export function toMarkdown(events, crops) {
  const year = events[0]?.sowDate?.slice(0, 4) ?? new Date().getFullYear();
  const seasons = ['spring', 'summer', 'fall'];

  const sections = seasons.map(season => {
    const title = season.charAt(0).toUpperCase() + season.slice(1);
    const b1 = bedSection(events, crops, season, 1);
    const b2 = bedSection(events, crops, season, 2);
    const table = successionTable(events, crops, season);
    return `## ${title}\n\n${b1}\n\n${b2}\n\n### Succession Calendar\n\n${table}`;
  });

  return `# Vegetable Garden Plan — ${year}\n\n` + sections.join('\n\n---\n\n');
}

export function toJSON(events, crops) {
  return JSON.stringify({ crops, events }, null, 2);
}

export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
