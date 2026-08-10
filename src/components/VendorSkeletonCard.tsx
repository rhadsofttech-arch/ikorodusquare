import React from 'react';

interface VendorSkeletonCardProps {
  viewMode?: 'grid' | 'list';
}

export const VendorSkeletonCard: React.FC<VendorSkeletonCardProps> = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-3xl border border-gray-150 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-pulse">
        <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left w-full">
          <div className="h-5 bg-slate-200 rounded-lg w-1/2 mx-auto sm:mx-0" />
          <div className="h-3.5 bg-slate-150 rounded-md w-1/3 mx-auto sm:mx-0" />
          <div className="h-3 bg-slate-100 rounded-md w-4/5 mx-auto sm:mx-0" />
        </div>
        <div className="flex flex-col sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="h-4 bg-amber-100 rounded-md w-24 mx-auto sm:mx-0" />
          <div className="flex items-center gap-2">
            <div className="h-8 bg-slate-200 rounded-xl w-24" />
            <div className="h-8 bg-emerald-200/70 rounded-xl w-28" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between animate-pulse">
      <div>
        {/* Cover image area */}
        <div className="relative h-44 bg-slate-200/90">
          <div className="absolute top-3 left-3 flex gap-1.5">
            <div className="h-5 w-20 bg-slate-300/80 rounded-full" />
            <div className="h-5 w-16 bg-slate-300/80 rounded-full" />
          </div>
          <div className="absolute bottom-3 right-3 h-5 w-16 bg-slate-300/80 rounded-lg" />
        </div>

        {/* Details area */}
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-300 border-2 border-white shadow-md -mt-8 relative z-10 shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-150 rounded-md w-1/2" />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-150 rounded w-1/4" />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2">
        <div className="h-8 bg-slate-200 rounded-xl flex-1" />
        <div className="h-8 bg-emerald-200/80 rounded-xl flex-1" />
      </div>
    </div>
  );
};
