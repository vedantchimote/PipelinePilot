import { memo, useState } from 'react';

interface KeyValueListProps {
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export const KeyValueList = memo(({ value, onChange }: KeyValueListProps) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey && newValue) {
      onChange({ ...value, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (key: string) => {
    const updated = { ...value };
    delete updated[key];
    onChange(updated);
  };

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div className="space-y-2 min-w-0">
      {Object.entries(value).map(([key, val]) => (
        <div key={key} className="flex items-center gap-1.5 min-w-0">
          <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs font-mono truncate" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            {key}
          </div>
          <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>=</span>
          <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs font-mono truncate" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            {val}
          </div>
          <button
            onClick={() => handleRemove(key)}
            className="flex-shrink-0 p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Key"
          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-primary)'; }}
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Value"
          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs"
          style={inputStyle}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-primary)'; }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        />
        <button
          onClick={handleAdd}
          className="flex-shrink-0 p-1 rounded transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
});

KeyValueList.displayName = 'KeyValueList';
