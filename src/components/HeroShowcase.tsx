import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Wind, Activity, Info, X, Zap } from 'lucide-react';
import { CarEdition, Hotspot } from '../types/market';
import { engineAudio } from '../utils/audio';

interface HeroShowcaseProps {
  edition: CarEdition;
  onNextEdition: () => void;
  onPrevEdition: () => void;
  currentIndex: number;
  totalEditions: number;
  onSelectIndex: (idx: number) => void;
  showAerodynamics: boolean;
  onToggleAerodynamics: () => void;
  onOpenMarket: () => void;
  onOpenConfigurator: () => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  edition,
  onNextEdition,
  onPrevEdition,
  currentIndex,
  totalEditions,
  onSelectIndex,
  showAerodynamics,
  onToggleAerodynamics,
  onOpenMarket,
  onOpenConfigurator,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const handleHotspotClick = (h: Hotspot) => {
    engineAudio.playClickTone('radar');
    setActiveHotspot(h);
  };

  const handleDoorRadarClick = () => {
    engineAudio.triggerRevBurst();
    const doorHotspot = edition.hotspots.find(h => h.id.includes('door') || h.id === 'door-radar');
    if (doorHotspot) {
      setActiveHotspot(doorHotspot);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-8 px-6 lg:px-12 select-none overflow-hidden"
    >
      {/* Background Soft Ambient Studio Floor Gradient & Highlights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#FFF5F0]/60 via-[#F7ECE5]/40 to-transparent blur-3xl -z-10" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[850px] h-[180px] bg-[#E8A588]/15 blur-3xl rounded-full -z-10" />
      </div>

      {/* Main Top Header Typography matching the screenshot */}
      <div className="text-center pt-2 md:pt-4 z-20">
        <motion.h1
          key={`title-${edition.id}`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl lg:text-[54px] font-extrabold tracking-[-0.03em] text-neutral-900 leading-none"
        >
          {edition.title}
        </motion.h1>
        <motion.p
          key={`sub-${edition.id}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs md:text-sm lg:text-base font-semibold tracking-[0.24em] text-neutral-600 mt-2.5 uppercase"
        >
          {edition.subtitle}
        </motion.p>
      </div>

      {/* Center Stage: Pure Pristine Still Car Presentation (3D interaction disabled) & Hotspots */}
      <div className="relative flex-1 flex items-center justify-center my-auto w-full max-w-[1380px] mx-auto z-20">
        <div
          className="relative w-full max-w-[940px] aspect-[16/9] flex items-center justify-center pointer-events-auto"
        >
          {/* High-res Car Render */}
          <AnimatePresence mode="wait">
            <motion.div
              key={edition.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img
                src={edition.image}
                alt={edition.title}
                className="w-full h-full object-contain drop-shadow-2xl select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* SVG Dotted Leader Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
            {/* Curving leader arc to 4.0L Flat-Six */}
            <path
              d="M 680 180 Q 640 220 570 230"
              fill="none"
              stroke="#E8A588"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            {/* Curving leader arc to 3.2s 0-100 */}
            <path
              d="M 740 290 Q 710 295 680 300"
              fill="none"
              stroke="#E8A588"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            {/* Arc from radar door to rear air duct */}
            <path
              d="M 590 300 Q 630 330 670 330"
              fill="none"
              stroke="#E8A588"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              opacity="0.7"
            />
          </svg>

          {/* Hotspot 1: 4.0L Flat-Six Badge (Top-right of car) */}
          <div
            onClick={() => {
              const h = edition.hotspots.find((item) => item.id.includes('engine'));
              if (h) handleHotspotClick(h);
            }}
            className="absolute top-[28%] right-[22%] z-30 flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A588] group-hover:scale-125 transition-transform" />
              <span className="absolute -inset-1 rounded-full border border-[#E8A588] animate-ping opacity-60" />
            </div>
            <div className="crystal-glass px-3 py-1 rounded-md shadow-xs border border-white/90 group-hover:border-[#E8A588] transition-all">
              <span className="text-[12px] md:text-[13px] font-bold text-neutral-900 tracking-tight whitespace-nowrap">
                4.0L Flat-Six
              </span>
            </div>
          </div>

          {/* Hotspot 2: 3.2s 0-100 km/h Badge (Mid-right rear wheel area) */}
          <div
            onClick={() => {
              const h = edition.hotspots.find((item) => item.id.includes('accel'));
              if (h) handleHotspotClick(h);
            }}
            className="absolute top-[49%] right-[11%] z-30 flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8A588] group-hover:scale-125 transition-transform" />
              <span className="absolute -inset-1 rounded-full border border-[#E8A588] animate-ping opacity-60" />
            </div>
            <div className="crystal-glass px-3 py-1 rounded-md shadow-xs border border-white/90 group-hover:border-[#E8A588] transition-all">
              <span className="text-[12px] md:text-[13px] font-bold text-neutral-900 tracking-tight whitespace-nowrap">
                3.2s 0-100 km/h
              </span>
            </div>
          </div>

          {/* Hotspot 3: Interactive Radar Ripple on Car Door with Mouse Pointer Icon */}
          <div
            onClick={handleDoorRadarClick}
            className="absolute top-[51%] left-[61%] -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
            title="Click to rev 4.0L engine & inspect carbon door aerodynamics"
          >
            {/* Concentric expanding ripples */}
            <div className="relative flex items-center justify-center w-14 h-14">
              <div className="absolute inset-0 rounded-full border border-[#E8A588]/80 animate-radar" />
              <div className="absolute inset-2 rounded-full border border-[#E8A588]/60 animate-radar-delayed" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#E8A588] shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>

              {/* Cursor click icon prompt */}
              <div className="absolute -bottom-6 -right-5 pointer-events-none transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-5 h-5 text-neutral-800 drop-shadow-md fill-white stroke-neutral-800 stroke-[1.5]"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotspot Detail Modal / Popover */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="crystal-glass p-5 rounded-2xl shadow-xl border border-white/80 relative">
              <button
                onClick={() => setActiveHotspot(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-200/50 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E8A588]" />
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                  GT3 RS Engineering Telemetry
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">{activeHotspot.title}</h3>
              <p className="text-sm font-semibold text-[#C86D51] mt-0.5">{activeHotspot.value}</p>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{activeHotspot.description}</p>
              <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
                <button
                  onClick={() => engineAudio.triggerRevBurst()}
                  className="text-xs font-semibold text-neutral-800 hover:text-[#C86D51] flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-[#E8A588]" />
                  Acoustic Feedback
                </button>
                <button
                  onClick={onOpenConfigurator}
                  className="text-xs font-bold text-[#C86D51] hover:underline"
                >
                  Configure Spec &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls Zone (matching the screenshot exactly) */}
      <div className="relative max-w-[1580px] w-full mx-auto flex items-center justify-between z-30 pt-2">
        {/* Left Arrow Controls (< >) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              engineAudio.playClickTone('tick');
              onPrevEdition();
            }}
            aria-label="Previous edition"
            className="w-10 h-10 rounded-full crystal-glass hover:bg-white border border-neutral-300/80 shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <button
            onClick={() => {
              engineAudio.playClickTone('tick');
              onNextEdition();
            }}
            aria-label="Next edition"
            className="w-10 h-10 rounded-full crystal-glass hover:bg-white border border-neutral-300/80 shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Aerodynamics DRS Streamlines Toggle */}
          <button
            onClick={onToggleAerodynamics}
            className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              showAerodynamics
                ? 'bg-neutral-900 text-white shadow-md'
                : 'crystal-glass text-neutral-700 hover:bg-white border border-neutral-300/80'
            }`}
          >
            <Wind className={`w-3.5 h-3.5 ${showAerodynamics ? 'text-[#E8A588]' : ''}`} />
            <span>DRS Aero 860kg</span>
          </button>
        </div>

        {/* Center: Mouse Scroll Indicator (Exact match to screenshot) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center pointer-events-none">
          <div className="w-5 h-8 rounded-full border-[1.5px] border-[#E8A588] flex justify-center p-1 bg-white/40 backdrop-blur-xs">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.8, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-1 h-2 bg-[#E8A588] rounded-full"
            />
          </div>
          {/* Subtle connecting vertical hairline */}
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#E8A588] to-transparent mt-1" />
        </div>

        {/* Right Arrow Control (Single > arrow like in screenshot) & Market Quick CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMarket}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-neutral-50 border border-neutral-300/80 shadow-xs text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-[#E8A588] transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>Market Telemetry</span>
          </button>
          <button
            onClick={() => {
              engineAudio.playClickTone('tick');
              onNextEdition();
            }}
            aria-label="Next model"
            className="w-10 h-10 rounded-full crystal-glass hover:bg-white border border-neutral-300/80 shadow-xs flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Right-Side Vertical Pagination Rail (matching the screenshot) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-3">
        {Array.from({ length: totalEditions }).map((_, idx) => (
          <button
            key={`page-${idx}`}
            onClick={() => {
              engineAudio.playClickTone('tick');
              onSelectIndex(idx);
            }}
            aria-label={`Select model edition ${idx + 1}`}
            className="group relative flex items-center justify-center p-1 focus:outline-none"
          >
            <span
              className={`w-1 transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'h-8 bg-[#E8A588] shadow-xs'
                  : 'h-4 bg-neutral-300 group-hover:bg-neutral-400 group-hover:h-5'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
