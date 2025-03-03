/**
 * Templates slice - manages template library (official and custom templates)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TemplatesState, Template } from '@/types';

const initialState: TemplatesState = {
  official: [],
  custom: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
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
