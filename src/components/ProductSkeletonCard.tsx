import React from 'react';

interface ProductSkeletonCardProps {
  viewMode?: 'grid' | 'list';
}

export const ProductSkeletonCard: React.FC<ProductSkeletonCardProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-150 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-pulse">
        <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
          <div className="h-3 bg-slate-200 rounded w-1/4 mx-auto sm:mx-0" />
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto sm:mx-0" />
          <div className="h-3 bg-slate-150 rounded w-1/3 mx-auto sm:mx-0" />
        </div>
        <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
          <div className="h-5 bg-emerald-200/80 rounded w-20 mx-auto sm:mx-0" />
          <div className="h-8 bg-emerald-200/70 rounded-xl w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between animate-pulse">
      <div>
        {/* Product image area */}
        <div className="relative h-44 bg-slate-200/90">
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-300/80" />
          <div className="absolute bottom-2 left-2 h-4 w-14 bg-slate-300/80 rounded-lg" />
        </div>

        {/* Content area */}
        <div className="p-3.5 space-y-2">
          <div className="h-2.5 bg-emerald-200/70 rounded w-1/3" />
          <div className="h-3.5 bg-slate-200 rounded w-4/5" />
          <div className="h-3 bg-slate-150 rounded w-1/2" />
          <div className="h-4 bg-emerald-300/60 rounded w-2/5 pt-1" />
        </div>
      </div>

      {/* Buttons */}
      <div className="p-3 pt-0 flex flex-col gap-2">
        <div className="h-8 bg-emerald-200/80 rounded-xl w-full" />
        <div className="h-7 bg-slate-200 rounded-xl w-full" />
      </div>
    </div>
  );
};
