import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { GlossaryCategory, GlossaryTerm } from '../types/equipment';
import { fetchSpaceGlossary } from '../services/atlasService';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (id: string) => void;
}

const STORAGE_KEY_QUERY = 'fma_glossary_query';
const STORAGE_KEY_CAT = 'fma_glossary_category';
const STORAGE_KEY_TERM = 'fma_glossary_term';

function readStoredValue(key: string, fallback: string): string {
  try {
    return window.sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage unavailability
  }
}

const CATEGORIES: (GlossaryCategory | 'All')[] = [
  'All',
  'Spacecraft & Propulsion',
  'Planetary Geology',
  'Instruments & Operations'
];

export function GlossaryModal({
  isOpen,
  onClose,
  onSelectEquipment
}: GlossaryModalProps) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState(() => readStoredValue(STORAGE_KEY_QUERY, ''));
  const [category, setCategory] = useState<GlossaryCategory | 'All'>(
    () => readStoredValue(STORAGE_KEY_CAT, 'All') as GlossaryCategory | 'All'
  );
  const [selectedId, setSelectedId] = useState<string>(() =>
    readStoredValue(STORAGE_KEY_TERM, '')
  );

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    fetchSpaceGlossary()
      .then((data) => {
        if (active) {
          setTerms(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load NASA space glossary.'
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeStoredValue(STORAGE_KEY_QUERY, query);
  }, [query]);

  useEffect(() => {
    writeStoredValue(STORAGE_KEY_CAT, category);
  }, [category]);

  useEffect(() => {
    if (selectedId) {
      writeStoredValue(STORAGE_KEY_TERM, selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((item) => {
      const catMatch = category === 'All' || item.category === category;
      if (!catMatch) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        item.term.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.atlasContext.toLowerCase().includes(q) ||
        item.relatedEquipment.some((eq) => eq.name.toLowerCase().includes(q))
      );
    });
  }, [terms, query, category]);

  const activeTerm = useMemo(() => {
    if (filteredTerms.length === 0) {
      return null;
    }
    return (
      filteredTerms.find((item) => item.id === selectedId) ?? filteredTerms[0]
    );
  }, [filteredTerms, selectedId]);

  const handleReset = () => {
    setQuery('');
    setCategory('All');
    if (terms.length > 0) {
      setSelectedId(terms[0].id);
    }
  };

  const handleNavigateToEquipment = (id: string) => {
    onClose();
    onSelectEquipment(id);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040711]/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#2463C5]/50 bg-[#080D1C] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#1E3666] bg-[#0D152B] px-5 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>NASA Educational Reference</span>
            </div>
            <h2
              id="glossary-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#E6EDF7] sm:text-2xl"
            >
              Space Exploration Glossary
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close glossary modal"
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#1E3666] bg-[#14264A]/60 text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Search & Category Controls */}
        <div className="border-b border-[#1E3666] bg-[#0D152B]/60 px-5 py-4 sm:px-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9FB2D1]"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Look up a technical term (e.g., regolith, sol, RTG, aeroshell)..."
              aria-label="Search glossary terms"
              className="min-h-[42px] w-full rounded-lg border border-[#1E3666] bg-[#080D1C] py-2 pr-9 pl-10 text-sm text-[#E6EDF7] placeholder-[#9FB2D1]/60 focus:border-[#20B9C9]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear glossary search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-1 text-[#9FB2D1] hover:text-[#E6EDF7]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#2463C5] text-[#E6EDF7]'
                        : 'border border-[#1E3666] bg-[#080D1C]/60 text-[#9FB2D1] hover:text-[#E6EDF7]'
                    }`}
                  >
                    {cat === 'All' ? 'All Terms' : cat}
                  </button>
                );
              })}
            </div>

            <p className="font-mono text-xs text-[#9FB2D1] tabular-nums">
              {filteredTerms.length}{' '}
              {filteredTerms.length === 1 ? 'term' : 'terms'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="h-56 animate-pulse rounded-lg bg-[#14264A]/35 md:col-span-5" />
              <div className="h-56 animate-pulse rounded-lg bg-[#14264A]/35 md:col-span-7" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-8 text-center">
              <p className="font-display text-lg font-semibold text-[#E6EDF7]">
                Unable to Load Space Glossary
              </p>
              <p className="mt-2 text-sm text-[#9FB2D1]">{error}</p>
            </div>
          ) : filteredTerms.length === 0 ? (
            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/30 p-10 text-center">
              <p className="font-display text-lg font-semibold text-[#E6EDF7]">
                No glossary terms match “{query}”
              </p>
              <p className="mt-2 text-sm text-[#9FB2D1]">
                Try searching a broader keyword such as regolith, Mars, Apollo,
                or reset your filters.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-5 inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Reset Search</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Term Selector Column */}
              <div className="md:col-span-5">
                <ul
                  aria-label="Glossary Terms List"
                  className="max-h-[42vh] space-y-1.5 overflow-y-auto pr-1 md:max-h-[48vh]"
                >
                  {filteredTerms.map((item) => {
                    const isSelected = activeTerm?.id === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(item.id)}
                          className={`w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                            isSelected
                              ? 'border-[#20B9C9] bg-[#14264A] text-[#E6EDF7]'
                              : 'border-[#1E3666]/80 bg-[#0D152B]/60 text-[#C5D2E8] hover:border-[#2463C5] hover:text-[#E6EDF7]'
                          }`}
                        >
                          <p className="text-sm font-semibold leading-snug">
                            {item.term}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#9FB2D1]">
                            {item.category}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Active Term Definition Card */}
              {activeTerm && (
                <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-5 sm:p-6 md:col-span-7">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                    {activeTerm.category}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold text-[#E6EDF7]">
                    {activeTerm.term}
                  </h3>

                  <div className="mt-4 border-t border-[#1E3666] pt-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                      NASA Glossary Definition
                    </p>
                    <p className="mt-2 text-base leading-relaxed text-[#E6EDF7]">
                      {activeTerm.definition}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#1E3666] pt-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                      Where It Appears in the Atlas
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                      {activeTerm.atlasContext}
                    </p>

                    {activeTerm.relatedEquipment.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeTerm.relatedEquipment.map((eq) => (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => handleNavigateToEquipment(eq.id)}
                            className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#2463C5]/60 bg-[#0D152B] px-3 py-1.5 text-xs font-medium text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                          >
                            <span>{eq.name}</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-[#1E3666] pt-4">
                    <a
                      href={activeTerm.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#20B9C9] transition-colors hover:text-[#E6EDF7]"
                    >
                      <span>Source: {activeTerm.sourceLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
