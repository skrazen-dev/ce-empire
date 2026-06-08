import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton-shimmer bg-white/5 rounded-lg', className)} />
  );
}

export function SkeletonAccountCard() {
  return (
    <div className="bg-[#1A1F26] border border-white/5 rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonExpenseCard() {
  return (
    <div className="bg-[#1A1F26] border border-white/5 rounded-xl p-3.5 flex items-center gap-3 animate-fade-in">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonAgentCard() {
  return (
    <div className="bg-[#1A1F26] border border-white/5 rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="bg-[#1A1F26] border border-white/5 rounded-xl p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      {/* Chart */}
      <div className="bg-[#1A1F26] border border-white/5 rounded-xl p-4">
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4, type = 'account' }: { count?: number; type?: 'account' | 'expense' | 'agent' }) {
  const Component = type === 'expense' ? SkeletonExpenseCard : type === 'agent' ? SkeletonAgentCard : SkeletonAccountCard;
  return (
    <div className="space-y-3 stagger-children">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}
