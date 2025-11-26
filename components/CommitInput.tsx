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
    <div className="bg-midnight-900/40 backdrop-blur-md rounded-2xl border border-midnight-700/50 p-6 mb-10 shadow-xl shadow-midnight-950/20">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            <div className="md:col-span-4 space-y-2">
                <label htmlFor="project-type" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                    Project Type
                </label>
                <div className="relative group">
                    <select
                        id="project-type"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        disabled={isLoading}
                        className="w-full appearance-none bg-midnight-950/50 border border-midnight-700 rounded-lg py-3 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200 hover:border-midnight-600"
                    >
                        {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gray-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="md:col-span-8 space-y-2">
                <label htmlFor="commit-message" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                    Commit Message
                </label>
                <div className="flex gap-3">
                     <div className="relative flex-grow group">
                        <input
                            id="commit-message"
                            type="text"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            className="w-full bg-midnight-950/50 border border-midnight-700 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200 hover:border-midnight-600"
                            placeholder="e.g., feat: Add 2FA authentication"
                            disabled={isLoading}
                            required
                        />
                     </div>
                     <div className="relative w-12 sm:w-auto flex-shrink-0" title="Choose a sample commit">
                        <select
                            id="sample-commits"
                            aria-label="Select a sample commit message"
                            onChange={(e) => {
                                if (e.target.value) setCommitMessage(e.target.value);
                            }}
                            value=""
                            disabled={isLoading}
                            className="w-full h-full appearance-none bg-midnight-950/50 border border-midnight-700 rounded-lg py-3 pl-3 pr-8 sm:pr-10 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200 hover:border-midnight-600 cursor-pointer"
                        >
                            <option value="" disabled>Samples</option>
                            {sampleCommitMessages.map((msg) => (
                                <option key={msg} value={msg}>{msg.length > 30 ? msg.substring(0, 30) + '...' : msg}</option>
                            ))}
                        </select>
                         <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                 <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                             </svg>
                         </div>
                    </div>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !commitMessage.trim()}
          className="w-full group relative overflow-hidden bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-midnight-950 focus:ring-violet-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <div className="relative flex items-center justify-center gap-3">
            {isLoading ? (
                <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Orchestrating Pipeline...</span>
                </>
            ) : (
                <>
                <SparklesIcon className="w-5 h-5" />
                <span>Trigger AI Pipeline</span>
                </>
            )}
          </div>
        </button>
      </form>
    </div>
  );
};

export default CommitInput;