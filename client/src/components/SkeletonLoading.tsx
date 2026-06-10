import React from 'react';

export function AccountsPageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-slate-700 rounded-lg w-32 mb-4"></div>

      {/* Quick Stats Cards skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-4 space-y-2">
            <div className="h-4 bg-slate-700 rounded w-20"></div>
            <div className="h-6 bg-slate-700 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Account cards skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-24"></div>
                <div className="h-3 bg-slate-700 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpensesPageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-slate-700 rounded-lg w-32 mb-4"></div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-slate-700 rounded-full w-20 flex-shrink-0"></div>
        ))}
      </div>

      {/* Expense items skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-32"></div>
                <div className="h-3 bg-slate-700 rounded w-24"></div>
              </div>
              <div className="h-5 bg-slate-700 rounded w-20"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-3 bg-slate-700 rounded w-16"></div>
              <div className="h-3 bg-slate-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentsPageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-slate-700 rounded-lg w-32 mb-4"></div>

      {/* Agent cards skeleton */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-28"></div>
                <div className="h-3 bg-slate-700 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-3 space-y-2">
            <div className="h-3 bg-slate-700 rounded w-16"></div>
            <div className="h-5 bg-slate-700 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#1E293B] rounded-xl p-4">
            <div className="h-4 bg-slate-700 rounded w-24 mb-3"></div>
            <div className="h-48 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
