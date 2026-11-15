export type Destination = 'Moon' | 'Mars';

export type EquipmentCategory =
  | 'Lander & Descent Stage'
  | 'Rover'
  | 'Scientific Package';

export type SurfaceStatus =
  | 'Intentionally Left Behind'
  | 'Stopped Operating'
  | 'Condition Uncertain';

export type AppSection =
  | 'home'
  | 'moon'
  | 'mars'
  | 'timeline'
  | 'search'
  | 'about'
  | 'detail'
  | 'lab';

export interface NasaReferenceLink {
  label: string;
  url: string;
  source: 'NASA NSSDCA' | 'NASA Science' | 'NASA.gov';
}

export interface EquipmentItem {
  id: string;
  catalogCode: string;
  name: string;
  missionName: string;
  destination: Destination;
  landingSite: string;
  category: EquipmentCategory;
  launchDate: string;
  landingDate: string;
  missionDuration: string;
  finalStatusSummary: string;
  surfaceStatus: SurfaceStatus;
  surfacePresence: string;
  statusClarification: string;
  imageUrl: string;
  imageCaption: string;
  shortSummary: string;
  historicalBackground: string;
  scientificPurpose: string;
  importantDiscoveries: string[];
  whatRemainsOnSurface: string;
  discardedComponents: string;
  whyItMattersToday: string;
  uncertainties: string;
  nasaSources: NasaReferenceLink[];
  featured?: boolean;
}

export interface TimelineEvent {
  id: string;
  year: number;
  dateLabel: string;
  title: string;
  destination: Destination;
  missionName: string;
  summary: string;
  equipmentId: string;
  eventCategory: 'Landing' | 'Milestone' | 'Mission End' | 'Revisit';
}

export interface EquipmentFilterCriteria {
  query?: string;
  destination?: Destination | 'All';
  category?: EquipmentCategory | 'All';
  surfaceStatus?: SurfaceStatus | 'All';
}

export interface AtlasSummaryStats {
  total: number;
  moonCount: number;
  marsCount: number;
  leftBehindCount: number;
  stoppedOperatingCount: number;
  conditionUncertainCount: number;
}

export type GlossaryCategory =
  | 'Spacecraft & Propulsion'
  | 'Planetary Geology'
  | 'Instruments & Operations';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: GlossaryCategory;
  definition: string;
  atlasContext: string;
  relatedEquipment: { id: string; name: string }[];
  sourceLabel: string;
  sourceUrl: string;
}

export type LabTab = '3d-explorer' | 'historian' | 'compare' | 'quiz';

export interface SubsystemHotspot {
  id: string;
  name: string;
  role: string;
  details: string;
  position: [number, number, number];
  cameraOffset: [number, number, number];
}

export interface Equipment3DSpec {
  equipmentId: string;
  environment: 'Moon' | 'Mars';
  modelSummary: string;
  defaultCameraPosition: [number, number, number];
  defaultTarget: [number, number, number];
  hotspots: SubsystemHotspot[];
}

export interface HistorianMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  uncertaintyNote?: string;
  relatedEquipmentIds?: string[];
  sources?: NasaReferenceLink[];
  timestamp: string;
}

export interface HistorianApiResponse {
  answer: string;
  uncertaintyNote: string;
  relatedEquipmentIds: string[];
  sources: NasaReferenceLink[];
}

export interface ComparisonSection {
  machineA: string;
  machineB: string;
  takeaway: string;
}

export interface ComparisonApiResponse {
  machineA: {
    id: string;
    name: string;
    missionName: string;
    destination: Destination;
    surfaceStatus: SurfaceStatus;
  };
  machineB: {
    id: string;
    name: string;
    missionName: string;
    destination: Destination;
    surfaceStatus: SurfaceStatus;
  };
  comparison: {
    overview: string;
    missionObjectives: ComparisonSection;
    datesAndTimeline: ComparisonSection;
    operationalDuration: ComparisonSection;
    scientificContributions: ComparisonSection;
    missionOutcomes: ComparisonSection;
    importantDifferences: string[];
    uncertaintiesComparison: string;
  };
  sources: NasaReferenceLink[];
}

export type QuizDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  equipmentId: string;
  equipmentName: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface QuizApiResponse {
  difficulty: QuizDifficulty;
  focus: 'All' | 'Moon' | 'Mars';
  questions: QuizQuestion[];
}
