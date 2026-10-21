import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, History, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { engineAudio } from '../utils/audio';

interface HeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMarket: () => void;
}

export const HeritageModal: React.FC<HeritageModalProps> = ({
  isOpen,
  onClose,
  onOpenMarket,
}) => {
  if (!isOpen) return null;

  const milestones = [
    {
      year: '2003',
      generation: '996 GT3 RS',
      title: 'The Inception of RS Purity',
      desc: 'Homologation lightweight special with carbon rear wing and blue/red script decals. Original MSRP: $120k. Current Market: $350k+ (+190%).',
      engine: '3.6L Mezger Flat-Six · 376 HP',
    },
    {
      year: '2011',
      generation: '997.2 GT3 RS 4.0',
      title: 'The Pinnacle of Manual Boxers',
      desc: 'Limited to 600 units worldwide with 500 HP atmospheric displacement. Regarded as one of the greatest investment collector vehicles in automotive history (Current: $800k - $1.1M).',
      engine: '4.0L Mezger Flat-Six · 500 HP',
    },
    {
      year: '2018',
      generation: '991.2 GT3 RS Weissach',
      title: 'Sub-7 Minute Nürburgring Pioneer',
      desc: 'Nordschleife benchmark lap of 6:56.4 with titanium roll cage and NACA bonnet duct cooling.',
      engine: '4.0L Motorsport Boxer · 520 HP',
    },
    {
      year: '2023–2026',
      generation: '992 GT3 RS Refraction',
      title: 'Active Aero & Central Radiator Revolution',
      desc: 'Full F1-style Drag Reduction System (DRS), 860 kg downforce at 285 km/h, and Paint-to-Sample bespoke commissions commanding historic secondary market premiums.',
      engine: '4.0L Naturally Aspirated · 518 HP · 9,000 RPM',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
          <div>
            <span className="porsche-font text-xs tracking-[0.25em] text-[#C86D51] font-bold">
              WEISSACH MOTORSPORT ARCHIVES
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 mt-1">
              The GT3 RS Lineage & Provenance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 space-y-4 max-h-[55vh] overflow-y-auto pr-2">
          {milestones.map((m, idx) => (
            <div
              key={m.year}
              className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 hover:bg-white hover:border-[#E8A588] transition-all"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono font-bold text-[#C86D51]">{m.year}</span>
                <span className="text-[11px] font-mono text-neutral-500">{m.generation}</span>
              </div>
              <h3 className="text-base font-bold text-neutral-900 mt-1">{m.title}</h3>
              <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">{m.desc}</p>
              <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                <span>{m.engine}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Collector Retention
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
          <p className="text-xs text-neutral-500">
            Historical value data sourced from RM Sotheby's & Porsche Club of America registries.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenMarket();
            }}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <span>View Current Market Index</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
