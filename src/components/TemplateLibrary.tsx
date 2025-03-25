/**
 * TemplateLibrary Component
 * Searchable library of GitLab CI/CD templates
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { closeTemplateLibrary } from '@/store/uiSlice';
import { fetchTemplates } from '@/store/templatesSlice';
import TemplateCard from './TemplateCard';

export const TemplateLibrary = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.templateLibraryOpen);
  const { official, custom, examples, loading, error } = useAppSelector((state) => state.templates);
  
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
    if (isOpen && official.length === 0 && !loading && !error) {
      dispatch(fetchTemplates());
    }
  }, [isOpen, official.length, loading, error, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-96 bg-gray-800 border-r border-gray-700 shadow-2xl overflow-hidden z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Template Library</h2>
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
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-700 space-y-3">
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
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
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
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin text-2xl mb-2">⟳</div>
            <div>Loading templates...</div>
          </div>
        )}

        {error && (
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
