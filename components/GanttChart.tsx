import React from 'react';
import { PipelineRun } from '../types';

interface GanttChartProps {
  run: PipelineRun;
}

const GanttChart: React.FC<GanttChartProps> = ({ run }) => {
  if (!run || !run.stages || run.stages.length === 0) {
    return null;
  }

  const chartHeight = run.stages.length * 40 + 40; // 40px per stage + padding
  const chartWidth = 1000;
  const barHeight = 24;
  const topPadding = 30;
  const leftPadding = 180; // Space for stage names

  const pipelineStartTime = run.stages.find(s => s.startTime !== null)?.startTime ?? 0;
  const totalDuration = run.totalDuration;

  if (pipelineStartTime === 0 || totalDuration <= 0) {
    return <p className="text-gray-400 text-sm">Not enough timing data to display timeline for the last run.</p>;
  }
  
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const time = (totalDuration / 1000 / tickCount) * i;
      const xPos = (chartWidth - leftPadding) / tickCount * i + leftPadding;
      return { time, xPos };
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Last Run Timeline</h3>
      <div className="bg-midnight-800 p-2 rounded-lg">
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Render time axis ticks and grid lines */}
          {ticks.map((tick, index) => (
              <g key={index}>
                  <line 
                      x1={tick.xPos} 
                      y1={topPadding - 10}
                      x2={tick.xPos} 
                      y2={chartHeight - 10}
                      stroke="#363463" // midnight-700
                      strokeWidth="1"
                  />
                  <text
                      x={tick.xPos}
                      y={topPadding - 15}
                      textAnchor="middle"
                      fill="#9ca3af" // gray-400
                      fontSize="12"
                  >
                      {tick.time.toFixed(1)}s
                  </text>
              </g>
          ))}

          {run.stages.map((stage, index) => {
            if (!stage.startTime || !stage.endTime) return null;

            const relativeStart = stage.startTime - pipelineStartTime;
            const duration = stage.endTime - stage.startTime;

            const x = (relativeStart / totalDuration) * (chartWidth - leftPadding) + leftPadding;
            const y = index * 40 + topPadding;
            const width = Math.max((duration / totalDuration) * (chartWidth - leftPadding), 2); // min width of 2px
            
            const tooltip = `${stage.name}\nDuration: ${(duration / 1000).toFixed(2)}s`;

            return (
              <g key={stage.name + index} className="group">
                <title>{tooltip}</title>
                
                {/* Stage Name Label */}
                <text x={leftPadding - 10} y={y + barHeight / 2} textAnchor="end" alignmentBaseline="middle" fill="#e5e7eb" fontSize="14">
                  {stage.name}
                </text>

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={barHeight}
                  rx="4"
                  ry="4"
                  className="fill-violet-500 group-hover:fill-violet-400 transition-colors"
                />

                {/* Duration Text inside bar if it fits */}
                {width > 60 && (
                  <text
                      x={x + width / 2}
                      y={y + barHeight / 2}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                      className="pointer-events-none"
                  >
                      {(duration / 1000).toFixed(2)}s
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default GanttChart;