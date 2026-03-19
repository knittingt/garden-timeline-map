import { useState } from 'react';
import { toMarkdown, toJSON, downloadFile } from '../utils/exportUtils';

export default function ExportPanel({ events, crops }) {
  const [format, setFormat] = useState('md');
  const content = format === 'md' ? toMarkdown(events, crops) : toJSON(events, crops);
  const mime = format === 'md' ? 'text/markdown' : 'application/json';
  const filename = format === 'md' ? 'garden-plan.md' : 'garden-plan.json';

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => alert('Copied to clipboard!'));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">Format:</span>
        {['md', 'json'].map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              format === f
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
            }`}
          >
            .{f}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Copy
        </button>
        <button
          onClick={() => downloadFile(content, filename, mime)}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          Download {filename}
        </button>
      </div>

      <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 overflow-auto max-h-[60vh] whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  );
}
