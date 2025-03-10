import { memo, useState } from 'react';
import type { Rule } from '@/types';

interface RuleBuilderProps {
  value: Rule[];
  onChange: (value: Rule[]) => void;
}

const COMMON_PATTERNS = [
  { label: 'Only main branch', rule: { if: '$CI_COMMIT_BRANCH == "main"' } },
  { label: 'Only merge requests', rule: { if: '$CI_PIPELINE_SOURCE == "merge_request_event"' } },
  { label: 'Only tags', rule: { if: '$CI_COMMIT_TAG' } },
  { label: 'Manual trigger', rule: { when: 'manual' as const } },
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

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">Rules</label>
      
      {/* Existing Rules */}
      {value.map((rule, index) => (
        <div key={index} className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
          <div className="flex-1 text-sm text-white">
            {rule.if && <div><span className="text-gray-400">if:</span> {rule.if}</div>}
            {rule.when && <div><span className="text-gray-400">when:</span> {rule.when}</div>}
            {rule.changes && <div><span className="text-gray-400">changes:</span> {rule.changes.join(', ')}</div>}
          </div>
          <button
            onClick={() => handleRemove(index)}
            className="p-2 text-red-400 hover:text-red-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}

      {/* Common Patterns */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-medium">Common Patterns</div>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_PATTERNS.map((pattern, index) => (
            <button
              key={index}
              onClick={() => handleAddPattern(pattern.rule)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors text-left"
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
          className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-blue-400 text-sm rounded-lg transition-colors"
        >
          + Add Custom Rule
        </button>
      ) : (
        <div className="space-y-2 p-3 bg-gray-700 rounded-lg">
          <input
            type="text"
            value={customIf}
            onChange={(e) => setCustomIf(e.target.value)}
            placeholder='$CI_COMMIT_BRANCH == "develop"'
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={customWhen}
            onChange={(e) => setCustomWhen(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="on_success">on_success</option>
            <option value="on_failure">on_failure</option>
            <option value="always">always</option>
            <option value="manual">manual</option>
            <option value="delayed">delayed</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddCustom}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowCustom(false)}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
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
