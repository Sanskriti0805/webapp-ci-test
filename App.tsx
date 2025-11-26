import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PipelineStage, StageStatus, StageName, PipelineRun } from './types';
import * as geminiService from './services/geminiService';
import PipelineStageComponent from './components/PipelineStage';
import CommitInput from './components/CommitInput';
import SparklesIcon from './components/icons/SparklesIcon';
import PipelineMetrics from './components/PipelineMetrics';
import Modal from './components/Modal';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import XCircleIcon from './components/icons/XCircleIcon';
import ArrowPathIcon from './components/icons/ArrowPathIcon';
import ClockIcon from './components/icons/ClockIcon';


const initialStages: PipelineStage[] = [
  { id: 1, name: StageName.ProjectSetup, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 2, name: StageName.MergeCheck, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 3, name: StageName.SecurityScan, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 4, name: StageName.CodeAnalysis, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 5, name: StageName.TestGeneration, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 6, name: StageName.BuildAndTest, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 7, name: StageName.DeploymentStrategy, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 8, name: StageName.DeployToStaging, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 9, name: StageName.ReleaseNotes, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 10, name: StageName.DeployToProduction, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
];

const possibleBuildErrors = [
    "Error: Test failed. `TypeError: Cannot read properties of undefined (reading 'avatarUrl')` in `ProfileHeader.test.tsx`.",
    "Error: Build failed. `ReferenceError: 'config' is not defined` in `scripts/deploy.js` at line 42.",
    "Error: Test suite failed to run. `Jest worker encountered 1 child process exceptions, exceeding retry limit.`",
    "Error: Module not found: Can't resolve './utils/formatters' in `/app/src/components/UserProfile.tsx`.",
    "Error: Integration test failed. `[404] Not Found` for API endpoint `GET /api/v1/users/123`."
];

const possibleDeploymentErrors = [
    "Error: Deployment failed. `CrashLoopBackOff`: The application is crashing and restarting.",
    "Error: Deployment failed. `ImagePullBackOff`: Cannot pull the container image from the registry.",
    "Error: Deployment failed. `502 Bad Gateway`: Health checks are failing on the new revision.",
    "Error: Deployment failed. `Invalid credentials` for database connection.",
];

const getStatusIcon = (status: StageStatus) => {
  switch (status) {
    case StageStatus.Success:
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case StageStatus.Failed:
      return <XCircleIcon className="w-5 h-5 text-red-400" />;
    case StageStatus.Running:
      return <ArrowPathIcon className="w-5 h-5 text-violet-400 animate-spin" />;
    case StageStatus.Pending:
    default:
      return <ClockIcon className="w-5 h-5 text-gray-400" />;
  }
};

const formatTimestamp = (timestamp: number | null): string => {
    if (timestamp === null) return 'N/A';
    return new Date(timestamp).toLocaleString();
};

const App: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>(initialStages);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineHistory, setPipelineHistory] = useState<PipelineRun[]>([]);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runPipeline = useCallback(async (commitMessage: string, projectType: string) => {
    setIsLoading(true);
    let currentStages = initialStages.map(s => ({ ...s })); // Deep copy for this run
    setStages(currentStages);
    const pipelineStartTime = Date.now();

    const updateCurrentStage = (id: number, updates: Partial<PipelineStage>) => {
        currentStages = currentStages.map(stage => (stage.id === id ? { ...stage, ...updates } : stage));
        setStages(currentStages);
    };

    const addDynamicStage = (newStage: PipelineStage, afterId: number) => {
      const insertIndex = currentStages.findIndex(s => s.id === afterId) + 1;
      currentStages.splice(insertIndex, 0, newStage);
      setStages([...currentStages]);
    };

    let stageIdCounter = 20;
    let finalStatus: PipelineRun['status'] = StageStatus.Success;

    try {
        // --- 1. AI Project Setup ---
        updateCurrentStage(1, { status: StageStatus.Running, startTime: Date.now() });
        const setup = await geminiService.getProjectSetup(projectType, commitMessage);
        updateCurrentStage(1, { status: StageStatus.Success, content: setup, endTime: Date.now() });
        await sleep(500);

        // --- 2. AI Merge Conflict Check (New) ---
        updateCurrentStage(2, { status: StageStatus.Running, startTime: Date.now() });
        const mergeCheck = await geminiService.getMergeConflictAnalysis(commitMessage);
        updateCurrentStage(2, { status: StageStatus.Success, content: mergeCheck, endTime: Date.now() });
        await sleep(500);

        // --- 3. AI Security Scan ---
        updateCurrentStage(3, { status: StageStatus.Running, startTime: Date.now() });
        const security = await geminiService.getSecurityScan(commitMessage);
        updateCurrentStage(3, { status: StageStatus.Success, content: security, endTime: Date.now() });
        await sleep(500);
        
        // --- 4. AI Code Analysis (CodeRabbit style) ---
        updateCurrentStage(4, { status: StageStatus.Running, startTime: Date.now() });
        const analysis = await geminiService.getCodeAnalysis(commitMessage);
        updateCurrentStage(4, { status: StageStatus.Success, content: analysis, endTime: Date.now() });
        await sleep(500);

        // --- 5. AI Test Generation ---
        updateCurrentStage(5, { status: StageStatus.Running, startTime: Date.now() });
        const tests = await geminiService.getTestCases(commitMessage);
        updateCurrentStage(5, { status: StageStatus.Success, content: tests, endTime: Date.now() });
        await sleep(500);

        // --- 6. Build & Test ---
        updateCurrentStage(6, { status: StageStatus.Running, content: '```bash\n> Building application...\n> Running generated tests...\n```', startTime: Date.now() });
        await sleep(2000); 

        const shouldBuildFail = Math.random() > 0.75; 
        if (shouldBuildFail) {
          const errorLog = possibleBuildErrors[Math.floor(Math.random() * possibleBuildErrors.length)];
          const failureContent = `\`\`\`bash\n> Build failed!\n\n${errorLog}\n\`\`\``;
          updateCurrentStage(6, { status: StageStatus.Failed, content: failureContent, endTime: Date.now() });
          
          const failureAnalysisStage: PipelineStage = { id: stageIdCounter++, name: StageName.FailureAnalysis, status: StageStatus.Pending, content: '', startTime: null, endTime: null};
          addDynamicStage(failureAnalysisStage, 6);
          await sleep(100);

          const userContext = window.prompt("The build failed. Provide additional context for the AI to analyze (optional):");

          updateCurrentStage(failureAnalysisStage.id, { status: StageStatus.Running, startTime: Date.now() });
          const failureAnalysis = await geminiService.getFailureAnalysis(commitMessage, errorLog, userContext || '');
          updateCurrentStage(failureAnalysisStage.id, { status: StageStatus.Success, content: failureAnalysis, endTime: Date.now() });
          
          finalStatus = StageStatus.Failed;
          throw new Error("Build failed");
        } 
        
        const successContent = '```bash\n> Build successful.\n> All tests passed.\n```';
        updateCurrentStage(6, { status: StageStatus.Success, content: successContent, endTime: Date.now() });
        await sleep(500);

        // --- 7. AI Deployment Strategy ---
        updateCurrentStage(7, { status: StageStatus.Running, startTime: Date.now() });
        const strategy = await geminiService.getDeploymentStrategy(commitMessage);
        updateCurrentStage(7, { status: StageStatus.Success, content: strategy, endTime: Date.now() });
        await sleep(500);

        // --- 8. Deploy to Staging ---
        updateCurrentStage(8, { status: StageStatus.Running, content: '```bash\n> Deploying to staging environment...\n```', startTime: Date.now() });
        await sleep(1500);
        updateCurrentStage(8, { status: StageStatus.Success, content: '```bash\n> Deployed to staging successfully.\n> Running smoke tests...\n> Smoke tests passed.\n```', endTime: Date.now() });
        await sleep(500);

        // --- 9. AI Release Notes ---
        updateCurrentStage(9, { status: StageStatus.Running, startTime: Date.now() });
        const notes = await geminiService.getReleaseNotes(commitMessage);
        updateCurrentStage(9, { status: StageStatus.Success, content: notes, endTime: Date.now() });
        await sleep(500);
        
        // --- 10. Deploy to Production ---
        updateCurrentStage(10, { status: StageStatus.Running, content: '```bash\n> Starting production deployment...\n```', startTime: Date.now() });
        await sleep(2000);

        const shouldDeployFail = Math.random() > 0.8;
        if (shouldDeployFail) {
            const errorLog = possibleDeploymentErrors[Math.floor(Math.random() * possibleDeploymentErrors.length)];
            const failureContent = `\`\`\`bash\n> Production deployment failed!\n\n${errorLog}\n\`\`\``;
            updateCurrentStage(10, { status: StageStatus.Failed, content: failureContent, endTime: Date.now() });

            const rollbackStage: PipelineStage = { id: stageIdCounter++, name: StageName.AutomatedRollback, status: StageStatus.Pending, content: '', startTime: null, endTime: null };
            addDynamicStage(rollbackStage, 10);
            await sleep(100);

            updateCurrentStage(rollbackStage.id, { status: StageStatus.Running, startTime: Date.now() });
            const rollbackAnalysis = await geminiService.getRollbackAnalysis(commitMessage, errorLog);
            updateCurrentStage(rollbackStage.id, { status: StageStatus.Success, content: rollbackAnalysis, endTime: Date.now() });
            finalStatus = StageStatus.Failed;
            throw new Error("Deployment failed");
        } else {
            updateCurrentStage(10, { status: StageStatus.Success, content: '```bash\n> Production deployment successful!\n```', endTime: Date.now() });
        }
    } catch (e) {
      // Errors are handled, pipeline ends gracefully
    } finally {
      const pipelineEndTime = Date.now();
      const newRun: PipelineRun = {
        status: finalStatus,
        stages: currentStages.map(({ name, startTime, endTime }) => ({ name, startTime, endTime })),
        totalDuration: pipelineEndTime - pipelineStartTime,
      };
      setPipelineHistory(prev => [...prev, newRun]);
      setIsLoading(false);
    }
  }, []);

  const handleStageClick = (stage: PipelineStage) => {
    setSelectedStage(stage);
  };

  const handleCloseModal = () => {
    setSelectedStage(null);
  };

  return (
    <div className="min-h-screen bg-midnight-950 font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
             <SparklesIcon className="w-12 h-12 text-violet-400" />
             <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
               AI-Powered CI/CD Pipeline
             </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A simulation of a smart CI/CD workflow. Select a project type, enter a commit message, and watch AI build a full pipeline to analyze, test, and deploy your change.
          </p>
        </header>

        <CommitInput onRunPipeline={runPipeline} isLoading={isLoading} />

        {pipelineHistory.length > 0 && <PipelineMetrics history={pipelineHistory} />}
        
        <div className="mt-8 relative">
          {stages.map((stage, index) => (
            <PipelineStageComponent
              key={stage.id}
              stage={stage}
              isLast={index === stages.length - 1}
              onClick={handleStageClick}
            />
          ))}
        </div>
      </main>

      <Modal isOpen={!!selectedStage} onClose={handleCloseModal}>
        {selectedStage && (
          <div className="p-1">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-200">{selectedStage.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedStage.status)}
                        <span className="text-sm font-semibold capitalize">{selectedStage.status.toLowerCase()}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm bg-midnight-900/50 p-4 rounded-lg">
                <div>
                    <p className="font-semibold text-gray-400">Start Time</p>
                    <p className="font-mono">{formatTimestamp(selectedStage.startTime)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-400">End Time</p>
                    <p className="font-mono">{formatTimestamp(selectedStage.endTime)}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-400">Duration</p>
                    <p className="font-mono">
                        {selectedStage.startTime && selectedStage.endTime
                        ? `${((selectedStage.endTime - selectedStage.startTime) / 1000).toFixed(2)}s`
                        : 'N/A'}
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-300 mb-2">Stage Output</h3>
            <div className="bg-midnight-900 p-6 rounded-lg border border-midnight-700">
                {selectedStage.content ? (
                    <div className="prose prose-invert prose-sm max-w-none 
                        prose-headings:text-violet-400 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3
                        prose-p:text-gray-300 prose-p:my-2
                        prose-li:text-gray-300 prose-ul:my-2 prose-ul:pl-4
                        prose-pre:bg-midnight-950/50 prose-pre:border prose-pre:border-white/5 prose-pre:p-4 prose-pre:rounded-lg
                        prose-code:text-violet-300 prose-code:bg-midnight-950/30 prose-code:px-1 prose-code:rounded
                        prose-table:border-collapse prose-table:border prose-table:border-midnight-700 prose-table:w-full prose-table:my-4
                        prose-th:bg-midnight-800 prose-th:p-3 prose-th:text-left prose-th:text-gray-200 prose-th:border prose-th:border-midnight-700
                        prose-td:border prose-td:border-midnight-700 prose-td:p-3 prose-td:text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedStage.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-gray-400 italic">This stage has not produced any output yet.</p>
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;