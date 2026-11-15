import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import {
  AppSection,
  EquipmentItem,
  LabTab,
  TimelineEvent
} from '../types/equipment';
import { ResilientImage } from './ResilientImage';
import { StatusIndicator } from './StatusIndicator';
import { MissionStoryReader } from './MissionStoryReader';
import { Equipment3DExplorer } from './Equipment3DExplorer';

interface EquipmentDetailViewProps {
  item: EquipmentItem;
  allItems: EquipmentItem[];
  timelineEvents: TimelineEvent[];
  onBack: (destinationSection: AppSection) => void;
  onSelectEquipment: (id: string) => void;
  onOpenLab?: (tab: LabTab, equipmentId?: string) => void;
}

export function EquipmentDetailView({
  item,
  allItems,
  timelineEvents,
  onBack,
  onSelectEquipment,
  onOpenLab
}: EquipmentDetailViewProps) {
  const [show3DModel, setShow3DModel] = useState(true);

  useEffect(() => {
    setShow3DModel(true);
  }, [item.id]);

  const currentIndex = allItems.findIndex((entry) => entry.id === item.id);
  const prevItem =
    currentIndex > 0 ? allItems[currentIndex - 1] : allItems[allItems.length - 1];
  const nextItem =
    currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : allItems[0];

  const destinationSection: AppSection =
    item.destination === 'Moon' ? 'moon' : 'mars';

  const scrollToStory = () => {
    const el = document.getElementById('explore-mission-story');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openAndScrollTo3D = () => {
    setShow3DModel(true);
    setTimeout(() => {
      const el = document.getElementById('equipment-3d-inspector');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  return (
    <article className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div data-museum-audio="equipment">
          {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onBack(destinationSection)}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-medium text-[#9FB2D1] transition-colors hover:text-[#20B9C9]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to {item.destination} Explorer</span>
          </button>

          <span className="font-mono text-xs text-[#9FB2D1] tabular-nums">
            Archive Record {item.catalogCode}
          </span>
        </div>

        {/* Title & Summary Header */}
        <header className="mt-6 border-b border-[#1E3666] pb-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9FB2D1]">
            <span>{item.destination}</span>
            <span aria-hidden="true">·</span>
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <span>{item.missionName}</span>
          </div>

          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl lg:text-5xl">
            {item.name}
          </h1>

          <div className="mt-4">
            <StatusIndicator status={item.surfaceStatus} />
          </div>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#C5D2E8]">
            {item.shortSummary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToStory}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors duration-150 hover:bg-[#20B9C9] hover:text-[#080D1C]"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Explore the Mission Story (5 Chapters)</span>
            </button>

            <button
              type="button"
              onClick={openAndScrollTo3D}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#20B9C9]/70 bg-[#14264A]/60 px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors duration-150 hover:bg-[#20B9C9] hover:text-[#080D1C]"
            >
              <Box className="h-4 w-4" aria-hidden="true" />
              <span>Inspect Interactive 3D Model</span>
            </button>

            {onOpenLab && (
              <button
                type="button"
                onClick={() => onOpenLab('historian', item.id)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-[#1E3666] bg-[#0D152B] px-4 py-2.5 text-sm font-medium text-[#C5D2E8] transition-colors duration-150 hover:border-[#20B9C9] hover:text-[#20B9C9]"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                <span>Ask AI Historian</span>
              </button>
            )}
          </div>
        </header>

        {/* Main 2-Column Presentation: Visual + Accession Metadata */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <figure className="overflow-hidden rounded-xl border border-[#1E3666] bg-[#14264A]/40">
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#080D1C]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={`${item.name} (${item.missionName})`}
                  fallbackTitle={item.name}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="border-t border-[#1E3666] px-5 py-3.5 text-xs italic text-[#9FB2D1]">
                {item.imageCaption}
              </figcaption>
            </figure>
          </div>

          {/* Museum Accession Metadata Grid */}
          <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6 lg:col-span-5">
            <h2 className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
              Mission &amp; Hardware Specifications
            </h2>
            <dl className="mt-4 divide-y divide-[#1E3666] text-sm">
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Equipment Name</dt>
                <dd className="mt-1 font-medium text-[#E6EDF7]">{item.name}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Mission Name</dt>
                <dd className="mt-1 font-medium text-[#E6EDF7]">
                  {item.missionName}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Destination &amp; Site</dt>
                <dd className="mt-1 font-medium text-[#E6EDF7]">
                  {item.destination} — {item.landingSite}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Launch Date</dt>
                <dd className="mt-1 font-mono text-xs text-[#E6EDF7] tabular-nums">
                  {item.launchDate}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Landing Date</dt>
                <dd className="mt-1 font-mono text-xs text-[#E6EDF7] tabular-nums">
                  {item.landingDate}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Mission Duration</dt>
                <dd className="mt-1 font-mono text-xs text-[#E6EDF7] tabular-nums">
                  {item.missionDuration}
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-[#9FB2D1]">Surface Verification</dt>
                <dd className="mt-1 font-medium text-[#E6EDF7]">
                  {item.surfacePresence}
                </dd>
              </div>
              <div className="pt-3">
                <dt className="text-xs text-[#9FB2D1]">Final Mission Status</dt>
                <dd className="mt-1 text-[#E6EDF7]">{item.finalStatusSummary}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Interactive Three.js 3D Hardware Inspector */}
        <div id="equipment-3d-inspector" className="mt-10 scroll-mt-24">
          {show3DModel ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShow3DModel(false)}
                  className="cursor-pointer text-xs font-medium text-[#9FB2D1] hover:text-[#20B9C9]"
                >
                  Hide 3D Viewport
                </button>
              </div>
              <Equipment3DExplorer
                items={allItems}
                initialEquipmentId={item.id}
                allowEquipmentSwitch={false}
              />
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-xs text-[#20B9C9]">
                  Three.js Interactive Hardware Visualization
                </p>
                <h2 className="mt-1 font-display text-lg font-semibold text-[#E6EDF7]">
                  Explore {item.name} in 3D ({item.destination} Surface)
                </h2>
                <p className="mt-1 text-sm text-[#9FB2D1]">
                  Orbit an illustrative procedural 3D model, inspect subsystem
                  callouts, and examine key hardware components.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShow3DModel(true)}
                className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <Box className="h-4 w-4" aria-hidden="true" />
                <span>Launch 3D Explorer</span>
              </button>
            </div>
          )}
        </div>
        </div>

        {/* Guided 5-Chapter Storytelling Experience */}
        <div data-museum-audio="history">
          <MissionStoryReader
            key={item.id}
            item={item}
            timelineEvents={timelineEvents}
          />
        </div>

        {/* Narrative & Scientific Breakdown */}
        <div data-museum-audio="history" className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <section>
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Historical Background
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {item.historicalBackground}
              </p>
            </section>

            <section className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Scientific Purpose
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {item.scientificPurpose}
              </p>
            </section>

            <section className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Important Discoveries
              </h2>
              <ul className="mt-4 space-y-3">
                {item.importantDiscoveries.map((discovery, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-base leading-relaxed text-[#C5D2E8]"
                  >
                    <span className="mt-1 font-mono text-xs text-[#20B9C9] tabular-nums">
                      0{index + 1}.
                    </span>
                    <span>{discovery}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                What Remains on the Planetary Surface
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {item.whatRemainsOnSurface}
              </p>

              <h3 className="mt-6 font-display text-lg font-semibold text-[#E6EDF7]">
                Intentionally Discarded &amp; Detached Subsystems
              </h3>
              <p className="mt-2 max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {item.discardedComponents}
              </p>
            </section>

            <section className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Why This Equipment Matters Today
              </h2>
              <p className="mt-3 max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {item.whyItMattersToday}
              </p>
            </section>
          </div>

          {/* Right Sidebar: Status Clarification, Uncertainties & Official NASA Citations */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                Preservation Assessment
              </p>
              <div className="mt-3">
                <StatusIndicator status={item.surfaceStatus} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#C5D2E8]">
                {item.statusClarification}
              </p>
              <div className="mt-4 border-t border-[#1E3666] pt-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[#F5B041]">
                  Remaining Uncertainties
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#C5D2E8]">
                  {item.uncertainties}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                Official NASA Sources
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#9FB2D1]">
                Verify dates, mission logs, and orbital photography directly in
                NASA’s public archives:
              </p>
              <ul className="mt-4 space-y-3">
                {item.nasaSources.map((src) => (
                  <li key={src.url}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-3 rounded-lg border border-[#1E3666] bg-[#0D152B] p-3 text-sm text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                    >
                      <div>
                        <p className="font-medium leading-snug">{src.label}</p>
                        <p className="mt-1 font-mono text-xs text-[#9FB2D1]">
                          {src.source}
                        </p>
                      </div>
                      <ExternalLink
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Bottom Prev/Next Navigation */}
        <nav
          aria-label="Adjacent Equipment Profiles"
          className="mt-14 flex flex-col justify-between gap-4 border-t border-[#1E3666] pt-8 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => onSelectEquipment(prevItem.id)}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1E3666] bg-[#14264A]/35 px-5 py-4 text-left transition-colors hover:border-[#20B9C9]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-[#20B9C9]" aria-hidden="true" />
            <div>
              <p className="text-xs text-[#9FB2D1]">Previous Profile</p>
              <p className="font-display text-sm font-semibold text-[#E6EDF7]">
                {prevItem.name}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectEquipment(nextItem.id)}
            className="flex cursor-pointer items-center justify-end gap-3 rounded-xl border border-[#1E3666] bg-[#14264A]/35 px-5 py-4 text-right transition-colors hover:border-[#20B9C9]"
          >
            <div>
              <p className="text-xs text-[#9FB2D1]">Next Profile</p>
              <p className="font-display text-sm font-semibold text-[#E6EDF7]">
                {nextItem.name}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#20B9C9]" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </article>
  );
}
