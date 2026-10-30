'use client';

import React from 'react';
import { ZODIAC_SIGNS } from '@/constants/astrology';

import { ChartPlanet, TransitPlanet } from '@/types/astrology';
import { cn } from '@/lib/utils';

export type ChartSelection = {
  planet: string;
  sign: string;
  degree: number;
  isTransit: boolean;
};

interface ChartProps {
  natalPlanets?: ChartPlanet[];
  transitPlanets?: TransitPlanet[];
  className?: string;
  title?: string;
  onSelectPlanet?: (selection: ChartSelection) => void;
}

const SOLAR_GOLD = 'var(--solar-gold,#ffd2a8)';
const TEXT_PRIMARY = 'var(--text-primary,#ededed)';

const PLANET_INFO: Record<string, { symbol: string }> = {
  Sun: { symbol: 'Sun' },
  Moon: { symbol: 'Moon' },
  Mars: { symbol: 'Mars' },
  Mercury: { symbol: 'Mer' },
  Jupiter: { symbol: 'Jup' },
  Venus: { symbol: 'Ven' },
  Saturn: { symbol: 'Sat' },
  Rahu: { symbol: 'Rahu' },
  Ketu: { symbol: 'Ketu' },
  Ascendant: { symbol: 'Asc' },
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

interface PlanetNodeProps extends ChartSelection {
  displayDegree?: number;
  id: string;
  radialOffset?: number;
  isHovered: boolean;
  rotationOffset: number;
  setHoveredId: (id: string | null) => void;
  onSelectPlanet?: (selection: ChartSelection) => void;
}

const PlanetNode = React.memo(function PlanetNode({
  planet,
  sign,
  degree,
  displayDegree,
  isTransit,
  id,
  radialOffset,
  isHovered,
  rotationOffset,
  setHoveredId,
  onSelectPlanet,
}: PlanetNodeProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const info = PLANET_INFO[planet] || { symbol: planet[0] };

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
  const markerRadius = isHovered ? 19 : 16;
  const signName = ZODIAC_SIGNS[getSignIndex(sign)]?.name ?? sign;

  const handleMouseEnter = React.useCallback(() => setHoveredId(id), [setHoveredId, id]);
  const handleMouseLeave = React.useCallback(() => setHoveredId(null), [setHoveredId]);
  const handleSelect = React.useCallback(() => {
    onSelectPlanet?.({ planet, sign, degree, isTransit });
  }, [onSelectPlanet, planet, sign, degree, isTransit]);

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${isTransit ? 'Transit' : 'Natal'} ${planet}, ${signName}, ${degree} degrees`}
      className="group cursor-pointer outline-none transition-[transform] duration-200 motion-reduce:transition-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (!event.repeat) handleSelect();
        }
      }}
      style={{
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      {isFocused && (
        <circle
          cx={cx}
          cy={cy}
          r="24"
          fill="none"
          stroke={SOLAR_GOLD}
          strokeWidth="2"
          className="pointer-events-none"
          aria-hidden="true"
        />
      )}
      {isTransit ? (
        <rect
          x={cx - markerRadius}
          y={cy - markerRadius}
          width={markerRadius * 2}
          height={markerRadius * 2}
          fill="transparent"
          stroke={SOLAR_GOLD}
          strokeWidth="1.5"
          strokeDasharray="3,2"
        />
      ) : (
        <circle
          cx={cx}
          cy={cy}
          r={markerRadius}
          fill="transparent"
          stroke={TEXT_PRIMARY}
          strokeWidth="1.5"
        />
      )}
      <text
        x={cx}
        y={cy + 1}
        fill={isTransit || planet === 'Ascendant' ? SOLAR_GOLD : TEXT_PRIMARY}
        fontSize={isHovered ? '14' : '13'}
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
  title = 'Vedic chart',
  onSelectPlanet,
}: ChartProps) {
  const chartId = React.useId();
  const titleId = `${chartId}-title`;
  const descriptionId = `${chartId}-description`;
  const gradientId = `${chartId}-house-gradient`;
  const glowId = `${chartId}-glow`;
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
          role="group"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          style={{ color: SOLAR_GOLD }}
        >
          <title id={titleId}>{title || 'Vedic chart'}</title>
          <desc id={descriptionId}>
            Zodiac placements with circular natal markers
            {transitPlanets.length > 0 ? ' and dashed square transit markers' : ''}.
            Select a planet by clicking or focusing it and pressing Enter or Space.
          </desc>
          <defs>
            <radialGradient
              id={gradientId}
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={SOLAR_GOLD} stopOpacity="0.08" />
              <stop offset="100%" stopColor={SOLAR_GOLD} stopOpacity="0" />
            </radialGradient>
            <filter id={glowId}>
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
              className="opacity-40"
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
              <g key={sign.name} className="group" aria-hidden="true">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="opacity-20"
                />
                <text
                  x={textX}
                  y={textY}
                  fill={TEXT_PRIMARY}
                  fontSize="20"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="cursor-default font-serif opacity-80 transition-opacity group-hover:opacity-100"
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
            className="opacity-30"
          />
          <circle
            cx={CHART_CENTER}
            cy={CHART_CENTER}
            r={INNER_RADIUS}
            fill={`url(#${gradientId})`}
            stroke="currentColor"
            strokeWidth="1.5"
          />

          {/* Celestial Accent / Compass Rose at Center */}
          <g
            style={{ filter: `url(#${glowId})` }}
            className="pointer-events-none opacity-80"
            aria-hidden="true"
          >
            {/* Elegant outer dashed fine ring */}
            <circle
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="3,3"
              className="opacity-40"
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
              fill={TEXT_PRIMARY}
            />
          </g>

          {/* Base Planet Layer (Stable Order) */}
          {natalWithIdx.map((p) => (
            <PlanetNode
              key={p.id}
              {...p}
              isHovered={hoveredId === p.id}
              rotationOffset={rotationOffset}
              setHoveredId={stableSetHoveredId}
              onSelectPlanet={onSelectPlanet}
            />
          ))}
          {transitWithIdx.map((p) => (
            <PlanetNode
              key={p.id}
              {...p}
              isHovered={hoveredId === p.id}
              rotationOffset={rotationOffset}
              setHoveredId={stableSetHoveredId}
              onSelectPlanet={onSelectPlanet}
            />
          ))}
        </svg>
      </div>

      <ul
        aria-label="Chart legend"
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 pb-2 text-sm leading-5"
        style={{ color: TEXT_PRIMARY }}
      >
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-3 rounded-full border"
            style={{ borderColor: TEXT_PRIMARY }}
          />
          <span>Natal</span>
        </li>
        {transitPlanets.length > 0 && (
          <li className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-3 w-3 border border-dashed"
              style={{ borderColor: SOLAR_GOLD }}
            />
            <span>Transit</span>
          </li>
        )}
      </ul>
    </div>
  );
});

export default VedicChart;
