import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { EquipmentItem, TimelineEvent } from '../types/equipment';
import { buildMissionStoryChapters } from '../utils/storyBuilder';
import { ResilientImage } from './ResilientImage';
import { StatusIndicator } from './StatusIndicator';

interface MissionStoryReaderProps {
  item: EquipmentItem;
  timelineEvents: TimelineEvent[];
}

export function MissionStoryReader({
  item,
  timelineEvents
}: MissionStoryReaderProps) {
  const chapters = useMemo(
    () => buildMissionStoryChapters(item, timelineEvents),
    [item, timelineEvents]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const currentChapter = chapters[activeIndex] ?? chapters[0];
  const progressPercent = Math.round(
    ((activeIndex + 1) / chapters.length) * 100
  );

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => Math.min(chapters.length - 1, prev + 1));
  };

  return (
    <section
      id="explore-mission-story"
      aria-labelledby="mission-story-heading"
      className="mt-12 rounded-xl border border-[#1E3666] bg-[#0D152B]/90 p-5 sm:p-8"
    >
      {/* Section Header & Progress Readout */}
      <div className="flex flex-col gap-4 border-b border-[#1E3666] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Explore the Mission Story</span>
          </div>
          <h2
            id="mission-story-heading"
            className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#E6EDF7] sm:text-3xl"
          >
            {item.name}: Guided Chapter Walkthrough
          </h2>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="font-mono text-xs text-[#9FB2D1] tabular-nums">
            Chapter {currentChapter.number} of {chapters.length} ·{' '}
            {progressPercent}% Complete
          </p>
          <div
            role="progressbar"
            aria-label="Mission story reading progress"
            aria-valuenow={currentChapter.number}
            aria-valuemin={1}
            aria-valuemax={chapters.length}
            className="mt-2 h-1.5 w-44 overflow-hidden rounded-full bg-[#14264A] sm:ml-auto"
          >
            <div
              className="h-full bg-[#20B9C9] transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive 5-Chapter Selector Bar */}
      <nav
        aria-label="Story Chapters"
        className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      >
        {chapters.map((chapter, idx) => {
          const isActive = idx === activeIndex;
          const isCompleted = idx < activeIndex;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-current={isActive ? 'step' : undefined}
              className={`flex min-h-[44px] cursor-pointer flex-col items-start justify-center rounded-lg border px-3.5 py-2.5 text-left transition-colors duration-150 ${
                isActive
                  ? 'border-[#20B9C9] bg-[#14264A] text-[#E6EDF7]'
                  : isCompleted
                    ? 'border-[#2463C5]/50 bg-[#14264A]/35 text-[#C5D2E8] hover:border-[#20B9C9]/70'
                    : 'border-[#1E3666] bg-[#080D1C]/60 text-[#9FB2D1] hover:border-[#2463C5]/60 hover:text-[#E6EDF7]'
              }`}
            >
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  isActive ? 'text-[#20B9C9]' : 'text-[#9FB2D1]'
                }`}
              >
                0{chapter.number}
              </span>
              <span className="mt-0.5 line-clamp-1 text-xs font-semibold">
                {chapter.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Active Chapter Reading Stage */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left/Main Story Content */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9] tabular-nums">
              Chapter 0{currentChapter.number} — {currentChapter.subtitle}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#E6EDF7] sm:text-3xl">
              {currentChapter.title}
            </h3>

            {/* Educational Explanation vs Verified Facts Distinction */}
            <div className="mt-5 rounded-lg border border-[#2463C5]/40 bg-[#14264A]/40 px-4 py-3.5">
              <p className="text-sm leading-relaxed text-[#E6EDF7]">
                {currentChapter.educationalIntro}
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <p className="max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                {currentChapter.primaryNarrative}
              </p>
              {currentChapter.secondaryNarrative && (
                <p className="max-w-prose text-base leading-relaxed text-[#C5D2E8]">
                  {currentChapter.secondaryNarrative}
                </p>
              )}
            </div>

            {/* Verified Historical Facts Table */}
            <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#080D1C]/70 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                {currentChapter.factsHeading}
              </p>

              {currentChapter.id === 'final' && (
                <div className="mt-3">
                  <StatusIndicator status={item.surfaceStatus} />
                </div>
              )}

              <dl className="mt-3 divide-y divide-[#1E3666] text-sm">
                {currentChapter.verifiedFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <dt className="shrink-0 text-xs text-[#9FB2D1]">
                      {fact.label}
                    </dt>
                    <dd
                      className={`text-left text-[#E6EDF7] sm:text-right ${
                        fact.mono ? 'font-mono text-xs tabular-nums' : 'font-medium'
                      }`}
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {currentChapter.verifiedBullets &&
                currentChapter.bulletHeading && (
                  <div className="mt-4 border-t border-[#1E3666] pt-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                      {currentChapter.bulletHeading}
                    </p>
                    <ul className="mt-3 space-y-2.5">
                      {currentChapter.verifiedBullets.map((entry, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-[#C5D2E8]"
                        >
                          <span className="mt-0.5 font-mono text-xs text-[#20B9C9] tabular-nums">
                            0{idx + 1}.
                          </span>
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {currentChapter.uncertaintyNote && (
                <div className="mt-4 border-t border-[#1E3666] pt-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#F5B041]">
                    Preserved Scientific Uncertainty
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#C5D2E8]">
                    {currentChapter.uncertaintyNote}
                  </p>
                </div>
              )}

              {currentChapter.includeNasaLinks && (
                <div className="mt-4 border-t border-[#1E3666] pt-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                    Verified NASA Sources
                  </p>
                  <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {item.nasaSources.map((src) => (
                      <li key={src.url}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 rounded-lg border border-[#1E3666] bg-[#14264A]/45 px-3 py-2.5 text-xs font-medium text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                        >
                          <span className="truncate">{src.label}</span>
                          <ExternalLink
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Archival Photography Column */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <figure className="overflow-hidden rounded-xl border border-[#1E3666] bg-[#080D1C]">
            <div className="aspect-[4/3] w-full overflow-hidden">
              <ResilientImage
                src={item.imageUrl}
                alt={`${item.name} — ${currentChapter.title}`}
                fallbackTitle={item.name}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="border-t border-[#1E3666] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#20B9C9]">
                Chapter 0{currentChapter.number} Archival Plate
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#C5D2E8]">
                {currentChapter.photoNote}
              </p>
            </figcaption>
          </figure>

          {/* Chapter Navigation Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E3666] pt-5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={`inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                activeIndex === 0
                  ? 'cursor-not-allowed border-[#1E3666]/50 bg-[#080D1C]/40 text-[#9FB2D1]/40'
                  : 'cursor-pointer border-[#1E3666] bg-[#14264A]/50 text-[#E6EDF7] hover:border-[#20B9C9] hover:text-[#20B9C9]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Previous Chapter</span>
            </button>

            {activeIndex < chapters.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#2463C5] px-5 py-2 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <span>Next Chapter</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveIndex(0)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#20B9C9]/70 bg-[#14264A]/60 px-4 py-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Restart Story</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
