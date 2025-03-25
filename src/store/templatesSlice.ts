/**
 * Templates slice - manages template library (official and custom templates)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TemplatesState, Template } from '@/types';
import { EXAMPLE_TEMPLATES } from '@/data/example-templates';

const initialState: TemplatesState = {
  official: [],
  custom: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  examples: EXAMPLE_TEMPLATES,
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    // Official templates
    fetchTemplatesStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchTemplatesSuccess: (state, action: PayloadAction<Template[]>) => {
      state.official = action.payload;
      state.loading = false;
      state.error = null;
    },

    fetchTemplatesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Custom templates
    addCustomTemplate: (state, action: PayloadAction<Template>) => {
      state.custom.push(action.payload);
      // Save to localStorage
      localStorage.setItem('custom_templates', JSON.stringify(state.custom));
    },

    updateCustomTemplate: (
      state,
      action: PayloadAction<{ key: string; template: Template }>
    ) => {
      const { key, template } = action.payload;
      const index = state.custom.findIndex((t) => t.key === key);
      if (index !== -1) {
        state.custom[index] = template;
        localStorage.setItem('custom_templates', JSON.stringify(state.custom));
      }
    },

    deleteCustomTemplate: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      state.custom = state.custom.filter((t) => t.key !== key);
      localStorage.setItem('custom_templates', JSON.stringify(state.custom));
    },

    loadCustomTemplates: (state) => {
      const stored = localStorage.getItem('custom_templates');
      if (stored) {
        try {
          state.custom = JSON.parse(stored);
        } catch (error) {
          console.error('Failed to load custom templates:', error);
          state.custom = [];
        }
      }
    },

    // Search and filter
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },

    clearSearch: (state) => {
      state.searchQuery = '';
      state.selectedCategory = null;
    },
  },
});

// Thunk actions
export const fetchTemplates = () => async (dispatch: any) => {
  dispatch(fetchTemplatesStart());
  try {
    const { getGitLabClient } = await import('@/api/gitlab-client');
    const client = getGitLabClient();
    const templates = await client.fetchTemplates();
    dispatch(fetchTemplatesSuccess(templates));
  } catch (error) {
    dispatch(fetchTemplatesFailure(error instanceof Error ? error.message : 'Failed to fetch templates'));
  }
};

export const applyTemplate = (templateId: string) => async (dispatch: any, getState: any) => {
  const state = getState();
  const template = [...state.templates.official, ...state.templates.custom].find(
    (t: Template) => t.id === templateId
  );

  if (!template) return;

  try {
    // Fetch template content if not already loaded
    let yamlContent = template.yaml;
    if (!yamlContent && template.source === 'official') {
      const { getGitLabClient } = await import('@/api/gitlab-client');
      const client = getGitLabClient();
      yamlContent = await client.fetchTemplate(templateId);
    }

    if (yamlContent) {
      // Parse YAML and import to pipeline
      const { fromYAML } = await import('@/engine/yaml-engine');
      const pipelineState = fromYAML(yamlContent);
      
      const { importYAML } = await import('./pipelineSlice');
      dispatch(importYAML(pipelineState));
      
      const { closeTemplateLibrary } = await import('./uiSlice');
      dispatch(closeTemplateLibrary());
    }
  } catch (error) {
    console.error('Failed to apply template:', error);
  }
};

export const {
  fetchTemplatesStart,
  fetchTemplatesSuccess,
  fetchTemplatesFailure,
  addCustomTemplate,
  updateCustomTemplate,
  deleteCustomTemplate,
  loadCustomTemplates,
  setSearchQuery,
  setSelectedCategory,
  clearSearch,
} = templatesSlice.actions;

export default templatesSlice.reducer;
