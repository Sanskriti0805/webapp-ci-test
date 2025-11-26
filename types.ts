export enum StageStatus {
  Pending = 'PENDING',
  Running = 'RUNNING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

export enum StageName {
  ProjectSetup = 'AI Project Setup',
  MergeCheck = 'AI Merge Conflict Check',
  SecurityScan = 'AI Security Scan',
  CodeAnalysis = 'AI Code Analysis',
  TestGeneration = 'AI Test Generation',
  BuildAndTest = 'Build & Test',
  FailureAnalysis = 'AI Failure Analysis',
  DeploymentStrategy = 'AI Deployment Strategy',
  DeployToStaging = 'Deploy to Staging',
  ReleaseNotes = 'AI Release Notes',
  DeployToProduction = 'Deploy to Production',
  AutomatedRollback = 'AI Automated Rollback',
}


export interface PipelineStage {
  id: number;
  name: StageName;
  status: StageStatus;
  content: string;
  startTime: number | null;
  endTime: number | null;
}

export interface PipelineRun {
  status: StageStatus.Success | StageStatus.Failed;
  stages: Pick<PipelineStage, 'name' | 'startTime' | 'endTime'>[];
  totalDuration: number;
}