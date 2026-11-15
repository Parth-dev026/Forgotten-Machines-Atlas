import { EquipmentItem, TimelineEvent } from '../types/equipment';

export interface StoryFactItem {
  label: string;
  value: string;
  mono?: boolean;
}

export interface StoryChapter {
  number: number;
  id: 'begins' | 'journey' | 'discoveries' | 'final' | 'legacy';
  title: string;
  subtitle: string;
  educationalIntro: string;
  primaryNarrative: string;
  secondaryNarrative?: string;
  factsHeading: string;
  verifiedFacts: StoryFactItem[];
  bulletHeading?: string;
  verifiedBullets?: string[];
  uncertaintyNote?: string;
  includeNasaLinks?: boolean;
  photoNote: string;
}

/**
 * Derives a structured 5-chapter guided story directly from verified catalog
 * and timeline JSON records—preserving scientific accuracy without duplicating data.
 */
export function buildMissionStoryChapters(
  item: EquipmentItem,
  allTimelineEvents: TimelineEvent[]
): StoryChapter[] {
  const relatedEvents = allTimelineEvents.filter(
    (ev) => ev.equipmentId === item.id
  );

  const destinationContext =
    item.destination === 'Moon'
      ? 'lunar exploration'
      : 'Martian planetary exploration';

  const milestoneBullets = relatedEvents.map(
    (ev) => `${ev.dateLabel} — ${ev.title}: ${ev.summary}`
  );

  return [
    {
      number: 1,
      id: 'begins',
      title: 'The Mission Begins',
      subtitle: 'Why NASA built and launched this machine',
      educationalIntro: `Educational Context: Every spacecraft sent to the ${item.destination} began as an engineering answer to a specific scientific question. This chapter looks at why NASA created ${item.name} for ${destinationContext}.`,
      primaryNarrative: item.historicalBackground,
      secondaryNarrative: item.scientificPurpose,
      factsHeading: 'Verified Launch & Program Record',
      verifiedFacts: [
        { label: 'Equipment', value: item.name },
        { label: 'Mission', value: item.missionName },
        { label: 'Category', value: item.category },
        { label: 'Launch Date', value: item.launchDate, mono: true }
      ],
      photoNote: `${item.missionName} archival plate — engineered for ${item.destination} surface operations.`
    },
    {
      number: 2,
      id: 'journey',
      title: 'The Journey',
      subtitle: `Arrival at ${item.destination} and key milestones`,
      educationalIntro: `Educational Context: Reaching ${item.landingSite} required surviving launch, interplanetary or cislunar transit, and a precision descent onto unfamiliar terrain.`,
      primaryNarrative: `${item.name} touched down on ${item.destination} at ${item.landingSite} (${item.landingDate}) and carried out surface operations across a mission duration of ${item.missionDuration}.`,
      secondaryNarrative:
        relatedEvents.length > 0
          ? 'Below are the verified historical milestones recorded in the mission timeline for this hardware.'
          : undefined,
      factsHeading: 'Verified Arrival & Duration Record',
      verifiedFacts: [
        { label: 'Destination', value: item.destination },
        { label: 'Landing Site', value: item.landingSite },
        { label: 'Landing Date', value: item.landingDate, mono: true },
        { label: 'Operational Span', value: item.missionDuration, mono: true }
      ],
      bulletHeading:
        milestoneBullets.length > 0 ? 'Recorded Mission Milestones' : undefined,
      verifiedBullets:
        milestoneBullets.length > 0 ? milestoneBullets : undefined,
      photoNote: `Target site: ${item.destination} — ${item.landingSite}.`
    },
    {
      number: 3,
      id: 'discoveries',
      title: 'The Discoveries',
      subtitle: 'Scientific work and achievements on the surface',
      educationalIntro: `Educational Context: Once safely on the surface, ${item.name} acted as a scientific extension of researchers on Earth—turning measurements, images, and samples into lasting knowledge.`,
      primaryNarrative: item.shortSummary,
      secondaryNarrative: `Primary scientific objective: ${item.scientificPurpose}`,
      factsHeading: 'Verified Scientific Scope',
      verifiedFacts: [
        { label: 'Mission', value: item.missionName },
        { label: 'Equipment Role', value: item.category }
      ],
      bulletHeading: 'Verified Discoveries & Achievements',
      verifiedBullets: item.importantDiscoveries,
      photoNote: item.imageCaption
    },
    {
      number: 4,
      id: 'final',
      title: 'The Final Chapter',
      subtitle: 'What ended operations and what remains today',
      educationalIntro: `Educational Context: Spacecraft rarely return to Earth. Depending on their design and environment, machines are intentionally left behind, fall silent after exhausting power or encountering hazards, or sit unmonitored with an uncertain modern condition.`,
      primaryNarrative: item.statusClarification,
      secondaryNarrative: `On the planetary surface: ${item.whatRemainsOnSurface} Detached or discarded subsystems: ${item.discardedComponents}`,
      factsHeading: 'Verified Outcome & Surface Record',
      verifiedFacts: [
        { label: 'Outcome Category', value: item.surfaceStatus },
        { label: 'Orbital Verification', value: item.surfacePresence },
        { label: 'Final Status', value: item.finalStatusSummary }
      ],
      uncertaintyNote: item.uncertainties,
      photoNote: `Current verification: ${item.surfacePresence}.`
    },
    {
      number: 5,
      id: 'legacy',
      title: 'The Legacy',
      subtitle: 'How this machine shapes future exploration',
      educationalIntro: `Educational Context: Even after transmissions stop, retired spacecraft remain vital classrooms in engineering, materials science, and planetary heritage for the next generation of explorers.`,
      primaryNarrative: item.whyItMattersToday,
      factsHeading: 'Archive & Primary Source Verification',
      verifiedFacts: [
        { label: 'Catalog Record', value: item.catalogCode, mono: true },
        { label: 'Destination Heritage', value: `${item.destination} (${item.landingSite})` }
      ],
      includeNasaLinks: true,
      photoNote: `Preserved in the Forgotten Machines Atlas under catalog code ${item.catalogCode}.`
    }
  ];
}
