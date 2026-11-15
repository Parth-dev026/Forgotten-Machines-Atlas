import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

interface NasaSource {
  label: string;
  url: string;
  source: 'NASA NSSDCA' | 'NASA Science' | 'NASA.gov';
}

interface CatalogEquipment {
  id: string;
  catalogCode: string;
  name: string;
  missionName: string;
  destination: 'Moon' | 'Mars';
  landingSite: string;
  category: string;
  launchDate: string;
  landingDate: string;
  missionDuration: string;
  finalStatusSummary: string;
  surfaceStatus: string;
  surfacePresence: string;
  statusClarification: string;
  shortSummary: string;
  historicalBackground: string;
  scientificPurpose: string;
  importantDiscoveries: string[];
  whatRemainsOnSurface: string;
  discardedComponents: string;
  whyItMattersToday: string;
  uncertainties: string;
  nasaSources: NasaSource[];
}

interface TimelineRecord {
  id: string;
  year: number;
  dateLabel: string;
  title: string;
  destination: 'Moon' | 'Mars';
  missionName: string;
  summary: string;
  equipmentId: string;
  eventCategory: string;
}

const GEMINI_MODEL = 'gemini-4-hydrogen';

function loadCatalogData(): {
  equipment: CatalogEquipment[];
  timeline: TimelineRecord[];
  sourceIndex: Map<string, NasaSource>;
} {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const catalogRaw = fs.readFileSync(
    path.join(dataDir, 'equipment-catalog.json'),
    'utf-8'
  );
  const timelineRaw = fs.readFileSync(
    path.join(dataDir, 'mission-timeline.json'),
    'utf-8'
  );

  const catalogParsed = JSON.parse(catalogRaw) as {
    equipment: CatalogEquipment[];
  };
  const timelineParsed = JSON.parse(timelineRaw) as {
    events: TimelineRecord[];
  };

  const sourceIndex = new Map<string, NasaSource>();
  for (const item of catalogParsed.equipment) {
    for (const src of item.nasaSources) {
      sourceIndex.set(src.url, src);
    }
  }

  return {
    equipment: catalogParsed.equipment,
    timeline: timelineParsed.events,
    sourceIndex
  };
}

function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      const message = err instanceof Error ? err.message : String(err);
      const isTransient =
        message.includes('429') ||
        message.includes('503') ||
        message.includes('500') ||
        message.includes('UNAVAILABLE') ||
        message.includes('RESOURCE_EXHAUSTED');

      if (!isTransient || attempt > maxRetries) {
        throw err;
      }
      const delayMs = 600 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function parseJsonResponse<T>(rawText: string | undefined): T {
  if (!rawText) {
    throw new Error('Empty response received from Gemini API.');
  }
  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

function buildCompactKnowledgeBase(
  equipment: CatalogEquipment[],
  timeline: TimelineRecord[]
): string {
  const compactEquipment = equipment.map((item) => ({
    id: item.id,
    catalogCode: item.catalogCode,
    name: item.name,
    missionName: item.missionName,
    destination: item.destination,
    landingSite: item.landingSite,
    category: item.category,
    launchDate: item.launchDate,
    landingDate: item.landingDate,
    missionDuration: item.missionDuration,
    surfaceStatus: item.surfaceStatus,
    surfacePresence: item.surfacePresence,
    finalStatusSummary: item.finalStatusSummary,
    statusClarification: item.statusClarification,
    historicalBackground: item.historicalBackground,
    scientificPurpose: item.scientificPurpose,
    importantDiscoveries: item.importantDiscoveries,
    whatRemainsOnSurface: item.whatRemainsOnSurface,
    discardedComponents: item.discardedComponents,
    whyItMattersToday: item.whyItMattersToday,
    uncertainties: item.uncertainties,
    nasaSources: item.nasaSources
  }));

  const compactTimeline = timeline.map((ev) => ({
    year: ev.year,
    dateLabel: ev.dateLabel,
    title: ev.title,
    destination: ev.destination,
    missionName: ev.missionName,
    summary: ev.summary,
    equipmentId: ev.equipmentId,
    eventCategory: ev.eventCategory
  }));

  return JSON.stringify(
    {
      equipmentCatalog: compactEquipment,
      missionTimeline: compactTimeline
    },
    null,
    2
  );
}

function formatErrorStatus(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : 'Unexpected server error.';
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'AI request rate limit reached. Please wait a moment and try again.'
    };
  }
  if (raw.includes('API key')) {
    return {
      status: 503,
      message: 'Server Gemini API configuration is unavailable.'
    };
  }
  return {
    status: 500,
    message: 'Unable to complete the AI request right now. Please try again.'
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const { equipment, timeline, sourceIndex } = loadCatalogData();
  const knowledgeBaseJson = buildCompactKnowledgeBase(equipment, timeline);
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      catalogCount: equipment.length,
      timelineCount: timeline.length,
      aiConfigured: getGenAIClient() !== null
    });
  });

  // 1. AI Space Historian
  app.post('/api/ai/historian', async (req: Request, res: Response) => {
    try {
      const { question, equipmentId, history } = req.body as {
        question?: string;
        equipmentId?: string;
        history?: { role: 'user' | 'assistant'; text: string }[];
      };

      const trimmedQuestion = typeof question === 'string' ? question.trim() : '';
      if (!trimmedQuestion) {
        res.status(400).json({ error: 'Please enter a question for the AI Space Historian.' });
        return;
      }
      if (trimmedQuestion.length > 600) {
        res.status(400).json({ error: 'Question must be 600 characters or fewer.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini API key is not configured in server environment secrets (GEMINI_API_KEY).'
        });
        return;
      }

      const focusedItem = equipmentId ? equipmentById.get(equipmentId) : undefined;
      const recentHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map(
              (turn) =>
                `${turn.role === 'user' ? 'User' : 'Historian'}: ${String(turn.text).slice(0, 400)}`
            )
            .join('\n')
        : '';

      const systemInstruction = `You are the AI Space Historian for the "Forgotten Machines Atlas" (2026 NASA Space Apps Challenge, Team ALPHA Explorers).
Your sole authoritative knowledge base is the verified NASA equipment catalog and mission timeline JSON provided below.

STRICT SCIENTIFIC ACCURACY RULES:
1. Answer ONLY using facts present in the verified equipment catalog and mission timeline JSON.
2. NEVER invent launch/landing dates, exact coordinates, rover distances, mass figures, discoveries, or present-day hardware conditions not explicitly in the JSON.
3. If the user asks about something outside the 10 cataloged Moon and Mars equipment profiles, or asks for details not present in the dataset, clearly state what is known from the catalog and explicitly identify what is unknown or outside the verified archive.
4. Always preserve scientific uncertainty: if an item's status or physical condition is uncertain (e.g., ALSEP internal state after 1977, Surveyor 1 internal frame, Sojourner orbital resolution below ~65 cm, or long-term dust/radiation wear), state that uncertainty transparently.
5. Cite ONLY URLs from the "nasaSources" arrays in the verified catalog.`;

      const prompt = `VERIFIED KNOWLEDGE BASE (equipment-catalog.json & mission-timeline.json):
${knowledgeBaseJson}

${
  focusedItem
    ? `CURRENTLY FOCUSED EQUIPMENT PROFILE: ${focusedItem.name} (${focusedItem.id})\n`
    : ''
}${recentHistory ? `RECENT CONVERSATION:\n${recentHistory}\n` : ''}USER QUESTION:
${trimmedQuestion}`;

      interface HistorianModelResponse {
        answer: string;
        uncertaintyNote: string;
        relatedEquipmentIds: string[];
        sourceUrls: string[];
      }

      const parsed = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                answer: {
                  type: Type.STRING,
                  description:
                    'Clear, educational answer grounded strictly in the provided JSON dataset.'
                },
                uncertaintyNote: {
                  type: Type.STRING,
                  description:
                    'Explicit note about any scientifically uncertain or unverified facts relevant to the question.'
                },
                relatedEquipmentIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Matching equipment ids from equipmentCatalog.'
                },
                sourceUrls: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    'Exact NASA source URLs copied verbatim from nasaSources in the verified catalog.'
                }
              },
              required: [
                'answer',
                'uncertaintyNote',
                'relatedEquipmentIds',
                'sourceUrls'
              ]
            }
          }
        });

        return parseJsonResponse<HistorianModelResponse>(response.text);
      });

      const validRelatedIds = Array.from(
        new Set(
          (parsed.relatedEquipmentIds || []).filter((id) =>
            equipmentById.has(id)
          )
        )
      );
      if (validRelatedIds.length === 0 && focusedItem) {
        validRelatedIds.push(focusedItem.id);
      }

      const verifiedSources: NasaSource[] = [];
      const seenUrls = new Set<string>();
      for (const url of parsed.sourceUrls || []) {
        const match = sourceIndex.get(url);
        if (match && !seenUrls.has(match.url)) {
          seenUrls.add(match.url);
          verifiedSources.push(match);
        }
      }
      if (verifiedSources.length === 0) {
        for (const id of validRelatedIds) {
          const item = equipmentById.get(id);
          if (item) {
            for (const src of item.nasaSources) {
              if (!seenUrls.has(src.url)) {
                seenUrls.add(src.url);
                verifiedSources.push(src);
              }
            }
          }
        }
      }

      res.json({
        answer: parsed.answer,
        uncertaintyNote: parsed.uncertaintyNote,
        relatedEquipmentIds: validRelatedIds,
        sources: verifiedSources.slice(0, 5)
      });
    } catch (err) {
      const { status, message } = formatErrorStatus(err);
      res.status(status).json({ error: message });
    }
  });

  // 2. AI Mission Comparison
  app.post('/api/ai/compare', async (req: Request, res: Response) => {
    try {
      const { firstId, secondId } = req.body as {
        firstId?: string;
        secondId?: string;
      };

      if (!firstId || !secondId) {
        res.status(400).json({ error: 'Please select two equipment profiles to compare.' });
        return;
      }
      if (firstId === secondId) {
        res.status(400).json({ error: 'Please select two different equipment profiles.' });
        return;
      }

      const machineA = equipmentById.get(firstId);
      const machineB = equipmentById.get(secondId);
      if (!machineA || !machineB) {
        res.status(404).json({ error: 'One or both selected equipment profiles were not found.' });
        return;
      }

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini API key is not configured in server environment secrets (GEMINI_API_KEY).'
        });
        return;
      }

      const systemInstruction = `You are a NASA mission analyst for Forgotten Machines Atlas.
Compare ONLY the two verified equipment profiles provided below.
RULES:
1. Base every date, duration, objective, discovery, and outcome strictly on the JSON provided.
2. Never invent specs, coordinates, or post-mission states not present in the profiles.
3. Explicitly note uncertainties where NASA records do not establish modern physical condition.`;

      const prompt = `PROFILE A (${machineA.name}):
${JSON.stringify(machineA, null, 2)}

PROFILE B (${machineB.name}):
${JSON.stringify(machineB, null, 2)}

Generate an educational, accurate comparison covering mission objectives, launch/landing dates, operational duration, scientific contributions, mission outcomes, important differences, and uncertainty notes.`;

      interface ComparisonModelResponse {
        overview: string;
        missionObjectives: {
          machineA: string;
          machineB: string;
          takeaway: string;
        };
        datesAndTimeline: {
          machineA: string;
          machineB: string;
          takeaway: string;
        };
        operationalDuration: {
          machineA: string;
          machineB: string;
          takeaway: string;
        };
        scientificContributions: {
          machineA: string;
          machineB: string;
          takeaway: string;
        };
        missionOutcomes: {
          machineA: string;
          machineB: string;
          takeaway: string;
        };
        importantDifferences: string[];
        uncertaintiesComparison: string;
      }

      const comparisonSectionSchema = {
        type: Type.OBJECT,
        properties: {
          machineA: { type: Type.STRING },
          machineB: { type: Type.STRING },
          takeaway: { type: Type.STRING }
        },
        required: ['machineA', 'machineB', 'takeaway']
      };

      const comparison = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                missionObjectives: comparisonSectionSchema,
                datesAndTimeline: comparisonSectionSchema,
                operationalDuration: comparisonSectionSchema,
                scientificContributions: comparisonSectionSchema,
                missionOutcomes: comparisonSectionSchema,
                importantDifferences: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                uncertaintiesComparison: { type: Type.STRING }
              },
              required: [
                'overview',
                'missionObjectives',
                'datesAndTimeline',
                'operationalDuration',
                'scientificContributions',
                'missionOutcomes',
                'importantDifferences',
                'uncertaintiesComparison'
              ]
            }
          }
        });
        return parseJsonResponse<ComparisonModelResponse>(response.text);
      });

      const mergedSources: NasaSource[] = [];
      const seen = new Set<string>();
      for (const src of [...machineA.nasaSources, ...machineB.nasaSources]) {
        if (!seen.has(src.url)) {
          seen.add(src.url);
          mergedSources.push(src);
        }
      }

      res.json({
        machineA: {
          id: machineA.id,
          name: machineA.name,
          missionName: machineA.missionName,
          destination: machineA.destination,
          surfaceStatus: machineA.surfaceStatus
        },
        machineB: {
          id: machineB.id,
          name: machineB.name,
          missionName: machineB.missionName,
          destination: machineB.destination,
          surfaceStatus: machineB.surfaceStatus
        },
        comparison,
        sources: mergedSources
      });
    } catch (err) {
      const { status, message } = formatErrorStatus(err);
      res.status(status).json({ error: message });
    }
  });

  // 3. AI Knowledge Quiz
  app.post('/api/ai/quiz', async (req: Request, res: Response) => {
    try {
      const { difficulty, focus } = req.body as {
        difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
        focus?: 'All' | 'Moon' | 'Mars';
      };

      const validDifficulty =
        difficulty === 'Beginner' ||
        difficulty === 'Intermediate' ||
        difficulty === 'Advanced'
          ? difficulty
          : 'Beginner';

      const validFocus =
        focus === 'Moon' || focus === 'Mars' || focus === 'All' ? focus : 'All';

      const ai = getGenAIClient();
      if (!ai) {
        res.status(503).json({
          error:
            'Gemini API key is not configured in server environment secrets (GEMINI_API_KEY).'
        });
        return;
      }

      const filteredEquipment =
        validFocus === 'All'
          ? equipment
          : equipment.filter((item) => item.destination === validFocus);

      const focusedKb = buildCompactKnowledgeBase(
        filteredEquipment,
        timeline.filter(
          (ev) => validFocus === 'All' || ev.destination === validFocus
        )
      );

      const difficultyGuide =
        validDifficulty === 'Beginner'
          ? 'Focus on foundational mission purposes, destinations (Moon vs Mars), and iconic discoveries.'
          : validDifficulty === 'Intermediate'
          ? 'Focus on specific scientific instruments, landing sites, mission dates, and why hardware stopped operating or was left behind.'
          : 'Focus on nuanced comparative facts, specific discoveries (e.g., silica deposits, moonquake classes, ALSEP shutdown date, LRO/HiRISE verification vs uncertainty), and exact mission outcomes.';

      const systemInstruction = `You are creating an educational space exploration quiz for Forgotten Machines Atlas.
Generate exactly 5 unique multiple-choice questions strictly from the verified NASA catalog JSON below.
RULES:
1. Every question, correct answer, and explanation MUST be 100% verifiable in the provided JSON.
2. Never invent facts, dates, or distractor claims that contradict the explanation. Make the 3 incorrect options plausible yet clearly false according to the catalog.
3. Each question must cite one exact equipmentId and a valid NASA source URL from that item's nasaSources.`;

      const prompt = `DIFFICULTY: ${validDifficulty} (${difficultyGuide})
PLANETARY FOCUS: ${validFocus}
RANDOMIZATION SEED: ${Date.now()}

VERIFIED DATASET:
${focusedKb}

Create 5 distinct multiple-choice questions with 4 options each.`;

      interface QuizQuestionModel {
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
        equipmentId: string;
        sourceUrl: string;
      }

      const result = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      equipmentId: { type: Type.STRING },
                      sourceUrl: { type: Type.STRING }
                    },
                    required: [
                      'id',
                      'question',
                      'options',
                      'correctIndex',
                      'explanation',
                      'equipmentId',
                      'sourceUrl'
                    ]
                  }
                }
              },
              required: ['questions']
            }
          }
        });
        return parseJsonResponse<{ questions: QuizQuestionModel[] }>(
          response.text
        );
      });

      const sanitizedQuestions = (result.questions || [])
        .slice(0, 5)
        .map((q, index) => {
          const item = equipmentById.get(q.equipmentId) || filteredEquipment[0];
          const matchedSource =
            sourceIndex.get(q.sourceUrl) || item.nasaSources[0];
          const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
          const safeIndex =
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex < options.length
              ? q.correctIndex
              : 0;

          return {
            id: q.id || `q-${index + 1}`,
            question: q.question,
            options,
            correctIndex: safeIndex,
            explanation: q.explanation,
            equipmentId: item.id,
            equipmentName: item.name,
            sourceLabel: matchedSource.label,
            sourceUrl: matchedSource.url
          };
        })
        .filter((q) => q.options.length === 4 && Boolean(q.question));

      if (sanitizedQuestions.length === 0) {
        throw new Error('Quiz generation did not produce valid questions.');
      }

      res.json({
        difficulty: validDifficulty,
        focus: validFocus,
        questions: sanitizedQuestions
      });
    } catch (err) {
      const { status, message } = formatErrorStatus(err);
      res.status(status).json({ error: message });
    }
  });

  // API error fallback
  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const { status, message } = formatErrorStatus(err);
    res.status(status).json({ error: message });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Forgotten Machines Atlas server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
