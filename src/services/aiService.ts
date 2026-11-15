import {
  ComparisonApiResponse,
  HistorianApiResponse,
  QuizApiResponse,
  QuizDifficulty
} from '../types/equipment';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(
      payload.error || `Request failed with status ${response.status}.`
    );
  }

  return payload;
}

export function askSpaceHistorian(params: {
  question: string;
  equipmentId?: string;
  history?: { role: 'user' | 'assistant'; text: string }[];
}): Promise<HistorianApiResponse> {
  return postJson<HistorianApiResponse>('/api/ai/historian', params);
}

export function compareMissionsWithAi(params: {
  firstId: string;
  secondId: string;
}): Promise<ComparisonApiResponse> {
  return postJson<ComparisonApiResponse>('/api/ai/compare', params);
}

export function generateAiQuiz(params: {
  difficulty: QuizDifficulty;
  focus: 'All' | 'Moon' | 'Mars';
}): Promise<QuizApiResponse> {
  return postJson<QuizApiResponse>('/api/ai/quiz', params);
}
