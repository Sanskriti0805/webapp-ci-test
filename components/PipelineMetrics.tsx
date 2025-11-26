import React, { useMemo } from 'react';
import { PipelineRun, StageName, StageStatus } from '../types';
import GanttChart from './GanttChart';

interface PipelineMetricsProps {
  history: PipelineRun[];
}

const PipelineMetrics: React.FC<PipelineMetricsProps> = ({ history }) => {
  const stats = useMemo(() => {
    if (history.length === 0) {
      return null;
    }

    const totalRuns = history.length;
    const successfulRuns = history.filter(run => run.status === StageStatus.Success).length;
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
    const lastRun = history[history.length - 1];
    const lastRunDuration = lastRun.totalDuration / 1000;

    const stageTimings: { [key in StageName]?: { total: number; count: number } } = {};
    
    history.forEach(run => {
      run.stages.forEach(stage => {
        if (stage.startTime && stage.endTime) {
          if (!stageTimings[stage.name]) {
            stageTimings[stage.name] = { total: 0, count: 0 };
          }
          const duration = stage.endTime - stage.startTime;
          stageTimings[stage.name]!.total += duration;
          stageTimings[stage.name]!.count += 1;
        }
      });
    });

    const averageStageTimes = Object.entries(stageTimings)
      .map(([name, data]) => ({
        name: name as StageName,
        avgTime: data.total / data.count / 1000, // in seconds
      }))
      .sort((a, b) => a.avgTime - b.avgTime);

    return {
      successRate,
      lastRunDuration,
      averageStageTimes,
      totalRuns,
      lastRun,
    };
  }, [history]);

  if (!stats) return null;

  const { successRate, lastRunDuration, averageStageTimes, totalRuns, lastRun } = stats;
  const maxAvgTime = Math.max(...averageStageTimes.map(s => s.avgTime), 1);

  return (
    <div className="bg-midnight-900/40 backdrop-blur-md rounded-2xl border border-midnight-700/50 p-6 my-8 shadow-xl shadow-midnight-950/20 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
        <span>Pipeline Performance Metrics</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-stretch">
        <div className="bg-midnight-950/50 border border-white/5 p-4 rounded-xl text-center hover:border-violet-500/30 transition-colors flex flex-col justify-center h-full">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Run Duration</p>
          <p className="text-3xl font-bold text-violet-400">{lastRunDuration.toFixed(2)}s</p>
        </div>
        <div className="bg-midnight-950/50 border border-white/5 p-4 rounded-xl text-center hover:border-green-500/30 transition-colors flex flex-col justify-center h-full">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Success Rate</p>
          <p className="text-3xl font-bold text-green-400">{successRate.toFixed(1)}%</p>
        </div>
        <div className="bg-midnight-950/50 border border-white/5 p-4 rounded-xl text-center hover:border-blue-500/30 transition-colors flex flex-col justify-center h-full">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Runs</p>
          <p className="text-3xl font-bold text-gray-200">{totalRuns}</p>
        </div>
      </div>
      
      <div className="mb-8">
        {lastRun && <GanttChart run={lastRun} />}
      </div>

      <div className="bg-midnight-950/30 p-4 rounded-xl border border-white/5">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Average Stage Duration</h3>
        <div className="space-y-3 text-sm">
          {averageStageTimes.map(({ name, avgTime }) => (
            <div key={name} className="flex items-center group" title={`${name}: ${avgTime.toFixed(2)}s`}>
              <p className="w-48 truncate pr-4 text-gray-400 font-medium">{name}</p>
              <div className="flex-1 bg-midnight-800/50 rounded-full h-2 overflow-hidden">
                 <div
                    className="bg-violet-500 h-full rounded-full group-hover:bg-violet-400 transition-all duration-300 relative"
                    style={{ width: `${(avgTime / maxAvgTime) * 100}%` }}
                  >
                      <div className="absolute inset-0 bg-white/20"></div>
                  </div>
              </div>
              <p className="w-16 text-right pl-3 font-mono text-gray-300">{avgTime.toFixed(2)}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineMetrics;