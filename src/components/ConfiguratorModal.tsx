import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Sparkles, Shield, Gauge, Sliders, ChevronRight } from 'lucide-react';
import { CarEdition } from '../types/market';
import { engineAudio } from '../utils/audio';

interface ConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  edition: CarEdition;
  onSelectEdition: (editionId: string) => void;
  onOpenMarket: () => void;
  onOpenDrive?: () => void;
}

export const ConfiguratorModal: React.FC<ConfiguratorModalProps> = ({
  isOpen,
  onClose,
  edition,
  onSelectEdition,
  onOpenMarket,
  onOpenDrive,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(edition.id);
  const [selectedWheels, setSelectedWheels] = useState<string>('peach-gold');
  const [weissachPackage, setWeissachPackage] = useState<boolean>(true);
  const [ceramicBrakes, setCeramicBrakes] = useState<boolean>(true);
  const [frontLift, setFrontLift] = useState<boolean>(true);
  const [clubsportRollCage, setClubsportRollCage] = useState<boolean>(false);

  if (!isOpen) return null;

  const basePrice = 241300;
  const weissachPrice = weissachPackage ? 33520 : 0;
  const ceramicPrice = ceramicBrakes ? 10200 : 0;
  const liftPrice = frontLift ? 3670 : 0;
  const rollCagePrice = clubsportRollCage ? 4950 : 0;
  const ptsColorPrice = selectedColor === 'peach-refraction' ? 14750 : selectedColor === 'obsidian-gold' ? 4200 : 0;

  const totalMSRP = basePrice + weissachPrice + ceramicPrice + liftPrice + rollCagePrice + ptsColorPrice;
  const estimatedMarketResale = Math.round(totalMSRP * 1.58);

  const colors = [
    { id: 'peach-refraction', name: 'Peach Refraction PTS', hex: '#E8A588', type: 'Sonderwunsch PTS' },
    { id: 'arctic-crystal', name: 'Arctic Crystal Silver', hex: '#93C5FD', type: 'Metallic' },
    { id: 'obsidian-gold', name: 'Obsidian Gold Quartz', hex: '#F59E0B', type: 'Heritage Metallic' },
  ];

  const wheels = [
    { id: 'peach-gold', name: 'Satin Peach Gold Magnesium', desc: 'Lightweight motorsport magnesium' },
    { id: 'neodyme', name: 'Satin Neodyme Gold', desc: 'Motorsport satin gold metallic' },
    { id: 'brilliant-silver', name: 'Brilliant Diamond Silver', desc: 'Classic motorsport silver finish' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-[#FBFBFC]">
          <div>
            <span className="porsche-font text-xs tracking-[0.28em] text-neutral-500 uppercase">
              Porsche Exclusive Manufaktur
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900 mt-0.5">
              911 GT3 RS Bespoke Studio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Preview */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div className="relative w-full aspect-[16/10] bg-[#F7F6F3] rounded-2xl p-6 flex items-center justify-center border border-neutral-200/80 overflow-hidden">
              <div className="absolute inset-0 bg-radial from-white via-transparent to-transparent opacity-80" />
              <img
                src={edition.image}
                alt={edition.title}
                className="w-full h-full object-contain drop-shadow-xl z-10"
              />
              <div className="absolute top-4 left-4 z-20">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 shadow-xs border border-neutral-200 text-neutral-800">
                  {edition.name}
                </span>
              </div>
            </div>

            {/* Quick Specs telemetry */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-center">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-neutral-500 font-medium">Power</div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">518 HP</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-neutral-500 font-medium">0-100 km/h</div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">3.2 s</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-[11px] text-neutral-500 font-medium">Downforce</div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">860 kg</div>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Exterior Colors */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Exterior Color Refraction
                </label>
                <span className="text-xs font-mono text-neutral-400">PTS Allocation</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      engineAudio.playClickTone('tick');
                      setSelectedColor(c.id);
                      onSelectEdition(c.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      selectedColor === c.id
                        ? 'border-[#E8A588] bg-[#FFF8F5] ring-2 ring-[#E8A588]/20'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      {selectedColor === c.id && <Check className="w-3.5 h-3.5 text-[#C86D51]" />}
                    </div>
                    <div className="text-xs font-bold text-neutral-900 truncate">{c.name}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{c.type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wheels Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-2.5">
                Wheels & Chassis
              </label>
              <div className="space-y-2">
                {wheels.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      engineAudio.playClickTone('tick');
                      setSelectedWheels(w.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedWheels === w.id
                        ? 'border-[#E8A588] bg-[#FFF8F5]'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{w.name}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{w.desc}</div>
                    </div>
                    {selectedWheels === w.id && <Check className="w-4 h-4 text-[#C86D51]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Options */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block mb-2.5">
                Motorsport Equipment
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={weissachPackage}
                      onChange={(e) => {
                        engineAudio.playClickTone('tick');
                        setWeissachPackage(e.target.checked);
                      }}
                      className="rounded accent-[#E8A588]"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Weissach Package</div>
                      <div className="text-[11px] text-neutral-500">Exposed carbon hood & rear wing</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-700">+$33,520</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={ceramicBrakes}
                      onChange={(e) => {
                        engineAudio.playClickTone('tick');
                        setCeramicBrakes(e.target.checked);
                      }}
                      className="rounded accent-[#E8A588]"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Porsche Ceramic Composite Brakes</div>
                      <div className="text-[11px] text-neutral-500">408mm Carbon Ceramic Discs</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-700">+$10,200</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={frontLift}
                      onChange={(e) => {
                        engineAudio.playClickTone('tick');
                        setFrontLift(e.target.checked);
                      }}
                      className="rounded accent-[#E8A588]"
                    />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Front Axle Lift System</div>
                      <div className="text-[11px] text-neutral-500">Pneumatic 30mm clearance adjustment</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-700">+$3,670</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Price & Order Bar */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-[#FBFBFC] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] text-neutral-500 font-medium">Factory Total MSRP</div>
              <div className="text-lg font-bold font-mono tabular-nums text-neutral-900">
                ${totalMSRP.toLocaleString()}
              </div>
            </div>
            <div className="h-8 w-px bg-neutral-200" />
            <div>
              <div className="text-[11px] text-[#C86D51] font-semibold">Immediate Secondary Valuation</div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600">
                ${estimatedMarketResale.toLocaleString()}
                <span className="text-xs font-normal text-emerald-700 ml-1.5">(+58%)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {onOpenDrive && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDrive();
                }}
                className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-xs font-semibold text-amber-900 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                <span>Save Spec to Drive</span>
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onOpenMarket();
              }}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-colors"
            >
              Analyze in Market Dashboard
            </button>
            <button
              onClick={() => {
                engineAudio.triggerRevBurst();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Lock Configuration
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
