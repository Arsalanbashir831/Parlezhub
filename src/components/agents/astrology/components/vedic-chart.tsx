'use client';

import React from 'react';
import { ZODIAC_SIGNS } from '@/constants/astrology';

import { Planet } from '@/types/astrology';
import { cn } from '@/lib/utils';

interface ChartProps {
  _natalPlanets?: Planet[];
  _transitPlanets?: Planet[];
  className?: string;
}

const VedicChart: React.FC<ChartProps> = ({ className }) => {
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
        className="drop-shadow-[0_0_40px_rgba(249,115,22,0.1)] transition-all duration-700"
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
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
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
          const textAngle = angle + 15;
          const textRad = (textAngle * Math.PI) / 180;
          const textX = Number(
            (center + (outerRadius + 30) * Math.cos(textRad)).toFixed(2)
          );
          const textY = Number(
            (center + (outerRadius + 30) * Math.sin(textRad)).toFixed(2)
          );

          const x1 = Number((center + innerRadius * Math.cos(rad)).toFixed(2));
          const y1 = Number((center + innerRadius * Math.sin(rad)).toFixed(2));
          const x2 = Number((center + outerRadius * Math.cos(rad)).toFixed(2));
          const y2 = Number((center + outerRadius * Math.sin(rad)).toFixed(2));

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
          strokeWidth="1.5"
          className="text-primary-200"
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
      <div className="absolute left-2 top-2 z-20 rounded-xl border border-slate-200/60 bg-white/60 p-2 text-[8px] font-bold text-slate-600 shadow-sm backdrop-blur-md md:left-4 md:top-4 md:rounded-2xl md:p-4 md:text-[10px]">
        <div className="mb-1 flex items-center gap-2 md:mb-2 md:gap-3">
          <div className="h-2 w-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50 md:h-2.5 md:w-2.5"></div>
          <span className="uppercase tracking-widest opacity-80">Natal</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-2 w-2 rounded-full border-2 border-primary-500 bg-transparent shadow-sm md:h-2.5 md:w-2.5"></div>
          <span className="uppercase tracking-widest opacity-80">Transit</span>
        </div>
      </div>
    </div>
  );
};

export default VedicChart;
