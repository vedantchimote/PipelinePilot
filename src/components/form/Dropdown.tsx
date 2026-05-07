import { memo } from 'react';

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export const Dropdown = memo(({ label, value, options, onChange, required, error }: DropdownProps) => {
  return (
    <div className="min-w-0">
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer transition-colors"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: '32px',
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
});

Dropdown.displayName = 'Dropdown';
