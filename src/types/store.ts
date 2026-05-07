/**
 * Redux store type definitions
 * Based on design document specifications
 */

import type { Pipeline_State, Template, ValidationStatus } from './pipeline';

// ============================================================================
// Root State
// ============================================================================

export interface RootState {
  pipeline: PipelineHistoryState;
  ui: UIState;
  templates: TemplatesState;
  persistence: PersistenceState;
}

// ============================================================================
// Pipeline State (with undo/redo)
// ============================================================================

export interface PipelineHistoryState {
  past: Pipeline_State[];
  present: Pipeline_State;
  future: Pipeline_State[];
}

// ============================================================================
// UI State
// ============================================================================

export interface UIState {
  selectedNodeId: string | null;
  propertyPanelOpen: boolean;
  templateLibraryOpen: boolean;
  welcomeOverlayOpen: boolean;
  keyboardShortcutsOpen: boolean;
  validationStatus: ValidationStatus;
  validationErrors: Record<string, string[]>; // jobId -> error messages
  theme: string;
  showWelcome: boolean;
  showTutorial: boolean;
  canvasLocked: boolean;
}

// ============================================================================
// Templates State
// ============================================================================

export interface TemplatesState {
  official: Template[];
  custom: Template[];
  examples: Template[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
}

// ============================================================================
// Persistence State
// ============================================================================

export interface PersistenceState {
  lastSaved: string | null; // ISO timestamp
  autoSaveEnabled: boolean;
  isDirty: boolean; // Has unsaved changes
}
