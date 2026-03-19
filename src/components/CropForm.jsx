import { useState, useEffect } from 'react';
import { addDays, formatDate } from '../utils/dateUtils';

const SEASONS = ['spring', 'summer', 'fall'];
const STRIPS_BED1 = ['trellis', 'A', 'B', 'C'];
const STRIPS_BED2 = ['1', '2', '3', '4'];

export default function CropForm({ event, crops, onSave, onCancel }) {
  const isNew = !event?.id;

  const [form, setForm] = useState({
    cropId: crops[0]?.id ?? '',
    bed: 1,
    strip: 'A',
    sowDate: new Date().toISOString().slice(0, 10),
    season: 'spring',
    successionRound: 1,
    groupId: '',
  });

  useEffect(() => {
    if (event) {
      setForm({
        cropId: event.cropId,
        bed: event.bed,
        strip: event.strip,
        sowDate: event.sowDate,
        season: event.season,
        successionRound: event.successionRound,
        groupId: event.groupId ?? '',
      });
    }
  }, [event]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  const crop = crops.find(c => c.id === form.cropId);
  const harvestStart = crop ? addDays(form.sowDate, crop.daysToMaturity) : null;
  const harvestEnd = crop ? addDays(form.sowDate, crop.daysToMaturity + 21) : null;

  const strips = form.bed === 1 ? STRIPS_BED1 : STRIPS_BED2;

  function handleSave() {
    const saved = {
      ...event,
      ...form,
      bed: Number(form.bed),
      successionRound: Number(form.successionRound),
      id: event?.id ?? `ev-${Date.now()}`,
      groupId: form.groupId || `g-${form.cropId}-${Date.now()}`,
    };
    onSave(saved);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isNew ? 'Add Planting Event' : 'Edit Planting Event'}
        </h2>

        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Crop</span>
            <select
              value={form.cropId}
              onChange={e => set('cropId', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {crops.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-sm font-medium text-gray-700">Season</span>
              <select
                value={form.season}
                onChange={e => set('season', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label className="block flex-1">
              <span className="text-sm font-medium text-gray-700">Bed</span>
              <select
                value={form.bed}
                onChange={e => {
                  const newBed = Number(e.target.value);
                  set('bed', newBed);
                  set('strip', newBed === 1 ? 'A' : '1');
                }}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value={1}>Bed 1 (west)</option>
                <option value={2}>Bed 2 (east)</option>
              </select>
            </label>

            <label className="block flex-1">
              <span className="text-sm font-medium text-gray-700">Strip</span>
              <select
                value={form.strip}
                onChange={e => set('strip', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {strips.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="text-sm font-medium text-gray-700">Sow Date</span>
              <input
                type="date"
                value={form.sowDate}
                onChange={e => set('sowDate', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </label>

            <label className="block w-24">
              <span className="text-sm font-medium text-gray-700">Round #</span>
              <input
                type="number"
                min={1}
                value={form.successionRound}
                onChange={e => set('successionRound', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </label>
          </div>

          {crop && (
            <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
              <span className="font-medium">Harvest:</span>{' '}
              {formatDate(harvestStart)} — {formatDate(harvestEnd)}
              {' '}({crop.daysToMaturity} days to maturity + 21-day window)
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
