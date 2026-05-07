import { memo } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const TextInput = memo(({ label, value, onChange, placeholder, required, error, helpText }: TextInputProps) => {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const helpId = helpText ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={inputId} className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-primary)'; e.target.style.boxShadow = 'none'; }}
      />
      {helpText && <p id={helpId} className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>{helpText}</p>}
      {error && <p id={errorId} className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
});

TextInput.displayName = 'TextInput';
