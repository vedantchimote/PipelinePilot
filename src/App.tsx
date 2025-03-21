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
import { toggleKeyboardShortcuts } from './store/uiSlice';
import { markSaved } from './store/persistenceSlice';
import { exportYAMLFile } from './utils/import-export';

function AppContent() {
  useEffect(() => {
    // Apply dark mode class to html element
    document.documentElement.classList.add('dark');

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
    <div className="h-screen w-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Template Library (Overlay) */}
        <TemplateLibrary />

        {/* Canvas (Left 60%) */}
        <div className="flex-1 relative">
          <Canvas />
        </div>

        {/* Monaco Preview (Right 40%) */}
        <div className="w-2/5 border-l border-gray-700">
          <MonacoPreview />
        </div>

        {/* Property Panel (Overlay) */}
        <PropertyPanel />
      </div>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
