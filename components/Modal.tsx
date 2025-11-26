import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StageStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import ClockIcon from './icons/ClockIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // Keep generic children support if needed, but we mostly pass content now
  stageContent?: string;     // Explicit content prop
  stageName?: string;
  stageStatus?: StageStatus;
}

const getStatusIcon = (status?: StageStatus) => {
    switch (status) {
      case StageStatus.Success: return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case StageStatus.Failed: return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case StageStatus.Running: return <ArrowPathIcon className="w-5 h-5 text-violet-400 animate-spin" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-4xl bg-midnight-900 rounded-2xl border border-midnight-700 shadow-2xl shadow-midnight-950/80 m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-4 right-4 z-10">
            <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-midnight-800 hover:bg-midnight-700 rounded-full transition-colors"
            aria-label="Close modal"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;