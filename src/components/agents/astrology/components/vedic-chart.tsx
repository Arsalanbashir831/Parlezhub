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
  Ascendant: { symbol: 'Asc', color: 'transparent', textColor: '#EAB308' },
};

// Chart geometry constants — defined once at module level
const CHART_SIZE = 700;
const CHART_CENTER = CHART_SIZE / 2;
const OUTER_RADIUS = 300;
const MID_RADIUS = 210;
const INNER_RADIUS = 120;

const getSignIndex = (sign: string) => {
  if (!sign) return -1;
  const signs = [
    'Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
    'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis',
  ];
  const index = signs.indexOf(sign);
  if (index !== -1) return index;

  const fullSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
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
  const angleDeg = -90 - (index * 30 + degree - rotationOffset);
  return (angleDeg * Math.PI) / 180;
};

interface PlanetNodeProps {
  planet: string;
  sign: string;
  degree?: number;
  displayDegree?: number;
  isTransit: boolean;
  hide: boolean;
  id: string;
  radialOffset?: number;
  isHovered: boolean;
  rotationOffset: number;
  setHoveredId: (id: string | null) => void;
}

const PlanetNode = React.memo(function PlanetNode({
  planet,
  sign,
  degree,
  displayDegree,
  isTransit,
  hide,
  id,
  radialOffset,
  isHovered,
  rotationOffset,
  setHoveredId,
}: PlanetNodeProps) {
  const info = PLANET_INFO[planet] || {
    symbol: planet[0],
    color: '#ccc',
    textColor: '#000',
  };

  const deg = displayDegree ?? degree ?? 15;
  const rad = getAngleRad(sign, deg, rotationOffset);

  const baseRadius = isTransit ? OUTER_RADIUS - 45 : INNER_RADIUS + 45;
  let radiusDist = baseRadius + (radialOffset || 0);

  if (isTransit) {
    radiusDist = Math.max(MID_RADIUS + 25, Math.min(radiusDist, OUTER_RADIUS - 25));
  } else {
    radiusDist = Math.max(INNER_RADIUS + 25, Math.min(radiusDist, MID_RADIUS - 25));
  }

  const cx = CHART_CENTER + radiusDist * Math.cos(rad);
  const cy = CHART_CENTER + radiusDist * Math.sin(rad);

  const handleMouseEnter = React.useCallback(() => setHoveredId(id), [setHoveredId, id]);
  const handleMouseLeave = React.useCallback(() => setHoveredId(null), [setHoveredId]);

  return (
    <g
      className={cn(
        'group cursor-pointer transition-[transform] duration-200',
        isHovered ? 'z-50' : 'z-0'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transformOrigin: `${cx}px ${cy}px`,
        visibility: hide ? 'hidden' : 'visible',
      }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={isHovered ? '19' : '16'}
        fill="transparent"
        stroke="none"
        className={isHovered ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]' : ''}
      />
      <text
        x={cx}
        y={cy + 1}
        fill={isTransit ? '#EAB308' : info.textColor}
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
});

const VedicChart = React.memo(function VedicChart({
  className,
  natalPlanets = [],
  transitPlanets = [],
  title = 'D1 CHART',
}: ChartProps) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const stableSetHoveredId = React.useCallback(
    (id: string | null) => setHoveredId(id),
    []
  );

  const ascendant = natalPlanets.find((p) => p.planet === 'Ascendant');
  const ascIndex = ascendant ? getSignIndex(ascendant.sign) : 0;
  const ascDegree = ascendant?.degree || 0;
  const rotationOffset = ascIndex * 30 + ascDegree;

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

    interface ProcessedPlanet {
      planet: string;
      sign: string;
      degree: number;
      isTransit: boolean;
      id: string;
      lord?: string;
      displayDegree?: number;
      radialOffset?: number;
    }

    const bySign: Record<string, ProcessedPlanet[]> = {};
    combined.forEach((p) => {
      if (!bySign[p.sign]) bySign[p.sign] = [];
      bySign[p.sign].push(p as ProcessedPlanet);
    });

    return Object.values(bySign).flatMap((signPlanets) => {
      const natals = signPlanets.filter((p) => !p.isTransit);
      const transits = signPlanets.filter((p) => p.isTransit);

      const processCategory = (list: ProcessedPlanet[]) => {
        if (list.length === 0) return [];
        list.sort((a, b) => (a.degree || 0) - (b.degree || 0));

        const PADDING = 4;
        const availableSpace = 30 - PADDING * 2;
        const MIN_GAP = Math.min(6, availableSpace / Math.max(1, list.length - 1));

        const adjustedDegrees = list.map(p =>
          Math.max(PADDING, Math.min(30 - PADDING, p.degree || 15))
        );

        if (list.length > 1) {
          for (let i = 1; i < adjustedDegrees.length; i++) {
            if (adjustedDegrees[i] - adjustedDegrees[i - 1] < MIN_GAP) {
              adjustedDegrees[i] = adjustedDegrees[i - 1] + MIN_GAP;
            }
          }

          if (adjustedDegrees[adjustedDegrees.length - 1] > 30 - PADDING) {
            adjustedDegrees[adjustedDegrees.length - 1] = 30 - PADDING;
            for (let i = adjustedDegrees.length - 2; i >= 0; i--) {
              if (adjustedDegrees[i + 1] - adjustedDegrees[i] < MIN_GAP) {
                adjustedDegrees[i] = adjustedDegrees[i + 1] - MIN_GAP;
              }
            }
          }
        }

        return list.map((p, i) => {
          const radialOffset = list.length > 2 ? ((i % 2 === 0) ? 8 : -8) : 0;
          return { ...p, displayDegree: adjustedDegrees[i], radialOffset };
        });
      };

      return [...processCategory(natals), ...processCategory(transits)];
    });
  }, [natalPlanets, transitPlanets]);

  const natalWithIdx = processedPlanets.filter((p) => !p.isTransit);
  const transitWithIdx = processedPlanets.filter((p) => p.isTransit);
  const hoveredPlanetData = processedPlanets.find((p) => p.id === hoveredId);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className={cn(
          'relative flex w-full items-center justify-center overflow-visible p-0',
          className
        )}
      >
        <svg
          viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          className="h-auto w-full max-w-[750px] lg:max-w-[1000px]"
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
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r={OUTER_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="5,5"
              className="text-primary-800 opacity-40"
            />
          )}

          {/* Zodiac Divisions */}
          {ZODIAC_SIGNS.map((sign, i) => {
            const angle = -90 - (i * 30 - rotationOffset);
            const rad = (angle * Math.PI) / 180;
            const textAngle = angle - 15;
            const textRad = (textAngle * Math.PI) / 180;
            const outerR = transitPlanets.length > 0 ? OUTER_RADIUS : MID_RADIUS;
            const textLabelRadius = transitPlanets.length > 0 ? OUTER_RADIUS : MID_RADIUS;
            const textX = Number(
              (CHART_CENTER + (textLabelRadius + 30) * Math.cos(textRad)).toFixed(2)
            );
            const textY = Number(
              (CHART_CENTER + (textLabelRadius + 30) * Math.sin(textRad)).toFixed(2)
            );

            const x1 = Number((CHART_CENTER + INNER_RADIUS * Math.cos(rad)).toFixed(2));
            const y1 = Number((CHART_CENTER + INNER_RADIUS * Math.sin(rad)).toFixed(2));
            const x2 = Number((CHART_CENTER + outerR * Math.cos(rad)).toFixed(2));
            const y2 = Number((CHART_CENTER + outerR * Math.sin(rad)).toFixed(2));

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
                  className="cursor-default font-serif text-primary-400 opacity-70 transition-[opacity,fill] group-hover:text-primary-500 group-hover:opacity-100"
                >
                  {sign.symbol}
                </text>
              </g>
            );
          })}

          {/* Rings */}
          <circle
            cx={CHART_CENTER}
            cy={CHART_CENTER}
            r={MID_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary-700 opacity-30"
          />
          <circle
            cx={CHART_CENTER}
            cy={CHART_CENTER}
            r={INNER_RADIUS}
            fill="url(#houseGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary-200"
          />

          {/* Celestial Accent / Compass Rose at Center */}
          <g style={{ filter: 'url(#glow)' }} className="pointer-events-none text-primary-400/80">
            {/* Elegant outer dashed fine ring */}
            <circle
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="3,3"
              className="text-primary-500/40"
            />
            {/* Elegant 4-pointed celestial star */}
            <path
              d={`
                M ${CHART_CENTER} ${CHART_CENTER - 15}
                Q ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER + 15} ${CHART_CENTER}
                Q ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER + 15}
                Q ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER - 15} ${CHART_CENTER}
                Q ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER} ${CHART_CENTER - 15}
                Z
              `}
              fill="currentColor"
            />
            {/* Center golden pinpoint */}
            <circle
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r="2.5"
              fill="#fff"
            />
          </g>

          {/* Base Planet Layer (Stable Order) */}
          {natalWithIdx.map((p) => (
            <PlanetNode
              key={p.id}
              {...p}
              hide={hoveredId === p.id}
              isHovered={hoveredId === p.id}
              rotationOffset={rotationOffset}
              setHoveredId={stableSetHoveredId}
            />
          ))}
          {transitWithIdx.map((p) => (
            <PlanetNode
              key={p.id}
              {...p}
              hide={hoveredId === p.id}
              isHovered={hoveredId === p.id}
              rotationOffset={rotationOffset}
              setHoveredId={stableSetHoveredId}
            />
          ))}

          {/* Hover Overlay Layer (Ensures immediate "on top" rendering) */}
          {hoveredPlanetData && (
            <PlanetNode
              key={`${hoveredPlanetData.id}-overlay`}
              {...hoveredPlanetData}
              hide={false}
              isHovered={true}
              rotationOffset={rotationOffset}
              setHoveredId={stableSetHoveredId}
            />
          )}
        </svg>

        {/* Legend */}
        <div className="absolute left-2 top-2 z-20 rounded-xl border border-primary-500/30 bg-background/90 p-2 text-[8px] font-bold text-primary-400 shadow-sm md:left-4 md:top-4 md:rounded-2xl md:p-4 md:text-[10px]">
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

      {/* Dynamic Title Under the Chart */}
      {title && (
        <div className="text-center select-none px-6 pb-2 animate-fade-in">
          <h3 className="font-serif text-base sm:text-lg md:text-xl font-bold tracking-widest text-primary-500 uppercase drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]">
            {title}
          </h3>
        </div>
      )}
    </div>
  );
});

export default VedicChart;
