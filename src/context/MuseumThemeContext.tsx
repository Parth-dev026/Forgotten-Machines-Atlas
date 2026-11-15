import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  AUDIO_CONTEXT_TRACKS,
  AudioTrackInfo,
  BackdropMode,
  MUSEUM_THEMES,
  MuseumAudioContextId,
  MuseumTheme,
  MuseumThemeMeta,
  PAGE_PALETTES,
  PagePaletteId,
  PagePaletteMeta
} from '../types/theme';
import { ambientAudioEngine } from '../services/ambientAudioEngine';

const STORAGE_KEY = 'fma_museum_theme_prefs_v2';
const PAGE_THEME_STORAGE_KEY = 'fma_page_theme_v1';

interface StoredPrefs {
  backdropMode?: BackdropMode;
  pagePalette?: PagePaletteId;
  audioEnabled?: boolean;
  audioMuted?: boolean;
  audioVolume?: number;
}

function isValidPagePalette(value: unknown): value is PagePaletteId {
  return typeof value === 'string' && value in PAGE_PALETTES;
}

function readStoredPagePalette(prefs: StoredPrefs): PagePaletteId {
  try {
    const dedicated = window.localStorage.getItem(PAGE_THEME_STORAGE_KEY);
    if (isValidPagePalette(dedicated)) {
      return dedicated;
    }
  } catch {
    // ignore storage errors
  }
  return isValidPagePalette(prefs.pagePalette) ? prefs.pagePalette : 'default';
}

function writeStoredPagePalette(palette: PagePaletteId) {
  try {
    window.localStorage.setItem(PAGE_THEME_STORAGE_KEY, palette);
  } catch {
    // ignore storage errors
  }
}

function readStoredPrefs(): StoredPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredPrefs;
  } catch {
    return {};
  }
}

function writeStoredPrefs(prefs: StoredPrefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

interface PlanetDragImpulse {
  vx: number;
  vy: number;
}

interface MuseumThemeContextValue {
  activeTheme: MuseumTheme;
  themeMeta: MuseumThemeMeta;
  pagePalette: PagePaletteId;
  pagePaletteMeta: PagePaletteMeta;
  setPagePalette: (palette: PagePaletteId) => void;
  backdropMode: BackdropMode;
  prefersReducedMotion: boolean;
  isMobileViewport: boolean;
  setRouteTheme: (theme: MuseumTheme) => void;
  setScrollObservedTheme: (theme: MuseumTheme | null) => void;
  setBackdropMode: (mode: BackdropMode) => void;
  // Context-aware museum audio state & controls
  activeAudioContext: MuseumAudioContextId;
  setRouteAudioContext: (contextId: MuseumAudioContextId) => void;
  setScrollObservedAudioContext: (contextId: MuseumAudioContextId | null) => void;
  currentTrackInfo: AudioTrackInfo;
  currentTrackNumber: number;
  totalTracksForContext: number;
  hasAudioActivated: boolean;
  isAudioEnabled: boolean;
  isAudioPlaying: boolean;
  isAudioMuted: boolean;
  audioVolume: number;
  activateAndEnableAudio: () => Promise<void>;
  toggleAudioEnabled: () => Promise<void>;
  toggleAudioMute: () => void;
  setAudioVolume: (vol: number) => void;
  nextTrack: () => Promise<void>;
  // Shared drag impulse ref for 3D Moon / Mars rotation
  dragImpulseRef: React.MutableRefObject<PlanetDragImpulse>;
  isDraggingPlanet: boolean;
  setIsDraggingPlanet: (dragging: boolean) => void;
  nudgePlanetRotation: (deltaYaw: number, deltaPitch: number) => void;
}

const MuseumThemeContext = createContext<MuseumThemeContextValue | null>(null);

export function MuseumThemeProvider({ children }: { children: ReactNode }) {
  const initialPrefs = useMemo(() => {
    if (typeof window === 'undefined') return {};
    return readStoredPrefs();
  }, []);

  const [routeTheme, setRouteThemeState] = useState<MuseumTheme>('default');
  const [scrollObservedTheme, setScrollObservedThemeState] =
    useState<MuseumTheme | null>(null);

  const [routeAudioContext, setRouteAudioContextState] =
    useState<MuseumAudioContextId>('mission-control');
  const [scrollObservedAudioContext, setScrollObservedAudioContextState] =
    useState<MuseumAudioContextId | null>(null);

  const [trackIndices, setTrackIndices] = useState<
    Record<MuseumAudioContextId, number>
  >({
    'mission-control': 0,
    lunar: 0,
    mars: 0,
    timeline: 0,
    equipment: 0,
    history: 0
  });

  const [backdropMode, setBackdropModeState] = useState<BackdropMode>(
    initialPrefs.backdropMode === 'static' ? 'static' : '3d'
  );
  const [pagePalette, setPagePaletteState] = useState<PagePaletteId>(() => {
    if (typeof window === 'undefined') return 'default';
    return readStoredPagePalette(initialPrefs);
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const [hasAudioActivated, setHasAudioActivated] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(
    initialPrefs.audioEnabled === true
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(
    initialPrefs.audioMuted === true
  );
  const [audioVolume, setAudioVolumeState] = useState(
    typeof initialPrefs.audioVolume === 'number'
      ? Math.max(0, Math.min(1, initialPrefs.audioVolume))
      : 0.32
  );

  const [isDraggingPlanet, setIsDraggingPlanet] = useState(false);
  const dragImpulseRef = useRef<PlanetDragImpulse>({ vx: 0, vy: 0 });

  // Persist user preferences cleanly across sessions and reloads
  useEffect(() => {
    writeStoredPagePalette(pagePalette);
    writeStoredPrefs({
      backdropMode,
      pagePalette,
      audioEnabled: isAudioEnabled,
      audioMuted: isAudioMuted,
      audioVolume
    });
  }, [backdropMode, pagePalette, isAudioEnabled, isAudioMuted, audioVolume]);

  // Keep page theme synchronized if changed in another open browser tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === PAGE_THEME_STORAGE_KEY && isValidPagePalette(e.newValue)) {
        setPagePaletteState(e.newValue);
      } else if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as StoredPrefs;
          if (isValidPagePalette(parsed.pagePalette)) {
            setPagePaletteState(parsed.pagePalette);
          }
        } catch {
          // ignore invalid JSON
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 767px)');

    const syncMedia = () => {
      setPrefersReducedMotion(motionMq.matches);
      setIsMobileViewport(mobileMq.matches);
    };
    syncMedia();

    motionMq.addEventListener('change', syncMedia);
    mobileMq.addEventListener('change', syncMedia);
    return () => {
      motionMq.removeEventListener('change', syncMedia);
      mobileMq.removeEventListener('change', syncMedia);
    };
  }, []);

  const activeTheme: MuseumTheme = scrollObservedTheme ?? routeTheme;
  const themeMeta = MUSEUM_THEMES[activeTheme];
  const pagePaletteMeta = PAGE_PALETTES[pagePalette];

  const activeAudioContext: MuseumAudioContextId =
    scrollObservedAudioContext ?? routeAudioContext;
  const tracksForContext = AUDIO_CONTEXT_TRACKS[activeAudioContext];
  const rawTrackIdx = trackIndices[activeAudioContext] ?? 0;
  const safeTrackIdx = rawTrackIdx % tracksForContext.length;
  const currentTrackInfo = tracksForContext[safeTrackIdx];

  // Sync visual CSS theme attribute and selected page palette before paint
  useLayoutEffect(() => {
    document.documentElement.dataset.museumTheme = activeTheme;
    document.documentElement.dataset.pageTheme = pagePalette;
  }, [activeTheme, pagePalette]);

  // Sync context-aware audio transitions ONLY when context/track changes, without restarting same track or overriding mute/off
  useEffect(() => {
    ambientAudioEngine.setVolume(audioVolume);
    ambientAudioEngine.setMuted(isAudioMuted);
    ambientAudioEngine.setTrack(activeAudioContext, safeTrackIdx, false);
  }, [activeAudioContext, safeTrackIdx, audioVolume, isAudioMuted]);

  // If returning visitor already chose Audio On in a prior session, unlock on their first interaction
  useEffect(() => {
    if (!isAudioEnabled || hasAudioActivated) return;

    const handleFirstGesture = (e: Event) => {
      if (
        e.target instanceof Element &&
        e.target.closest('[data-audio-control]')
      ) {
        return;
      }
      ambientAudioEngine.setVolume(audioVolume);
      ambientAudioEngine.setMuted(isAudioMuted);
      void ambientAudioEngine
        .play(activeAudioContext, safeTrackIdx)
        .then((started) => {
          if (started) {
            setHasAudioActivated(true);
            setIsAudioPlaying(true);
          }
        });
    };

    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [
    isAudioEnabled,
    hasAudioActivated,
    audioVolume,
    isAudioMuted,
    activeAudioContext,
    safeTrackIdx
  ]);

  useEffect(() => {
    return () => {
      ambientAudioEngine.dispose();
    };
  }, []);

  const setRouteTheme = useCallback((theme: MuseumTheme) => {
    setRouteThemeState(theme);
    setScrollObservedThemeState(null);
  }, []);

  const setScrollObservedTheme = useCallback((theme: MuseumTheme | null) => {
    setScrollObservedThemeState((prev) => (prev === theme ? prev : theme));
  }, []);

  const setRouteAudioContext = useCallback((contextId: MuseumAudioContextId) => {
    setRouteAudioContextState(contextId);
    setScrollObservedAudioContextState(null);
  }, []);

  const setScrollObservedAudioContext = useCallback(
    (contextId: MuseumAudioContextId | null) => {
      setScrollObservedAudioContextState((prev) =>
        prev === contextId ? prev : contextId
      );
    },
    []
  );

  const setBackdropMode = useCallback((next: BackdropMode) => {
    setBackdropModeState(next);
  }, []);

  const setPagePalette = useCallback((next: PagePaletteId) => {
    setPagePaletteState(next);
    writeStoredPagePalette(next);
    document.documentElement.dataset.pageTheme = next;
  }, []);

  const activateAndEnableAudio = useCallback(async () => {
    setIsAudioEnabled(true);
    ambientAudioEngine.setVolume(audioVolume);
    ambientAudioEngine.setMuted(isAudioMuted);
    const started = await ambientAudioEngine.play(
      activeAudioContext,
      safeTrackIdx
    );
    if (started) {
      setHasAudioActivated(true);
      setIsAudioPlaying(true);
    }
  }, [audioVolume, isAudioMuted, activeAudioContext, safeTrackIdx]);

  const toggleAudioEnabled = useCallback(async () => {
    if (isAudioEnabled && isAudioPlaying) {
      ambientAudioEngine.pause();
      setIsAudioPlaying(false);
      setIsAudioEnabled(false);
      return;
    }
    await activateAndEnableAudio();
  }, [isAudioEnabled, isAudioPlaying, activateAndEnableAudio]);

  const toggleAudioMute = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      ambientAudioEngine.setMuted(next);
      return next;
    });
  }, []);

  const setAudioVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setAudioVolumeState(clamped);
    ambientAudioEngine.setVolume(clamped);
  }, []);

  const nextTrack = useCallback(async () => {
    const count = AUDIO_CONTEXT_TRACKS[activeAudioContext].length;
    const nextIdx = (safeTrackIdx + 1) % count;

    setTrackIndices((prev) => ({
      ...prev,
      [activeAudioContext]: nextIdx
    }));

    if (isAudioEnabled && hasAudioActivated) {
      ambientAudioEngine.setTrack(activeAudioContext, nextIdx, true);
    } else if (isAudioEnabled) {
      ambientAudioEngine.setVolume(audioVolume);
      ambientAudioEngine.setMuted(isAudioMuted);
      const started = await ambientAudioEngine.play(activeAudioContext, nextIdx);
      if (started) {
        setHasAudioActivated(true);
        setIsAudioPlaying(true);
      }
    }
  }, [
    activeAudioContext,
    safeTrackIdx,
    isAudioEnabled,
    hasAudioActivated,
    audioVolume,
    isAudioMuted
  ]);

  const nudgePlanetRotation = useCallback(
    (deltaYaw: number, deltaPitch: number) => {
      dragImpulseRef.current.vx += deltaYaw;
      dragImpulseRef.current.vy += deltaPitch;
    },
    []
  );

  const value: MuseumThemeContextValue = {
    activeTheme,
    themeMeta,
    pagePalette,
    pagePaletteMeta,
    setPagePalette,
    backdropMode,
    prefersReducedMotion,
    isMobileViewport,
    setRouteTheme,
    setScrollObservedTheme,
    setBackdropMode,
    activeAudioContext,
    setRouteAudioContext,
    setScrollObservedAudioContext,
    currentTrackInfo,
    currentTrackNumber: safeTrackIdx + 1,
    totalTracksForContext: tracksForContext.length,
    hasAudioActivated,
    isAudioEnabled,
    isAudioPlaying,
    isAudioMuted,
    audioVolume,
    activateAndEnableAudio,
    toggleAudioEnabled,
    toggleAudioMute,
    setAudioVolume,
    nextTrack,
    dragImpulseRef,
    isDraggingPlanet,
    setIsDraggingPlanet,
    nudgePlanetRotation
  };

  return (
    <MuseumThemeContext.Provider value={value}>
      {children}
    </MuseumThemeContext.Provider>
  );
}

export function useMuseumTheme(): MuseumThemeContextValue {
  const ctx = useContext(MuseumThemeContext);
  if (!ctx) {
    throw new Error('useMuseumTheme must be used within MuseumThemeProvider');
  }
  return ctx;
}
