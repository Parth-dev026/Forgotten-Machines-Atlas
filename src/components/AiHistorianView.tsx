import { FormEvent, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  Send
} from 'lucide-react';
import { EquipmentItem, HistorianMessage } from '../types/equipment';
import { askSpaceHistorian } from '../services/aiService';

interface AiHistorianViewProps {
  items: EquipmentItem[];
  focusedEquipmentId?: string;
  onSelectEquipment: (id: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Why were the Apollo Lunar Roving Vehicles left parked on the Moon?',
  'Which ALSEP discoveries proved the Moon is seismically active, and why did transmissions end?',
  'Why is Sojourner’s exact present physical condition uncertain?',
  'Compare how Viking 1, Spirit, and Opportunity stopped operating on Mars.'
];

export function AiHistorianView({
  items,
  focusedEquipmentId,
  onSelectEquipment
}: AiHistorianViewProps) {
  const [selectedFocusId, setSelectedFocusId] = useState<string>(
    focusedEquipmentId || ''
  );
  const [messages, setMessages] = useState<HistorianMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (focusedEquipmentId !== undefined) {
      setSelectedFocusId(focusedEquipmentId);
    }
  }, [focusedEquipmentId]);

  const itemById = new Map(items.map((item) => [item.id, item]));

  const submitQuestion = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || loading) return;

    const userTurn: HistorianMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const response = await askSpaceHistorian({
        question: trimmed,
        equipmentId: selectedFocusId || undefined,
        history: nextHistory.slice(-6).map((m) => ({
          role: m.role,
          text: m.text
        }))
      });

      const assistantTurn: HistorianMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: response.answer,
        uncertaintyNote: response.uncertaintyNote,
        relatedEquipmentIds: response.relatedEquipmentIds,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages((prev) => [...prev, assistantTurn]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reach the AI Space Historian.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submitQuestion(input);
  };

  const focusedItem = selectedFocusId ? itemById.get(selectedFocusId) : undefined;

  return (
    <section className="rounded-2xl border border-[#1E3666] bg-[#0D152B] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E3666] bg-[#080D1C] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="font-mono text-xs text-[#20B9C9]">
            Grounded in equipment-catalog.json &amp; mission-timeline.json
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#E6EDF7] sm:text-2xl">
            AI Space Historian
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[#9FB2D1]">
            <span>Context:</span>
            <select
              value={selectedFocusId}
              onChange={(e) => setSelectedFocusId(e.target.value)}
              className="rounded-lg border border-[#1E3666] bg-[#14264A] px-3 py-1.5 text-xs text-[#E6EDF7]"
            >
              <option value="">All 10 Moon &amp; Mars Profiles</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1E3666] bg-[#14264A]/60 px-3 py-1.5 text-xs font-medium text-[#C5D2E8] hover:border-[#20B9C9] hover:text-[#E6EDF7]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6">
        {focusedItem && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2463C5]/60 bg-[#14264A]/45 px-4 py-3 text-xs">
            <p className="text-[#C5D2E8]">
              Focused archive context:{' '}
              <strong className="text-[#E6EDF7]">{focusedItem.name}</strong> (
              {focusedItem.missionName})
            </p>
            <button
              type="button"
              onClick={() => onSelectEquipment(focusedItem.id)}
              className="inline-flex cursor-pointer items-center gap-1 font-medium text-[#20B9C9] hover:text-[#E6EDF7]"
            >
              <span>Open Full Profile</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Empty State + Starter Questions */}
        {messages.length === 0 ? (
          <div className="rounded-xl border border-[#1E3666] bg-[#080D1C]/70 p-6">
            <div className="flex items-start gap-3">
              <MessageSquare
                className="mt-0.5 h-5 w-5 shrink-0 text-[#20B9C9]"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-semibold text-[#E6EDF7]">
                  Ask About NASA’s Moon &amp; Mars Surface Hardware
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#9FB2D1]">
                  Every answer draws directly from our verified NASA NSSDCA and
                  NASA Science catalog records, cites official source links, and
                  explicitly flags unverified or uncertain hardware conditions.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void submitQuestion(q)}
                  disabled={loading}
                  className="cursor-pointer rounded-xl border border-[#1E3666] bg-[#14264A]/40 p-3.5 text-left text-sm text-[#C5D2E8] transition-colors hover:border-[#20B9C9] hover:text-[#E6EDF7] disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-h-[540px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl border p-4 sm:p-5 ${
                  msg.role === 'user'
                    ? 'ml-auto max-w-2xl border-[#2463C5]/70 bg-[#14264A]/70'
                    : 'border-[#1E3666] bg-[#080D1C]/85'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#9FB2D1]">
                  <span className="font-mono uppercase tracking-wider text-[#20B9C9]">
                    {msg.role === 'user' ? 'Explorer Question' : 'AI Space Historian'}
                  </span>
                  <span className="font-mono tabular-nums">{msg.timestamp}</span>
                </div>

                <div className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-[#E6EDF7]">
                  {msg.text}
                </div>

                {msg.role === 'assistant' && msg.uncertaintyNote && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#F5B041]/40 bg-[#14264A]/40 px-3.5 py-2.5 text-xs text-[#E6EDF7]">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]"
                      aria-hidden="true"
                    />
                    <div>
                      <span className="font-mono uppercase tracking-wider text-[#F5B041]">
                        Uncertainty &amp; Verification Note:{' '}
                      </span>
                      <span className="text-[#C5D2E8]">{msg.uncertaintyNote}</span>
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' &&
                  msg.relatedEquipmentIds &&
                  msg.relatedEquipmentIds.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#9FB2D1]">
                        Related Profiles:
                      </span>
                      {msg.relatedEquipmentIds.map((eqId) => {
                        const eq = itemById.get(eqId);
                        if (!eq) return null;
                        return (
                          <button
                            key={eqId}
                            type="button"
                            onClick={() => onSelectEquipment(eqId)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#2463C5] bg-[#14264A]/60 px-2.5 py-1 text-xs font-medium text-[#E6EDF7] hover:border-[#20B9C9] hover:text-[#20B9C9]"
                          >
                            <span>{eq.name}</span>
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                {msg.role === 'assistant' &&
                  msg.sources &&
                  msg.sources.length > 0 && (
                    <div className="mt-4 border-t border-[#1E3666] pt-3">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[#9FB2D1]">
                        Verified NASA Sources
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.sources.map((src) => (
                          <a
                            key={src.url}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-[#1E3666] bg-[#0D152B] px-3 py-1.5 text-xs text-[#C5D2E8] transition-colors hover:border-[#20B9C9] hover:text-[#20B9C9]"
                          >
                            <span>{src.label}</span>
                            <ExternalLink
                              className="h-3 w-3 shrink-0"
                              aria-hidden="true"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="rounded-xl border border-[#1E3666] bg-[#080D1C]/80 p-5">
                <p className="font-mono text-xs text-[#20B9C9]">
                  Consulting verified NASA catalog and mission timeline...
                </p>
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#14264A]" />
                  <div className="h-3 w-3/5 animate-pulse rounded bg-[#14264A]" />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-400/50 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            placeholder={
              focusedItem
                ? `Ask about ${focusedItem.name}...`
                : 'Ask about Apollo LM, LRV, ALSEP, Surveyor, Viking, Sojourner, Spirit, or Opportunity...'
            }
            className="min-h-[46px] flex-1 rounded-xl border border-[#1E3666] bg-[#080D1C] px-4 py-2.5 text-sm text-[#E6EDF7] placeholder-[#7B91B5]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2463C5] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? 'Analyzing...' : 'Ask Historian'}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
