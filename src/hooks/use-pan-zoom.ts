'use client';

import { useState, useRef, useCallback } from 'react';
import type React from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PanZoomState {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
}

export interface CanvasEvents {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Encapsulates all canvas pan + zoom state and produces:
 *   - `panZoom`      → spread as panZoom prop on TreeCanvas
 *   - `canvasEvents` → spread as canvasEvents prop on TreeCanvas
 *   - `setPanX / setPanY` → for external "fly-to" navigation (handleSearchSelect)
 *   - toolbar callbacks (`handleZoomIn`, `handleZoomOut`, `handleZoomReset`)
 */
export function usePanZoom() {
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Toolbar handlers
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.1, 2.0)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.1, 0.3)), []);
  const handleZoomReset = useCallback(() => {
    setZoom(1.0);
    setPanX(0);
    setPanY(0);
  }, []);

  // Canvas drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
      // Only start panning when clicking the background, not a card
      const isBg = (e.target as HTMLElement).closest('.node-card') === null;
      if (!isBg) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
    },
    [panX, panY]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      setPanX(e.clientX - panStart.current.x);
      setPanY(e.clientY - panStart.current.y);
    },
    [isPanning]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const factor = 0.08;
      setZoom((z) =>
        e.deltaY < 0 ? Math.min(z + factor, 2.0) : Math.max(z - factor, 0.3)
      );
    },
    []
  );

  return {
    // Grouped state for TreeCanvas prop
    panZoom: { zoom, panX, panY, isPanning } satisfies PanZoomState,
    // Event handlers object for TreeCanvas prop
    canvasEvents: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
    } satisfies CanvasEvents,
    // Individual setters still needed for external "fly-to-member" navigation
    zoom,
    setPanX,
    setPanY,
    // Toolbar callbacks
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  };
}
