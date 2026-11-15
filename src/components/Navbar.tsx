import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Check,
  ChevronDown,
  Image,
  Menu,
  Palette,
  Search,
  X
} from 'lucide-react';
import { AppSection } from '../types/equipment';
import { PAGE_PALETTES, PagePaletteId } from '../types/theme';
import { useMuseumTheme } from '../context/MuseumThemeContext';

interface NavbarProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'home', label: 'Mission Control' },
  { id: 'moon', label: 'Moon' },
  { id: 'mars', label: 'Mars' },
  { id: 'lab', label: '3D & AI Lab' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'about', label: 'About' }
];

const PALETTE_LIST: PagePaletteId[] = [
  'default',
  'lunar-slate',
  'martian-amber',
  'planetarium-gold'
];

export function Navbar({ activeSection, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    backdropMode,
    setBackdropMode,
    prefersReducedMotion,
    pagePalette,
    pagePaletteMeta,
    setPagePalette
  } = useMuseumTheme();

  const is3DActive = backdropMode === '3d' && !prefersReducedMotion;

  useEffect(() => {
    if (!themeMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setThemeMenuOpen(false);
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        themeMenuRef.current &&
        e.target instanceof Node &&
        !themeMenuRef.current.contains(e.target)
      ) {
        setThemeMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [themeMenuOpen]);

  const handleSelect = (section: AppSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setThemeMenuOpen(false);
  };

  const handleSelectPalette = (paletteId: PagePaletteId) => {
    setPagePalette(paletteId);
    setThemeMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--museum-border)] backdrop-blur-md transition-colors duration-300"
      style={{
        backgroundColor:
          'color-mix(in srgb, var(--museum-bg, #080D1C) 92%, transparent)'
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="cursor-pointer whitespace-nowrap shrink-0 text-left font-display text-lg font-semibold tracking-tight text-[#E6EDF7] transition-colors hover:text-[#20B9C9]"
        >
          Forgotten Machines Atlas
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-3.5 lg:flex xl:gap-5"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeSection === item.id ||
              (activeSection === 'detail' && item.id === 'home');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`cursor-pointer whitespace-nowrap shrink-0 border-b-2 py-1 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'border-[#20B9C9] text-[#E6EDF7]'
                    : 'border-transparent text-[#9FB2D1] hover:border-[#2463C5]/60 hover:text-[#E6EDF7]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Selector + Viewing Mode Controls + Search Atlas + Mobile drawer trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Change Button (near View Mode option) */}
          <div ref={themeMenuRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setThemeMenuOpen((prev) => !prev)}
              aria-expanded={themeMenuOpen}
              aria-haspopup="menu"
              aria-label={`Change page theme (current: ${pagePaletteMeta.name})`}
              title={`Page Theme: ${pagePaletteMeta.name}`}
              className={`inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                themeMenuOpen
                  ? 'border-[#20B9C9] bg-[#14264A] text-[#E6EDF7]'
                  : 'border-[#1E3666] bg-[#0D152B]/90 text-[#E6EDF7] hover:border-[#20B9C9]'
              }`}
            >
              <Palette className="h-3.5 w-3.5 text-[#20B9C9]" aria-hidden="true" />
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full border border-white/25"
                style={{ backgroundColor: pagePaletteMeta.accentHex }}
              />
              <span className="hidden xl:inline">{pagePaletteMeta.shortLabel}</span>
              <span className="xl:hidden">Theme</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-[#9FB2D1] transition-transform duration-150 ${
                  themeMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {themeMenuOpen && (
              <div
                role="menu"
                aria-label="Museum Page Themes"
                className="absolute right-0 mt-2 w-64 rounded-xl border border-[#1E3666] bg-[#0D152B] p-2 shadow-2xl"
              >
                <p className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#9FB2D1]">
                  Museum Page Theme
                </p>
                <div className="mt-1 space-y-1">
                  {PALETTE_LIST.map((id) => {
                    const meta = PAGE_PALETTES[id];
                    const selected = pagePalette === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={selected}
                        onClick={() => handleSelectPalette(id)}
                        className={`flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                          selected
                            ? 'border-[#20B9C9] bg-[#14264A] text-[#E6EDF7]'
                            : 'border-transparent text-[#C5D2E8] hover:bg-[#14264A]/60 hover:text-[#E6EDF7]'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/20"
                            style={{ backgroundColor: meta.bgHex }}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: meta.accentHex }}
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-[#E6EDF7]">
                              {meta.name}
                            </p>
                            <p className="truncate text-[11px] text-[#9FB2D1]">
                              {meta.description}
                            </p>
                          </div>
                        </div>
                        {selected && (
                          <Check
                            className="h-4 w-4 shrink-0 text-[#20B9C9]"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Viewing Mode Controls (3D View / Static View) */}
          <div
            role="group"
            aria-label="Viewing Mode"
            className="hidden items-center rounded-lg border border-[#1E3666] bg-[#0D152B]/90 p-0.5 sm:inline-flex"
          >
            <button
              type="button"
              onClick={() => setBackdropMode('3d')}
              disabled={prefersReducedMotion}
              aria-pressed={is3DActive}
              title={
                prefersReducedMotion
                  ? '3D View unavailable while Reduced Motion is active'
                  : 'Switch to interactive 3D presentation'
              }
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                is3DActive
                  ? 'bg-[#20B9C9] text-[#080D1C] font-semibold'
                  : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
              }`}
            >
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
              <span>3D View</span>
            </button>
            <button
              type="button"
              onClick={() => setBackdropMode('static')}
              aria-pressed={!is3DActive}
              title="Switch to Static View presentation"
              className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                !is3DActive
                  ? 'bg-[#2463C5] text-[#E6EDF7] font-semibold'
                  : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
              }`}
            >
              <Image className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Static View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSelect('search')}
            className={`hidden cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150 sm:inline-flex ${
              activeSection === 'search'
                ? 'bg-[#20B9C9] text-[#080D1C]'
                : 'bg-[#2463C5] text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]'
            }`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search Atlas</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-[#1E3666] bg-[#14264A]/60 text-[#E6EDF7] transition-colors hover:border-[#20B9C9] lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#1E3666] bg-[#080D1C] px-4 py-4 lg:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#14264A] text-[#20B9C9]'
                      : 'text-[#C5D2E8] hover:bg-[#14264A]/60 hover:text-[#E6EDF7]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Mobile-only Museum Theme Switcher (shown < sm when hidden in ribbon) */}
            <div className="mt-2 border-t border-[#1E3666] pt-3 sm:hidden">
              <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-wider text-[#9FB2D1]">
                Museum Page Theme
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {PALETTE_LIST.map((id) => {
                  const meta = PAGE_PALETTES[id];
                  const selected = pagePalette === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPagePalette(id)}
                      aria-pressed={selected}
                      className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                        selected
                          ? 'border-[#20B9C9] bg-[#14264A] text-[#E6EDF7]'
                          : 'border-[#1E3666] bg-[#0D152B] text-[#C5D2E8]'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 rounded-full border border-white/25"
                        style={{ backgroundColor: meta.accentHex }}
                      />
                      <span className="truncate">{meta.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile-only Viewing Mode Switcher (shown < sm when hidden in ribbon) */}
            <div className="mt-3 border-t border-[#1E3666] pt-3 sm:hidden">
              <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-wider text-[#9FB2D1]">
                Viewing Mode
              </p>
              <div
                role="group"
                aria-label="Mobile Viewing Mode"
                className="grid grid-cols-2 gap-1.5 rounded-lg border border-[#1E3666] bg-[#0D152B] p-1"
              >
                <button
                  type="button"
                  onClick={() => setBackdropMode('3d')}
                  disabled={prefersReducedMotion}
                  aria-pressed={is3DActive}
                  className={`inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                    is3DActive
                      ? 'bg-[#20B9C9] text-[#080D1C] font-semibold'
                      : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>3D View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBackdropMode('static')}
                  aria-pressed={!is3DActive}
                  className={`inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
                    !is3DActive
                      ? 'bg-[#2463C5] text-[#E6EDF7] font-semibold'
                      : 'text-[#9FB2D1] hover:text-[#E6EDF7]'
                  }`}
                >
                  <Image className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Static View</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelect('search')}
              className="mt-3 flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C] sm:hidden"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Search Atlas</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
