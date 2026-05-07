import { memo } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox = memo(({ label, checked, onChange }: CheckboxProps) => {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onChange(!checked)}>
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: checked ? 'var(--accent)' : 'var(--bg-tertiary)',
          border: checked ? 'none' : '1px solid var(--border-secondary)',
        }}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
