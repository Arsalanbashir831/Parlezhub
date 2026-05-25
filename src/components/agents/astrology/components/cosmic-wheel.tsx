'use client';

import React, { useMemo, memo } from 'react';
import { PLANET_ORDER, PLANET_META } from '@/constants/astrology';

interface CosmicWheelProps {
  activePlanet: string;
}

function getMeta(planet: string) {
  return PLANET_META[planet] ?? { symbol: '★', color: '#f97316' };
}

// Pre-compute static spoke and node geometry once at module level (never changes)
const SPOKE_COORDS = PLANET_ORDER.map((_, i) => {
  const angle = (i * 40 - 90) * Math.PI / 180;
  const cx = 160, cy = 160;
  return {
    x1: cx + 45 * Math.cos(angle),
    y1: cy + 45 * Math.sin(angle),
    x2: cx + 145 * Math.cos(angle),
    y2: cy + 145 * Math.sin(angle),
  };
});

const NODE_COORDS = PLANET_ORDER.map((planet, i) => {
  const cx = 160, cy = 160, radius = 110;
  const angle = i * 40 - 90;
  const theta = angle * Math.PI / 180;
  const px = cx + radius * Math.cos(theta);
  const py = cy + radius * Math.sin(theta);
  const textDist = radius + 22;
  return {
    planet,
    px,
    py,
    tx: cx + textDist * Math.cos(theta),
    ty: cy + textDist * Math.sin(theta) + 3,
    meta: getMeta(planet),
  };
});

export const CosmicWheel = memo(function CosmicWheel({ activePlanet }: CosmicWheelProps) {
  const cx = 160, cy = 160;

  // Only re-compute the highlight slice geometry when activePlanet changes
  const highlightPath = useMemo(() => {
    const activeIndex = PLANET_ORDER.indexOf(activePlanet);
    if (activeIndex === -1) return null;
    const angle = activeIndex * 40 - 90;
    const rSlice = 145;
    const a1 = (angle - 20) * Math.PI / 180;
    const a2 = (angle + 20) * Math.PI / 180;
    const x1 = cx + rSlice * Math.cos(a1);
    const y1 = cy + rSlice * Math.sin(a1);
    const x2 = cx + rSlice * Math.cos(a2);
    const y2 = cy + rSlice * Math.sin(a2);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${rSlice} ${rSlice} 0 0 1 ${x2} ${y2} Z`;
  }, [activePlanet]);

  return (
    // Removed drop-shadow-[...] filter class — expensive on SVG compositing
    <div className="relative aspect-square w-full max-w-[320px] mx-auto">
      <svg viewBox="0 0 320 320" className="w-full h-full">
        <defs>
          <radialGradient id="wheelBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b132b" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#02040a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="goldGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="goldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#d97706" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Wheel base */}
        <circle cx={cx} cy={cy} r="145" fill="url(#wheelBgGrad)" stroke="#1e293b" strokeWidth="1.5" />

        {/* Concentric orbit paths */}
        <circle cx={cx} cy={cy} r="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
        <circle cx={cx} cy={cy} r="75"  stroke="rgba(255,255,255,0.03)" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        <circle cx={cx} cy={cy} r="45"  stroke="rgba(255,255,255,0.02)" strokeWidth="1"   fill="none" />

        {/* Highlight segment — static glow path, no animate-pulse on path */}
        {highlightPath && (
          <>
            <path d={highlightPath} fill="url(#goldGlowGrad)" opacity="0.12" />
            <path d={highlightPath} fill="rgba(245,158,11,0.04)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" opacity="0.9" />
          </>
        )}

        {/* Pre-computed spokes – static, rendered once */}
        {SPOKE_COORDS.map(({ x1, y1, x2, y2 }, i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {/* Central mandala */}
        <circle cx={cx} cy={cy} r="25" fill="#020617" stroke="url(#goldRingGrad)" strokeWidth="2.5" />
        <text x={cx} y={cy + 7} textAnchor="middle" fill="#f59e0b" fontSize="17" fontWeight="bold" className="select-none">
          ॐ
        </text>

        {/* Planet nodes – pre-computed positions, removed drop-shadow filter on non-active */}
        {NODE_COORDS.map(({ planet, px, py, tx, ty, meta }) => {
          const isCurrent = planet === activePlanet;
          return (
            <g key={planet} className="select-none">
              {/* Active ring – use CSS animation only on the ONE active element */}
              {isCurrent && (
                <circle cx={px} cy={py} r="18" fill="none" stroke="#f59e0b" strokeWidth="2" className="animate-pulse" />
              )}

              {/* Node circle */}
              <circle
                cx={px}
                cy={py}
                r="13"
                fill={isCurrent ? '#f59e0b' : '#030712'}
                stroke={isCurrent ? '#ffffffcc' : meta.color + '99'}
                strokeWidth={isCurrent ? 2 : 1.5}
                // Only apply filter on the active node, not all 9
                style={isCurrent ? { filter: 'drop-shadow(0 0 6px #f59e0b)' } : undefined}
              />

              {/* Symbol */}
              <text x={px} y={py + 5.5} textAnchor="middle" fontSize="15" fontWeight="500" fill={isCurrent ? '#000' : meta.color}>
                {meta.symbol}
              </text>

              {/* Label */}
              <text x={tx} y={ty} textAnchor="middle" fontSize="9" fontWeight="700" fill={isCurrent ? '#f59e0b' : '#94a3b8'}>
                {planet}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});
