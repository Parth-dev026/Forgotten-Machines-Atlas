import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, Move, RotateCcw, RotateCw } from 'lucide-react';
import {
  AppSection,
  Destination,
  EquipmentCategory,
  EquipmentItem,
  SurfaceStatus
} from '../types/equipment';
import { EquipmentCard } from './EquipmentCard';
import { useMuseumTheme } from '../context/MuseumThemeContext';

interface PlanetaryExplorerViewProps {
  destination: Destination;
  items: EquipmentItem[];
  onSelectEquipment: (id: string) => void;
  onNavigate: (section: AppSection) => void;
}

export function PlanetaryExplorerView({
  destination,
  items,
  onSelectEquipment,
  onNavigate
}: PlanetaryExplorerViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    EquipmentCategory | 'All'
  >('All');
  const [selectedStatus, setSelectedStatus] = useState<SurfaceStatus | 'All'>(
    'All'
  );
  const {
    nudgePlanetRotation,
    backdropMode,
    prefersReducedMotion,
    setIsDraggingPlanet
  } = useMuseumTheme();
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);

  const isMoon = destination === 'Moon';
  const showInteractivePlanetPad =
    backdropMode === '3d' && !prefersReducedMotion;

  const destinationItems = useMemo(
    () => items.filter((item) => item.destination === destination),
    [items, destination]
  );

  const availableCategories = useMemo(() => {
    const unique = Array.from(
      new Set(destinationItems.map((item) => item.category))
    );
    return ['All', ...unique] as (EquipmentCategory | 'All')[];
  }, [destinationItems]);

  const filteredItems = useMemo(() => {
    return destinationItems.filter((item) => {
      const catMatch =
        selectedCategory === 'All' || item.category === selectedCategory;
      const statusMatch =
        selectedStatus === 'All' || item.surfaceStatus === selectedStatus;
      return catMatch && statusMatch;
    });
  }, [destinationItems, selectedCategory, selectedStatus]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  return (
    <section
      data-museum-theme={isMoon ? 'lunar' : 'mars'}
      className="py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#9FB2D1] transition-colors hover:text-[var(--museum-accent)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Mission Control</span>
        </button>

        {/* Planetary Header */}
        <div className="mt-6 grid grid-cols-1 gap-8 border-b border-[var(--museum-border)] pb-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p
              className="font-mono text-xs tracking-wider"
              style={{ color: isMoon ? '#7CC6FE' : '#EB7D4B' }}
            >
              {isMoon
                ? 'Lunar Heritage Museum · Interactive 3D Moon Exhibit'
                : 'Mars Exploration Museum · Interactive 3D Mars Exhibit'}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl lg:text-5xl">
              {isMoon ? 'Moon Explorer' : 'Mars Explorer'}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#C5D2E8]">
              {isMoon
                ? 'Explore the robotic Surveyor landers that tested lunar soil before astronauts arrived, the Apollo Lunar Module descent stages left behind as launch pads, the electric Lunar Roving Vehicles, and the nuclear-powered ALSEP scientific stations.'
                : 'Explore the individual mission profiles of NASA’s historic Mars surface pioneers—from the twin 1976 Viking landers and the nimble 1997 Sojourner rover to the marathon twin Mars Exploration Rovers, Spirit and Opportunity.'}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--museum-border)] bg-[var(--museum-surface)]/90 p-5 lg:col-span-4">
            <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
              Surface Environment
            </p>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--museum-border)]/80 pb-2">
                <dt className="text-[#9FB2D1]">Documented Profiles</dt>
                <dd className="font-mono font-medium text-[#E6EDF7] tabular-nums">
                  {destinationItems.length}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--museum-border)]/80 pb-2">
                <dt className="text-[#9FB2D1]">Surface Gravity</dt>
                <dd className="font-mono font-medium text-[#E6EDF7] tabular-nums">
                  {isMoon ? '1.62 m/s² (~1/6 Earth)' : '3.72 m/s² (~3/8 Earth)'}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#9FB2D1]">Primary Weathering</dt>
                <dd className="text-right font-medium text-[#E6EDF7]">
                  {isMoon
                    ? 'Vacuum, UV & thermal extremes'
                    : 'CO₂ frost, global dust & cold'}
                </dd>
              </div>
            </dl>

            {showInteractivePlanetPad && (
              <div className="mt-4 border-t border-[var(--museum-border)]/80 pt-3">
                <div className="flex items-center justify-between gap-2">
                  <div
                    role="region"
                    aria-label={`Drag to rotate 3D ${destination} globe`}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      dragOriginRef.current = { x: e.clientX, y: e.clientY };
                      setIsDraggingPlanet(true);
                    }}
                    onPointerMove={(e) => {
                      if (!dragOriginRef.current) return;
                      const dx = e.clientX - dragOriginRef.current.x;
                      const dy = e.clientY - dragOriginRef.current.y;
                      dragOriginRef.current = { x: e.clientX, y: e.clientY };
                      nudgePlanetRotation(dx * 0.006, dy * 0.004);
                    }}
                    onPointerUp={(e) => {
                      dragOriginRef.current = null;
                      setIsDraggingPlanet(false);
                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                    }}
                    onPointerCancel={() => {
                      dragOriginRef.current = null;
                      setIsDraggingPlanet(false);
                    }}
                    className="flex flex-1 touch-none cursor-grab items-center gap-2 rounded-lg border border-dashed border-[var(--museum-border)] bg-[#080D1C]/60 px-3 py-2 text-xs text-[#C5D2E8] select-none active:cursor-grabbing"
                  >
                    <Move
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: isMoon ? '#7CC6FE' : '#EB7D4B' }}
                      aria-hidden="true"
                    />
                    <span>Drag to rotate 3D {destination}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => nudgePlanetRotation(-0.35, 0)}
                      aria-label={`Rotate 3D ${destination} left`}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--museum-border)] bg-[#080D1C]/70 text-[#C5D2E8] hover:text-[#E6EDF7]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudgePlanetRotation(0.35, 0)}
                      aria-label={`Rotate 3D ${destination} right`}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--museum-border)] bg-[#080D1C]/70 text-[#C5D2E8] hover:text-[#E6EDF7]"
                    >
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Filter Controls */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium text-[#9FB2D1]">
              Category:
            </span>
            <div className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--museum-border)] bg-[var(--museum-surface)] p-1">
              {availableCategories.map((category) => {
                const active = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#2463C5] text-[#E6EDF7]'
                        : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`status-filter-${destination}`}
              className="text-xs font-medium text-[#9FB2D1]"
            >
              Preservation Status:
            </label>
            <select
              id={`status-filter-${destination}`}
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as SurfaceStatus | 'All')
              }
              className="min-h-[38px] cursor-pointer rounded-lg border border-[var(--museum-border)] bg-[var(--museum-surface)] px-3 py-1.5 text-xs font-medium text-[#E6EDF7]"
            >
              <option value="All">All Outcomes</option>
              <option value="Intentionally Left Behind">
                Intentionally Left Behind
              </option>
              <option value="Stopped Operating">Stopped Operating</option>
              <option value="Condition Uncertain">
                Physical Condition Uncertain
              </option>
            </select>
          </div>
        </div>

        {/* Equipment Grid or Empty State */}
        {filteredItems.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[var(--museum-border)] bg-[var(--museum-surface)]/80 p-10 text-center">
            <p className="font-display text-lg font-semibold text-[#E6EDF7]">
              No {destination} equipment matches the selected filters.
            </p>
            <p className="mt-2 text-sm text-[#9FB2D1]">
              Try resetting the category or preservation status filter to view
              all documented hardware.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onSelect={onSelectEquipment}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
