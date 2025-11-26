import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const PipelineStageComponent: React.FC<PipelineStageProps> = ({ stage, isLast, onClick }) => {
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
                        <div className="prose prose-invert prose-sm max-w-none 
                            prose-headings:text-gray-300 prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
                            prose-p:text-gray-400 prose-p:my-2
                            prose-li:text-gray-400 prose-ul:my-2 prose-ul:pl-4
                            prose-pre:bg-midnight-950/50 prose-pre:border prose-pre:border-white/5 prose-pre:p-3 prose-pre:rounded-lg
                            prose-code:text-violet-300 prose-code:bg-midnight-950/30 prose-code:px-1 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-['']
                            prose-table:border-collapse prose-table:border prose-table:border-midnight-700 prose-table:w-full prose-table:my-4
                            prose-th:bg-midnight-800 prose-th:p-2 prose-th:text-left prose-th:text-gray-200 prose-th:border prose-th:border-midnight-700
                            prose-td:border prose-td:border-midnight-700 prose-td:p-2 prose-td:text-gray-400">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {stage.content}
                             </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStageComponent;