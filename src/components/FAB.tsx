'use client';

import { useState, useRef, useCallback } from 'react';

interface FABProps {
  onClickAction: () => void;
  onLongPressAction: () => void;
}

export default function FAB({ onClickAction, onLongPressAction }: FABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleMouseDown = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsExpanded(true);
    }, 600);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      onClickAction();
    }
  }, [onClickAction]);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsExpanded(true);
    }, 600);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      onClickAction();
    }
  }, [onClickAction]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Speed dial - report issue button */}
      <div
        className={`transition-all duration-300 ${
          isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-50 pointer-events-none'
        }`}
      >
        <button
          onClick={() => {
            onLongPressAction();
            setIsExpanded(false);
          }}
          className="w-12 h-12 rounded-full bg-[#C8A84E] text-[#1B2A5B] shadow-lg hover:bg-[#d8b85e] 
                     flex items-center justify-center transition-all hover:scale-110"
          title="แจ้งปัญหาเว็บไซต์"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </button>
        <span className="text-xs text-slate-700 font-bold mt-1 block text-center whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm">แจ้งปัญหา</span>
      </div>

      {/* Main FAB button */}
      <button
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all 
                   hover:scale-110 active:scale-95 select-none
                   ${isExpanded ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-br from-[#1B2A5B] to-[#0F1A3A] border-2 border-[#C8A84E]/40'}`}
        title="คลิก: คืนอุปกรณ์ | กดค้าง: เมนูเพิ่มเติม"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </button>

      {/* Overlay to close expanded menu */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
