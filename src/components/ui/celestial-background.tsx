'use client';

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  phase: number;
  speed: number;
  depth: number;
  warm: boolean;
};
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

const CelestialBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let frame = 0;
    let rafId = 0;
    let scrollY = window.scrollY;

    const seedStars = () => {
      const count = Math.min(420, Math.floor((width * height) / 4200));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: depth > 0.92 ? Math.random() * 1.1 + 0.8 : Math.random() * 0.7 + 0.2,
          base: Math.random() * 0.6 + 0.25,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.004,
          depth,
          warm: Math.random() > 0.88,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars();
    };

    const drawNebula = (
      x: number,
      y: number,
      radius: number,
      rgb: string,
      alpha: number
    ) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';
      drawNebula(
        width * 0.85,
        height * 0.12,
        Math.max(width, height) * 0.45,
        '255, 163, 90',
        0.045
      );
      drawNebula(
        width * 0.1,
        height * 0.85,
        Math.max(width, height) * 0.5,
        '139, 156, 255',
        0.04
      );
      ctx.globalCompositeOperation = 'source-over';

      for (const s of stars) {
        const twinkle = reduceMotion
          ? s.base
          : s.base + Math.sin(frame * s.speed + s.phase) * 0.35;
        const parallaxY = (s.y - scrollY * s.depth * 0.08) % height;
        const y = parallaxY < 0 ? parallaxY + height : parallaxY;
        ctx.fillStyle = s.warm
          ? `rgba(255, 210, 168, ${Math.max(0.05, twinkle)})`
          : `rgba(255, 255, 255, ${Math.max(0.05, twinkle)})`;
        ctx.beginPath();
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.2) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, twinkle) * 0.08})`;
          ctx.beginPath();
          ctx.arc(s.x, y, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduceMotion && Math.random() < 0.004 && meteors.length < 2) {
        meteors.push({
          x: Math.random() * width * 0.8 + width * 0.2,
          y: Math.random() * height * 0.4,
          vx: -(Math.random() * 6 + 6),
          vy: Math.random() * 3 + 2,
          life: 1,
        });
      }

      meteors = meteors.filter((m) => m.life > 0);
      for (const m of meteors) {
        const tailX = m.x - m.vx * 14;
        const tailY = m.y - m.vy * 14;
        const g = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        g.addColorStop(0, `rgba(255, 255, 255, ${m.life})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.015;
      }

      if (!reduceMotion) rafId = requestAnimationFrame(draw);
    };

    const onScroll = () => {
      scrollY = window.scrollY;
      if (reduceMotion) draw();
    };

    const onVisibility = () => {
      cancelAnimationFrame(rafId);
      if (!document.hidden) draw();
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 w-full bg-black"
    />
  );
};

export default CelestialBackground;
