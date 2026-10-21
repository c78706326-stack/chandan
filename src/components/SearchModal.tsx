import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, X, ChevronRight, Gauge, Activity, Sparkles, ExternalLink } from 'lucide-react';
import { EDITIONS } from '../data/editions';
import { engineAudio } from '../utils/audio';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEdition: (id: string) => void;
  onOpenMarket: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectEdition,
  onOpenMarket,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const quickItems = [
    { type: 'model', id: 'peach-refraction', title: 'Porsche 911 GT3 RS (Peach Refraction)', subtitle: 'Paint to Sample · 518 HP · 860 kg Downforce' },
    { type: 'model', id: 'arctic-crystal', title: 'Porsche 911 GT3 RS (Arctic Crystal Weissach)', subtitle: 'Carbon Bonnet · Magnesium Wheels · 3.0s 0-100' },
    { type: 'model', id: 'obsidian-gold', title: 'Porsche 911 GT3 RS (Obsidian Gold Heritage)', subtitle: 'Neodyme Wheels · Carbon Ceramic Brakes' },
    { type: 'market', id: 'market-trends', title: 'Secondary Market Valuation Index', subtitle: 'Live auction results, Bring a Trailer hammer prices' },
    { type: 'spec', id: 'drs-aero', title: 'Drag Reduction System (DRS) Aerodynamics', subtitle: 'Active hydraulic rear wing element telemetry' },
  ];

  const filtered = quickItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search 911 GT3 RS models, market trends, PTS colors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 border border-neutral-200 rounded-md"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[360px] overflow-y-auto p-3 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  engineAudio.playClickTone('tick');
                  if (item.type === 'market') {
                    onClose();
                    onOpenMarket();
                  } else if (item.type === 'model') {
                    onSelectEdition(item.id);
                    onClose();
                  } else {
                    onClose();
                  }
                }}
                className="w-full p-3 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-[#E8A588]/20 group-hover:text-[#C86D51] transition-colors">
                    {item.type === 'market' ? (
                      <Activity className="w-4 h-4" />
                    ) : item.type === 'model' ? (
                      <Gauge className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{item.title}</div>
                    <div className="text-[11px] text-neutral-500">{item.subtitle}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-neutral-500 font-mono">
              No matching specifications or models found for "{query}"
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
