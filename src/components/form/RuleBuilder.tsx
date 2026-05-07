import { memo, useState } from 'react';
import type { Rule } from '@/types';

interface RuleBuilderProps {
  value: Rule[];
  onChange: (value: Rule[]) => void;
}

const COMMON_PATTERNS = [
  { label: 'Main branch', rule: { if: '$CI_COMMIT_BRANCH == "main"' } },
  { label: 'Merge requests', rule: { if: '$CI_PIPELINE_SOURCE == "merge_request_event"' } },
  { label: 'Tags only', rule: { if: '$CI_COMMIT_TAG' } },
  { label: 'Manual', rule: { when: 'manual' as const } },
];

export const RuleBuilder = memo(({ value, onChange }: RuleBuilderProps) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customIf, setCustomIf] = useState('');
  const [customWhen, setCustomWhen] = useState<'on_success' | 'on_failure' | 'always' | 'manual' | 'delayed'>('on_success');

  const handleAddPattern = (rule: Rule) => {
    onChange([...value, rule]);
  };

  const handleAddCustom = () => {
    if (customIf) {
      onChange([...value, { if: customIf, when: customWhen }]);
      setCustomIf('');
      setShowCustom(false);
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <div className="space-y-2.5 min-w-0">
      <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Rules</label>

      {/* Existing Rules */}
      {value.map((rule, index) => (
        <div key={index} className="flex items-start gap-1.5 p-2.5 rounded-lg min-w-0" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex-1 min-w-0 text-xs font-mono space-y-0.5">
            {rule.if && <div className="truncate"><span style={{ color: 'var(--text-muted)' }}>if:</span> <span style={{ color: 'var(--text-primary)' }}>{rule.if}</span></div>}
            {rule.when && <div className="truncate"><span style={{ color: 'var(--text-muted)' }}>when:</span> <span style={{ color: 'var(--accent)' }}>{rule.when}</span></div>}
            {rule.changes && <div className="truncate"><span style={{ color: 'var(--text-muted)' }}>changes:</span> <span style={{ color: 'var(--text-primary)' }}>{rule.changes.join(', ')}</span></div>}
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

      {/* Common Patterns */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quick add</div>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_PATTERNS.map((pattern, index) => (
            <button
              key={index}
              onClick={() => handleAddPattern(pattern.rule)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {pattern.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Rule */}
      {!showCustom ? (
        <button
          onClick={() => setShowCustom(true)}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)', border: '1px dashed var(--border-secondary)' }}
        >
          + Add Custom Rule
        </button>
      ) : (
        <div className="space-y-2 p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
          <input
            type="text"
            value={customIf}
            onChange={(e) => setCustomIf(e.target.value)}
            placeholder='$CI_COMMIT_BRANCH == "develop"'
            className="w-full px-2.5 py-1.5 rounded-md text-xs font-mono"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-primary)'; }}
          />
          <select
            value={customWhen}
            onChange={(e) => setCustomWhen(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-md text-xs"
            style={inputStyle}
          >
            <option value="on_success">on_success</option>
            <option value="on_failure">on_failure</option>
            <option value="always">always</option>
            <option value="manual">manual</option>
            <option value="delayed">delayed</option>
          </select>
          <div className="flex gap-1.5">
            <button
              onClick={handleAddCustom}
              className="btn-primary flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Add
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="toolbar-btn toolbar-btn-labeled px-3 py-1.5 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

RuleBuilder.displayName = 'RuleBuilder';
