import { formatDate, addDays } from '../utils/dateUtils';

const SEASON_BADGE = {
  spring: 'bg-green-100 text-green-800',
  summer: 'bg-orange-100 text-orange-800',
  fall: 'bg-purple-100 text-purple-800',
};

export default function CropList({ events, crops, onEdit, onDelete, onAdd }) {
  const sorted = [...events].sort((a, b) => a.sowDate.localeCompare(b.sowDate));

  function getCrop(cropId) {
    return crops.find(c => c.id === cropId);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{events.length} planting events</p>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          + Add Event
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="pb-2 pr-4">Crop</th>
              <th className="pb-2 pr-4">Season</th>
              <th className="pb-2 pr-4">Bed / Strip</th>
              <th className="pb-2 pr-4">Sow Date</th>
              <th className="pb-2 pr-4">Harvest Starts</th>
              <th className="pb-2 pr-4">Harvest Ends</th>
              <th className="pb-2 pr-4">Round</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {sorted.map(event => {
              const crop = getCrop(event.cropId);
              if (!crop) return null;
              const harvestStart = addDays(event.sowDate, crop.daysToMaturity);
              const harvestEnd = addDays(event.sowDate, crop.daysToMaturity + 21);

              return (
                <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-800">{crop.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEASON_BADGE[event.season] ?? 'bg-gray-100 text-gray-700'}`}>
                      {event.season}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">Bed {event.bed} / {event.strip}</td>
                  <td className="py-2 pr-4 text-gray-600">{formatDate(event.sowDate)}</td>
                  <td className="py-2 pr-4 text-gray-600">{formatDate(harvestStart)}</td>
                  <td className="py-2 pr-4 text-gray-600">{formatDate(harvestEnd)}</td>
                  <td className="py-2 pr-4 text-gray-500">#{event.successionRound}</td>
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => onEdit(event)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
