import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  RefreshCw,
  BarChart3,
  Sliders,
  Sparkles,
  ArrowUpRight,
  X,
  Layers,
  Award,
  CircleDollarSign,
} from 'lucide-react';
import { MarketTransaction, ChartDataPoint } from '../types/market';
import { HISTORICAL_DATA, INITIAL_TRANSACTIONS } from '../data/editions';
import { engineAudio } from '../utils/audio';

interface MarketDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentCarPrice: number;
  carName: string;
  onOpenDrive?: () => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({
  isOpen,
  onClose,
  currentCarPrice,
  carName,
  onOpenDrive,
}) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1M');
  const [chartType, setChartType] = useState<'line' | 'candles'>('line');
  const [transactions, setTransactions] = useState<MarketTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'orderbook' | 'calculator'>('analytics');

  // Valuation Calculator interactive state
  const [mileage, setMileage] = useState<number>(350);
  const [hasWeissach, setHasWeissach] = useState<boolean>(true);
  const [hasMagnesiumWheels, setHasMagnesiumWheels] = useState<boolean>(true);
  const [hasPTSPaint, setHasPTSPaint] = useState<boolean>(true);
  const [hasPCCB, setHasPCCB] = useState<boolean>(true);
  const [condition, setCondition] = useState<'delivery' | 'collector' | 'driven'>('delivery');

  // Live Simulated WebSocket tick stream
  useEffect(() => {
    const platforms: MarketTransaction['platform'][] = [
      'Bring a Trailer',
      'RM Sotheby’s',
      'PCARMARKET',
      'Collecting Cars',
      'Porsche Stuttgart VIP',
    ];
    const cities = ['Miami, FL', 'Beverly Hills, CA', 'Munich, DE', 'Dubai, UAE', 'Tokyo, JP', 'Geneva, CH'];
    const types: MarketTransaction['type'][] = ['Active Bid', 'Hammer Sale', 'Dealer Allocation'];

    const interval = setInterval(() => {
      const isPositive = Math.random() > 0.35;
      const priceDelta = (Math.floor(Math.random() * 8) + 1) * 1000 * (isPositive ? 1 : -1);
      const newPrice = Math.max(340000, 386450 + priceDelta + (Math.floor(Math.random() * 40) - 20) * 100);

      const newTx: MarketTransaction = {
        id: `TX-${Math.floor(900 + Math.random() * 900)}`,
        time: 'Just now',
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        model: '911 GT3 RS (992)',
        edition: Math.random() > 0.5 ? 'Peach Refraction PTS' : 'Weissach Carbon Spec',
        price: newPrice,
        delta: priceDelta,
        type: types[Math.floor(Math.random() * types.length)],
        mileage: `${Math.floor(40 + Math.random() * 600)} mi`,
        location: cities[Math.floor(Math.random() * cities.length)],
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 14)]);
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Calculate live dynamic valuation
  const baseMSRP = 241300;
  const weissachAdd = hasWeissach ? 33520 : 0;
  const magWheelsAdd = hasMagnesiumWheels ? 22000 : 0;
  const ptsPaintAdd = hasPTSPaint ? 48500 : 0;
  const pccbAdd = hasPCCB ? 10200 : 0;
  const totalCalculatedMSRP = baseMSRP + weissachAdd + magWheelsAdd + ptsPaintAdd + pccbAdd;

  // Secondary market premium formula
  const conditionFactor = condition === 'delivery' ? 1.0 : condition === 'collector' ? 0.96 : 0.89;
  const mileageDeduction = (mileage / 1000) * 1800;
  const collectorMultiplier = hasPTSPaint ? 1.28 : 1.2;
  const estimatedSecondary = Math.round(
    (totalCalculatedMSRP * collectorMultiplier - mileageDeduction) * conditionFactor
  );
  const totalAppreciation = estimatedSecondary - totalCalculatedMSRP;
  const appreciationPercentage = ((totalAppreciation / totalCalculatedMSRP) * 100).toFixed(1);

  const filteredTransactions = transactions.filter(
    (tx) => selectedPlatform === 'all' || tx.platform.toLowerCase().includes(selectedPlatform.toLowerCase())
  );

  const chartData = HISTORICAL_DATA[timeframe] || HISTORICAL_DATA['1M'];
  const minPrice = Math.min(...chartData.map((d) => d.low || d.price)) * 0.98;
  const maxPrice = Math.max(...chartData.map((d) => d.high || d.price)) * 1.02;
  const chartHeight = 220;
  const chartWidth = 720;

  // SVG Line path generation
  const getCoordinates = (index: number, val: number) => {
    const x = (index / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minPrice) / (maxPrice - minPrice)) * chartHeight;
    return { x, y };
  };

  const linePath = chartData.reduce((acc, curr, i) => {
    const { x, y } = getCoordinates(i, curr.price);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-[#F9F9FB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8A588]/15 border border-[#E8A588]/40 flex items-center justify-center text-[#C86D51]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  Porsche 911 GT3 RS Secondary Market Index
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE TICK FEED
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Aggregated valuation telemetry from BaT, RM Sotheby’s, PCARMARKET & Private Allocations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Navigation Tabs */}
            <div className="hidden md:flex items-center p-1 bg-neutral-200/60 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'analytics' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Index Analytics
              </button>
              <button
                onClick={() => setActiveTab('orderbook')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'orderbook' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Live Transactions
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'calculator' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Appraisal Calculator
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Market KPIs Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border-b border-neutral-200 text-neutral-900">
          <div className="bg-white p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs text-neutral-500 font-medium">Composite Benchmark Index</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-neutral-900">
                ${currentCarPrice.toLocaleString()}
              </span>
              <span className="flex items-center text-xs font-semibold text-emerald-600 font-mono">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +4.18%
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1">30-day weighted median</span>
          </div>

          <div className="bg-white p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs text-neutral-500 font-medium">Premium Over MSRP</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-[#C86D51]">
                +$145,150
              </span>
              <span className="text-xs font-semibold text-[#C86D51] font-mono">
                (+60.1%)
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1">Base MSRP: $241,300</span>
          </div>

          <div className="bg-white p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs text-neutral-500 font-medium">24h Auction Liquidity</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-neutral-900">
                $4.82M
              </span>
              <span className="text-xs font-medium text-neutral-500 font-mono">
                12 Sales
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1">Avg 11 days on market</span>
          </div>

          <div className="bg-white p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs text-neutral-500 font-medium">PTS Refraction Premium</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-neutral-900">
                +$52,000
              </span>
              <span className="text-xs font-semibold text-purple-600 font-mono">
                Tier 1
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1">Paint-to-Sample Peach Allocation</span>
          </div>
        </div>

        {/* Mobile Navigation Tab Strip */}
        <div className="flex md:hidden border-b border-neutral-200 px-4 py-2 bg-neutral-50 gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'analytics' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'orderbook' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Live Sales
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${
              activeTab === 'calculator' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-500'
            }`}
          >
            Calculator
          </button>
        </div>

        {/* Content Body Based on Active Tab */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Chart Controls & Timeframe Selector */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-600">
                    {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => {
                          engineAudio.playClickTone('tick');
                          setTimeframe(tf);
                        }}
                        className={`px-3 py-1 rounded-md transition-all font-mono ${
                          timeframe === tf ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-600">
                    <button
                      onClick={() => setChartType('line')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        chartType === 'line' ? 'bg-white text-neutral-900 shadow-xs' : ''
                      }`}
                    >
                      Area
                    </button>
                    <button
                      onClick={() => setChartType('candles')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        chartType === 'candles' ? 'bg-white text-neutral-900 shadow-xs' : ''
                      }`}
                    >
                      Range
                    </button>
                  </div>
                </div>

                {hoveredPoint ? (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-neutral-500">{hoveredPoint.date}:</span>
                    <span className="text-base font-bold text-neutral-900">
                      ${hoveredPoint.price.toLocaleString()}
                    </span>
                    <span className="text-neutral-400">Vol: ${hoveredPoint.volume}k</span>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500 font-mono">
                    Hover data points to inspect historic bids & volumes
                  </div>
                )}
              </div>

              {/* Interactive SVG Chart */}
              <div className="relative w-full h-[260px] bg-neutral-50/70 rounded-2xl p-4 border border-neutral-200/80 overflow-hidden flex flex-col justify-end">
                {/* Horizontal price grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-40">
                  <div className="w-full border-b border-dashed border-neutral-300 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>${Math.round(maxPrice).toLocaleString()}</span>
                  </div>
                  <div className="w-full border-b border-dashed border-neutral-300 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>${Math.round((maxPrice + minPrice) / 2).toLocaleString()}</span>
                  </div>
                  <div className="w-full border-b border-dashed border-neutral-300 flex justify-between text-[10px] font-mono text-neutral-400">
                    <span>${Math.round(minPrice).toLocaleString()}</span>
                  </div>
                </div>

                {/* SVG Visual Curves */}
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible z-10"
                >
                  <defs>
                    <linearGradient id="peachGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8A588" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#E8A588" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  {chartType === 'line' && (
                    <path d={areaPath} fill="url(#peachGradient)" />
                  )}

                  {/* Main Price Line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#C86D51"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Range Bars / Candlesticks */}
                  {chartType === 'candles' &&
                    chartData.map((d, i) => {
                      const { x, y } = getCoordinates(i, d.price);
                      const highY = chartHeight - ((d.high - minPrice) / (maxPrice - minPrice)) * chartHeight;
                      const lowY = chartHeight - ((d.low - minPrice) / (maxPrice - minPrice)) * chartHeight;
                      return (
                        <g key={`bar-${i}`}>
                          <line x1={x} y1={highY} x2={x} y2={lowY} stroke="#C86D51" strokeWidth="1.2" />
                          <rect
                            x={x - 4}
                            y={Math.min(y, y - 6)}
                            width={8}
                            height={12}
                            fill="#E8A588"
                            rx={2}
                          />
                        </g>
                      );
                    })}

                  {/* Interactive Nodes */}
                  {chartData.map((d, i) => {
                    const { x, y } = getCoordinates(i, d.price);
                    return (
                      <g
                        key={`pt-${i}`}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredPoint(d)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r={hoveredPoint === d ? 6 : 3.5}
                          fill="#FFFFFF"
                          stroke="#C86D51"
                          strokeWidth={hoveredPoint === d ? 3 : 2}
                          className="transition-all duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between items-center pt-2 text-[11px] font-mono text-neutral-500 z-10 border-t border-neutral-200">
                  {chartData.map((d, i) => (
                    <span key={`lbl-${i}`}>{d.date}</span>
                  ))}
                </div>
              </div>

              {/* Comparative Exotic Market Benchmarks */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  Exotic Track Vehicle Secondary Retention Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-[#E8A588]/40 bg-[#FFF9F6] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Porsche 911 GT3 RS (992)</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">Atmospheric 4.0L Boxer</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-600">+60.1%</span>
                      <div className="text-[10px] text-neutral-400">vs MSRP</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900">Ferrari 296 GTB Assetto</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">3.0L Twin-Turbo Hybrid</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-neutral-600">-8.4%</span>
                      <div className="text-[10px] text-neutral-400">vs MSRP</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-neutral-900">McLaren 765LT Spider</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">4.0L Twin-Turbo V8</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-600">+14.2%</span>
                      <div className="text-[10px] text-neutral-400">vs MSRP</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orderbook' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500">Filter platform:</span>
                  {(['all', 'Bring a Trailer', 'RM Sotheby’s', 'PCARMARKET'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={`px-2.5 py-1 rounded-md capitalize font-medium ${
                        selectedPlatform === p ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-mono text-neutral-400">Live order matching</span>
              </div>

              {/* Transactions Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-medium">
                      <th className="py-3 px-4">Event & Model</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Spec & Mileage</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-right">Price (USD)</th>
                      <th className="py-3 px-4 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {tx.type}
                          </div>
                          <div className="text-[11px] text-neutral-400">{tx.time}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-700">{tx.platform}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-800">{tx.edition}</div>
                          <div className="text-[11px] text-neutral-500">{tx.mileage}</div>
                        </td>
                        <td className="py-3 px-4 text-neutral-500">{tx.location}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                          ${tx.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <span
                            className={tx.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}
                          >
                            {tx.delta >= 0 ? `+${tx.delta.toLocaleString()}` : tx.delta.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Option Selectors */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">GT3 RS Custom Valuation Parameters</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Adjust factory packages and collector condition to view real-time market value estimate.
                  </p>
                </div>

                {/* Mileage Slider */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-neutral-700">Odometer Mileage</span>
                    <span className="text-xs font-mono font-bold text-neutral-900">{mileage.toLocaleString()} miles</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="10000"
                    step="50"
                    value={mileage}
                    onChange={(e) => setMileage(Number(e.target.value))}
                    className="w-full accent-[#E8A588]"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                    <span>Delivery (10 mi)</span>
                    <span>5,000 mi</span>
                    <span>10,000 mi</span>
                  </div>
                </div>

                {/* Packages Checkboxes */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Factory Equipment
                  </span>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasWeissach}
                        onChange={(e) => setHasWeissach(e.target.checked)}
                        className="rounded accent-[#E8A588]"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Weissach Package</div>
                        <div className="text-[11px] text-neutral-500">Exposed carbon lid, roll cage, anti-roll bars</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-800">+$33,520 MSRP</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasMagnesiumWheels}
                        onChange={(e) => setHasMagnesiumWheels(e.target.checked)}
                        className="rounded accent-[#E8A588]"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Forged Magnesium Wheels</div>
                        <div className="text-[11px] text-neutral-500">8.0 kg unsprung mass reduction</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-800">+$22,000 MSRP</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasPTSPaint}
                        onChange={(e) => setHasPTSPaint(e.target.checked)}
                        className="rounded accent-[#E8A588]"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Paint-To-Sample (Peach Refraction)</div>
                        <div className="text-[11px] text-neutral-500">Exclusive Porsche Sonderwunsch bespoke color</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-800">+$48,500 MSRP</span>
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={hasPCCB}
                        onChange={(e) => setHasPCCB(e.target.checked)}
                        className="rounded accent-[#E8A588]"
                      />
                      <div>
                        <div className="text-xs font-bold text-neutral-900">Ceramic Composite Brakes (PCCB)</div>
                        <div className="text-[11px] text-neutral-500">408mm yellow/black ceramic discs</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-neutral-800">+$10,200 MSRP</span>
                  </label>
                </div>

                {/* Condition Selector */}
                <div>
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Vehicle Provenance & Condition
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => setCondition('delivery')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        condition === 'delivery'
                          ? 'border-[#E8A588] bg-[#FFF8F5]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-900">Factory Delivery</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Wrapper still on, 0 track hrs</div>
                    </button>
                    <button
                      onClick={() => setCondition('collector')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        condition === 'collector'
                          ? 'border-[#E8A588] bg-[#FFF8F5]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-900">Collector Grade</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Full PPF, climate garage</div>
                    </button>
                    <button
                      onClick={() => setCondition('driven')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        condition === 'driven'
                          ? 'border-[#E8A588] bg-[#FFF8F5]'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-neutral-900">Track Enthusiast</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Driven on circuit, serviced</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Valuation Appraisal Summary Card */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-xl flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-700">
                      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                        Live Valuation Appraisal
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="mt-6">
                      <span className="text-xs text-neutral-400">Estimated Fair Market Resale</span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1">
                        ${estimatedSecondary.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-emerald-400 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+${totalAppreciation.toLocaleString()} ({appreciationPercentage}%) Above Sticker</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2.5 text-xs font-mono pt-4 border-t border-neutral-700">
                      <div className="flex justify-between text-neutral-300">
                        <span>Original Window Sticker MSRP:</span>
                        <span>${totalCalculatedMSRP.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>PTS Custom Color Bonus:</span>
                        <span className="text-purple-300">{hasPTSPaint ? '+$52,000' : '$0'}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Instant Dealer Buyout Bid:</span>
                        <span className="text-amber-300">${Math.round(estimatedSecondary * 0.92).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>12-Month Projected Value:</span>
                        <span className="text-emerald-300">${Math.round(estimatedSecondary * 1.06).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-neutral-700/60 space-y-2">
                    <button
                      onClick={() => {
                        engineAudio.playClickTone('radar');
                        if (onOpenDrive) {
                          onOpenDrive();
                        }
                      }}
                      className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                      </svg>
                      <span>Save Appraisal to Google Drive</span>
                    </button>
                    <p className="text-[10px] text-neutral-400 text-center mt-2">
                      Saves certified markdown report directly into your Google Drive vault.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
