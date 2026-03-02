'use client';

import React from 'react';

import { cn } from '@/lib/utils';

import { ZODIAC_SIGNS } from './constants';
import { Planet } from './types';

interface ChartProps {
  _natalPlanets?: Planet[];
  _transitPlanets?: Planet[];
  className?: string;
}

const VedicChart: React.FC<ChartProps> = ({
  _natalPlanets = [],
  _transitPlanets = [],
  className,
}) => {
  const size = 600;
  const center = size / 2;
  const outerRadius = 260;
  const midRadius = 180;
  const innerRadius = 100;

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-visible p-4',
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-700"
      >
        <defs>
          <radialGradient
            id="houseGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="rgb(var(--primary-900) / 0.2)" />
            <stop offset="100%" stopColor="rgb(var(--primary-900) / 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Circle - Transits */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          className="text-primary-800 opacity-40"
        />

        {/* Zodiac Divisions */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = i * 30 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = center + innerRadius * Math.cos(rad);
          const y1 = center + innerRadius * Math.sin(rad);
          const x2 = center + outerRadius * Math.cos(rad);
          const y2 = center + outerRadius * Math.sin(rad);

          const textAngle = angle + 15;
          const textRad = (textAngle * Math.PI) / 180;
          const textX = center + (outerRadius + 30) * Math.cos(textRad);
          const textY = center + (outerRadius + 30) * Math.sin(textRad);

          return (
            <g key={sign.name} className="group">
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1"
                className="text-primary-400 opacity-20"
              />
              <text
                x={textX}
                y={textY}
                fill="currentColor"
                fontSize="18"
                textAnchor="middle"
                alignmentBaseline="middle"
                className="cursor-default font-serif text-primary-400 opacity-70 transition-all group-hover:text-primary-500 group-hover:opacity-100"
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Rings */}
        <circle
          cx={center}
          cy={center}
          r={midRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary-700 opacity-30"
        />
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="url(#houseGradient)"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary-500"
        />

        {/* Center Label */}
        <text
          x={center}
          y={center}
          fill="currentColor"
          textAnchor="middle"
          alignmentBaseline="middle"
          className="font-serif text-2xl font-bold tracking-widest text-primary-600"
          style={{ filter: 'url(#glow)' }}
        >
          D1 CHART
        </text>

        {/* Planets Display Logic (Simplified/Placeholder for now as per provided code) */}

        {/* Sun in Natal */}
        <g className="animate-pulse">
          <circle
            cx={center + 140 * Math.cos(0.2)}
            cy={center + 140 * Math.sin(0.2)}
            r="14"
            fill="#fbbf24"
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={center + 140 * Math.cos(0.2)}
            y={center + 140 * Math.sin(0.2)}
            fill="#000"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ☉
          </text>
        </g>

        {/* Moon in Transit */}
        <g>
          <circle
            cx={center + 220 * Math.cos(Math.PI / 4)}
            cy={center + 220 * Math.sin(Math.PI / 4)}
            r="14"
            fill="#f8fafc"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary-500"
          />
          <text
            x={center + 220 * Math.cos(Math.PI / 4)}
            y={center + 220 * Math.sin(Math.PI / 4)}
            fill="#000"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ☽
          </text>
        </g>

        {/* Mars in Natal */}
        <g>
          <circle
            cx={center + 140 * Math.cos(Math.PI / 2)}
            cy={center + 140 * Math.sin(Math.PI / 2)}
            r="14"
            fill="#ef4444"
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={center + 140 * Math.cos(Math.PI / 2)}
            y={center + 140 * Math.sin(Math.PI / 2)}
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ♂
          </text>
        </g>

        {/* Saturn in Transit */}
        <g>
          <circle
            cx={center + 220 * Math.cos(Math.PI)}
            cy={center + 220 * Math.sin(Math.PI)}
            r="14"
            fill="#475569"
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={center + 220 * Math.cos(Math.PI)}
            y={center + 220 * Math.sin(Math.PI)}
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            ♄
          </text>
        </g>

        {/* Dynamic Aspect Lines (Example) */}
        <path
          d={`M ${center + 140 * Math.cos(0.2)} ${center + 140 * Math.sin(0.2)} Q ${center + 180} ${center + 50} ${center + 220 * Math.cos(Math.PI / 4)} ${center + 220 * Math.sin(Math.PI / 4)}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          className="text-primary-500 opacity-40"
        />
      </svg>

      {/* Legend */}
      <div className="absolute left-4 top-4 rounded-2xl border border-primary-200/30 bg-white/40 p-4 text-xs font-medium text-primary-900 shadow-xl shadow-primary-500/5 backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50"></div>
          <span className="uppercase tracking-wide opacity-70">
            Natal Positions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full border-2 border-primary-400 bg-white shadow-sm"></div>
          <span className="uppercase tracking-wide opacity-70">
            Transit Positions
          </span>
        </div>
      </div>
    </div>
  );
};

export default VedicChart;
