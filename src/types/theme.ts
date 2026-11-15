export type MuseumTheme = 'default' | 'lunar' | 'mars' | 'timeline';

export type PagePaletteId =
  | 'default'
  | 'lunar-slate'
  | 'martian-amber'
  | 'planetarium-gold';

export type MuseumAudioContextId =
  | 'mission-control'
  | 'lunar'
  | 'mars'
  | 'timeline'
  | 'equipment'
  | 'history';

export type ThemeControlMode = 'auto' | 'manual';

export type BackdropMode = '3d' | 'static';

export interface PagePaletteMeta {
  id: PagePaletteId;
  name: string;
  shortLabel: string;
  description: string;
  bgHex: string;
  surfaceHex: string;
  cardHex: string;
  borderHex: string;
  primaryHex: string;
  accentHex: string;
  accentInkHex: string;
  atmosphereRgba: string;
  scrimRgb: string;
}

export const PAGE_PALETTES: Record<PagePaletteId, PagePaletteMeta> = {
  default: {
    id: 'default',
    name: 'Observatory Navy',
    shortLabel: 'Default',
    description: 'Deep space navy & telemetry cyan (Default)',
    bgHex: '#080D1C',
    surfaceHex: '#0D152B',
    cardHex: '#14264A',
    borderHex: '#1E3666',
    primaryHex: '#2463C5',
    accentHex: '#20B9C9',
    accentInkHex: '#080D1C',
    atmosphereRgba: 'rgba(36,99,197,0.18)',
    scrimRgb: '8,13,28'
  },
  'lunar-slate': {
    id: 'lunar-slate',
    name: 'Lunar Obsidian',
    shortLabel: 'Lunar',
    description: 'Moonstone slate & Apollo silver-blue',
    bgHex: '#0A0F18',
    surfaceHex: '#121A28',
    cardHex: '#1B273C',
    borderHex: '#314260',
    primaryHex: '#3468BD',
    accentHex: '#7CC6FE',
    accentInkHex: '#0A0F18',
    atmosphereRgba: 'rgba(124,198,254,0.2)',
    scrimRgb: '10,15,24'
  },
  'martian-amber': {
    id: 'martian-amber',
    name: 'Martian Canyon',
    shortLabel: 'Martian',
    description: 'Iron-oxide basalt & terracotta copper',
    bgHex: '#140A09',
    surfaceHex: '#1F110F',
    cardHex: '#311A16',
    borderHex: '#5A2F26',
    primaryHex: '#B84B27',
    accentHex: '#EB7D4B',
    accentInkHex: '#140A09',
    atmosphereRgba: 'rgba(235,125,75,0.22)',
    scrimRgb: '20,10,9'
  },
  'planetarium-gold': {
    id: 'planetarium-gold',
    name: 'Planetarium Brass',
    shortLabel: 'Brass',
    description: 'Cosmic midnight & museum archive gold',
    bgHex: '#090B12',
    surfaceHex: '#121622',
    cardHex: '#1C2234',
    borderHex: '#4A3D24',
    primaryHex: '#34569C',
    accentHex: '#F5B041',
    accentInkHex: '#090B12',
    atmosphereRgba: 'rgba(245,176,65,0.18)',
    scrimRgb: '9,11,18'
  }
};

export interface MuseumThemeMeta {
  id: MuseumTheme;
  label: string;
  exhibitTitle: string;
  subtitle: string;
  bgHex: string;
  surfaceHex: string;
  borderHex: string;
  accentHex: string;
  accentTextHex: string;
}

export interface AudioTrackInfo {
  id: string;
  contextId: MuseumAudioContextId;
  contextLabel: string;
  title: string;
  description: string;
}

export const MUSEUM_THEMES: Record<MuseumTheme, MuseumThemeMeta> = {
  default: {
    id: 'default',
    label: 'Observatory Default',
    exhibitTitle: 'Deep Space Observatory',
    subtitle: 'Full planetary heritage catalog across Moon and Mars',
    bgHex: '#080D1C',
    surfaceHex: '#0D152B',
    borderHex: '#1E3666',
    accentHex: '#20B9C9',
    accentTextHex: '#080D1C'
  },
  lunar: {
    id: 'lunar',
    label: 'Lunar Heritage',
    exhibitTitle: 'Lunar Heritage Museum',
    subtitle: 'Interactive 3D Moon exhibit · Apollo, Surveyor & ALSEP sites',
    bgHex: '#070B16',
    surfaceHex: '#0E1629',
    borderHex: '#2A3B61',
    accentHex: '#7CC6FE',
    accentTextHex: '#070B16'
  },
  mars: {
    id: 'mars',
    label: 'Mars Exploration',
    exhibitTitle: 'Mars Exploration Museum',
    subtitle: 'Interactive 3D Mars exhibit · Viking, Pathfinder & MER sites',
    bgHex: '#120A0A',
    surfaceHex: '#1C1111',
    borderHex: '#522922',
    accentHex: '#EB7D4B',
    accentTextHex: '#120A0A'
  },
  timeline: {
    id: 'timeline',
    label: 'Mission Timeline',
    exhibitTitle: 'Astronomical Timeline Wing',
    subtitle: 'Orbital trajectories & chronological surface milestones (1966–2019)',
    bgHex: '#060A18',
    surfaceHex: '#0C1329',
    borderHex: '#1F356B',
    accentHex: '#F5B041',
    accentTextHex: '#060A18'
  }
};

export const AUDIO_CONTEXT_TRACKS: Record<
  MuseumAudioContextId,
  AudioTrackInfo[]
> = {
  'mission-control': [
    {
      id: 'mc-observatory-drift',
      contextId: 'mission-control',
      contextLabel: 'Mission Control',
      title: 'Observatory Drift',
      description: 'Subtle cosmic synthesizer pads and calm deep-space ambience'
    },
    {
      id: 'mc-starlight-horizon',
      contextId: 'mission-control',
      contextLabel: 'Mission Control',
      title: 'Starlight Horizon',
      description: 'Gentle interstellar harmonics and sparse celestial chimes'
    }
  ],
  lunar: [
    {
      id: 'lunar-tranquility',
      contextId: 'lunar',
      contextLabel: 'Moon Exhibition Wing',
      title: 'Sea of Tranquility',
      description: 'Peaceful lunar ambience with soft futuristic harmonics'
    },
    {
      id: 'lunar-imbrium-nocturne',
      contextId: 'lunar',
      contextLabel: 'Moon Exhibition Wing',
      title: 'Mare Imbrium Nocturne',
      description: 'Crystalline lunar stillness and quiet orbital overtones'
    }
  ],
  mars: [
    {
      id: 'mars-red-horizon',
      contextId: 'mars',
      contextLabel: 'Mars Exhibition Wing',
      title: 'Red Horizon Winds',
      description: 'Gentle Martian wind atmosphere with warm cinematic synth'
    },
    {
      id: 'mars-marineris-dusk',
      contextId: 'mars',
      contextLabel: 'Mars Exhibition Wing',
      title: 'Valles Marineris Dusk',
      description: 'Filtered canyon breeze and contemplative desert textures'
    }
  ],
  timeline: [
    {
      id: 'timeline-chronicle',
      contextId: 'timeline',
      contextLabel: 'Timeline Exhibition',
      title: 'Chronicle of Discovery',
      description: 'Historical documentary-style instrumental pulse'
    },
    {
      id: 'timeline-orbital-epochs',
      contextId: 'timeline',
      contextLabel: 'Timeline Exhibition',
      title: 'Orbital Epochs',
      description: 'Measured archival tones tracing five decades of landings'
    }
  ],
  equipment: [
    {
      id: 'equip-hardware-vault',
      contextId: 'equipment',
      contextLabel: 'Equipment Exploration',
      title: 'Hardware Vault',
      description: 'Subtle technological and museum-style gallery ambience'
    },
    {
      id: 'equip-telemetry-echoes',
      contextId: 'equipment',
      contextLabel: 'Equipment Exploration',
      title: 'Telemetry Echoes',
      description: 'Clean engineering synth bed with delicate acoustic pulses'
    }
  ],
  history: [
    {
      id: 'history-archival-memory',
      contextId: 'history',
      contextLabel: 'Mission History',
      title: 'Archival Memory',
      description: 'Reflective museum ambience tailored for historical reading'
    },
    {
      id: 'history-quiet-legacy',
      contextId: 'history',
      contextLabel: 'Mission History',
      title: 'Quiet Legacy',
      description: 'Soft sustained documentary chords with zero distraction'
    }
  ]
};
