import { useState, useRef, useEffect } from 'react';
import { transformGeneratedPlan } from '../utils/gardenPlanTransformer';

const UNIT_OPTS = ['in', 'ft'];

function toInches(value, unit) {
  const n = parseFloat(value);
  if (isNaN(n) || n <= 0) return null;
  return unit === 'ft' ? Math.round(n * 12) : Math.round(n);
}

function buildInitialBeds(bedCount) {
  return Array.from({ length: bedCount }, (_, i) => ({
    number: i + 1,
    width: '',
    widthUnit: 'in',
    length: '',
    lengthUnit: 'in',
  }));
}

export default function SetupPage({ onPlanGenerated }) {
  // --- Form state (phase = 'form') ---
  const [zip, setZip] = useState('');
  const [bedCount, setBedCount] = useState(1);
  const [bedInputs, setBedInputs] = useState(buildInitialBeds(1));
  const [hasPermanentPlants, setHasPermanentPlants] = useState(false);
  const [permanentPlantsDesc, setPermanentPlantsDesc] = useState('');
  const [formError, setFormError] = useState('');

  // --- Chat state ---
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [gardenInfo, setGardenInfo] = useState(null);
  const [phase, setPhase] = useState('form'); // 'form' | 'chat' | 'generating' | 'done' | 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- Bed count change ---
  function handleBedCountChange(count) {
    setBedCount(count);
    setBedInputs(prev => {
      const next = buildInitialBeds(count);
      // Preserve existing values
      for (let i = 0; i < Math.min(prev.length, count); i++) {
        next[i] = { ...prev[i], number: i + 1 };
      }
      return next;
    });
  }

  function updateBedInput(idx, field, value) {
    setBedInputs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  // --- Form submit ---
  function handleFormSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!/^\d{5}$/.test(zip.trim())) {
      setFormError('Please enter a valid 5-digit US zip code.');
      return;
    }

    const beds = [];
    for (const b of bedInputs) {
      const widthIn = toInches(b.width, b.widthUnit);
      const lengthIn = toInches(b.length, b.lengthUnit);
      if (!widthIn || !lengthIn) {
        setFormError(`Please enter valid dimensions for Bed ${b.number}.`);
        return;
      }
      beds.push({ number: b.number, widthIn, lengthIn });
    }

    // Parse permanent plants
    let permanentPlants = [];
    if (hasPermanentPlants && permanentPlantsDesc.trim()) {
      // Simple parse: each line = one plant description
      permanentPlants = permanentPlantsDesc
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
          // Try to detect bed number from text like "thyme in bed 1"
          const bedMatch = line.match(/bed\s*(\d)/i);
          return { name: line, bed: bedMatch ? parseInt(bedMatch[1]) : 1, location: '' };
        });
    }

    const info = { zip: zip.trim(), bedCount, beds, permanentPlants };
    setGardenInfo(info);
    setPhase('chat');
    fireInitialChat(info);
  }

  // --- Chat API calls ---
  async function fireInitialChat(info) {
    setIsLoading(true);
    try {
      const result = await callChatApi([], info);
      setMessages([{ role: 'assistant', content: result.reply }]);
      setGardenInfo(result.gardenInfo ?? info);
    } catch (err) {
      setMessages([{ role: 'assistant', content: 'Hello! I\'m ready to help you plan your garden. What kind of sun exposure do your beds get?' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function callChatApi(msgs, info) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, gardenInfo: info }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Chat API error ${res.status}`);
    }
    return res.json();
  }

  async function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await callChatApi(nextMessages, gardenInfo);
      const assistantMsg = { role: 'assistant', content: result.reply };
      setMessages(prev => [...prev, assistantMsg]);
      setGardenInfo(result.gardenInfo ?? gardenInfo);

      if (result.complete) {
        setPhase('generating');
        await handleGenerate(result.gardenInfo ?? gardenInfo);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, something went wrong: ${err.message}. Please try again.`,
      }]);
    } finally {
      setIsLoading(false);
      if (phase === 'chat') setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  async function handleGenerate(info) {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gardenInfo: info ?? gardenInfo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Generate API error ${res.status}`);
      }
      const raw = await res.json();
      const transformed = transformGeneratedPlan(raw);
      onPlanGenerated(transformed);
      setPhase('done');
    } catch (err) {
      setPhase('error');
      setErrorMsg(err.message);
    }
  }

  function handleRetry() {
    setPhase('chat');
    setErrorMsg('');
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ---- Render ----

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Structured Form ── */}
      <div className={`rounded-xl border border-amber-200 bg-amber-50 p-6 mb-6 transition-opacity ${phase !== 'form' ? 'opacity-60 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-semibold text-amber-900 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
          Your Garden
        </h2>
        <p className="text-sm text-amber-700 mb-4">Tell us the basics — the rest we'll work out together.</p>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Zip */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-1">Zip Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="e.g. 55401"
              className="w-32 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Bed count */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">Number of Beds</label>
            <div className="flex gap-2">
              {[1, 2].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleBedCountChange(n)}
                  className={`w-12 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    bedCount === n
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-amber-300 bg-white text-amber-800 hover:border-amber-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Bed dimensions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-amber-900">Bed Dimensions</label>
            {bedInputs.map((bed, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-amber-700 w-10">Bed {bed.number}</span>
                <input
                  type="number"
                  min="1"
                  value={bed.width}
                  onChange={e => updateBedInput(idx, 'width', e.target.value)}
                  placeholder="Width"
                  className="w-20 rounded-lg border border-amber-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <select
                  value={bed.widthUnit}
                  onChange={e => updateBedInput(idx, 'widthUnit', e.target.value)}
                  className="rounded-lg border border-amber-300 bg-white px-2 py-2 text-sm focus:outline-none"
                >
                  {UNIT_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <span className="text-amber-600 text-sm">×</span>
                <input
                  type="number"
                  min="1"
                  value={bed.length}
                  onChange={e => updateBedInput(idx, 'length', e.target.value)}
                  placeholder="Length"
                  className="w-20 rounded-lg border border-amber-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <select
                  value={bed.lengthUnit}
                  onChange={e => updateBedInput(idx, 'lengthUnit', e.target.value)}
                  className="rounded-lg border border-amber-300 bg-white px-2 py-2 text-sm focus:outline-none"
                >
                  {UNIT_OPTS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Permanent plants */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Permanent or Perennial Plants?
            </label>
            <div className="flex gap-3 mb-2">
              {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setHasPermanentPlants(val)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    hasPermanentPlants === val
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-amber-300 bg-white text-amber-800 hover:border-amber-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {hasPermanentPlants && (
              <textarea
                value={permanentPlantsDesc}
                onChange={e => setPermanentPlantsDesc(e.target.value)}
                placeholder={"One per line, e.g.:\nThyme in Bed 1\nRosemary in Bed 2"}
                rows={3}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Start Planning →
          </button>
        </form>
      </div>

      {/* ── Chat Section ── */}
      {phase !== 'form' && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-700 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && phase !== 'generating' && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === 'generating' && (
              <div className="flex justify-center py-4">
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-800">
                  <svg className="animate-spin w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generating your garden plan…
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div className="flex justify-center py-4">
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800">
                  🌱 Your garden plan is ready! Explore it in the tabs above.
                </div>
              </div>
            )}

            {phase === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 mb-2">{errorMsg || 'Something went wrong generating your plan.'}</p>
                <button
                  onClick={handleRetry}
                  className="text-xs text-red-700 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {(phase === 'chat') && (
            <div className="border-t border-gray-200 p-3 flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={2}
                disabled={isLoading}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-end"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
