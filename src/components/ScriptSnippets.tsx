/**
 * ScriptSnippets Component
 * Dropdown with common CI/CD script commands
 */

import { memo, useState, useRef, useEffect } from 'react';

const SNIPPETS = [
  { category: 'Node.js', items: [
    { label: 'npm install', value: 'npm ci' },
    { label: 'npm build', value: 'npm run build' },
    { label: 'npm test', value: 'npm run test' },
    { label: 'npm lint', value: 'npm run lint' },
  ]},
  { category: 'Docker', items: [
    { label: 'Docker build', value: 'docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .' },
    { label: 'Docker push', value: 'docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA' },
    { label: 'Docker login', value: 'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY' },
  ]},
  { category: 'Python', items: [
    { label: 'pip install', value: 'pip install -r requirements.txt' },
    { label: 'pytest', value: 'python -m pytest tests/' },
    { label: 'flake8', value: 'flake8 --max-line-length=120 .' },
  ]},
  { category: 'DevOps', items: [
    { label: 'kubectl apply', value: 'kubectl apply -f k8s/' },
    { label: 'terraform plan', value: 'terraform plan -out=tfplan' },
    { label: 'terraform apply', value: 'terraform apply tfplan' },
    { label: 'ansible playbook', value: 'ansible-playbook -i inventory playbook.yml' },
  ]},
  { category: 'General', items: [
    { label: 'Echo message', value: 'echo "Hello World"' },
    { label: 'Make build', value: 'make build' },
    { label: 'Curl health', value: 'curl -f http://localhost:8080/health || exit 1' },
  ]},
];

interface ScriptSnippetsProps {
  onInsert: (snippet: string) => void;
}

export const ScriptSnippets = memo(({ onInsert }: ScriptSnippetsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
        style={{
          background: 'var(--bg-primary)',
          border: '1px dashed var(--border-secondary)',
          color: 'var(--text-muted)',
        }}
        title="Insert script snippet"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        Snippets
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1 z-50 rounded-lg shadow-xl py-1 w-[260px] max-h-[300px] overflow-y-auto scale-in"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {SNIPPETS.map(group => (
            <div key={group.category}>
              <div
                className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}
              >
                {group.category}
              </div>
              {group.items.map(item => (
                <button
                  key={item.value}
                  onClick={() => { onInsert(item.value); setIsOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs flex flex-col transition-colors"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                  <span className="font-mono text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{item.value}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ScriptSnippets.displayName = 'ScriptSnippets';
export default ScriptSnippets;
