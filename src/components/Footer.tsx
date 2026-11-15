import { ExternalLink } from 'lucide-react';
import { AppSection } from '../types/equipment';

interface FooterProps {
  onNavigate: (section: AppSection) => void;
  onOpenGlossary: () => void;
}

export function Footer({ onNavigate, onOpenGlossary }: FooterProps) {
  return (
    <footer
      className="border-t border-[var(--museum-border)] py-12 pb-28 sm:pb-20 transition-colors duration-300"
      style={{ backgroundColor: 'var(--museum-bg, #080D1C)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold text-[#E6EDF7]">
              Forgotten Machines Atlas
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#9FB2D1]">
              An educational planetary heritage archive created by Team ALPHA
              Explorers for the 2026 NASA Space Apps Challenge.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
              Atlas Sections
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  Mission Control
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('moon')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  Moon Explorer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('mars')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  Mars Explorer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('lab')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  3D &amp; AI Exploration Lab
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('timeline')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  Mission Timeline
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('search')}
                  className="cursor-pointer text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  Search &amp; Filter Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenGlossary}
                  className="cursor-pointer text-[#20B9C9] transition-colors hover:text-[#E6EDF7]"
                >
                  Space Exploration Glossary
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
              Primary NASA Sources
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://nssdc.gsfc.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  <span>NASA NSSDCA Master Catalog</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://science.nasa.gov/mission/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  <span>NASA Science Missions</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
                >
                  <span>NASA Official Portal</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#1E3666] pt-6 text-xs text-[#9FB2D1] sm:flex-row sm:items-center">
          <p>
            Team ALPHA Explorers · 2026 NASA Space Apps Challenge · Educational
            Reference Project
          </p>
          <p>
            All historical mission records attributed to official NASA archives.
          </p>
        </div>
      </div>
    </footer>
  );
}
