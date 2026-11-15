import {
  AtlasSummaryStats,
  Destination,
  EquipmentFilterCriteria,
  EquipmentItem,
  GlossaryTerm,
  TimelineEvent
} from '../types/equipment';

interface CatalogDatasetResponse {
  schemaVersion: string;
  lastVerified: string;
  equipment: EquipmentItem[];
}

interface TimelineDatasetResponse {
  schemaVersion: string;
  lastVerified: string;
  events: TimelineEvent[];
}

interface GlossaryDatasetResponse {
  schemaVersion: string;
  lastVerified: string;
  terms: GlossaryTerm[];
}

let cachedCatalog: EquipmentItem[] | null = null;
let cachedTimeline: TimelineEvent[] | null = null;
let cachedGlossary: GlossaryTerm[] | null = null;

async function loadCatalogData(): Promise<EquipmentItem[]> {
  if (cachedCatalog) {
    return cachedCatalog;
  }

  const response = await fetch('/data/equipment-catalog.json');
  if (!response.ok) {
    throw new Error(`Failed to load equipment catalog (${response.status})`);
  }
  const data = (await response.json()) as CatalogDatasetResponse;
  cachedCatalog = Array.isArray(data.equipment) ? data.equipment : [];
  return cachedCatalog;
}

async function loadTimelineData(): Promise<TimelineEvent[]> {
  if (cachedTimeline) {
    return cachedTimeline;
  }

  const response = await fetch('/data/mission-timeline.json');
  if (!response.ok) {
    throw new Error(`Failed to load mission timeline (${response.status})`);
  }
  const data = (await response.json()) as TimelineDatasetResponse;
  cachedTimeline = Array.isArray(data.events) ? data.events : [];
  return cachedTimeline;
}

async function loadGlossaryData(): Promise<GlossaryTerm[]> {
  if (cachedGlossary) {
    return cachedGlossary;
  }

  const response = await fetch('/data/space-glossary.json');
  if (!response.ok) {
    throw new Error(`Failed to load space glossary (${response.status})`);
  }
  const data = (await response.json()) as GlossaryDatasetResponse;
  cachedGlossary = Array.isArray(data.terms) ? data.terms : [];
  return cachedGlossary;
}

/**
 * Fetches equipment records from the maintainable JSON dataset in /public/data/equipment-catalog.json.
 * Updating the JSON file updates the live catalog without rebuilding the frontend.
 */
export async function fetchEquipmentCatalog(
  criteria?: EquipmentFilterCriteria
): Promise<EquipmentItem[]> {
  const catalog = await loadCatalogData();
  let results = [...catalog];

  if (!criteria) {
    return results;
  }

  if (criteria.destination && criteria.destination !== 'All') {
    results = results.filter((item) => item.destination === criteria.destination);
  }

  if (criteria.category && criteria.category !== 'All') {
    results = results.filter((item) => item.category === criteria.category);
  }

  if (criteria.surfaceStatus && criteria.surfaceStatus !== 'All') {
    results = results.filter((item) => item.surfaceStatus === criteria.surfaceStatus);
  }

  if (criteria.query && criteria.query.trim().length > 0) {
    const q = criteria.query.trim().toLowerCase();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.missionName.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.landingSite.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.shortSummary.toLowerCase().includes(q) ||
        item.importantDiscoveries.some((d) => d.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function fetchEquipmentById(
  id: string
): Promise<EquipmentItem | undefined> {
  const catalog = await loadCatalogData();
  return catalog.find((item) => item.id === id);
}

export async function fetchTimelineEvents(
  destinationFilter: Destination | 'All' = 'All',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<TimelineEvent[]> {
  const timeline = await loadTimelineData();
  const filtered =
    destinationFilter === 'All'
      ? [...timeline]
      : timeline.filter((ev) => ev.destination === destinationFilter);

  if (sortOrder === 'desc') {
    return filtered.reverse();
  }
  return filtered;
}

export async function fetchSpaceGlossary(): Promise<GlossaryTerm[]> {
  const terms = await loadGlossaryData();
  return [...terms].sort((a, b) => a.term.localeCompare(b.term));
}

export function calculateAtlasSummaryStats(
  catalog: EquipmentItem[]
): AtlasSummaryStats {
  return {
    total: catalog.length,
    moonCount: catalog.filter((e) => e.destination === 'Moon').length,
    marsCount: catalog.filter((e) => e.destination === 'Mars').length,
    leftBehindCount: catalog.filter(
      (e) => e.surfaceStatus === 'Intentionally Left Behind'
    ).length,
    stoppedOperatingCount: catalog.filter(
      (e) => e.surfaceStatus === 'Stopped Operating'
    ).length,
    conditionUncertainCount: catalog.filter(
      (e) => e.surfaceStatus === 'Condition Uncertain'
    ).length
  };
}
