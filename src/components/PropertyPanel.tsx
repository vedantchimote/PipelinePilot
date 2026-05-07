/**
 * PropertyPanel Component
 * Premium sidebar for editing job configuration
 */

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateJob } from '@/store/pipelineSlice';
import { selectNode } from '@/store/uiSlice';
import type { Job_Node_Config } from '@/types';
import { validateJobConfig, getFieldError } from '@/utils/validation';
import { TextInput } from './form/TextInput';
import { TextArea } from './form/TextArea';
import { Dropdown } from './form/Dropdown';
import { KeyValueList } from './form/KeyValueList';
import { PathList } from './form/PathList';
import { Checkbox } from './form/Checkbox';
import { RuleBuilder } from './form/RuleBuilder';
import ScriptSnippets from './ScriptSnippets';

export const PropertyPanel = () => {
  const dispatch = useAppDispatch();
  const selectedNodeId = useAppSelector((state) => state.ui.selectedNodeId);
  const job = useAppSelector((state) => 
    selectedNodeId ? state.pipeline.present.jobs[selectedNodeId] : null
  );
  const stages = useAppSelector((state) => state.pipeline.present.stages);

  const [formData, setFormData] = useState<Partial<Job_Node_Config>>({});
  const allJobs = useAppSelector((state) => state.pipeline.present.jobs);

  useEffect(() => {
    if (job) {
      setFormData(job);
    }
  }, [job]);

  useEffect(() => {
    // Handle Escape key to close panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNodeId) {
        dispatch(selectNode(null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, dispatch]);

  const validationErrors = useMemo(() => {
    return validateJobConfig(formData, allJobs);
  }, [formData, allJobs]);

  const hasErrors = validationErrors.length > 0;

  const handleClose = useCallback(() => {
    dispatch(selectNode(null));
  }, [dispatch]);

  const handleSave = useCallback(() => {
    if (selectedNodeId && formData) {
      dispatch(updateJob({ jobId: selectedNodeId, updates: formData }));
    }
  }, [dispatch, selectedNodeId, formData]);

  const updateField = useCallback((field: keyof Job_Node_Config, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!job || !selectedNodeId) return null;

  return (
    <div
      className="fixed right-0 top-0 h-full w-[360px] flex flex-col z-50 slide-in-right overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-xl)',
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-primary)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formData.name || 'Job Configuration'}
          </h2>
        </div>
        <button onClick={handleClose} className="toolbar-btn p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-5">
        {/* Basic Section */}
        <Section title="Basic">
          <div className="space-y-3">
            <TextInput
              label="Job Name"
              value={formData.name || ''}
              onChange={(value) => updateField('name', value)}
              required
              error={getFieldError(validationErrors, 'name')}
            />
            <Dropdown
              label="Stage"
              value={formData.stage || ''}
              options={stages}
              onChange={(value) => updateField('stage', value)}
              required
              error={getFieldError(validationErrors, 'stage')}
            />
            <TextInput
              label="Image"
              value={formData.image || ''}
              onChange={(value) => updateField('image', value)}
              placeholder="node:18-alpine"
              error={getFieldError(validationErrors, 'image')}
            />
            <Dropdown
              label="Extends"
              value={formData.extends || ''}
              options={['', ...Object.keys(allJobs).filter(k => k.startsWith('.'))]}
              onChange={(value) => updateField('extends', value || undefined)}
            />
          </div>
        </Section>

        {/* Scripts Section */}
        <Section title="Scripts">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Script *</span>
              <ScriptSnippets
                onInsert={(snippet) => {
                  const current = formData.script || [];
                  updateField('script', [...current, snippet]);
                }}
              />
            </div>
            <TextArea
              value={formData.script?.join('\n') || ''}
              onChange={(value) => updateField('script', value.split('\n').filter(Boolean))}
              placeholder="npm install&#10;npm test"
              rows={3}
              required
              error={getFieldError(validationErrors, 'script')}
            />
            <TextArea
              label="Before Script"
              value={formData.before_script?.join('\n') || ''}
              onChange={(value) => updateField('before_script', value ? value.split('\n').filter(Boolean) : undefined)}
              placeholder="echo 'Starting...'"
              rows={2}
            />
            <TextArea
              label="After Script"
              value={formData.after_script?.join('\n') || ''}
              onChange={(value) => updateField('after_script', value ? value.split('\n').filter(Boolean) : undefined)}
              placeholder="echo 'Finished...'"
              rows={2}
            />
          </div>
        </Section>

        {/* Artifacts Section */}
        <Section title="Artifacts">
          <PathList
            label="Paths"
            value={formData.artifacts?.paths || []}
            onChange={(paths) => updateField('artifacts', { ...formData.artifacts, paths })}
            placeholder="dist/"
          />
        </Section>

        {/* Cache Section */}
        <Section title="Cache">
          <div className="space-y-3">
            <TextInput
              label="Cache Key"
              value={typeof formData.cache?.key === 'string' ? formData.cache.key : formData.cache?.key?.prefix || ''}
              onChange={(value) => updateField('cache', { ...formData.cache, key: value })}
              placeholder="$CI_COMMIT_REF_SLUG"
            />
            <PathList
              label="Cache Paths"
              value={formData.cache?.paths || []}
              onChange={(paths) => updateField('cache', { ...formData.cache, paths })}
              placeholder="node_modules/"
            />
          </div>
        </Section>

        {/* Variables Section */}
        <Section title="Variables">
          <KeyValueList
            value={formData.variables ? Object.fromEntries(
              Object.entries(formData.variables).map(([k, v]) => [k, typeof v === 'string' ? v : v.value])
            ) : {}}
            onChange={(variables) => updateField('variables', variables)}
          />
        </Section>

        {/* Rules Section */}
        <Section title="Rules">
          <RuleBuilder
            value={formData.rules || []}
            onChange={(rules) => updateField('rules', rules.length > 0 ? rules : undefined)}
          />
        </Section>

        {/* Advanced Section */}
        <Section title="Advanced">
          <div className="space-y-3">
            <Checkbox
              label="Allow Failure"
              checked={formData.allow_failure || false}
              onChange={(checked) => updateField('allow_failure', checked)}
            />
            <TextInput
              label="Timeout"
              value={formData.timeout || ''}
              onChange={(value) => updateField('timeout', value)}
              placeholder="1h"
            />
            <TextInput
              label="Tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(value) => updateField('tags', value ? value.split(',').map(t => t.trim()).filter(Boolean) : undefined)}
              placeholder="docker, linux"
            />
          </div>
        </Section>

        {/* Trigger Section */}
        <Section title="Trigger">
          <div className="space-y-3">
            <TextInput
              label="Project Path"
              value={typeof formData.trigger === 'object' ? formData.trigger?.project || '' : ''}
              onChange={(value) => updateField('trigger', value ? { project: value, strategy: formData.trigger?.strategy } : undefined)}
              placeholder="group/project"
            />
            {formData.trigger && (
              <>
                <TextInput
                  label="Branch"
                  value={formData.trigger?.branch || ''}
                  onChange={(value) => updateField('trigger', { ...formData.trigger, branch: value })}
                  placeholder="main"
                />
                <Dropdown
                  label="Strategy"
                  value={formData.trigger?.strategy || 'depend'}
                  options={['depend', 'independent']}
                  onChange={(value) => updateField('trigger', { ...formData.trigger, strategy: value as 'depend' | 'independent' })}
                />
              </>
            )}
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-4 py-3 flex gap-2"
        style={{ borderTop: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}
      >
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className="flex-1 btn-primary px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
        <button
          onClick={handleClose}
          className="toolbar-btn toolbar-btn-labeled px-4 py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/** Collapsible section wrapper */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="min-w-0">
    <h3
      className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-2"
      style={{ color: 'var(--text-muted)' }}
    >
      <span>{title}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border-primary)' }} />
    </h3>
    {children}
  </section>
);

export default PropertyPanel;
