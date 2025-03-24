/**
 * WelcomeOverlay Component
 * First-time user welcome screen with quick-start options
 */

import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeWelcomeOverlay } from '@/store/uiSlice';
import { addJob } from '@/store/pipelineSlice';
import { importYAMLFile } from '@/utils/import-export';
import { toggleTemplateLibrary } from '@/store/uiSlice';

const HELLO_WORLD_JOB = {
  id: 'hello_world',
  name: 'hello_world',
  stage: 'test',
  script: ['echo "Hello, World!"', 'echo "Welcome to GitLab CI/CD Pipeline Editor"'],
};

export const WelcomeOverlay = memo(() => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.welcomeOverlayOpen);
  const showWelcome = useAppSelector((state) => state.ui.showWelcome);

  const handleClose = useCallback(() => {
    dispatch(closeWelcomeOverlay());
  }, [dispatch]);

  const handleStartFromScratch = useCallback(() => {
    dispatch(closeWelcomeOverlay());
  }, [dispatch]);

  const handleUseTemplate = useCallback(() => {
    dispatch(closeWelcomeOverlay());
    dispatch(toggleTemplateLibrary());
  }, [dispatch]);

  const handleImportYAML = useCallback(async () => {
    const imported = await importYAMLFile();
    if (imported) {
      const { importYAML } = await import('@/store/pipelineSlice');
      dispatch(importYAML(imported));
      dispatch(closeWelcomeOverlay());
    }
  }, [dispatch]);

  const handleHelloWorld = useCallback(() => {
    dispatch(addJob({ job: HELLO_WORLD_JOB, position: { x: 250, y: 100 } }));
    dispatch(closeWelcomeOverlay());
  }, [dispatch]);

  if (!isOpen || !showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome to GitLab CI/CD Pipeline Editor
          </h1>
          <p className="text-gray-400 text-lg">
            Create, edit, and visualize your GitLab CI/CD pipelines with ease
          </p>
        </div>

        {/* Quick Start Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleStartFromScratch}
            className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Start from Scratch</h3>
                <p className="text-gray-400 text-sm">
                  Begin with an empty canvas and build your pipeline step by step
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleUseTemplate}
            className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600 rounded-lg group-hover:bg-purple-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Use Template</h3>
                <p className="text-gray-400 text-sm">
                  Choose from official GitLab templates or your custom templates
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleImportYAML}
            className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-600 rounded-lg group-hover:bg-green-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Import YAML</h3>
                <p className="text-gray-400 text-sm">
                  Import an existing .gitlab-ci.yml file to visualize and edit
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleHelloWorld}
            className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-600 rounded-lg group-hover:bg-yellow-500 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Hello World</h3>
                <p className="text-gray-400 text-sm">
                  Start with a simple "Hello World" job to explore the editor
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              onChange={handleClose}
              className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm">Don't show this again</span>
          </label>

          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
});

WelcomeOverlay.displayName = 'WelcomeOverlay';

export default WelcomeOverlay;
