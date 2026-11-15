import { useEffect, useState } from 'react';
import { RotateCcw, Search, X } from 'lucide-react';
import {
  Destination,
  EquipmentCategory,
  EquipmentItem,
  SurfaceStatus
} from '../types/equipment';
import { fetchEquipmentCatalog } from '../services/atlasService';
import { EquipmentCard } from './EquipmentCard';

interface SearchCatalogViewProps {
  onSelectEquipment: (id: string) => void;
}

export function SearchCatalogView({
  onSelectEquipment
}: SearchCatalogViewProps) {
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<Destination | 'All'>('All');
  const [category, setCategory] = useState<EquipmentCategory | 'All'>('All');
  const [surfaceStatus, setSurfaceStatus] = useState<SurfaceStatus | 'All'>(
    'All'
  );
  const [results, setResults] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchEquipmentCatalog({
      query,
      destination,
      category,
      surfaceStatus
    }).then((data) => {
      if (active) {
        setResults(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [query, destination, category, surfaceStatus]);

  const hasActiveFilters =
    query.trim() !== '' ||
    destination !== 'All' ||
    category !== 'All' ||
    surfaceStatus !== 'All';

  const handleReset = () => {
    setQuery('');
    setDestination('All');
    setCategory('All');
    setSurfaceStatus('All');
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#1E3666] pb-8">
          <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
            Equipment Archive Directory
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl lg:text-5xl">
            Search &amp; Filter the Atlas
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C5D2E8]">
            Search across Moon and Mars missions by equipment name, mission
            title, landing site, category, or current planetary surface status.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-7 grid grid-cols-1 gap-4 rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-5 lg:grid-cols-12">
            {/* Search Input */}
            <div className="lg:col-span-5">
              <label
                htmlFor="atlas-search-input"
                className="block text-xs font-medium text-[#9FB2D1]"
              >
                Search Equipment, Mission, or Site
              </label>
              <div className="relative mt-1.5">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9FB2D1]"
                  aria-hidden="true"
                />
                <input
                  id="atlas-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Opportunity, Apollo 11, Oceanus Procellarum..."
                  className="min-h-[42px] w-full rounded-lg border border-[#1E3666] bg-[#080D1C] py-2 pr-9 pl-10 text-sm text-[#E6EDF7] placeholder-[#9FB2D1]/60 focus:border-[#20B9C9]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search text"
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-[#9FB2D1] hover:text-[#E6EDF7]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="lg:col-span-2">
              <label
                htmlFor="atlas-filter-destination"
                className="block text-xs font-medium text-[#9FB2D1]"
              >
                Destination
              </label>
              <select
                id="atlas-filter-destination"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value as Destination | 'All')
                }
                className="mt-1.5 min-h-[42px] w-full cursor-pointer rounded-lg border border-[#1E3666] bg-[#080D1C] px-3 py-2 text-sm text-[#E6EDF7]"
              >
                <option value="All">All Worlds</option>
                <option value="Moon">Moon</option>
                <option value="Mars">Mars</option>
              </select>
            </div>

            {/* Category */}
            <div className="lg:col-span-3">
              <label
                htmlFor="atlas-filter-category"
                className="block text-xs font-medium text-[#9FB2D1]"
              >
                Equipment Category
              </label>
              <select
                id="atlas-filter-category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as EquipmentCategory | 'All')
                }
                className="mt-1.5 min-h-[42px] w-full cursor-pointer rounded-lg border border-[#1E3666] bg-[#080D1C] px-3 py-2 text-sm text-[#E6EDF7]"
              >
                <option value="All">All Categories</option>
                <option value="Lander & Descent Stage">
                  Lander &amp; Descent Stage
                </option>
                <option value="Rover">Rover</option>
                <option value="Scientific Package">Scientific Package</option>
              </select>
            </div>

            {/* Preservation Status */}
            <div className="lg:col-span-2">
              <label
                htmlFor="atlas-filter-status"
                className="block text-xs font-medium text-[#9FB2D1]"
              >
                Surface Status
              </label>
              <select
                id="atlas-filter-status"
                value={surfaceStatus}
                onChange={(e) =>
                  setSurfaceStatus(e.target.value as SurfaceStatus | 'All')
                }
                className="mt-1.5 min-h-[42px] w-full cursor-pointer rounded-lg border border-[#1E3666] bg-[#080D1C] px-3 py-2 text-sm text-[#E6EDF7]"
              >
                <option value="All">All Outcomes</option>
                <option value="Intentionally Left Behind">
                  Intentionally Left Behind
                </option>
                <option value="Stopped Operating">Stopped Operating</option>
                <option value="Condition Uncertain">Condition Uncertain</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-[#9FB2D1]">
              Showing{' '}
              <span className="font-mono font-semibold text-[#E6EDF7] tabular-nums">
                {results.length}
              </span>{' '}
              {results.length === 1 ? 'machine profile' : 'machine profiles'}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#20B9C9] transition-colors hover:text-[#E6EDF7]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Grid / Loading / Empty State */}
        {loading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-xl border border-[#1E3666] bg-[#14264A]/30"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#1E3666] bg-[#14264A]/30 p-12 text-center">
            <p className="font-display text-xl font-semibold text-[#E6EDF7]">
              No matching equipment found
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#9FB2D1]">
              Try searching a broader term like “Apollo”, “Mars”, or “Rover”, or
              clear your active filters to browse the full catalog.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
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
