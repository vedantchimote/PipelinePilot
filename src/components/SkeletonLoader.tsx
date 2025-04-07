/**
 * SkeletonLoader Component
 * Loading placeholder for content
 */

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'circle';
  count?: number;
  className?: string;
}

export const SkeletonLoader = ({ type = 'card', count = 1, className = '' }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-gray-700 rounded-lg p-4 animate-pulse ${className}`}>
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-5/6"></div>
          </div>
        );
      case 'text':
        return (
          <div className={`h-4 bg-gray-700 rounded animate-pulse ${className}`}></div>
        );
      case 'circle':
        return (
          <div className={`w-12 h-12 bg-gray-700 rounded-full animate-pulse ${className}`}></div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;
