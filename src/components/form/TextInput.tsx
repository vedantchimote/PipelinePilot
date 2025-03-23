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
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
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
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helpText && <p id={helpId} className="mt-1 text-xs text-gray-400">{helpText}</p>}
      {error && <p id={errorId} className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
});

TextInput.displayName = 'TextInput';
