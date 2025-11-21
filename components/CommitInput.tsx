import React from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface CommitInputProps {
  onRunPipeline: (commitMessage: string, projectType: string) => void;
  isLoading: boolean;
}

const projectTypes = [
  'Node.js API',
  'React Frontend',
  'Vue.js Frontend',
  'Angular Frontend',
  'Django API',
  'Spring Boot API',
];

const sampleCommitMessages = [
  'feat: Add two-factor authentication via email',
  'fix: Correct price calculation for discounted items in cart',
  'refactor: Simplify state management using Zustand store',
  'perf: Optimize database queries for dashboard loading',
  'docs: Update API documentation for v2 endpoints',
  'test: Add end-to-end tests for user checkout flow',
  'chore: Upgrade Next.js to the latest version',
  'style: Implement dark mode theme across the application',
  'feat: Integrate user profile avatars',
  'fix: Resolve memory leak in data processing worker',
  'refactor: Migrate legacy API client to use async/await',
  'perf: Implement caching for frequently accessed product data',
  'feat: Enable OAuth login with Google and GitHub providers',
  'fix: Ensure proper error handling for external API timeouts',
  'test: Increase unit test coverage for payment module to 95%',
  'chore: Update build process to use esbuild for faster bundling',
  'feat: Implement real-time notifications with WebSockets',
  'fix: Prevent SQL injection vulnerability in search API',
];

const getRandomCommitMessage = () => {
    return sampleCommitMessages[Math.floor(Math.random() * sampleCommitMessages.length)];
};

const CommitInput: React.FC<CommitInputProps> = ({ onRunPipeline, isLoading }) => {
  const [commitMessage, setCommitMessage] = React.useState(getRandomCommitMessage);
  const [projectType, setProjectType] = React.useState(projectTypes[1]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commitMessage.trim() && !isLoading) {
      onRunPipeline(commitMessage.trim(), projectType);
    }
  };

  return (
    <div className="bg-midnight-900/50 backdrop-blur-sm rounded-xl border border-midnight-700 p-6 mb-8 shadow-2xl shadow-midnight-950/50">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="project-type" className="block text-sm font-medium text-gray-400 mb-2">
                Project Type
            </label>
            <select
                id="project-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                disabled={isLoading}
                className="w-full bg-midnight-800 border border-midnight-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
            >
                {projectTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>
        
        <div>
            <label htmlFor="commit-message" className="block text-sm font-medium text-gray-400 mb-2">
                Commit Message
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
                 <input
                    id="commit-message"
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full flex-grow bg-midnight-800 border border-midnight-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                    placeholder="e.g., feat: Add 2FA authentication"
                    disabled={isLoading}
                    required
                />
                <select
                    id="sample-commits"
                    aria-label="Select a sample commit message"
                    onChange={(e) => {
                        if (e.target.value) setCommitMessage(e.target.value);
                    }}
                    value=""
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-midnight-800 border border-midnight-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 transition duration-200"
                >
                    <option value="" disabled>Or use a sample...</option>
                    {sampleCommitMessages.map((msg) => (
                        <option key={msg} value={msg}>{msg}</option>
                    ))}
                </select>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !commitMessage.trim()}
          className="w-full flex items-center justify-center gap-2 bg-violet-500 text-white font-semibold py-2 px-6 rounded-md hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-950 focus:ring-violet-500 transition-all duration-200 disabled:bg-midnight-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Running Pipeline...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Trigger AI Pipeline</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CommitInput;