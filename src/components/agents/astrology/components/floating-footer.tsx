'use client';

import React from 'react';
import { Brain, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface FloatingFooterProps {
  leftOpen: boolean;
  setLeftOpen: (open: boolean) => void;
  rightOpen: boolean;
  setRightOpen: (open: boolean) => void;
  renderLeftSidebar: () => React.ReactNode;
  renderRightSidebar: () => React.ReactNode;
}

export function FloatingFooter({
  leftOpen,
  setLeftOpen,
  rightOpen,
  setRightOpen,
  renderLeftSidebar,
  renderRightSidebar,
}: FloatingFooterProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/80 p-2 shadow-2xl backdrop-blur-xl xl:hidden">
      {/* Analysis Menu Toggle */}
      <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-12 w-12 rounded-full bg-primary-500 p-0 text-white shadow-lg transition-all hover:bg-primary-600 active:scale-90"
            title="Analysis Menu"
          >
            <Brain className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="xs:w-80 w-[85vw] border-none p-0">
          <SheetTitle className="sr-only">Analysis Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Access astrological analysis.
          </SheetDescription>
          {renderLeftSidebar()}
        </SheetContent>
      </Sheet>

      {/* Navigation Menu Toggle */}
      <Sheet open={rightOpen} onOpenChange={setRightOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-12 w-12 rounded-full bg-slate-700 p-0 text-white shadow-lg transition-all hover:bg-slate-800 active:scale-90"
            title="Navigation Menu"
          >
            <Compass className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="xs:w-80 w-[85vw] border-none p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Explore dashboard sections.
          </SheetDescription>
          {renderRightSidebar()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
