import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpDown, Link2 } from 'lucide-react';
import { Destination, EquipmentItem, TimelineEvent } from '../types/equipment';
import {
  fetchEquipmentCatalog,
  fetchTimelineEvents
} from '../services/atlasService';

interface TimelineViewProps {
  onSelectEquipment: (id: string) => void;
}

export function TimelineView({ onSelectEquipment }: TimelineViewProps) {
  const [destinationFilter, setDestinationFilter] = useState<
    Destination | 'All'
  >('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [catalogMap, setCatalogMap] = useState<Record<string, EquipmentItem>>(
    {}
  );
  const [highlightedEquipmentId, setHighlightedEquipmentId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchEquipmentCatalog().then((items) => {
      if (!active) return;
      const map: Record<string, EquipmentItem> = {};
      for (const item of items) {
        map[item.id] = item;
      }
      setCatalogMap(map);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTimelineEvents(destinationFilter, sortOrder).then((data) => {
      if (active) {
        setEvents(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [destinationFilter, sortOrder]);

  const linkedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of events) {
      counts[ev.equipmentId] = (counts[ev.equipmentId] || 0) + 1;
    }
    return counts;
  }, [events]);

  return (
    <section data-museum-theme="timeline" className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--museum-border)] pb-8">
          <p className="font-mono text-xs tracking-wider text-[#F5B041]">
            Astronomical Timeline Wing · Chronological Surface History (1966–2019)
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl lg:text-5xl">
            Interactive Mission Timeline
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C5D2E8]">
            Trace the milestones that placed robotic scouts, electric vehicles,
            and long-lived observatories onto the Moon and Mars—from Surveyor 1’s
            1966 touchdown to Opportunity’s final transmission.
          </p>

          {/* Subtle Orbital Era Trajectory Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#9FB2D1]">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#20B9C9]"
              />
              <span>Lunar Trajectory Milestones</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#F5B041]"
              />
              <span>Mars Trajectory Milestones</span>
            </span>
            <span className="text-[#7AA7F7]">
              Hover or select a milestone to trace linked hardware profiles
            </span>
          </div>

          {/* Working Timeline Filter & Sort Controls */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-[var(--museum-border)] bg-[var(--museum-surface)] p-1">
              {(['All', 'Moon', 'Mars'] as const).map((filter) => {
                const isActive = destinationFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setDestinationFilter(filter)}
                    className={`cursor-pointer whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#2463C5] text-[#E6EDF7]'
                        : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
                    }`}
                  >
                    {filter === 'All' ? 'All Missions' : filter}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
              className="inline-flex min-h-[38px] w-fit cursor-pointer items-center gap-2 rounded-lg border border-[var(--museum-border)] bg-[var(--museum-surface)] px-3.5 py-1.5 text-xs font-medium text-[#E6EDF7] transition-colors hover:border-[#F5B041]"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-[#F5B041]" aria-hidden="true" />
              <span>
                {sortOrder === 'asc'
                  ? 'Order: Chronological (1966 → 2019)'
                  : 'Order: Most Recent First (2019 → 1966)'}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 animate-pulse rounded-xl border border-[var(--museum-border)] bg-[var(--museum-surface)]/50"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[var(--museum-border)] bg-[var(--museum-surface)]/70 p-8 text-center">
            <p className="text-base font-medium text-[#E6EDF7]">
              No timeline events available for this filter.
            </p>
          </div>
        ) : (
          <ol className="relative mt-10 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-[#1F356B] sm:before:left-6">
            {events.map((event) => {
              const linkedEquipment = catalogMap[event.equipmentId];
              const isHighlighted =
                highlightedEquipmentId === event.equipmentId;
              const sharedCount = linkedCounts[event.equipmentId] || 1;

              return (
                <li
                  key={event.id}
                  onMouseEnter={() =>
                    setHighlightedEquipmentId(event.equipmentId)
                  }
                  onMouseLeave={() => setHighlightedEquipmentId(null)}
                  className="relative pl-11 sm:pl-16"
                >
                  {/* Timeline node marker */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-6 left-[11px] h-2.5 w-2.5 rounded-full border-2 border-[#060A18] transition-transform sm:left-[19px] ${
                      isHighlighted ? 'scale-125' : ''
                    } ${
                      event.destination === 'Moon'
                        ? 'bg-[#20B9C9]'
                        : 'bg-[#F5B041]'
                    }`}
                  />

                  <div
                    className={`rounded-xl border p-5 transition-colors sm:p-6 ${
                      isHighlighted
                        ? 'border-[#20B9C9] bg-[#111D40]/90'
                        : 'border-[var(--museum-border)] bg-[var(--museum-surface)]/85 hover:border-[#20B9C9]/60'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-medium text-[#20B9C9] tabular-nums">
                        {event.dateLabel}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#9FB2D1]">
                        <span>{event.destination}</span>
                        <span aria-hidden="true">·</span>
                        <span>{event.missionName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{event.eventCategory}</span>
                      </div>
                    </div>

                    <h2 className="mt-2 font-display text-xl font-semibold text-[#E6EDF7]">
                      {event.title}
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                      {event.summary}
                    </p>

                    {/* Subtle Mission-to-Equipment Archive Connection */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--museum-border)]/70 pt-3">
                      {linkedEquipment ? (
                        <span className="inline-flex items-center gap-2 font-mono text-xs text-[#9FB2D1]">
                          <Link2
                            className="h-3.5 w-3.5 text-[#F5B041]"
                            aria-hidden="true"
                          />
                          <span>
                            {linkedEquipment.catalogCode} · {linkedEquipment.name}
                            {sharedCount > 1
                              ? ` (${sharedCount} linked milestones)`
                              : ''}
                          </span>
                        </span>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectEquipment(event.equipmentId)}
                        className="inline-flex min-h-[38px] cursor-pointer items-center gap-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:text-[#20B9C9]"
                      >
                        <span>Open Equipment Profile</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
