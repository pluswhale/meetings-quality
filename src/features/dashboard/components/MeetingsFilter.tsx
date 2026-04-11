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
  const filters = [
    MeetingsControllerFindAllFilter.current,
    MeetingsControllerFindAllFilter.past,
    MeetingsControllerFindAllFilter.upcoming,
  ];

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            currentFilter === filter
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
          }`}
        >
          {FILTER_LABELS[filter]}
        </button>
      ))}
    </div>
  );
};
