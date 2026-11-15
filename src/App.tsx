import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';
import {
  AppSection,
  EquipmentItem,
  LabTab,
  TimelineEvent
} from './types/equipment';
import { MuseumAudioContextId, MuseumTheme } from './types/theme';
import {
  fetchEquipmentCatalog,
  fetchTimelineEvents
} from './services/atlasService';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { PlanetaryExplorerView } from './components/PlanetaryExplorerView';
import { EquipmentDetailView } from './components/EquipmentDetailView';
import { TimelineView } from './components/TimelineView';
import { SearchCatalogView } from './components/SearchCatalogView';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { GlossaryModal } from './components/GlossaryModal';
import { InteractiveLabView } from './components/InteractiveLabView';
import {
  MuseumThemeProvider,
  useMuseumTheme
} from './context/MuseumThemeContext';
import { MuseumEnvironmentBackdrop } from './components/three/MuseumEnvironmentBackdrop';
import { MuseumControlDock } from './components/MuseumControlDock';

function getRouteThemeForSection(section: AppSection): MuseumTheme {
  switch (section) {
    case 'moon':
      return 'lunar';
    case 'mars':
      return 'mars';
    case 'timeline':
      return 'timeline';
    default:
      return 'default';
  }
}

function getRouteAudioForSection(
  section: AppSection,
  labTab: LabTab
): MuseumAudioContextId {
  switch (section) {
    case 'moon':
      return 'lunar';
    case 'mars':
      return 'mars';
    case 'timeline':
      return 'timeline';
    case 'search':
    case 'detail':
      return 'equipment';
    case 'lab':
      return labTab === '3d-explorer' ? 'equipment' : 'history';
    case 'about':
      return 'history';
    case 'home':
    default:
      return 'mission-control';
  }
}

function mapThemeToAudioContext(theme: MuseumTheme): MuseumAudioContextId {
  switch (theme) {
    case 'lunar':
      return 'lunar';
    case 'mars':
      return 'mars';
    case 'timeline':
      return 'timeline';
    case 'default':
    default:
      return 'mission-control';
  }
}

function AtlasShell() {
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null
  );
  const [catalog, setCatalog] = useState<EquipmentItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [labTab, setLabTab] = useState<LabTab>('3d-explorer');
  const [labFocusId, setLabFocusId] = useState<string | undefined>(undefined);

  const mainRef = useRef<HTMLElement | null>(null);
  const {
    setRouteTheme,
    setScrollObservedTheme,
    setRouteAudioContext,
    setScrollObservedAudioContext,
    isDraggingPlanet
  } = useMuseumTheme();

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchEquipmentCatalog(),
      fetchTimelineEvents('All', 'asc')
    ])
      .then(([items, events]) => {
        if (active) {
          setCatalog(items);
          setTimelineEvents(events);
          setLoadError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setLoadError(
            err instanceof Error ? err.message : 'Unable to load atlas catalog.'
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Synchronize top-level navigation section with museum theme and audio context
  useEffect(() => {
    setRouteTheme(getRouteThemeForSection(activeSection));
    setRouteAudioContext(getRouteAudioForSection(activeSection, labTab));
  }, [activeSection, labTab, setRouteTheme, setRouteAudioContext]);

  // Observe [data-museum-theme] and [data-museum-audio] sections inside <main> during scrolling
  useEffect(() => {
    const container = mainRef.current;
    if (!container || loading || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-museum-theme], [data-museum-audio]'
      )
    );
    if (targets.length === 0) {
      setScrollObservedTheme(null);
      setScrollObservedAudioContext(null);
      return;
    }

    const ratioMap = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratioMap.set(
            entry.target,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        let bestEl: Element | null = null;
        let bestRatio = 0;
        for (const [el, ratio] of ratioMap.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestEl = el;
          }
        }

        if (bestEl && bestRatio > 0.08) {
          const nextTheme = bestEl.getAttribute(
            'data-museum-theme'
          ) as MuseumTheme | null;
          if (nextTheme) {
            setScrollObservedTheme(nextTheme);
          }

          const explicitAudio = bestEl.getAttribute(
            'data-museum-audio'
          ) as MuseumAudioContextId | null;
          if (explicitAudio) {
            setScrollObservedAudioContext(explicitAudio);
          } else if (nextTheme) {
            setScrollObservedAudioContext(mapThemeToAudioContext(nextTheme));
          }
        }
      },
      {
        rootMargin: '-20% 0px -35% 0px',
        threshold: [0, 0.15, 0.35, 0.6, 0.85]
      }
    );

    for (const el of targets) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [
    activeSection,
    loading,
    selectedEquipmentId,
    setScrollObservedTheme,
    setScrollObservedAudioContext
  ]);

  const navigateToSection = (section: AppSection) => {
    setActiveSection(section);
    if (section !== 'detail') {
      setSelectedEquipmentId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEquipmentDetail = (id: string) => {
    setSelectedEquipmentId(id);
    setActiveSection('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLab = (tab: LabTab, equipmentId?: string) => {
    setLabTab(tab);
    setLabFocusId(equipmentId);
    setSelectedEquipmentId(null);
    setActiveSection('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const featuredEquipment = catalog.filter((item) => item.featured);
  const selectedEquipment = catalog.find(
    (item) => item.id === selectedEquipmentId
  );

  return (
    <div
      className={`relative min-h-screen text-[#E6EDF7] ${
        isDraggingPlanet ? 'cursor-grabbing select-none' : ''
      }`}
    >
      <MuseumEnvironmentBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          activeSection={activeSection}
          onNavigate={navigateToSection}
        />

        <main ref={mainRef} className="flex-1">
          {loading ? (
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="h-64 animate-pulse rounded-xl border border-[#1E3666] bg-[#14264A]/30" />
            </div>
          ) : loadError ? (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center">
              <p className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Unable to Load Equipment Catalog
              </p>
              <p className="mt-2 text-sm text-[#9FB2D1]">{loadError}</p>
            </div>
          ) : (
            <>
              {activeSection === 'home' && (
                <HomeView
                  allCatalog={catalog}
                  featuredEquipment={
                    featuredEquipment.length > 0
                      ? featuredEquipment
                      : catalog.slice(0, 4)
                  }
                  onNavigate={navigateToSection}
                  onSelectEquipment={openEquipmentDetail}
                  onOpenLab={openLab}
                />
              )}

              {activeSection === 'moon' && (
                <PlanetaryExplorerView
                  destination="Moon"
                  items={catalog}
                  onSelectEquipment={openEquipmentDetail}
                  onNavigate={navigateToSection}
                />
              )}

              {activeSection === 'mars' && (
                <PlanetaryExplorerView
                  destination="Mars"
                  items={catalog}
                  onSelectEquipment={openEquipmentDetail}
                  onNavigate={navigateToSection}
                />
              )}

              {activeSection === 'timeline' && (
                <TimelineView onSelectEquipment={openEquipmentDetail} />
              )}

              {activeSection === 'search' && (
                <SearchCatalogView onSelectEquipment={openEquipmentDetail} />
              )}

              {activeSection === 'about' && (
                <AboutView onNavigate={navigateToSection} />
              )}

              {activeSection === 'lab' && (
                <InteractiveLabView
                  items={catalog}
                  activeTab={labTab}
                  focusedEquipmentId={labFocusId}
                  onChangeTab={setLabTab}
                  onSelectEquipment={openEquipmentDetail}
                />
              )}

              {activeSection === 'detail' && selectedEquipment && (
                <EquipmentDetailView
                  item={selectedEquipment}
                  allItems={catalog}
                  timelineEvents={timelineEvents}
                  onBack={navigateToSection}
                  onSelectEquipment={openEquipmentDetail}
                  onOpenLab={openLab}
                />
              )}

              {activeSection === 'detail' && !selectedEquipment && (
                <div className="mx-auto max-w-3xl px-4 py-20 text-center">
                  <p className="font-display text-2xl font-semibold text-[#E6EDF7]">
                    Equipment Profile Not Found
                  </p>
                  <p className="mt-2 text-sm text-[#9FB2D1]">
                    The requested archive record could not be located.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateToSection('home')}
                    className="mt-6 inline-flex cursor-pointer items-center rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-medium text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]"
                  >
                    Return to Mission Control
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        <Footer
          onNavigate={navigateToSection}
          onOpenGlossary={() => setGlossaryOpen(true)}
        />
      </div>

      <MuseumControlDock />

      {/* Persistent Glossary Trigger */}
      <button
        type="button"
        onClick={() => setGlossaryOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={glossaryOpen}
        className="group fixed right-4 bottom-4 z-30 inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#20B9C9]/70 bg-[#0D152B]/95 px-3 py-2.5 text-xs font-semibold text-[#E6EDF7] shadow-lg backdrop-blur-md transition-colors duration-150 hover:bg-[#20B9C9] hover:text-[#080D1C] sm:right-6 sm:bottom-6 sm:gap-2 sm:px-4 sm:text-sm"
      >
        <BookOpen className="h-4 w-4 text-[#20B9C9] transition-colors group-hover:text-[#080D1C]" aria-hidden="true" />
        <span>Space Glossary</span>
      </button>

      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
        onSelectEquipment={openEquipmentDetail}
      />
    </div>
  );
}

export default function App() {
  return (
    <MuseumThemeProvider>
      <AtlasShell />
    </MuseumThemeProvider>
  );
}
