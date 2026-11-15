import {
  ArrowRight,
  Box,
  Clock,
  Compass,
  HelpCircle,
  MessageSquare,
  Scale,
  Search
} from 'lucide-react';
import { AppSection, EquipmentItem, LabTab } from '../types/equipment';
import { EquipmentCard } from './EquipmentCard';
import { ResilientImage } from './ResilientImage';
import { calculateAtlasSummaryStats } from '../services/atlasService';

interface HomeViewProps {
  allCatalog: EquipmentItem[];
  featuredEquipment: EquipmentItem[];
  onNavigate: (section: AppSection) => void;
  onSelectEquipment: (id: string) => void;
  onOpenLab: (tab: LabTab, equipmentId?: string) => void;
}

export function HomeView({
  allCatalog,
  featuredEquipment,
  onNavigate,
  onSelectEquipment,
  onOpenLab
}: HomeViewProps) {
  const stats = calculateAtlasSummaryStats(allCatalog);

  return (
    <div>
      {/* Hero Section */}
      <section
        data-museum-theme="default"
        data-museum-audio="mission-control"
        className="border-b border-[var(--museum-border)] py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
                2026 NASA Space Apps Challenge · Team ALPHA Explorers
              </p>

              <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight text-[#E6EDF7] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Forgotten Machines Atlas
              </h1>

              <p className="mt-3 font-display text-xl font-medium text-[#9FB2D1] sm:text-2xl">
                The Machines That Made History
              </p>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#C5D2E8]">
                Across the grey plains of the Moon and the iron-oxide deserts of
                Mars rest the robotic scouts, electric rovers, scientific
                observatories, and descent stages that expanded human knowledge.
                Explore why NASA sent them, what they discovered, and what
                remains on the planetary surface today.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('moon')}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-lg bg-[#2463C5] px-6 py-3 text-sm font-semibold text-[#E6EDF7] transition-colors duration-150 hover:bg-[#20B9C9] hover:text-[#080D1C]"
                >
                  <span>Explore the Moon</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('mars')}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-lg border border-[#20B9C9]/70 bg-[#14264A]/60 px-6 py-3 text-sm font-semibold text-[#E6EDF7] transition-colors duration-150 hover:bg-[#20B9C9] hover:text-[#080D1C]"
                >
                  <span>Explore Mars</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-[#9FB2D1]">
                <button
                  type="button"
                  onClick={() => onNavigate('timeline')}
                  className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-[#20B9C9]"
                >
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>View Mission Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('search')}
                  className="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-[#20B9C9]"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Filter Full Equipment Catalog</span>
                </button>
              </div>
            </div>

            {/* Hero Artwork Frame */}
            <div className="flex lg:col-span-6">
              <figure className="flex w-full flex-col overflow-hidden rounded-xl border border-[#1E3666] bg-[#14264A]/40">
                <div className="relative min-h-[280px] flex-1 overflow-hidden bg-[#080D1C]">
                  <ResilientImage
                    src="/images/hero_atlas_horizon.jpg"
                    alt="Apollo Lunar Module descent stage on lunar terrain and a Mars exploration rover on a distant Martian ridge under deep starry cosmos"
                    fallbackTitle="Moon and Mars Historic Hardware Panorama"
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1C]/75 via-transparent to-transparent"
                  />
                </div>
                <figcaption className="border-t border-[#1E3666] px-5 py-3 text-xs text-[#9FB2D1]">
                  Editorial composite: Historic Apollo lunar surface hardware and
                  Martian robotic scouts documented across two worlds.
                </figcaption>
              </figure>
            </div>
          </div>

          {/* Dynamically Computed Catalog Summary Strip */}
          <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#1E3666] bg-[#1E3666] lg:grid-cols-4">
            <div className="bg-[#0D152B] p-5 sm:p-6">
              <p className="text-xs font-medium text-[#9FB2D1]">
                Verified Catalog Profiles
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[#E6EDF7] tabular-nums">
                {stats.total}
              </p>
              <p className="mt-1 font-mono text-xs text-[#9FB2D1] tabular-nums">
                {stats.moonCount} Moon · {stats.marsCount} Mars
              </p>
            </div>

            <div className="bg-[#0D152B] p-5 sm:p-6">
              <p className="text-xs font-medium text-[#9FB2D1]">
                Intentionally Left Behind
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[#7AA7F7] tabular-nums">
                {stats.leftBehindCount}
              </p>
              <p className="mt-1 text-xs text-[#9FB2D1]">
                Single-use descent bases &amp; parked rovers
              </p>
            </div>

            <div className="bg-[#0D152B] p-5 sm:p-6">
              <p className="text-xs font-medium text-[#9FB2D1]">
                Stopped Operating on Surface
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[#20B9C9] tabular-nums">
                {stats.stoppedOperatingCount}
              </p>
              <p className="mt-1 text-xs text-[#9FB2D1]">
                Confirmed stationary via orbital imaging
              </p>
            </div>

            <div className="bg-[#0D152B] p-5 sm:p-6">
              <p className="text-xs font-medium text-[#9FB2D1]">
                Physical Condition Uncertain
              </p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[#F5B041] tabular-nums">
                {stats.conditionUncertainCount}
              </p>
              <p className="mt-1 text-xs text-[#9FB2D1]">
                Unverified modern hardware integrity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Historic Space Equipment Matters */}
      <section
        data-museum-theme="default"
        data-museum-audio="history"
        className="border-b border-[var(--museum-border)] py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
                Planetary Heritage &amp; Engineering Context
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#E6EDF7]">
                Why Historic Space Equipment Matters
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#C5D2E8]">
                When missions conclude, spacecraft do not return home. Every
                landing leg, solar wing, and scientific instrument left behind
                marks a turning point in how humanity learned to navigate,
                survive, and do science beyond Earth.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-7">
              <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
                <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                  01. Living Engineering Archives
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#C5D2E8]">
                  Exposed to vacuum, radiation, and severe thermal swings for
                  decades, off-world hardware reveals how metals, optics, and
                  electronics age outside Earth’s atmosphere.
                </p>
              </div>

              <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
                <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                  02. Honest Surface Accounting
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#C5D2E8]">
                  This atlas distinguishes hardware intentionally left behind
                  from spacecraft that stopped operating—and flags missions
                  whose modern physical condition remains uncertain.
                </p>
              </div>

              <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
                <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                  03. Blueprints for Future Exploration
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#C5D2E8]">
                  From Surveyor’s soil tests to Opportunity’s marathon
                  traverses, these retired machines provide the engineering DNA
                  behind Artemis and future Mars sample missions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D & AI Exploration Suite */}
      <section
        data-museum-theme="default"
        data-museum-audio="equipment"
        className="border-b border-[var(--museum-border)] py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
                Interactive Research Tools
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#E6EDF7]">
                3D &amp; AI Exploration Lab
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenLab('3d-explorer')}
              className="inline-flex cursor-pointer items-center gap-2 self-start text-sm font-medium text-[#20B9C9] transition-colors hover:text-[#E6EDF7] sm:self-auto"
            >
              <span>Open Full 3D &amp; AI Lab</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => onOpenLab('3d-explorer', 'apollo-lm-descent-stages')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6 text-left transition-colors hover:border-[#20B9C9]"
            >
              <div>
                <Box className="h-5 w-5 text-[#20B9C9]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold text-[#E6EDF7]">
                  3D Equipment Explorer
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Rotate, zoom, and inspect illustrative procedural 3D models of
                  all 10 Moon and Mars machines with subsystem callouts.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#20B9C9]">
                <span>Inspect 3D Models</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLab('historian')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6 text-left transition-colors hover:border-[#20B9C9]"
            >
              <div>
                <MessageSquare className="h-5 w-5 text-[#20B9C9]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold text-[#E6EDF7]">
                  AI Space Historian
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Ask questions about discoveries, mission endings, and surface
                  uncertainties grounded strictly in NASA archive records.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#20B9C9]">
                <span>Ask Historian</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLab('compare')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6 text-left transition-colors hover:border-[#20B9C9]"
            >
              <div>
                <Scale className="h-5 w-5 text-[#20B9C9]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold text-[#E6EDF7]">
                  AI Mission Comparison
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Compare any two Moon or Mars machines across objectives, dates,
                  durations, science, and outcomes.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#20B9C9]">
                <span>Compare Missions</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLab('quiz')}
              className="flex cursor-pointer flex-col justify-between rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6 text-left transition-colors hover:border-[#20B9C9]"
            >
              <div>
                <HelpCircle className="h-5 w-5 text-[#20B9C9]" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-semibold text-[#E6EDF7]">
                  AI Knowledge Quiz
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Challenge yourself across Beginner, Intermediate, and Advanced
                  tiers with verified explanations and score tracking.
                </p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#20B9C9]">
                <span>Take Quiz</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Scroll-Aware Planetary Museum Exhibition Wings */}
      <section className="border-b border-[var(--museum-border)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-mono text-xs tracking-wider text-[var(--museum-accent)]">
              Context-Aware Museum Galleries
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#E6EDF7]">
              Planetary Exhibition Wings
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#C5D2E8]">
              Scroll through each wing below—or enter any gallery directly—to
              transition between the interactive 3D Moon, 3D Mars, and
              Astronomical Timeline environments.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Wing 1: Lunar Heritage */}
            <div
              data-museum-theme="lunar"
              className="flex flex-col justify-between gap-6 rounded-xl border border-[#2A3B61] bg-[#0E1629]/85 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-wider text-[#7CC6FE]">
                  Wing 01 · Lunar Heritage Museum · {stats.moonCount} Documented Profiles
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#E6EDF7]">
                  The Moon: Surveyor, Apollo &amp; ALSEP Stations
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Inspect robotic lunar soil pioneers, six Apollo Lunar Module
                  descent stages, three electric Lunar Roving Vehicles, and five
                  nuclear-powered ALSEP surface science arrays.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('moon')}
                className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#7CC6FE] hover:text-[#070B16]"
              >
                <span>Enter Moon Wing</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Wing 2: Mars Exploration */}
            <div
              data-museum-theme="mars"
              className="flex flex-col justify-between gap-6 rounded-xl border border-[#522922] bg-[#1C1111]/85 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-wider text-[#EB7D4B]">
                  Wing 02 · Mars Exploration Museum · {stats.marsCount} Documented Profiles
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#E6EDF7]">
                  Mars: Viking Landers, Sojourner, Spirit &amp; Opportunity
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Explore the stationary nuclear-powered Viking landers of 1976,
                  humanity’s first Mars rover Sojourner, and the long-duration
                  solar-powered Mars Exploration Rovers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('mars')}
                className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-[#A94422] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#EB7D4B] hover:text-[#120A0A]"
              >
                <span>Enter Mars Wing</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Wing 3: Astronomical Timeline */}
            <div
              data-museum-theme="timeline"
              className="flex flex-col justify-between gap-6 rounded-xl border border-[#1F356B] bg-[#0C1329]/85 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <div className="max-w-2xl">
                <p className="font-mono text-xs tracking-wider text-[#F5B041]">
                  Wing 03 · Chronological Observatory · 1966–2019
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#E6EDF7]">
                  Astronomical Mission Timeline &amp; Orbital Connections
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  Follow five decades of verified landings, Apollo 12’s return
                  visit to Surveyor 3, and the final surface transmissions that
                  connected robotic scouts to human exploration.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('timeline')}
                className="inline-flex min-h-[44px] shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-[#F5B041]/70 bg-[#14264A]/70 px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#F5B041] hover:text-[#060A18]"
              >
                <span>Open Timeline Wing</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Featured Missions */}
      <section
        data-museum-theme="default"
        data-museum-audio="equipment"
        className="py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
                Curated Highlights
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#E6EDF7]">
                Selected Featured Machines
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="inline-flex cursor-pointer items-center gap-2 self-start text-sm font-medium text-[#20B9C9] transition-colors hover:text-[#E6EDF7] sm:self-auto"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Browse All {stats.total} Profiles</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onSelect={onSelectEquipment}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
