import { useState, useEffect } from 'react';
import { CROPS, EVENTS } from './data/seedData';
import Timeline from './components/Timeline';
import CropList from './components/CropList';
import CropForm from './components/CropForm';
import ExportPanel from './components/ExportPanel';
import BedVisualizer from './components/BedVisualizer';

const STORAGE_KEY = 'garden-planner-v1';
const TABS = ['Timeline', 'Crops', 'Export', 'Beds'];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(events, crops) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, crops }));
}

export default function App() {
  const initial = loadState();
  const [events, setEvents] = useState(initial?.events ?? EVENTS);
  const [crops] = useState(initial?.crops ?? CROPS);
  const [tab, setTab] = useState('Timeline');
  const [editing, setEditing] = useState(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    saveState(events, crops);
  }, [events, crops]);

  function handleSave(event) {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      if (idx === -1) return [...prev, event];
      const next = [...prev];
      next[idx] = event;
      return next;
    });
    setEditing(null);
  }

  function handleDelete(id) {
    if (!confirm('Delete this planting event?')) return;
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  function handleReset() {
    if (!confirm('Reset to the original garden plan? All changes will be lost.')) return;
    setEvents(EVENTS);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Garden Planner</h1>
          <p className="text-xs text-gray-400 mt-0.5">Zone 7b · 2 raised beds · {year}</p>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Reset to original
        </button>
      </header>

      <nav className="border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <main className="px-6 py-6">
        {tab === 'Timeline' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Click any bar to edit that planting event. Darker = growing period, lighter = harvest window.
            </p>
            <Timeline events={events} crops={crops} year={year} onEdit={setEditing} />
          </div>
        )}
        {tab === 'Crops' && (
          <CropList
            events={events}
            crops={crops}
            onEdit={setEditing}
            onDelete={handleDelete}
            onAdd={() => setEditing('new')}
          />
        )}
        {tab === 'Export' && (
          <ExportPanel events={events} crops={crops} />
        )}
        {tab === 'Beds' && <BedVisualizer events={events} crops={crops} />}
      </main>

      {editing !== null && (
        <CropForm
          event={editing === 'new' ? null : editing}
          crops={crops}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
