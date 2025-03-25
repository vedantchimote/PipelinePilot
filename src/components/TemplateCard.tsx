/**
 * TemplateCard Component
 * Displays a single template with drag-and-drop support
 */

import { memo, useState } from 'react';
import { useAppDispatch } from '@/store';
import { applyTemplate } from '@/store/templatesSlice';
import type { Template } from '@/types';

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard = memo(({ template }: TemplateCardProps) => {
  const dispatch = useAppDispatch();
  const [showPreview, setShowPreview] = useState(false);

  const handleApply = () => {
    dispatch(applyTemplate(template.id));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'build':
        return 'bg-blue-900/30 text-blue-400';
      case 'test':
        return 'bg-green-900/30 text-green-400';
      case 'deploy':
        return 'bg-purple-900/30 text-purple-400';
      case 'security':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  return (
    <div
      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer group"
      onMouseEnter={() => setShowPreview(true)}
      onMouseLeave={() => setShowPreview(false)}
      onClick={handleApply}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('template', JSON.stringify(template));
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-medium text-sm flex-1">{template.name}</h3>
        <div className="flex gap-1">
          {template.source === 'example' && (
            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded">
              Example
            </span>
          )}
          {template.source === 'official' && (
            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
              Official
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{template.description}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(template.category || 'other')}`}>
          {template.category}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleApply();
          }}
          className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 hover:text-blue-300 transition-opacity"
        >
          Apply →
        </button>
      </div>

      {/* Preview Tooltip */}
      {showPreview && template.yaml && (
        <div className="absolute left-full ml-2 top-0 w-96 max-h-96 overflow-auto bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50">
          <div className="text-xs text-gray-400 mb-2">Preview:</div>
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">{template.yaml.slice(0, 500)}</pre>
          {template.yaml.length > 500 && (
            <div className="text-xs text-gray-500 mt-2">...</div>
          )}
        </div>
      )}
    </div>
  );
});

TemplateCard.displayName = 'TemplateCard';

export default TemplateCard;
