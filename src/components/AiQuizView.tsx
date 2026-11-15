import { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { QuizApiResponse, QuizDifficulty } from '../types/equipment';
import { generateAiQuiz } from '../services/aiService';

interface AiQuizViewProps {
  onSelectEquipment: (id: string) => void;
}

const DIFFICULTIES: {
  level: QuizDifficulty;
  description: string;
}[] = [
  {
    level: 'Beginner',
    description: 'Core mission destinations, goals, and iconic discoveries.'
  },
  {
    level: 'Intermediate',
    description: 'Instruments, landing sites, dates, and mission endings.'
  },
  {
    level: 'Advanced',
    description: 'Detailed comparative facts, orbital verification, and uncertainties.'
  }
];

export function AiQuizView({ onSelectEquipment }: AiQuizViewProps) {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Beginner');
  const [focus, setFocus] = useState<'All' | 'Moon' | 'Mars'>('All');
  const [quiz, setQuiz] = useState<QuizApiResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [historyStats, setHistoryStats] = useState({
    quizzesCompleted: 0,
    totalCorrect: 0,
    totalAnswered: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewQuiz = async (
    nextDiff = difficulty,
    nextFocus = focus
  ) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setQuiz(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCompleted(false);

    try {
      const response = await generateAiQuiz({
        difficulty: nextDiff,
        focus: nextFocus
      });
      setQuiz(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate a quiz right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = quiz?.questions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion || selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.questions.length) {
      setCompleted(true);
      setHistoryStats((prev) => ({
        quizzesCompleted: prev.quizzesCompleted + 1,
        totalCorrect: prev.totalCorrect + score,
        totalAnswered: prev.totalAnswered + quiz.questions.length
      }));
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    }
  };

  return (
    <section className="rounded-2xl border border-[#1E3666] bg-[#0D152B] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E3666] bg-[#080D1C] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="font-mono text-xs text-[#20B9C9]">
            Dynamic Verified Archive Assessment
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#E6EDF7] sm:text-2xl">
            AI Knowledge Quiz
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9FB2D1] tabular-nums">
          <span>
            Quizzes Finished:{' '}
            <strong className="text-[#E6EDF7]">
              {historyStats.quizzesCompleted}
            </strong>
          </span>
          {historyStats.totalAnswered > 0 && (
            <span>
              Session Accuracy:{' '}
              <strong className="text-[#20B9C9]">
                {Math.round(
                  (historyStats.totalCorrect / historyStats.totalAnswered) * 100
                )}
                %
              </strong>
            </span>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Quiz Configuration Controls */}
        <div className="rounded-xl border border-[#1E3666] bg-[#080D1C]/75 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                Difficulty Level
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {DIFFICULTIES.map((d) => {
                  const active = difficulty === d.level;
                  return (
                    <button
                      key={d.level}
                      type="button"
                      disabled={loading}
                      onClick={() => setDifficulty(d.level)}
                      className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                        active
                          ? 'border-[#20B9C9] bg-[#14264A]'
                          : 'border-[#1E3666] bg-[#0D152B] hover:border-[#2463C5]'
                      }`}
                    >
                      <p className="font-display text-sm font-semibold text-[#E6EDF7]">
                        {d.level}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#9FB2D1]">
                        {d.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-3">
              <p className="font-mono text-xs uppercase tracking-wider text-[#9FB2D1]">
                Planetary Focus
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['All', 'Moon', 'Mars'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={loading}
                    onClick={() => setFocus(option)}
                    className={`min-h-[44px] cursor-pointer rounded-lg border px-3 text-xs font-medium transition-colors ${
                      focus === option
                        ? 'border-[#20B9C9] bg-[#20B9C9] text-[#080D1C]'
                        : 'border-[#1E3666] bg-[#0D152B] text-[#C5D2E8] hover:border-[#2463C5]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => void startNewQuiz(difficulty, focus)}
                disabled={loading}
                className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-sm font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C] disabled:opacity-50"
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                <span>{loading ? 'Generating...' : quiz ? 'New Quiz' : 'Start Quiz'}</span>
              </button>
            </div>
          </div>
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
          <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#080D1C]/80 p-6">
            <p className="font-mono text-xs text-[#20B9C9]">
              Crafting 5 verified {difficulty} questions from NASA catalog records...
            </p>
            <div className="mt-4 space-y-3">
              <div className="h-5 w-3/4 animate-pulse rounded bg-[#14264A]" />
              <div className="h-12 animate-pulse rounded-lg bg-[#14264A]/60" />
              <div className="h-12 animate-pulse rounded-lg bg-[#14264A]/60" />
            </div>
          </div>
        )}

        {!loading && !quiz && !error && (
          <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#080D1C]/70 p-8 text-center">
            <p className="font-display text-lg font-semibold text-[#E6EDF7]">
              Test Your Knowledge of Moon &amp; Mars Heritage
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#9FB2D1]">
              Choose Beginner, Intermediate, or Advanced difficulty above and
              generate a fresh 5-question quiz complete with NASA-cited
              explanations.
            </p>
          </div>
        )}

        {/* Active Quiz Question */}
        {!loading && quiz && !completed && currentQuestion && (
          <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#080D1C]/85 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#20B9C9] tabular-nums">
                Question {currentIndex + 1} of {quiz.questions.length} ·{' '}
                {quiz.difficulty}
              </span>
              <span className="font-mono text-xs text-[#E6EDF7] tabular-nums">
                Score: {score} / {currentIndex + (selectedOption !== null ? 1 : 0)}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#14264A]">
              <div
                className="h-full bg-[#20B9C9] transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`
                }}
              />
            </div>

            <h3 className="mt-5 font-display text-xl font-semibold leading-snug text-[#E6EDF7]">
              {currentQuestion.question}
            </h3>

            <div className="mt-5 space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const answered = selectedOption !== null;
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let styleClass =
                  'border-[#1E3666] bg-[#14264A]/40 text-[#E6EDF7] hover:border-[#20B9C9]';
                if (answered) {
                  if (isCorrect) {
                    styleClass =
                      'border-emerald-400/70 bg-emerald-950/40 text-emerald-100';
                  } else if (isSelected) {
                    styleClass =
                      'border-red-400/70 bg-red-950/40 text-red-100';
                  } else {
                    styleClass =
                      'border-[#1E3666] bg-[#0D152B] text-[#7B91B5] opacity-75';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={answered}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${styleClass}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-xs font-semibold text-[#20B9C9]">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{option}</span>
                    </div>
                    {answered && isCorrect && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-emerald-400"
                        aria-hidden="true"
                      />
                    )}
                    {answered && isSelected && !isCorrect && (
                      <XCircle
                        className="h-4 w-4 shrink-0 text-red-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className="mt-6 rounded-xl border border-[#1E3666] bg-[#14264A]/45 p-4 sm:p-5">
                <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                  {selectedOption === currentQuestion.correctIndex
                    ? 'Verified Answer — Correct'
                    : 'Verified Explanation'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#E6EDF7]">
                  {currentQuestion.explanation}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1E3666] pt-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={currentQuestion.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#20B9C9] hover:text-[#E6EDF7]"
                    >
                      <span>{currentQuestion.sourceLabel}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectEquipment(currentQuestion.equipmentId)
                      }
                      className="inline-flex cursor-pointer items-center gap-1 text-[#C5D2E8] hover:text-[#20B9C9]"
                    >
                      <span>Inspect {currentQuestion.equipmentName}</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-4 py-2 text-xs font-semibold text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]"
                  >
                    <span>
                      {currentIndex + 1 >= quiz.questions.length
                        ? 'View Final Score'
                        : 'Next Question'}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Summary */}
        {!loading && quiz && completed && (
          <div className="mt-6 rounded-xl border border-[#20B9C9]/50 bg-[#080D1C]/85 p-6 text-center sm:p-8">
            <Award
              className="mx-auto h-10 w-10 text-[#20B9C9]"
              aria-hidden="true"
            />
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
              {quiz.difficulty} Quiz Complete · {quiz.focus} Focus
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold text-[#E6EDF7] tabular-nums">
              {score} / {quiz.questions.length} Correct
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#C5D2E8]">
              {score === quiz.questions.length
                ? 'Outstanding mission mastery across the Forgotten Machines Atlas archive.'
                : score >= 3
                ? 'Solid command of Moon and Mars exploration history. Try a harder tier or explore the 3D models!'
                : 'Great warm-up—visit the Space Historian or Mission Stories to dig deeper into these missions.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void startNewQuiz(difficulty, focus)}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#2463C5] px-5 py-2.5 text-sm font-semibold text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Generate Another {difficulty} Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
