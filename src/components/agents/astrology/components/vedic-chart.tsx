'use client';

import React from 'react';
import { ZODIAC_SIGNS } from '@/constants/astrology';

import { ChartPlanet, TransitPlanet } from '@/types/astrology';
import { cn } from '@/lib/utils';

interface ChartProps {
  natalPlanets?: ChartPlanet[];
  transitPlanets?: TransitPlanet[];
  className?: string;
  title?: string;
}

const PLANET_INFO: Record<
  string,
  { symbol: string; color: string; textColor?: string }
> = {
  Sun: { symbol: 'Sun', color: '#fbbf24', textColor: '#000' },
  Moon: { symbol: 'Moon', color: '#f8fafc', textColor: '#000' },
  Mars: { symbol: 'Mars', color: '#ef4444', textColor: '#fff' },
  Mercury: { symbol: 'Mer', color: '#22c55e', textColor: '#fff' },
  Jupiter: { symbol: 'Jup', color: '#eab308', textColor: '#fff' },
  Venus: { symbol: 'Ven', color: '#ec4899', textColor: '#fff' },
  Saturn: { symbol: 'Sat', color: '#475569', textColor: '#fff' },
  Rahu: { symbol: 'Rahu', color: '#1f2937', textColor: '#fff' },
  Ketu: { symbol: 'Ketu', color: '#6b7280', textColor: '#fff' },
  Ascendant: { symbol: 'Asc', color: '#3b82f6', textColor: '#fff' },
};

const getSignIndex = (sign: string) => {
  const signs = [
    'Ari',
    'Tau',
    'Gem',
    'Can',
    'Leo',
    'Vir',
    'Lib',
    'Sco',
    'Sag',
    'Cap',
    'Aqu',
    'Pis',
  ];
  return signs.indexOf(sign);
};

const getAngleRad = (sign: string, degree: number = 15) => {
  const index = getSignIndex(sign);
  if (index === -1) return 0;
  const angleDeg = index * 30 - 90 + degree;
  return (angleDeg * Math.PI) / 180;
};

const VedicChart: React.FC<ChartProps> = ({
  className,
  natalPlanets = [],
  transitPlanets = [],
  title = 'D1 CHART',
}) => {
  const size = 600;
  const center = size / 2;
  const outerRadius = 260;
  const midRadius = 180;
  const innerRadius = 100;

  // Render a planet
  const renderPlanet = (
    p: { planet: string; sign: string; degree?: number; isTransit?: boolean },
    idx: number
  ) => {
    const info = PLANET_INFO[p.planet] || {
      symbol: p.planet[0],
      color: '#ccc',
      textColor: '#000',
    };
    const degree = p.degree ?? 15;

    // Slight offset to prevent overlap if degrees are very close
    const offset = (idx % 3) * 5 - 5;
    const rad = getAngleRad(p.sign, degree + offset);

    const radiusDist = p.isTransit ? 220 : 140;
    const cx = center + radiusDist * Math.cos(rad);
    const cy = center + radiusDist * Math.sin(rad);

    return (
      <g
        key={`${p.planet}-${p.isTransit ? 't' : 'n'}`}
        className="group transition-transform"
      >
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill={info.color}
          stroke={p.isTransit ? 'currentColor' : ''}
          strokeWidth="3"
          className={p.isTransit ? 'text-primary-500' : ''}
        />
        <text
          x={cx}
          y={cy + 1}
          fill={info.textColor}
          fontSize="11"
          fontWeight="semibold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {info.symbol}
        </text>
      </g>
    );
  };

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-visible p-4',
        className
      )}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full max-w-[500px] drop-shadow-[0_0_40px_rgba(249,115,22,0.1)] transition-all duration-700 lg:max-w-[600px]"
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
        {transitPlanets.length > 0 && (
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
        )}

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
          const outerR = transitPlanets.length > 0 ? outerRadius : midRadius;
          const x2 = Number((center + outerR * Math.cos(rad)).toFixed(2));
          const y2 = Number((center + outerR * Math.sin(rad)).toFixed(2));

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
          className="font-serif text-xl font-bold tracking-widest text-primary-600 sm:text-2xl"
          style={{ filter: 'url(#glow)' }}
        >
          {title}
        </text>

        {/* Natal Planets */}
        {natalPlanets.map((p, idx) =>
          renderPlanet({ ...p, isTransit: false }, idx)
        )}

        {/* Transit Planets */}
        {transitPlanets.map((p, idx) =>
          renderPlanet(
            {
              planet: p.planet,
              sign: p.sign,
              degree: p.longitude % 30,
              isTransit: true,
            },
            idx
          )
        )}
      </svg>

      {/* Legend */}
      <div className="absolute left-2 top-2 z-20 rounded-xl border border-slate-200/60 bg-white/60 p-2 text-[8px] font-bold text-slate-600 shadow-sm backdrop-blur-md md:left-4 md:top-4 md:rounded-2xl md:p-4 md:text-[10px]">
        <div className="mb-1 flex items-center gap-2 md:mb-2 md:gap-3">
          <div className="h-2 w-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50 md:h-2.5 md:w-2.5"></div>
          <span className="uppercase tracking-widest opacity-80">Natal</span>
        </div>
        {transitPlanets.length > 0 && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-2 w-2 rounded-full border-2 border-primary-500 bg-transparent shadow-sm md:h-2.5 md:w-2.5"></div>
            <span className="uppercase tracking-widest opacity-80">
              Transit
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VedicChart;
