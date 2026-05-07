import { memo } from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
}

export const TextArea = memo(({ label, value, onChange, placeholder, rows = 3, required, error }: TextAreaProps) => {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-lg text-sm resize-none transition-colors font-mono"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-primary)'; e.target.style.boxShadow = 'none'; }}
      />
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
});

TextArea.displayName = 'TextArea';
