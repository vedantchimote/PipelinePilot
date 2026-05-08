/**
 * TemplateLibrary Component
 * Searchable library of GitLab CI/CD templates
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeTemplateLibrary } from '@/store/uiSlice';
import { fetchTemplates } from '@/store/templatesSlice';
import TemplateCard from './TemplateCard';
import SkeletonLoader from './SkeletonLoader';

export const TemplateLibrary = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.templateLibraryOpen);
  const { official, custom, examples, loading, error } = useAppSelector((state) => state.templates);
  const validationStatus = useAppSelector((state) => state.ui.validationStatus);
  const isOffline = validationStatus === 'offline';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'official' | 'custom' | 'example'>('all');

  const allTemplates = useMemo(() => {
    return [...examples, ...official, ...custom];
  }, [examples, official, custom]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((template) => {
      // Search filter
      const matchesSearch = 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || template.category === selectedCategory;

      // Source filter
      const matchesSource = 
        selectedSource === 'all' || template.source === selectedSource;

      return matchesSearch && matchesCategory && matchesSource;
    });
  }, [allTemplates, searchQuery, selectedCategory, selectedSource]);

  const categories = useMemo(() => {
    const cats = new Set(allTemplates.map((t) => t.category));
    return ['all', ...Array.from(cats)];
  }, [allTemplates]);

  useEffect(() => {
    if (isOpen && official.length === 0 && !loading && !error && !isOffline) {
      dispatch(fetchTemplates());
    }
  }, [isOpen, official.length, loading, error, isOffline, dispatch]);

  useEffect(() => {
    // Handle Escape key to close library
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        dispatch(closeTemplateLibrary());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-96 shadow-2xl overflow-hidden z-50 flex flex-col slide-in-left" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Template Library</h2>
          <button
            onClick={() => dispatch(closeTemplateLibrary())}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border-primary)' }}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category || 'all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:opacity-80'
                }`}
                style={selectedCategory !== category ? { background: 'var(--bg-tertiary)' } : {}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
          <div className="flex gap-2">
            {(['all', 'example', 'official', 'custom'] as const).map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`flex-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedSource === source
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:opacity-80'
                }`}
                style={selectedSource !== source ? { background: 'var(--bg-tertiary)' } : {}}
              >
                {source}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isOffline && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-yellow-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-yellow-300 mb-1">Offline Mode</p>
                <p className="text-yellow-400">
                  Official GitLab templates are unavailable. You can still use example and custom
                  templates.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <SkeletonLoader type="card" count={5} />
          </div>
        )}

        {error && !isOffline && (
          <div className="text-center text-red-400 py-8">
            <div className="text-2xl mb-2">⚠</div>
            <div>{error}</div>
          </div>
        )}

        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="text-2xl mb-2">🔍</div>
            <div>No templates found</div>
          </div>
        )}

        {!loading && !error && filteredTemplates.length > 0 && (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibrary;
