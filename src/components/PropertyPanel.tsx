/**
 * PropertyPanel Component
 * Contextual sidebar for editing job configuration
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
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-2xl overflow-y-auto z-50 slide-in-right">
      {/* Header */}
      <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Job Configuration</h2>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Sections */}
      <div className="p-4 space-y-6">
        {/* Basic Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Basic</h3>
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
          </div>
        </section>

        {/* Scripts Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Scripts</h3>
          <div className="space-y-3">
            <TextArea
              label="Script"
              value={formData.script?.join('\n') || ''}
              onChange={(value) => updateField('script', value.split('\n').filter(Boolean))}
              placeholder="npm install&#10;npm test"
              rows={4}
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
        </section>

        {/* Artifacts Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Artifacts</h3>
          <PathList
            label="Paths"
            value={formData.artifacts?.paths || []}
            onChange={(paths) => updateField('artifacts', { ...formData.artifacts, paths })}
            placeholder="dist/"
          />
        </section>

        {/* Cache Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Cache</h3>
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
        </section>

        {/* Variables Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Variables</h3>
          <KeyValueList
            value={formData.variables ? Object.fromEntries(
              Object.entries(formData.variables).map(([k, v]) => [k, typeof v === 'string' ? v : v.value])
            ) : {}}
            onChange={(variables) => updateField('variables', variables)}
          />
        </section>

        {/* Rules Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Rules</h3>
          <RuleBuilder
            value={formData.rules || []}
            onChange={(rules) => updateField('rules', rules.length > 0 ? rules : undefined)}
          />
        </section>

        {/* Advanced Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Advanced</h3>
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
            <TextArea
              label="Tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(value) => updateField('tags', value ? value.split(',').map(t => t.trim()).filter(Boolean) : undefined)}
              placeholder="docker, linux"
              rows={1}
            />
          </div>
        </section>

        {/* Trigger Section */}
        <section>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Trigger</h3>
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
        </section>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={hasErrors}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PropertyPanel;
