/**
 * MeetingsFilter - Filter buttons for meetings
 */

import React from 'react';
import { MeetingsControllerFindAllFilter } from '@/src/shared/api/generated/meetingsQualityAPI.schemas';
import { FILTER_LABELS } from '@/src/shared/constants';

interface MeetingsFilterProps {
  currentFilter: MeetingsControllerFindAllFilter;
  onFilterChange: (filter: MeetingsControllerFindAllFilter) => void;
}

export const MeetingsFilter: React.FC<MeetingsFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterChange(MeetingsControllerFindAllFilter.current)}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          currentFilter === MeetingsControllerFindAllFilter.current
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {FILTER_LABELS[MeetingsControllerFindAllFilter.current]}
      </button>
      <button
        onClick={() => onFilterChange(MeetingsControllerFindAllFilter.past)}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          currentFilter === MeetingsControllerFindAllFilter.past
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {FILTER_LABELS[MeetingsControllerFindAllFilter.past]}
      </button>
      <button
        onClick={() => onFilterChange(MeetingsControllerFindAllFilter.upcoming)}
        className={`px-6 py-2 rounded-full font-semibold transition-all ${
          currentFilter === MeetingsControllerFindAllFilter.upcoming
            ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
      >
        {FILTER_LABELS[MeetingsControllerFindAllFilter.upcoming]}
      </button>
    </div>
  );
};
