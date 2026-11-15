import { SurfaceStatus } from '../types/equipment';

interface StatusIndicatorProps {
  status: SurfaceStatus;
  className?: string;
}

export function StatusIndicator({ status, className = '' }: StatusIndicatorProps) {
  if (status === 'Intentionally Left Behind') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#7AA7F7] ${className}`}
      >
        <span aria-hidden="true">◆</span>
        <span>Intentionally Left Behind</span>
      </span>
    );
  }

  if (status === 'Stopped Operating') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#20B9C9] ${className}`}
      >
        <span aria-hidden="true">●</span>
        <span>Stopped Operating on Surface</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-[#F5B041] ${className}`}
    >
      <span aria-hidden="true">▲</span>
      <span>Current Physical Condition Uncertain</span>
    </span>
  );
}
