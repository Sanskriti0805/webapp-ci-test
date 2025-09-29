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
    <div className="bg-midnight-900/50 backdrop-blur-sm rounded-xl border border-midnight-700 p-6 my-8 shadow-2xl shadow-midnight-950/50">
      <h2 className="text-xl font-bold text-gray-200 mb-4">Pipeline Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-midnight-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Last Run Duration</p>
          <p className="text-2xl font-bold text-violet-400">{lastRunDuration.toFixed(2)}s</p>
        </div>
        <div className="bg-midnight-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold text-green-400">{successRate.toFixed(1)}%</p>
        </div>
        <div className="bg-midnight-800 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Total Runs</p>
          <p className="text-2xl font-bold text-gray-200">{totalRuns}</p>
        </div>
      </div>
      
      <div className="my-8">
        {lastRun && <GanttChart run={lastRun} />}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Average Stage Times</h3>
        <div className="space-y-2 text-sm">
          {averageStageTimes.map(({ name, avgTime }) => (
            <div key={name} className="flex items-center group" title={`${name}: ${avgTime.toFixed(2)}s`}>
              <p className="w-48 truncate pr-4 text-gray-400">{name}</p>
              <div className="flex-1 bg-midnight-800 rounded-full h-5">
                 <div
                    className="bg-violet-500 h-5 rounded-full group-hover:bg-violet-400 transition-all duration-300"
                    style={{ width: `${(avgTime / maxAvgTime) * 100}%` }}
                  />
              </div>
              <p className="w-20 text-right pl-4 font-mono text-gray-200">{avgTime.toFixed(2)}s</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineMetrics;