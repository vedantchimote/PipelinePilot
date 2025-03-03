/**
 * Persistence slice - manages auto-save and persistence state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PersistenceState } from '@/types';

const initialState: PersistenceState = {
  lastSaved: null,
  autoSaveEnabled: true,
  isDirty: false,
};

const persistenceSlice = createSlice({
  name: 'persistence',
  initialState,
  reducers: {
    markSaved: (state) => {
      state.lastSaved = new Date().toISOString();
      state.isDirty = false;
      localStorage.setItem('last_saved', state.lastSaved);
    },

    markDirty: (state) => {
      state.isDirty = true;
    },

    toggleAutoSave: (state) => {
      state.autoSaveEnabled = !state.autoSaveEnabled;
      localStorage.setItem('auto_save_enabled', String(state.autoSaveEnabled));
    },

    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSaveEnabled = action.payload;
      localStorage.setItem('auto_save_enabled', String(action.payload));
    },

    initializePersistence: (state) => {
      const lastSaved = localStorage.getItem('last_saved');
      const autoSaveEnabled = localStorage.getItem('auto_save_enabled');

      if (lastSaved) {
        state.lastSaved = lastSaved;
      }

      if (autoSaveEnabled !== null) {
        state.autoSaveEnabled = autoSaveEnabled === 'true';
      }
    },
  },
});

export const {
  markSaved,
  markDirty,
  toggleAutoSave,
  setAutoSave,
  initializePersistence,
} = persistenceSlice.actions;

export default persistenceSlice.reducer;
