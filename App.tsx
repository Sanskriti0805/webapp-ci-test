import React, { useState, useCallback, useMemo } from 'react';
import { marked } from 'marked';
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
  { id: 2, name: StageName.SecurityScan, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 3, name: StageName.CodeAnalysis, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 4, name: StageName.TestGeneration, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 5, name: StageName.BuildAndTest, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 6, name: StageName.DeploymentStrategy, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 7, name: StageName.DeployToStaging, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 8, name: StageName.ReleaseNotes, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
  { id: 9, name: StageName.DeployToProduction, status: StageStatus.Pending, content: '', startTime: null, endTime: null },
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

  const updateStage = (id: number, updates: Partial<PipelineStage>) => {
    setStages(prev =>
      prev.map(stage => (stage.id === id ? { ...stage, ...updates } : stage))
    );
  };
  
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

    let stageIdCounter = 10;
    let finalStatus: PipelineRun['status'] = StageStatus.Success;

    try {
        // --- 1. AI Project Setup ---
        updateCurrentStage(1, { status: StageStatus.Running, startTime: Date.now() });
        const setup = await geminiService.getProjectSetup(projectType, commitMessage);
        updateCurrentStage(1, { status: StageStatus.Success, content: marked.parse(setup) as string, endTime: Date.now() });
        await sleep(500);

        // --- 2. AI Security Scan ---
        updateCurrentStage(2, { status: StageStatus.Running, startTime: Date.now() });
        const security = await geminiService.getSecurityScan(commitMessage);
        updateCurrentStage(2, { status: StageStatus.Success, content: marked.parse(security) as string, endTime: Date.now() });
        await sleep(500);
        
        // --- 3. AI Code Analysis ---
        updateCurrentStage(3, { status: StageStatus.Running, startTime: Date.now() });
        const analysis = await geminiService.getCodeAnalysis(commitMessage);
        updateCurrentStage(3, { status: StageStatus.Success, content: marked.parse(analysis) as string, endTime: Date.now() });
        await sleep(500);

        // --- 4. AI Test Generation ---
        updateCurrentStage(4, { status: StageStatus.Running, startTime: Date.now() });
        const tests = await geminiService.getTestCases(commitMessage);
        updateCurrentStage(4, { status: StageStatus.Success, content: marked.parse(tests) as string, endTime: Date.now() });
        await sleep(500);

        // --- 5. Build & Test ---
        updateCurrentStage(5, { status: StageStatus.Running, content: marked.parse('```\n> Building application...\n> Running generated tests...\n```') as string, startTime: Date.now() });
        await sleep(2000); 

        const shouldBuildFail = Math.random() > 0.7; 
        if (shouldBuildFail) {
          const errorLog = possibleBuildErrors[Math.floor(Math.random() * possibleBuildErrors.length)];
          const failureContent = marked.parse(`\`\`\`\n> Build failed!\n\n${errorLog}\n\`\`\``) as string;
          updateCurrentStage(5, { status: StageStatus.Failed, content: failureContent, endTime: Date.now() });
          
          const failureAnalysisStage: PipelineStage = { id: stageIdCounter++, name: StageName.FailureAnalysis, status: StageStatus.Pending, content: '', startTime: null, endTime: null};
          addDynamicStage(failureAnalysisStage, 5);
          await sleep(100);

          const userContext = window.prompt("The build failed. Provide additional context for the AI to analyze (optional):");

          updateCurrentStage(failureAnalysisStage.id, { status: StageStatus.Running, startTime: Date.now() });
          const failureAnalysis = await geminiService.getFailureAnalysis(commitMessage, errorLog, userContext || '');
          updateCurrentStage(failureAnalysisStage.id, { status: StageStatus.Success, content: marked.parse(failureAnalysis) as string, endTime: Date.now() });
          
          finalStatus = StageStatus.Failed;
          throw new Error("Build failed");
        } 
        
        const successContent = marked.parse('```\n> Build successful.\n> All tests passed.\n```') as string;
        updateCurrentStage(5, { status: StageStatus.Success, content: successContent, endTime: Date.now() });
        await sleep(500);

        // --- 6. AI Deployment Strategy ---
        updateCurrentStage(6, { status: StageStatus.Running, startTime: Date.now() });
        const strategy = await geminiService.getDeploymentStrategy(commitMessage);
        updateCurrentStage(6, { status: StageStatus.Success, content: marked.parse(strategy) as string, endTime: Date.now() });
        await sleep(500);

        // --- 7. Deploy to Staging ---
        updateCurrentStage(7, { status: StageStatus.Running, content: marked.parse('```\n> Deploying to staging environment...\n```') as string, startTime: Date.now() });
        await sleep(1500);
        updateCurrentStage(7, { status: StageStatus.Success, content: marked.parse('```\n> Deployed to staging successfully.\n> Running smoke tests...\n> Smoke tests passed.\n```') as string, endTime: Date.now() });
        await sleep(500);

        // --- 8. AI Release Notes ---
        updateCurrentStage(8, { status: StageStatus.Running, startTime: Date.now() });
        const notes = await geminiService.getReleaseNotes(commitMessage);
        updateCurrentStage(8, { status: StageStatus.Success, content: marked.parse(notes) as string, endTime: Date.now() });
        await sleep(500);
        
        // --- 9. Deploy to Production ---
        updateCurrentStage(9, { status: StageStatus.Running, content: marked.parse('```\n> Starting production deployment...\n```') as string, startTime: Date.now() });
        await sleep(2000);

        const shouldDeployFail = Math.random() > 0.8;
        if (shouldDeployFail) {
            const errorLog = possibleDeploymentErrors[Math.floor(Math.random() * possibleDeploymentErrors.length)];
            const failureContent = marked.parse(`\`\`\`\n> Production deployment failed!\n\n${errorLog}\n\`\`\``) as string;
            updateCurrentStage(9, { status: StageStatus.Failed, content: failureContent, endTime: Date.now() });

            const rollbackStage: PipelineStage = { id: stageIdCounter++, name: StageName.AutomatedRollback, status: StageStatus.Pending, content: '', startTime: null, endTime: null };
            addDynamicStage(rollbackStage, 9);
            await sleep(100);

            updateCurrentStage(rollbackStage.id, { status: StageStatus.Running, startTime: Date.now() });
            const rollbackAnalysis = await geminiService.getRollbackAnalysis(commitMessage, errorLog);
            updateCurrentStage(rollbackStage.id, { status: StageStatus.Success, content: marked.parse(rollbackAnalysis) as string, endTime: Date.now() });
            finalStatus = StageStatus.Failed;
            throw new Error("Deployment failed");
        } else {
            updateCurrentStage(9, { status: StageStatus.Success, content: marked.parse('```\n> Production deployment successful!\n```') as string, endTime: Date.now() });
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
            <div className="bg-midnight-900 p-4 rounded-lg max-h-[50vh] overflow-y-auto border border-midnight-700">
                {selectedStage.content ? (
                    <div
                        className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:text-violet-400"
                        dangerouslySetInnerHTML={{ __html: selectedStage.content }}
                    />
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