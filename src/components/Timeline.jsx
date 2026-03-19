import { dayOfYear, daysInYear, formatDate, addDays, monthLabels } from '../utils/dateUtils';

const SEASON_COLORS = {
  spring: '#22c55e',
  summer: '#f97316',
  fall: '#a855f7',
};

export default function Timeline({ events, crops, year, onEdit }) {
  const total = daysInYear(year);
  const months = monthLabels(year);

  // Sort events by sow date
  const sorted = [...events].sort((a, b) => a.sowDate.localeCompare(b.sowDate));

  function pct(isoDate) {
    const day = dayOfYear(isoDate);
    return Math.min(100, Math.max(0, (day / total) * 100));
  }

  function getCrop(cropId) {
    return crops.find(c => c.id === cropId);
  }

  return (
    <div className="overflow-x-auto">
      {/* Month header */}
      <div className="relative h-6 mb-1" style={{ minWidth: 800 }}>
        <div className="flex h-full">
          {months.map(m => {
            const left = pct(m.day);
            return (
              <div
                key={m.label}
                className="absolute text-xs text-gray-500 font-medium"
                style={{ left: `${left}%` }}
              >
                {m.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid + bars */}
      <div className="relative border border-gray-200 rounded bg-gray-50" style={{ minWidth: 800 }}>
        {/* Month grid lines */}
        {months.map(m => (
          <div
            key={m.label}
            className="absolute top-0 bottom-0 border-l border-gray-200"
            style={{ left: `${pct(m.day)}%` }}
          />
        ))}

        {/* Today line */}
        {(() => {
          const today = new Date().toISOString().slice(0, 10);
          const todayPct = pct(today);
          if (today.startsWith(String(year))) {
            return (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-400 z-10"
                style={{ left: `${todayPct}%` }}
                title="Today"
              />
            );
          }
          return null;
        })()}

        {/* Bars */}
        <div className="flex flex-col gap-0.5 p-1">
          {sorted.map(event => {
            const crop = getCrop(event.cropId);
            if (!crop) return null;
            const harvestEndDate = addDays(event.sowDate, crop.daysToMaturity + 21);
            const left = pct(event.sowDate);
            const right = pct(harvestEndDate);
            const harvestLeft = pct(addDays(event.sowDate, crop.daysToMaturity));
            const color = SEASON_COLORS[event.season] ?? '#6b7280';

            return (
              <div key={event.id} className="relative h-6" title={`${crop.name} — Bed ${event.bed}, Strip ${event.strip}`}>
                {/* Sow → harvest bar */}
                <div
                  className="absolute h-full rounded-l opacity-60 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{
                    left: `${left}%`,
                    width: `${harvestLeft - left}%`,
                    backgroundColor: color,
                  }}
                  onClick={() => onEdit(event)}
                />
                {/* Harvest window bar */}
                <div
                  className="absolute h-full rounded-r opacity-30 cursor-pointer hover:opacity-60 transition-opacity"
                  style={{
                    left: `${harvestLeft}%`,
                    width: `${right - harvestLeft}%`,
                    backgroundColor: color,
                  }}
                  onClick={() => onEdit(event)}
                />
                {/* Label */}
                <span
                  className="absolute text-xs font-medium text-white truncate px-1 leading-6 pointer-events-none"
                  style={{ left: `${left}%`, maxWidth: `${right - left}%` }}
                >
                  {crop.name} B{event.bed}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        {Object.entries(SEASON_COLORS).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: c }} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded opacity-60 bg-gray-400" />
          Sow→harvest
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded opacity-30 bg-gray-400" />
          Harvest window
        </span>
      </div>
    </div>
  );
}
