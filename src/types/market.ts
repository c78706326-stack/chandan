export interface CarEdition {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentHex: string;
  tagline: string;
  image: string;
  msrp: number;
  marketPrice: number;
  specs: {
    engine: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    downforce: string;
    weight: string;
    transmission: string;
  };
  hotspots: Hotspot[];
}

export interface Hotspot {
  id: string;
  title: string;
  value: string;
  x: number; // percentage
  y: number; // percentage
  description: string;
  arcTo?: { x: number; y: number };
}

export interface MarketTransaction {
  id: string;
  time: string;
  platform: 'Bring a Trailer' | 'RM Sotheby’s' | 'PCARMARKET' | 'Collecting Cars' | 'Porsche Stuttgart VIP';
  model: string;
  edition: string;
  price: number;
  delta: number;
  type: 'Hammer Sale' | 'Active Bid' | 'Private Treaty' | 'Dealer Allocation';
  mileage: string;
  location: string;
}

export interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
}
