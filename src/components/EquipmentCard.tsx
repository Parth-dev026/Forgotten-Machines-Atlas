import { ArrowRight } from 'lucide-react';
import { EquipmentItem } from '../types/equipment';
import { ResilientImage } from './ResilientImage';
import { StatusIndicator } from './StatusIndicator';

interface EquipmentCardProps {
  item: EquipmentItem;
  onSelect: (id: string) => void;
}

export function EquipmentCard({ item, onSelect }: EquipmentCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#1E3666] bg-[#14264A]/45 transition-colors duration-200 hover:border-[#20B9C9]/60">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#080D1C]">
        <ResilientImage
          src={item.imageUrl}
          alt={`${item.name} — ${item.missionName}`}
          fallbackTitle={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1C]/85 via-[#080D1C]/20 to-transparent"
        />
        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-[#E6EDF7]/90 tabular-nums">
            {item.catalogCode}
          </span>
          <span className="font-mono text-xs text-[#9FB2D1] tabular-nums">
            {item.landingDate.split('(')[0].trim()}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Unboxed typographic metadata separator */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[#9FB2D1]">
            <span>{item.destination}</span>
            <span aria-hidden="true">·</span>
            <span>{item.category}</span>
          </div>

          <h3 className="font-display text-xl font-semibold leading-snug text-[#E6EDF7]">
            {item.name}
          </h3>

          <p className="mt-1 text-sm font-medium text-[#20B9C9]">
            {item.missionName}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-[#C5D2E8]">
            {item.shortSummary}
          </p>
        </div>

        <div className="mt-5 border-t border-[#1E3666]/80 pt-4">
          <StatusIndicator status={item.surfaceStatus} className="mb-3" />
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-medium text-[#E6EDF7] transition-colors hover:text-[#20B9C9]"
            >
              <span>Inspect Mission Profile</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
