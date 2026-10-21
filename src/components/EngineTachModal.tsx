import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, Flame, Gauge, Zap } from 'lucide-react';
import { engineAudio } from '../utils/audio';

interface EngineTachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EngineTachModal: React.FC<EngineTachModalProps> = ({ isOpen, onClose }) => {
  const [rpm, setRpm] = useState<number>(900);
  const [gear, setGear] = useState<number>(1);
  const [isPedalDown, setIsPedalDown] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      engineAudio.stop();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    engineAudio.start();

    const loop = () => {
      setRpm((prevRpm) => {
        let nextRpm = prevRpm;
        if (isPedalDown) {
          nextRpm = Math.min(9000, prevRpm + 180);
        } else {
          nextRpm = Math.max(900, prevRpm - 120);
        }
        engineAudio.setRpm(nextRpm);
        return nextRpm;
      });
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isOpen, isPedalDown]);

  if (!isOpen) return null;

  // Tachometer angle calculation: 900 RPM = -120 deg, 9000 RPM = +120 deg
  const needleAngle = -120 + ((rpm - 900) / (9000 - 900)) * 240;
  const isRedline = rpm >= 8500;

  const handleShiftUp = () => {
    engineAudio.playClickTone('shift');
    setGear((g) => Math.min(7, g + 1));
    setRpm((r) => Math.max(3800, r * 0.72));
  };

  const handleShiftDown = () => {
    engineAudio.playClickTone('shift');
    setGear((g) => Math.max(1, g - 1));
    setRpm((r) => Math.min(8800, r * 1.35));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-[#141416] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="porsche-font text-xs tracking-[0.25em] text-[#E8A588] font-bold">
              4.0L FLAT-SIX TELEMETRY
            </span>
            {isRedline && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                REDLINE 9,000 RPM
              </span>
            )}
          </div>
          <button
            onClick={() => {
              engineAudio.stop();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tachometer Instrument Cluster */}
        <div className="relative flex flex-col items-center justify-center my-6">
          <div
            className={`relative w-64 h-64 rounded-full border-4 flex items-center justify-center transition-colors duration-200 ${
              isRedline ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]' : 'border-neutral-700'
            } bg-gradient-to-b from-neutral-900 to-black`}
          >
            {/* Ticks and Numbers */}
            <div className="absolute inset-4 rounded-full border border-neutral-800 flex items-center justify-center">
              {/* Central Digital Readout */}
              <div className="text-center z-10">
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
                  {Math.round(rpm)}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#E8A588] uppercase mt-0.5">
                  1/min x 1000
                </div>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-white/10 text-xs font-mono font-bold text-white">
                  GEAR {gear} (PDK)
                </div>
              </div>

              {/* Tachometer Needle */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75"
                style={{ transform: `rotate(${needleAngle}deg)` }}
              >
                <div className="w-1 h-24 bg-gradient-to-t from-transparent via-[#E8A588] to-rose-500 rounded-full transform -translate-y-12 origin-bottom shadow-lg" />
                <div className="w-5 h-5 rounded-full bg-neutral-900 border-2 border-[#E8A588] absolute z-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls: Throttle Pedal & Paddle Shifters */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleShiftDown}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold transition-colors"
            >
              - PADDLE (DOWN)
            </button>
            <button
              onClick={handleShiftUp}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold transition-colors"
            >
              + PADDLE (UP)
            </button>
          </div>

          {/* Interactive Gas Pedal (Hold to Rev) */}
          <button
            onMouseDown={() => setIsPedalDown(true)}
            onMouseUp={() => setIsPedalDown(false)}
            onTouchStart={() => setIsPedalDown(true)}
            onTouchEnd={() => setIsPedalDown(false)}
            onMouseLeave={() => setIsPedalDown(false)}
            className={`w-full py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all duration-150 flex items-center justify-center gap-2 ${
              isPedalDown
                ? 'bg-rose-600 text-white scale-[0.98] shadow-lg shadow-rose-600/30'
                : 'bg-[#E8A588] text-neutral-950 hover:bg-[#ffbba0]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{isPedalDown ? 'THROTTLE ENGAGED (HOLDING)' : 'HOLD TO REV ACCELERATOR'}</span>
          </button>

          <p className="text-[11px] text-center text-neutral-400 font-mono">
            Naturally aspirated 4.0-liter dry sump boxer acoustics synthesized at 9,000 RPM redline.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
