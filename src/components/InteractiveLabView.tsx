import { Box, HelpCircle, MessageSquare, Scale } from 'lucide-react';
import { EquipmentItem, LabTab } from '../types/equipment';
import { Equipment3DExplorer } from './Equipment3DExplorer';
import { AiHistorianView } from './AiHistorianView';
import { AiComparisonView } from './AiComparisonView';
import { AiQuizView } from './AiQuizView';

interface InteractiveLabViewProps {
  items: EquipmentItem[];
  activeTab: LabTab;
  focusedEquipmentId?: string;
  onChangeTab: (tab: LabTab) => void;
  onSelectEquipment: (id: string) => void;
}

const LAB_TABS: {
  id: LabTab;
  label: string;
  subtitle: string;
  icon: typeof Box;
}[] = [
  {
    id: '3d-explorer',
    label: '3D Equipment Explorer',
    subtitle: 'Interactive Moon & Mars models',
    icon: Box
  },
  {
    id: 'historian',
    label: 'AI Space Historian',
    subtitle: 'Grounded Q&A with NASA citations',
    icon: MessageSquare
  },
  {
    id: 'compare',
    label: 'AI Mission Comparison',
    subtitle: 'Side-by-side archive synthesis',
    icon: Scale
  },
  {
    id: 'quiz',
    label: 'AI Knowledge Quiz',
    subtitle: '3 difficulty tiers & score tracking',
    icon: HelpCircle
  }
];

export function InteractiveLabView({
  items,
  activeTab,
  focusedEquipmentId,
  onChangeTab,
  onSelectEquipment
}: InteractiveLabViewProps) {
  return (
    <div className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="border-b border-[#1E3666] pb-8">
          <p className="font-mono text-xs tracking-wider text-[#20B9C9]">
            Interactive Exploration &amp; AI Research Suite
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#E6EDF7] sm:text-4xl">
            3D &amp; AI Exploration Lab
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#C5D2E8]">
            Inspect illustrative Three.js models of NASA’s lunar and Martian
            hardware, question our catalog-grounded AI Space Historian, compare
            any two missions side by side, and test your mastery across three
            difficulty levels.
          </p>

          {/* Module Tabs */}
          <div
            role="tablist"
            aria-label="3D and AI Exploration Modules"
            className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {LAB_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onChangeTab(tab.id)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-[#20B9C9] bg-[#14264A]'
                      : 'border-[#1E3666] bg-[#0D152B] hover:border-[#2463C5]'
                  }`}
                >
                  <Icon
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      isSelected ? 'text-[#20B9C9]' : 'text-[#7AA7F7]'
                    }`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-display text-sm font-semibold text-[#E6EDF7]">
                      {tab.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9FB2D1]">
                      {tab.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </header>

        <div className="mt-8">
          {activeTab === '3d-explorer' && (
            <Equipment3DExplorer
              items={items}
              initialEquipmentId={
                focusedEquipmentId || 'apollo-lm-descent-stages'
              }
              allowEquipmentSwitch
              onOpenDetail={onSelectEquipment}
            />
          )}

          {activeTab === 'historian' && (
            <AiHistorianView
              items={items}
              focusedEquipmentId={focusedEquipmentId}
              onSelectEquipment={onSelectEquipment}
            />
          )}

          {activeTab === 'compare' && (
            <AiComparisonView
              items={items}
              onSelectEquipment={onSelectEquipment}
            />
          )}

          {activeTab === 'quiz' && (
            <AiQuizView onSelectEquipment={onSelectEquipment} />
          )}
        </div>
      </div>
    </div>
  );
}
