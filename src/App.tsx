import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { ActionCreators } from 'redux-undo';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import MonacoPreview from './components/MonacoPreview';
import TemplateLibrary from './components/TemplateLibrary';
import KeyboardShortcutsPanel from './components/KeyboardShortcutsPanel';
import WelcomeOverlay from './components/WelcomeOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import { toggleKeyboardShortcuts, initializeUI } from './store/uiSlice';
import { markSaved } from './store/persistenceSlice';
import { exportYAMLFile } from './utils/import-export';

function AppContent() {
  useEffect(() => {
    // Initialize UI state from localStorage
    store.dispatch(initializeUI());
    
    // Apply theme class to html element based on stored preference
    const currentTheme = store.getState().ui.theme;
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');

    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.dispatch(ActionCreators.undo());
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        store.dispatch(ActionCreators.redo());
      }

      // Ctrl+S - Save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        store.dispatch(markSaved());
      }

      // Ctrl+E - Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        const state = store.getState();
        exportYAMLFile(state.pipeline.present);
      }

      // Ctrl+/ - Keyboard shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        store.dispatch(toggleKeyboardShortcuts());
      }

      // Esc - Close panels
      if (e.key === 'Escape') {
        const state = store.getState();
        if (state.ui.keyboardShortcutsOpen) {
          store.dispatch(toggleKeyboardShortcuts());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Toolbar */}
      <Toolbar />

      {/* Accent Line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, var(--accent), transparent 50%)' }} />

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Template Library (Overlay) */}
        <TemplateLibrary />

        {/* Canvas (Left 60%) */}
        <div className="flex-1 relative">
          <Canvas />
        </div>

        {/* Monaco Preview (Right 40%) */}
        <div className="w-2/5 border-l" style={{ borderColor: 'var(--border-primary)' }}>
          <MonacoPreview />
        </div>

        {/* Property Panel (Overlay) */}
        <PropertyPanel />
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />

      {/* Welcome Overlay */}
      <WelcomeOverlay />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
