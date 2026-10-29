'use client';

import { cn } from '@/lib/utils';

const RASHI = [
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
].map(
  // U+FE0E forces monochrome text presentation (otherwise macOS renders emoji tiles)
  (glyph) => `${glyph}︎`
);

interface ZodiacWheelProps {
  className?: string;
  /** Show a counter-rotating inner ring for a layered orbital effect */
  layered?: boolean;
}

/**
 * Decorative Vedic rashi chakra — twelve zodiac signs around the natal wheel.
 * Purely presentational; hidden from assistive tech.
 */
const ZodiacWheel = ({ className, layered = true }: ZodiacWheelProps) => {
  const signPositions = RASHI.map((glyph, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      glyph,
      x: +(200 + Math.cos(angle) * 158).toFixed(2),
      y: +(200 + Math.sin(angle) * 158).toFixed(2),
      rotate: i * 30,
    };
  });

  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

  return (
    <div
      aria-hidden
      className={cn('relative aspect-square select-none', className)}
    >
      {/* ambient glow behind the wheel */}
      <div className="absolute inset-[12%] rounded-full bg-ember/10 blur-[80px]" />
      <div className="absolute inset-[30%] rounded-full bg-nebula/10 blur-[60px]" />

      {/* outer dotted ring — slow clockwise */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full animate-spin-slower text-white/10"
      >
        {ticks.map((deg) => (
          <line
            key={deg}
            x1="200"
            y1="6"
            x2="200"
            y2={deg % 30 === 0 ? 22 : 13}
            stroke="currentColor"
            strokeWidth={deg % 30 === 0 ? 1.4 : 0.7}
            transform={`rotate(${deg} 200 200)`}
          />
        ))}
        <circle
          cx="200"
          cy="200"
          r="194"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        />
      </svg>

      {/* rashi ring — counter-rotating */}
      <svg
        viewBox="0 0 400 400"
        className={cn(
          'absolute inset-[6%] h-[88%] w-[88%] text-white/35',
          layered && 'animate-spin-reverse'
        )}
      >
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        />
        <circle
          cx="200"
          cy="200"
          r="136"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
        />
        {signPositions.map((p, i) => (
          <g key={i} transform={`rotate(${p.rotate + 90} ${p.x} ${p.y})`}>
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="17"
              fill={i % 3 === 0 ? '#ffa35a' : 'currentColor'}
              opacity={i % 3 === 0 ? 0.9 : 0.6}
            >
              {p.glyph}
            </text>
          </g>
        ))}
        {/* spokes */}
        {RASHI.map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={+(200 + Math.cos(angle) * 136).toFixed(2)}
              y2={+(200 + Math.sin(angle) * 136).toFixed(2)}
              stroke="currentColor"
              strokeWidth="0.4"
              opacity="0.35"
            />
          );
        })}
      </svg>

      {/* inner orbit with a travelling planet dot */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-[24%] h-[52%] w-[52%] animate-orbit text-white/15"
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray="2 8"
        />
        <circle cx="200" cy="10" r="7" fill="#ffa35a" />
        <circle cx="200" cy="10" r="14" fill="#ffa35a" opacity="0.25" />
      </svg>

      {/* core */}
      <div className="absolute inset-[38%] rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.08),rgba(0,0,0,0.9)_65%)] shadow-[inset_0_0_30px_rgba(0,0,0,0.9),0_0_60px_rgba(255,163,90,0.15)]" />
    </div>
  );
};

export default ZodiacWheel;
