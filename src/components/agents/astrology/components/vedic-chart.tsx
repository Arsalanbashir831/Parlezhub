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
  Sun: { symbol: 'Sun', color: 'transparent', textColor: '#fff' },
  Moon: { symbol: 'Moon', color: 'transparent', textColor: '#fff' },
  Mars: { symbol: 'Mars', color: 'transparent', textColor: '#fff' },
  Mercury: { symbol: 'Mer', color: 'transparent', textColor: '#fff' },
  Jupiter: { symbol: 'Jup', color: 'transparent', textColor: '#fff' },
  Venus: { symbol: 'Ven', color: 'transparent', textColor: '#fff' },
  Saturn: { symbol: 'Sat', color: 'transparent', textColor: '#fff' },
  Rahu: { symbol: 'Rahu', color: 'transparent', textColor: '#fff' },
  Ketu: { symbol: 'Ketu', color: 'transparent', textColor: '#fff' },
  Ascendant: { symbol: 'Asc', color: 'transparent', textColor: '#fff' },
};

const getSignIndex = (sign: string) => {
  if (!sign) return -1;
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
  // Check for 3-letter symbol
  const index = signs.indexOf(sign);
  if (index !== -1) return index;

  // Check for full name
  const fullSigns = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  return fullSigns.indexOf(sign);
};

const getAngleRad = (
  sign: string,
  degree: number = 15,
  rotationOffset: number = 0
) => {
  const index = getSignIndex(sign);
  if (index === -1) return 0;
  // -90 is 12 o'clock. Subtracting moves anticlockwise.
  // We subtract (current position - ascendant position) to rotate
  const angleDeg = -90 - (index * 30 + degree - rotationOffset);
  return (angleDeg * Math.PI) / 180;
};

const VedicChart: React.FC<ChartProps> = ({
  className,
  natalPlanets = [],
  transitPlanets = [],
  title = 'D1 CHART',
}) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  // Calculate rotation to place Ascendant at top
  const ascendant = natalPlanets.find((p) => p.planet === 'Ascendant');
  const ascIndex = ascendant ? getSignIndex(ascendant.sign) : 0;
  const ascDegree = ascendant?.degree || 0;
  const rotationOffset = ascIndex * 30 + ascDegree;

  const size = 700;
  const center = size / 2;
  const outerRadius = 300;
  const midRadius = 210;
  const innerRadius = 120;

  // Render a planet
  const renderPlanet = (
    p: {
      planet: string;
      sign: string;
      degree?: number;
      isTransit?: boolean;
      hide?: boolean;
      id: string;
      radialOffset?: number;
    }
  ) => {
    const info = PLANET_INFO[p.planet] || {
      symbol: p.planet[0],
      color: '#ccc',
      textColor: '#000',
    };
    const degree = p.degree ?? 15;
    const rad = getAngleRad(p.sign, degree, rotationOffset);

    // Use pre-calculated radial offset for collision avoidance
    const baseRadius = p.isTransit ? outerRadius - 45 : innerRadius + 45;
    let radiusDist = baseRadius + (p.radialOffset || 0);

    // Clamp within ring boundaries to prevent overlap between sections
    if (p.isTransit) {
      // Transit must stay between Mid and Outer
      radiusDist = Math.max(midRadius + 25, Math.min(radiusDist, outerRadius - 25));
    } else {
      // Natal must stay between Inner and Mid
      radiusDist = Math.max(innerRadius + 25, Math.min(radiusDist, midRadius - 25));
    }

    const cx = center + radiusDist * Math.cos(rad);
    const cy = center + radiusDist * Math.sin(rad);

    const id = p.id;
    const isHovered = hoveredId === id;

    return (
      <g
        key={id}
        className={cn(
          'group cursor-pointer transition-all duration-200',
          isHovered ? 'z-50' : 'z-0'
        )}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          transformOrigin: `${cx}px ${cy}px`,
          visibility: p.hide ? 'hidden' : 'visible',
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? '19' : '16'}
          fill="transparent"
          stroke="none"
          className={cn(
            'transition-all duration-200',
            isHovered ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]' : ''
          )}
        />
        <text
          x={cx}
          y={cy + 1}
          fill={p.isTransit ? '#EAB308' : info.textColor}
          fontSize={isHovered ? '12' : '11'}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
          className="pointer-events-none"
        >
          {info.symbol}
        </text>
      </g>
    );
  };

  // Process planets with collision detection
  const processedPlanets = React.useMemo(() => {
    const combined = [
      ...natalPlanets.map((p) => ({ ...p, isTransit: false, id: `${p.planet}-n` })),
      ...transitPlanets.map((p) => ({
        planet: p.planet,
        sign: p.sign,
        degree: p.longitude % 30,
        isTransit: true,
        id: `${p.planet}-t`,
      })),
    ];

    const bySign: Record<string, any[]> = {};
    combined.forEach((p) => {
      if (!bySign[p.sign]) bySign[p.sign] = [];
      bySign[p.sign].push(p);
    });

    return Object.values(bySign).flatMap((signPlanets) => {
      const natals = signPlanets.filter((p) => !p.isTransit);
      const transits = signPlanets.filter((p) => p.isTransit);

      const processCategory = (list: any[]) => {
        list.sort((a, b) => (a.degree || 0) - (b.degree || 0));
        return list.map((p, i) => {
          let radialOffset = 0;
          let overlapCount = 0;
          
          for (let j = 0; j < i; j++) {
            const prev = list[j];
            if (Math.abs((p.degree || 0) - (prev.degree || 0)) < 8) {
              overlapCount++;
            }
          }

          if (overlapCount > 0) {
            // Alternating pattern: 0, 25, -25, 50, -50...
            const magnitude = Math.ceil(overlapCount / 2) * 25;
            const direction = overlapCount % 2 === 1 ? 1 : -1;
            radialOffset = magnitude * direction;
          }

          return { ...p, radialOffset };
        });
      };

      return [...processCategory(natals), ...processCategory(transits)];
    });
  }, [natalPlanets, transitPlanets]);

  const natalWithIdx = processedPlanets.filter((p) => !p.isTransit);
  const transitWithIdx = processedPlanets.filter((p) => p.isTransit);

  const hoveredPlanetData = processedPlanets.find((p) => p.id === hoveredId);

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-visible p-4',
        className
      )}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full max-w-[600px] drop-shadow-[0_0_40px_rgba(249,115,22,0.1)] transition-all duration-700 lg:max-w-[800px]"
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
          const angle = -90 - (i * 30 - rotationOffset); // Divider at start of sign
          const rad = (angle * Math.PI) / 180;
          const textAngle = angle - 15; // Label in center of sign
          const textRad = (textAngle * Math.PI) / 180;
          const outerR = transitPlanets.length > 0 ? outerRadius : midRadius;
          const textLabelRadius = transitPlanets.length > 0 ? outerRadius : midRadius;
          const textX = Number(
            (center + (textLabelRadius + 30) * Math.cos(textRad)).toFixed(2)
          );
          const textY = Number(
            (center + (textLabelRadius + 30) * Math.sin(textRad)).toFixed(2)
          );

          const x1 = Number((center + innerRadius * Math.cos(rad)).toFixed(2));
          const y1 = Number((center + innerRadius * Math.sin(rad)).toFixed(2));
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

        {/* Base Planet Layer (Stable Order) */}
        {natalWithIdx.map((p) =>
          renderPlanet({ ...p, hide: hoveredId === p.id })
        )}
        {transitWithIdx.map((p) =>
          renderPlanet({ ...p, hide: hoveredId === p.id })
        )}

        {/* Hover Overlay Layer (Ensures immediate "on top" rendering) */}
        {hoveredPlanetData &&
          renderPlanet(hoveredPlanetData)}
      </svg>

      {/* Legend */}
      <div className="absolute left-2 top-2 z-20 rounded-xl border border-primary-500/30 p-2 text-[8px] font-bold text-primary-400 shadow-sm backdrop-blur-md md:left-4 md:top-4 md:rounded-2xl md:p-4 md:text-[10px]">
        <div className="mb-1 flex items-center gap-2 md:mb-2 md:gap-3">
          <div className="h-2 w-2 rounded-full bg-white shadow-sm md:h-2.5 md:w-2.5"></div>
          <span className="uppercase tracking-widest opacity-80">Natal</span>
        </div>
        {transitPlanets.length > 0 && (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-2 w-2 rounded-full bg-[#EAB308] shadow-sm md:h-2.5 md:w-2.5"></div>
            <span className="uppercase tracking-widest text-[#EAB308] opacity-90">
              Transit
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VedicChart;
