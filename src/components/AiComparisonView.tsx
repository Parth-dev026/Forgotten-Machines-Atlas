import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  ExternalLink,
  Scale
} from 'lucide-react';
import { ComparisonApiResponse, EquipmentItem } from '../types/equipment';
import { compareMissionsWithAi } from '../services/aiService';
import { StatusIndicator } from './StatusIndicator';

interface AiComparisonViewProps {
  items: EquipmentItem[];
  onSelectEquipment: (id: string) => void;
}

const PRESET_PAIRINGS: { label: string; firstId: string; secondId: string }[] = [
  {
    label: 'Spirit vs. Opportunity',
    firstId: 'spirit-rover',
    secondId: 'opportunity-rover'
  },
  {
    label: 'Lunar Roving Vehicles vs. Sojourner',
    firstId: 'lunar-roving-vehicles',
    secondId: 'sojourner-rover'
  },
  {
    label: 'Surveyor 1 vs. Surveyor 3',
    firstId: 'surveyor-1',
    secondId: 'surveyor-3'
  },
  {
    label: 'Apollo LM Descent vs. Viking 1',
    firstId: 'apollo-lm-descent-stages',
    secondId: 'viking-1-lander'
  }
];

export function AiComparisonView({
  items,
  onSelectEquipment
}: AiComparisonViewProps) {
  const [firstId, setFirstId] = useState(
    items[0]?.id || 'apollo-lm-descent-stages'
  );
  const [secondId, setSecondId] = useState(
    items.find((i) => i.id === 'viking-1-lander')?.id ||
      items[1]?.id ||
      'viking-1-lander'
  );
  const [result, setResult] = useState<ComparisonApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async (idA: string, idB: string) => {
    if (!idA || !idB || loading) return;
    if (idA === idB) {
      setError('Select two different equipment profiles to compare.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await compareMissionsWithAi({
        firstId: idA,
        secondId: idB
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate mission comparison.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFirstId(secondId);
    setSecondId(firstId);
  };

  const sectionCards = result
    ? [
        {
          title: 'Mission Objectives',
          data: result.comparison.missionObjectives
        },
        {
          title: 'Launch & Landing Dates',
          data: result.comparison.datesAndTimeline
        },
        {
          title: 'Operational Duration',
          data: result.comparison.operationalDuration
        },
        {
          title: 'Scientific Contributions',
          data: result.comparison.scientificContributions
        },
        {
          title: 'Mission Outcomes',
          data: result.comparison.missionOutcomes
        }
      ]
    : [];

  return (
    <section className="rounded-2xl border border-[#1E3666] bg-[#0D152B] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#1E3666] bg-[#080D1C] px-5 py-4 sm:px-6">
        <p className="font-mono text-xs text-[#20B9C9]">
          Side-by-Side Verified Catalog Synthesis
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-[#E6EDF7] sm:text-2xl">
          AI Mission Comparison
        </h2>
      </div>

      <div className="p-5 sm:p-6">
        {/* Selectors */}
        <div className="grid grid-cols-1 items-end gap-4 rounded-xl border border-[#1E3666] bg-[#080D1C]/75 p-4 md:grid-cols-11">
          <div className="md:col-span-4">
            <label
              htmlFor="compare-first"
              className="block font-mono text-xs uppercase tracking-wider text-[#9FB2D1]"
            >
              First Machine
            </label>
            <select
              id="compare-first"
              value={firstId}
              onChange={(e) => setFirstId(e.target.value)}
              className="mt-2 min-h-[44px] w-full rounded-lg border border-[#1E3666] bg-[#14264A] px-3 py-2 text-sm text-[#E6EDF7]"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.destination})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center md:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap selected machines"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#1E3666] bg-[#14264A]/60 text-[#20B9C9] transition-colors hover:border-[#20B9C9]"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="compare-second"
              className="block font-mono text-xs uppercase tracking-wider text-[#9FB2D1]"
            >
              Second Machine
            </label>
            <select
              id="compare-second"
              value={secondId}
              onChange={(e) => setSecondId(e.target.value)}
              className="mt-2 min-h-[44px] w-full rounded-lg border border-[#1E3666] bg-[#14264A] px-3 py-2 text-sm text-[#E6EDF7]"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.destination})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => void runComparison(firstId, secondId)}
              disabled={loading || firstId === secondId}
              className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Scale className="h-4 w-4" aria-hidden="true" />
              <span>{loading ? 'Comparing...' : 'Compare'}</span>
            </button>
          </div>
        </div>

        {/* Preset Pairings */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9FB2D1]">Quick pairings:</span>
          {PRESET_PAIRINGS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setFirstId(preset.firstId);
                setSecondId(preset.secondId);
                void runComparison(preset.firstId, preset.secondId);
              }}
              className="cursor-pointer rounded-lg border border-[#1E3666] bg-[#14264A]/45 px-3 py-1.5 text-xs font-medium text-[#C5D2E8] transition-colors hover:border-[#20B9C9] hover:text-[#E6EDF7] disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-400/50 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-6 space-y-4 rounded-xl border border-[#1E3666] bg-[#080D1C]/75 p-6">
            <p className="font-mono text-xs text-[#20B9C9]">
              Synthesizing verified mission records...
            </p>
            <div className="h-4 w-2/3 animate-pulse rounded bg-[#14264A]" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="h-28 animate-pulse rounded-xl bg-[#14264A]/60" />
              <div className="h-28 animate-pulse rounded-xl bg-[#14264A]/60" />
            </div>
          </div>
        )}

        {!loading && !result && !error && (
          <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#080D1C]/70 p-6 text-center">
            <p className="font-display text-lg font-semibold text-[#E6EDF7]">
              Select Two Machines to Generate a Verified Comparison
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#9FB2D1]">
              Compare objectives, dates, operational spans, discoveries, outcomes,
              and key engineering differences grounded strictly in our NASA
              equipment catalog.
            </p>
          </div>
        )}

        {!loading && result && (
          <div className="mt-6 space-y-6">
            {/* Overview & Machine Headers */}
            <div className="rounded-xl border border-[#1E3666] bg-[#080D1C]/85 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 border-b border-[#1E3666] pb-5 md:grid-cols-2">
                {[result.machineA, result.machineB].map((m, idx) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-[#1E3666] bg-[#14264A]/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-[#20B9C9]">
                        Machine {idx === 0 ? 'A' : 'B'} · {m.destination}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectEquipment(m.id)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#20B9C9] hover:text-[#E6EDF7]"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-[#E6EDF7]">
                      {m.name}
                    </h3>
                    <p className="text-xs text-[#9FB2D1]">{m.missionName}</p>
                    <div className="mt-2.5">
                      <StatusIndicator status={m.surfaceStatus} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#E6EDF7]">
                {result.comparison.overview}
              </p>
            </div>

            {/* 5 Structured Comparison Sections */}
            <div className="space-y-4">
              {sectionCards.map((section) => (
                <div
                  key={section.title}
                  className="rounded-xl border border-[#1E3666] bg-[#080D1C]/80 p-5"
                >
                  <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                    {section.title}
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-[#1E3666] bg-[#14264A]/35 p-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#7AA7F7]">
                        {result.machineA.name}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#C5D2E8]">
                        {section.data.machineA}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1E3666] bg-[#14264A]/35 p-4">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#20B9C9]">
                        {result.machineB.name}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#C5D2E8]">
                        {section.data.machineB}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#9FB2D1]">
                    <strong className="text-[#E6EDF7]">Key Contrast: </strong>
                    {section.data.takeaway}
                  </p>
                </div>
              ))}
            </div>

            {/* Important Differences */}
            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-5">
              <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                Important Differences
              </h3>
              <ul className="mt-3 space-y-2.5">
                {result.comparison.importantDifferences.map((diff, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[#C5D2E8]"
                  >
                    <span className="mt-0.5 font-mono text-xs text-[#20B9C9] tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Uncertainty Callout */}
            <div className="flex items-start gap-3 rounded-xl border border-[#F5B041]/45 bg-[#14264A]/40 p-4 text-sm">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-[#F5B041]"
                aria-hidden="true"
              />
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#F5B041]">
                  Preserved Scientific Uncertainties
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#C5D2E8]">
                  {result.comparison.uncertaintiesComparison}
                </p>
              </div>
            </div>

            {/* Sources */}
            <div className="rounded-xl border border-[#1E3666] bg-[#080D1C]/80 p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                Cited NASA Sources
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E3666] bg-[#14264A]/45 px-3 py-1.5 text-xs text-[#C5D2E8] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                  >
                    <span>{src.label}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
