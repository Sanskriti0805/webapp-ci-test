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
        case StageStatus.Success: return 'border-green-400/50';
        case StageStatus.Failed: return 'border-red-400/50';
        case StageStatus.Running: return 'border-violet-400/50 animate-pulse-fast';
        case StageStatus.Pending:
        default: return 'border-midnight-700';
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

  return (
    <div className="flex items-stretch">
      <div className="flex flex-col items-center mr-6">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-midnight-800 flex items-center justify-center border-2 ${getStatusColor(stage.status)}`}>
          {getStatusIcon(stage.status)}
        </div>
        {!isLast && <div className="w-0.5 h-full bg-midnight-700 mt-2" />}
      </div>

      <div 
        className={`w-full bg-midnight-900 rounded-xl border ${getStatusColor(stage.status)} transition-all duration-300 hover:border-violet-500/70 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer mb-6`}
        title={getTooltipText()}
        onClick={() => onClick(stage)}
      >
        <div className="p-4 border-b border-midnight-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-lg text-gray-200">{stage.name}</h3>
          </div>
          <span className="text-sm text-gray-400 font-mono">
            {formatDuration(stage.startTime, stage.endTime)}
          </span>
        </div>
        <div className="p-4 overflow-hidden relative h-40">
            {stage.content && (
                <>
                    <div 
                    className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:text-violet-400"
                    dangerouslySetInnerHTML={{ __html: stage.content }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-midnight-900 to-transparent pointer-events-none"></div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PipelineStageComponent;