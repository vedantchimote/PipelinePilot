import { memo, useState } from 'react';

interface PathListProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const PathList = memo(({ label, value, onChange, placeholder }: PathListProps) => {
  const [newPath, setNewPath] = useState('');

  const handleAdd = () => {
    if (newPath) {
      onChange([...value, newPath]);
      setNewPath('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="space-y-1.5">
        {value.map((path, index) => (
          <div key={index} className="flex items-center gap-1.5 min-w-0">
            <div className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs font-mono truncate" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
              {path}
            </div>
            <button
              onClick={() => handleRemove(index)}
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
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md text-xs"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
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
    </div>
  );
});

PathList.displayName = 'PathList';
