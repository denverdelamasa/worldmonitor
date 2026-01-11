import type { PanelConfig, MapLayers } from '@/types';

// Panel order optimized for geopolitical analysis workflow:
// Row 1: Intel sources and breaking events
// Row 2: Market signals and leading indicators
// Row 3: Supporting context and tracking
export const DEFAULT_PANELS: Record<string, PanelConfig> = {
  map: { name: 'Global Map', enabled: true, priority: 1 },
  intel: { name: 'Intel Feed', enabled: true, priority: 1 },
  politics: { name: 'World News', enabled: true, priority: 1 },
  middleeast: { name: 'Middle East', enabled: true, priority: 1 },
  gov: { name: 'Government', enabled: true, priority: 1 },
  thinktanks: { name: 'Think Tanks', enabled: true, priority: 1 },
  polymarket: { name: 'Predictions', enabled: true, priority: 1 },
  commodities: { name: 'Commodities', enabled: true, priority: 1 },
  markets: { name: 'Markets', enabled: true, priority: 1 },
  economic: { name: 'Economic Indicators', enabled: true, priority: 1 },
  finance: { name: 'Financial', enabled: true, priority: 1 },
  tech: { name: 'Technology', enabled: true, priority: 2 },
  crypto: { name: 'Crypto', enabled: true, priority: 2 },
  heatmap: { name: 'Sector Heatmap', enabled: true, priority: 2 },
  congress: { name: 'Congress Trades', enabled: true, priority: 2 },
  ai: { name: 'AI/ML', enabled: true, priority: 2 },
  layoffs: { name: 'Layoffs Tracker', enabled: false, priority: 2 },
  monitors: { name: 'My Monitors', enabled: true, priority: 2 },
};

export const DEFAULT_MAP_LAYERS: MapLayers = {
  conflicts: true,
  bases: true,
  cables: false,
  pipelines: false,
  hotspots: true,
  ais: false,
  nuclear: true,
  irradiators: false,
  sanctions: true,
  earthquakes: true,
  weather: true,
  economic: true,
  countries: true,
  waterways: true,
  outages: true,
  datacenters: false,
  protests: true,
  flights: false,
  military: false,
};

// Mobile-specific defaults: minimal layers for better usability
export const MOBILE_DEFAULT_MAP_LAYERS: MapLayers = {
  conflicts: true,
  bases: false,
  cables: false,
  pipelines: false,
  hotspots: true,
  ais: false,
  nuclear: false,
  irradiators: false,
  sanctions: false,
  earthquakes: false,
  weather: false,
  economic: false,
  countries: false,
  waterways: false,
  outages: true,
  datacenters: false,
  protests: false,
  flights: false,
  military: false,
};

export const MONITOR_COLORS = [
  '#44ff88',
  '#ff8844',
  '#4488ff',
  '#ff44ff',
  '#ffff44',
  '#ff4444',
  '#44ffff',
  '#88ff44',
  '#ff88ff',
  '#88ffff',
];

export const STORAGE_KEYS = {
  panels: 'worldmonitor-panels',
  monitors: 'worldmonitor-monitors',
  mapLayers: 'worldmonitor-layers',
} as const;
