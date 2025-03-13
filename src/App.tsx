import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Apply dark mode class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="w-full h-full bg-gitlab-dark-bg text-gitlab-dark-text">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">GitLab CI/CD Visual Editor</h1>
          <p className="text-gitlab-dark-text-muted mb-8">
            Project infrastructure is ready. Implementation coming soon...
          </p>
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-gitlab-accent-blue rounded-lg">
              ✅ Configuration Files
            </div>
            <div className="px-4 py-2 bg-gitlab-accent-green rounded-lg">
              ✅ Project Structure
            </div>
            <div className="px-4 py-2 bg-gitlab-accent-purple rounded-lg">
              ✅ Documentation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
