import { ArrowRight, ExternalLink } from 'lucide-react';
import { AppSection } from '../types/equipment';
import { StatusIndicator } from './StatusIndicator';

interface AboutViewProps {
  onNavigate: (section: AppSection) => void;
}

export function AboutView({ onNavigate }: AboutViewProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-[#1E3666] pb-8">
          <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
            2026 NASA Space Apps Challenge · Team ALPHA Explorers
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl lg:text-5xl">
            About Forgotten Machines Atlas
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#C5D2E8]">
            Built for the challenge{' '}
            <span className="font-medium text-[#E6EDF7]">
              “Abandoned but not Forgotten: Storytelling about NASA’s Discarded
              Equipment on the Moon and Mars.”
            </span>
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Our Educational Purpose
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#C5D2E8]">
                Spacecraft rarely come home. When a rover finishes its last
                traverse or a lunar descent stage lifts a crew back into orbit,
                those machines stay behind on silent plains and crater rims.
                Team ALPHA Explorers created Forgotten Machines Atlas so students,
                educators, and space enthusiasts can explore the engineering
                stories, scientific breakthroughs, and resting places of these
                trailblazing vehicles.
              </p>
            </div>

            <div className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Team ALPHA Explorers
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#C5D2E8]">
                As participants in the 2026 NASA Space Apps Challenge, Team
                ALPHA Explorers designed this interactive digital atlas to turn
                dense archival spacecraft catalogs into an approachable,
                visually compelling educational experience without sacrificing
                scientific precision.
              </p>
            </div>

            <div className="border-t border-[#1E3666] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[#E6EDF7]">
                Scientific Accuracy &amp; Maintainable Dataset
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#C5D2E8]">
                Every mission date, landing site, scientific objective, and
                status summary in this atlas is grounded in official NASA
                records from NSSDCA and NASA Science. All equipment profiles and
                timeline milestones are stored in a structured JSON dataset that
                updates independently without rebuilding the frontend, ready for
                future NASA Open API and Planetary Data System integrations.
              </p>
            </div>
          </div>

          {/* Classification Guide & Reference Links */}
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                How We Classify Hardware Outcomes
              </h2>
              <div className="mt-4 space-y-5 text-sm">
                <div>
                  <StatusIndicator status="Intentionally Left Behind" />
                  <p className="mt-1.5 leading-relaxed text-[#C5D2E8]">
                    Hardware engineered to remain on the surface after finishing
                    its role—such as Apollo Lunar Module descent stages and
                    parked Lunar Roving Vehicles.
                  </p>
                </div>

                <div className="border-t border-[#1E3666] pt-4">
                  <StatusIndicator status="Stopped Operating" />
                  <p className="mt-1.5 leading-relaxed text-[#C5D2E8]">
                    Robotic landers and rovers that operated until power loss,
                    battery failure, dust storms, or command errors ended
                    communications, and whose presence is confirmed on the
                    surface.
                  </p>
                </div>

                <div className="border-t border-[#1E3666] pt-4">
                  <StatusIndicator status="Condition Uncertain" />
                  <p className="mt-1.5 leading-relaxed text-[#C5D2E8]">
                    Equipment remaining on the Moon or Mars whose exact modern
                    physical condition cannot be directly verified due to age,
                    lack of telemetry, or small physical scale.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#1E3666] bg-[#14264A]/35 p-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                Primary NASA Reference Portals
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="https://nssdc.gsfc.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[#1E3666] bg-[#0D152B] px-4 py-3 text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                  >
                    <span>NASA NSSDCA Master Catalog</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://science.nasa.gov/mission/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[#1E3666] bg-[#0D152B] px-4 py-3 text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                  >
                    <span>NASA Science Mission Directory</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.nasa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-[#1E3666] bg-[#0D152B] px-4 py-3 text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                  >
                    <span>NASA Official Portal</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('moon')}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-xs font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
                >
                  <span>Explore Moon</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('mars')}
                  className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-[#20B9C9]/70 bg-[#0D152B] px-4 py-2 text-xs font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
                >
                  <span>Explore Mars</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
