import React from 'react';
import { PipelineStage, StageStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ClockIcon from './icons/ClockIcon';
import SparklesIcon from './icons/SparklesIcon';

interface PipelineStageProps {
  stage: PipelineStage;
  isLast: boolean;
  onClick: (stage: PipelineStage) => void;
}

const getStatusIcon = (status: StageStatus) => {
  switch (status) {
    case StageStatus.Success:
      return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
    case StageStatus.Failed:
      return <XCircleIcon className="w-6 h-6 text-red-400" />;
    case StageStatus.Running:
      return <ArrowPathIcon className="w-6 h-6 text-violet-400 animate-spin-slow" />;
    case StageStatus.Pending:
    default:
      return <ClockIcon className="w-6 h-6 text-gray-400" />;
  }
};

const getStatusColor = (status: StageStatus) => {
    switch (status) {
        case StageStatus.Success: return 'border-green-400/50 shadow-[0_0_15px_-3px_rgba(74,222,128,0.1)]';
        case StageStatus.Failed: return 'border-red-400/50 shadow-[0_0_15px_-3px_rgba(248,113,113,0.1)]';
        case StageStatus.Running: return 'border-violet-400/50 shadow-[0_0_15px_-3px_rgba(139,92,246,0.1)]';
        case StageStatus.Pending:
        default: return 'border-midnight-700/50';
    }
}

const formatDuration = (start: number | null, end: number | null): string => {
  if (start === null || end === null) return '';
  const duration = (end - start) / 1000;
  return `${duration.toFixed(2)}s`;
};

const formatTimestamp = (timestamp: number | null): string => {
  if (timestamp === null) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

const PipelineStageComponent: React.FC<PipelineStageProps> = ({ stage, isLast, onClick }) => {
  const getTooltipText = () => {
    if (stage.status === StageStatus.Pending) {
      return 'Click to view details.';
    }

    const start = `Start Time: ${formatTimestamp(stage.startTime)}`;
    const end = `End Time: ${formatTimestamp(stage.endTime)}`;
    
    let duration = 'Duration: In progress...';
    if (stage.startTime && stage.endTime) {
      const durationSeconds = ((stage.endTime - stage.startTime) / 1000).toFixed(2);
      duration = `Duration: ${durationSeconds}s`;
    }

    return `${start}\n${end}\n${duration}\n\nClick to view full log.`;
  };

  const hasContent = !!stage.content && stage.content.length > 0;

  return (
    <div className="flex items-stretch group">
      <div className="flex flex-col items-center mr-6">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-midnight-900/80 backdrop-blur flex items-center justify-center border-2 transition-colors duration-300 ${getStatusColor(stage.status)}`}>
          {getStatusIcon(stage.status)}
        </div>
        {!isLast && <div className={`w-0.5 h-full mt-2 transition-colors duration-500 ${stage.status === StageStatus.Pending ? 'bg-midnight-800' : 'bg-midnight-700'}`} />}
      </div>

      <div 
        className={`w-full bg-midnight-900/40 backdrop-blur-sm rounded-xl border ${getStatusColor(stage.status)} transition-all duration-300 hover:border-violet-500/50 hover:bg-midnight-900/60 hover:shadow-lg hover:shadow-violet-500/5 cursor-pointer mb-6 overflow-hidden`}
        title={getTooltipText()}
        onClick={() => onClick(stage)}
      >
        <div className="p-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`transition-opacity duration-300 ${stage.status === StageStatus.Pending ? 'opacity-50' : 'opacity-100'}`}>
                <SparklesIcon className={`w-5 h-5 ${stage.status === StageStatus.Running ? 'text-violet-400 animate-pulse' : 'text-violet-500'}`} />
            </div>
            <h3 className={`font-bold text-lg ${stage.status === StageStatus.Pending ? 'text-gray-500' : 'text-gray-200'}`}>{stage.name}</h3>
          </div>
          <span className="text-xs font-mono text-gray-500 bg-midnight-950/30 px-2 py-1 rounded border border-white/5">
            {stage.status === StageStatus.Running ? 'Running...' : formatDuration(stage.startTime, stage.endTime)}
          </span>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out ${hasContent ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 relative">
                {hasContent && (
                    <div className="relative max-h-48 overflow-hidden [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]">
                        <div 
                        className="prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-li:text-gray-400 prose-headings:text-gray-300 prose-code:text-violet-300 prose-pre:bg-midnight-950/50 prose-pre:border prose-pre:border-white/5"
                        dangerouslySetInnerHTML={{ __html: stage.content }}
                        />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStageComponent;