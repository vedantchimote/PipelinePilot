/**
 * AIScriptHelper Component
 * "Describe what this job should do" → auto-generate the script block
 * Uses intelligent template matching (no external API required)
 */

import { memo, useState } from 'react';

const PATTERNS: { keywords: string[]; script: string[]; image?: string }[] = [
  { keywords: ['node', 'npm', 'install', 'javascript', 'js'], script: ['npm ci', 'npm run build'], image: 'node:20-alpine' },
  { keywords: ['test', 'unit', 'jest', 'mocha'], script: ['npm ci', 'npm run test -- --coverage'], image: 'node:20-alpine' },
  { keywords: ['lint', 'eslint', 'prettier', 'format'], script: ['npm ci', 'npm run lint'], image: 'node:20-alpine' },
  { keywords: ['python', 'pip', 'django', 'flask'], script: ['pip install -r requirements.txt', 'python -m pytest'], image: 'python:3.12-slim' },
  { keywords: ['docker', 'build', 'container', 'image'], script: ['docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY', 'docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .', 'docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA'], image: 'docker:24' },
  { keywords: ['deploy', 'kubernetes', 'k8s', 'kubectl'], script: ['kubectl config use-context $KUBE_CONTEXT', 'kubectl apply -f k8s/deployment.yml', 'kubectl rollout status deployment/app'], image: 'bitnami/kubectl:latest' },
  { keywords: ['terraform', 'infrastructure', 'iac'], script: ['terraform init', 'terraform plan -out=plan.tfplan', 'terraform apply plan.tfplan'], image: 'hashicorp/terraform:1.7' },
  { keywords: ['helm', 'chart', 'release'], script: ['helm repo update', 'helm upgrade --install app ./charts/app -f values.yml'], image: 'alpine/helm:3.14' },
  { keywords: ['security', 'scan', 'vulnerability', 'sast'], script: ['npm audit --audit-level=high', 'npx snyk test || true'], image: 'node:20-alpine' },
  { keywords: ['go', 'golang', 'compile'], script: ['go mod download', 'go build -o app ./cmd/...', 'go test ./...'], image: 'golang:1.22-alpine' },
  { keywords: ['rust', 'cargo'], script: ['cargo build --release', 'cargo test'], image: 'rust:1.77-slim' },
  { keywords: ['java', 'maven', 'gradle', 'spring'], script: ['mvn clean package -DskipTests', 'mvn test'], image: 'maven:3.9-eclipse-temurin-21' },
  { keywords: ['publish', 'npm', 'registry', 'package'], script: ['npm ci', 'npm version $CI_COMMIT_TAG --no-git-tag-version', 'npm publish --access public'], image: 'node:20-alpine' },
  { keywords: ['aws', 's3', 'cloudfront', 'lambda'], script: ['aws s3 sync ./dist s3://$S3_BUCKET --delete', 'aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"'], image: 'amazon/aws-cli:2' },
  { keywords: ['ansible', 'playbook', 'provision'], script: ['ansible-playbook -i inventory.yml site.yml'], image: 'cytopia/ansible:latest' },
  { keywords: ['notify', 'slack', 'notification', 'alert'], script: ['curl -X POST -H "Content-type: application/json" --data \'{"text":"Deployment completed"}\' $SLACK_WEBHOOK_URL'] },
  { keywords: ['cache', 'clean', 'cleanup', 'prune'], script: ['docker system prune -af', 'rm -rf /tmp/*', 'echo "Cleanup complete"'] },
  { keywords: ['migrate', 'database', 'db', 'migration'], script: ['npm run db:migrate', 'npm run db:seed'], image: 'node:20-alpine' },
];

function generateScript(description: string): { script: string[]; image?: string } {
  const lower = description.toLowerCase();
  let bestMatch = { score: 0, pattern: PATTERNS[0] };

  for (const pattern of PATTERNS) {
    const score = pattern.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestMatch.score) bestMatch = { score, pattern };
  }

  if (bestMatch.score > 0) {
    return { script: bestMatch.pattern.script, image: bestMatch.pattern.image };
  }

  // Fallback: generic script
  return { script: [`echo "Running: ${description}"`, `# TODO: Add your commands here`] };
}

interface AIScriptHelperProps {
  onGenerate: (script: string[], image?: string) => void;
  onClose: () => void;
}

export const AIScriptHelper = memo(({ onGenerate, onClose }: AIScriptHelperProps) => {
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<{ script: string[]; image?: string } | null>(null);

  const handleGenerate = () => {
    if (!description.trim()) return;
    const result = generateScript(description);
    setPreview(result);
  };

  const handleApply = () => {
    if (preview) {
      onGenerate(preview.script, preview.image);
      onClose();
    }
  };

  const suggestions = [
    'Build a Node.js application',
    'Run Python unit tests',
    'Build and push Docker image',
    'Deploy to Kubernetes',
    'Run Terraform infrastructure',
    'Security vulnerability scan',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl w-[480px] mx-4 scale-in overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>AI Script Helper</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Describe what this job should do</p>
            </div>
          </div>
          <button onClick={onClose} className="toolbar-btn p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Input */}
        <div className="px-6 py-4 space-y-3">
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setPreview(null); }}
            placeholder="e.g. Build a Docker image and push it to the registry"
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', outline: 'none', resize: 'none' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setDescription(s); setPreview(null); }}
                className="px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={!description.trim()} className="btn-primary w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Generate Script
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="px-6 py-4 space-y-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Generated Script</label>
            {preview.image && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                image: {preview.image}
              </div>
            )}
            <pre className="px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
              {preview.script.map((line, i) => <div key={i}>- {line}</div>)}
            </pre>
            <button onClick={handleApply} className="w-full py-2 rounded-xl text-sm font-semibold transition-colors" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              Apply to Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

AIScriptHelper.displayName = 'AIScriptHelper';
export default AIScriptHelper;
