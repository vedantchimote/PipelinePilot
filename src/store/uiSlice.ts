/**
 * UI slice - manages UI state (panels, modals, validation status, theme)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UIState, ValidationStatus } from '@/types';

// Read persisted preferences synchronously to avoid flash of initial state
const storedHideWelcome = typeof window !== 'undefined' && localStorage.getItem('hideWelcome') === 'true';
const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') as 'dark' | 'light' | null : null;

const initialState: UIState = {
  selectedNodeId: null,
  propertyPanelOpen: false,
  templateLibraryOpen: false,
  welcomeOverlayOpen: !storedHideWelcome, // Respect persisted preference from first render
  keyboardShortcutsOpen: false,
  validationStatus: 'idle',
  validationErrors: {},
  theme: storedTheme || 'dark',
  showWelcome: !storedHideWelcome, // Respect persisted preference from first render
  showTutorial: false,
  canvasLocked: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Node selection
    selectNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
      state.propertyPanelOpen = action.payload !== null;
    },

    deselectNode: (state) => {
      state.selectedNodeId = null;
      state.propertyPanelOpen = false;
    },

    // Panel toggles
    togglePropertyPanel: (state) => {
      state.propertyPanelOpen = !state.propertyPanelOpen;
      if (!state.propertyPanelOpen) {
        state.selectedNodeId = null;
      }
    },

    closePropertyPanel: (state) => {
      state.propertyPanelOpen = false;
      state.selectedNodeId = null;
    },

    toggleTemplateLibrary: (state) => {
      state.templateLibraryOpen = !state.templateLibraryOpen;
    },

    closeTemplateLibrary: (state) => {
      state.templateLibraryOpen = false;
    },

    toggleWelcomeOverlay: (state) => {
      state.welcomeOverlayOpen = !state.welcomeOverlayOpen;
    },

    closeWelcomeOverlay: (state) => {
      state.welcomeOverlayOpen = false;
      state.showWelcome = false;
      // Save preference to localStorage
      localStorage.setItem('hideWelcome', 'true');
    },

    toggleKeyboardShortcuts: (state) => {
      state.keyboardShortcutsOpen = !state.keyboardShortcutsOpen;
    },

    closeKeyboardShortcuts: (state) => {
      state.keyboardShortcutsOpen = false;
    },

    // Validation
    setValidationStatus: (state, action: PayloadAction<ValidationStatus>) => {
      state.validationStatus = action.payload;
    },

    setValidationErrors: (state, action: PayloadAction<Record<string, string[]>>) => {
      state.validationErrors = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
      state.validationStatus = 'idle';
    },

    // Theme
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      // Apply theme to document
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
      // Save to localStorage
      localStorage.setItem('theme', action.payload);
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
      localStorage.setItem('theme', state.theme);
    },

    // Tutorial
    startTutorial: (state) => {
      state.showTutorial = true;
    },

    completeTutorial: (state) => {
      state.showTutorial = false;
      localStorage.setItem('tutorialCompleted', 'true');
    },

    // Canvas lock
    toggleCanvasLock: (state) => {
      state.canvasLocked = !state.canvasLocked;
    },

    setCanvasLocked: (state, action: PayloadAction<boolean>) => {
      state.canvasLocked = action.payload;
    },

    // Initialize UI from localStorage
    initializeUI: (state) => {
      const hideWelcome = localStorage.getItem('hideWelcome') === 'true';
      const tutorialCompleted = localStorage.getItem('tutorialCompleted') === 'true';
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;

      state.showWelcome = !hideWelcome;
      state.welcomeOverlayOpen = !hideWelcome;
      state.showTutorial = !tutorialCompleted;
      
      if (savedTheme) {
        state.theme = savedTheme;
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    },
  },
});

export const {
  selectNode,
  deselectNode,
  togglePropertyPanel,
  closePropertyPanel,
  toggleTemplateLibrary,
  closeTemplateLibrary,
  toggleWelcomeOverlay,
  closeWelcomeOverlay,
  toggleKeyboardShortcuts,
  closeKeyboardShortcuts,
  setValidationStatus,
  setValidationErrors,
  clearValidationErrors,
  setTheme,
  toggleTheme,
  startTutorial,
  completeTutorial,
  toggleCanvasLock,
  setCanvasLocked,
  initializeUI,
} = uiSlice.actions;

export default uiSlice.reducer;
