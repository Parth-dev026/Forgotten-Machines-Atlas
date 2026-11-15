import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Info,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useMuseumTheme } from '../context/MuseumThemeContext';

export function MuseumControlDock() {
  const {
    themeMeta,
    currentTrackInfo,
    currentTrackNumber,
    totalTracksForContext,
    hasAudioActivated,
    isAudioEnabled,
    isAudioPlaying,
    isAudioMuted,
    audioVolume,
    activateAndEnableAudio,
    toggleAudioEnabled,
    toggleAudioMute,
    setAudioVolume,
    nextTrack
  } = useMuseumTheme();

  const [expanded, setExpanded] = useState(false);
  const [showAudioInfo, setShowAudioInfo] = useState(false);
  const dockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (
        dockRef.current &&
        e.target instanceof Node &&
        !dockRef.current.contains(e.target)
      ) {
        setExpanded(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [expanded]);

  const audioActiveLabel = !isAudioEnabled
    ? 'Off'
    : !hasAudioActivated
    ? 'Ready'
    : isAudioMuted
    ? 'Muted'
    : 'On';

  return (
    <div
      ref={dockRef}
      data-audio-control="true"
      className="fixed bottom-4 left-4 z-30 flex flex-col items-start gap-2 sm:bottom-6 sm:left-6"
    >
      {expanded && (
        <section
          aria-label="Museum Ambient Audio Controls"
          className="w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border p-4 shadow-2xl transition-colors duration-300"
          style={{
            backgroundColor: 'var(--museum-surface, #0D152B)',
            borderColor: 'var(--museum-border, #1E3666)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1E3666] pb-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#9FB2D1]">
                Museum Ambient Audio
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold text-[#20B9C9]">
                {currentTrackInfo.contextLabel}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAudioInfo((prev) => !prev)}
                aria-expanded={showAudioInfo}
                aria-label="Toggle audio information"
                title="About museum ambient audio"
                className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                  showAudioInfo
                    ? 'border-[#20B9C9] bg-[#14264A] text-[#20B9C9]'
                    : 'border-[#1E3666] text-[#9FB2D1] hover:border-[#20B9C9] hover:text-[#E6EDF7]'
                }`}
              >
                <Info className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Collapse audio controls"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#1E3666] text-[#C5D2E8] hover:border-[#20B9C9] hover:text-[#E6EDF7]"
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* First-visit Browser Autoplay Notice */}
          {!hasAudioActivated && !isAudioEnabled && (
            <div className="mt-3 rounded-lg border border-[#2463C5]/60 bg-[#080D1C]/85 p-3">
              <p className="text-xs font-medium text-[#E6EDF7]">
                Activate Context-Aware Museum Audio
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#9FB2D1]">
                Browsers pause sound until your first interaction. Enable audio
                once to let instrumental soundscapes adapt as you explore Moon,
                Mars, and Timeline galleries.
              </p>
              <button
                type="button"
                onClick={() => void activateAndEnableAudio()}
                className="mt-2.5 inline-flex min-h-[36px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2463C5] px-3 py-1.5 text-xs font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Enable Museum Audio</span>
              </button>
            </div>
          )}

          {/* Current Ambient Track & Next Track */}
          <div className="mt-3 rounded-lg border border-[#1E3666] bg-[#080D1C]/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#9FB2D1]">
                  Current Ambient Track ({currentTrackNumber}/{totalTracksForContext})
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-[#E6EDF7]">
                  {currentTrackInfo.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#9FB2D1]">
                  {currentTrackInfo.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void nextTrack()}
                aria-label="Change audio track"
                title="Change Audio / Next Track"
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#1E3666] bg-[#14264A]/70 px-2.5 py-1.5 text-[11px] font-medium text-[#E6EDF7] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
              >
                <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Next Track</span>
              </button>
            </div>
          </div>

          {/* Primary Audio Controls: On/Off, Mute/Unmute, Volume */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void toggleAudioEnabled()}
              aria-pressed={isAudioEnabled && isAudioPlaying}
              aria-label={
                isAudioEnabled && isAudioPlaying
                  ? 'Turn museum audio off'
                  : 'Turn museum audio on'
              }
              className={`inline-flex min-h-[38px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isAudioEnabled && isAudioPlaying
                  ? 'bg-[#20B9C9] text-[#080D1C]'
                  : 'bg-[#2463C5] text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]'
              }`}
            >
              {isAudioEnabled && isAudioPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Audio On</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isAudioEnabled && !hasAudioActivated ? 'Resume' : 'Audio Off'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleAudioMute}
              aria-label={isAudioMuted ? 'Unmute museum audio' : 'Mute museum audio'}
              aria-pressed={isAudioMuted}
              className={`inline-flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                isAudioMuted
                  ? 'border-[#F5B041]/70 bg-[#14264A] text-[#F5B041]'
                  : 'border-[#1E3666] bg-[#080D1C] text-[#C5D2E8] hover:border-[#20B9C9] hover:text-[#E6EDF7]'
              }`}
            >
              {isAudioMuted ? (
                <>
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-[#20B9C9]" aria-hidden="true" />
                  <span className="sr-only">Unmuted</span>
                </>
              )}
            </button>

            <div className="flex flex-1 items-center gap-2">
              <label htmlFor="museum-audio-volume" className="sr-only">
                Ambient audio volume
              </label>
              <input
                id="museum-audio-volume"
                type="range"
                min={0}
                max={100}
                value={Math.round(audioVolume * 100)}
                onChange={(e) => setAudioVolume(Number(e.target.value) / 100)}
                className="h-1.5 w-full cursor-pointer accent-[#20B9C9]"
              />
              <span className="w-8 text-right font-mono text-[11px] text-[#9FB2D1] tabular-nums">
                {Math.round(audioVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Optional Audio Information Drawer */}
          {showAudioInfo && (
            <div className="mt-3 rounded-lg border border-[#1E3666] bg-[#080D1C]/80 p-3 text-[11px] leading-relaxed text-[#9FB2D1]">
              <p className="font-semibold text-[#E6EDF7]">
                About Context-Aware Museum Audio
              </p>
              <p className="mt-1">
                Each gallery synthesizes a subtle, vocal-free instrumental or
                environmental soundscape on demand. Tracks crossfade smoothly
                between Mission Control, Moon, Mars, Timeline, and Equipment
                views while preserving your mute and volume preferences.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Compact Collapsed Audio Dock */}
      <div
        className="flex min-h-[44px] items-center rounded-lg border shadow-lg transition-colors duration-300"
        style={{
          backgroundColor: 'var(--museum-surface, #0D152B)',
          borderColor: 'var(--museum-border, #1E3666)'
        }}
      >
        <button
          type="button"
          onClick={() => void toggleAudioEnabled()}
          aria-pressed={isAudioEnabled && isAudioPlaying}
          aria-label={
            !hasAudioActivated && !isAudioEnabled
              ? 'Enable context-aware museum audio'
              : isAudioEnabled && isAudioPlaying
              ? `Turn off museum audio (${currentTrackInfo.title})`
              : `Turn on museum audio (${currentTrackInfo.title})`
          }
          className="flex min-h-[44px] cursor-pointer items-center gap-1.5 whitespace-nowrap px-2.5 py-2 text-xs font-semibold text-[#E6EDF7] transition-colors hover:text-[#20B9C9] sm:gap-2 sm:px-3"
        >
          <Headphones
            className="h-4 w-4 shrink-0"
            style={{
              color:
                isAudioEnabled && isAudioPlaying && !isAudioMuted
                  ? themeMeta.accentHex
                  : '#9FB2D1'
            }}
            aria-hidden="true"
          />
          {!hasAudioActivated && !isAudioEnabled ? (
            <span className="max-w-[110px] truncate sm:max-w-none">
              Enable Audio
            </span>
          ) : (
            <span className="max-w-[105px] truncate sm:max-w-[165px]">
              {currentTrackInfo.title}
            </span>
          )}
          <span
            className={`hidden rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline ${
              isAudioEnabled && isAudioPlaying && !isAudioMuted
                ? 'bg-[#20B9C9]/20 text-[#20B9C9]'
                : isAudioMuted && isAudioEnabled
                ? 'bg-[#F5B041]/20 text-[#F5B041]'
                : 'bg-[#14264A] text-[#9FB2D1]'
            }`}
          >
            {audioActiveLabel}
          </span>
        </button>

        <div className="h-5 w-px bg-[#1E3666]" aria-hidden="true" />

        <button
          type="button"
          onClick={toggleAudioMute}
          aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
          aria-pressed={isAudioMuted}
          title={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center px-2.5 text-[#C5D2E8] transition-colors hover:text-[#20B9C9]"
        >
          {isAudioMuted ? (
            <VolumeX className="h-4 w-4 text-[#F5B041]" aria-hidden="true" />
          ) : (
            <Volume2
              className={`h-4 w-4 ${
                isAudioEnabled && isAudioPlaying
                  ? 'text-[#20B9C9]'
                  : 'text-[#9FB2D1]'
              }`}
              aria-hidden="true"
            />
          )}
        </button>

        <div className="h-5 w-px bg-[#1E3666]" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label="Open Museum Audio Settings"
          title="Audio settings, volume & track selector"
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center px-2.5 text-[#9FB2D1] transition-colors hover:text-[#E6EDF7]"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
