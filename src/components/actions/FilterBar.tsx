import React from 'react';

export type FilterType = 'ALL' | 'OPEN' | 'RESOLVED' | 'ARCHIVED';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-slate-800 text-white' 
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
      <FilterButton active={currentFilter === 'ALL'} onClick={() => onFilterChange('ALL')}>Todas</FilterButton>
      <FilterButton active={currentFilter === 'OPEN'} onClick={() => onFilterChange('OPEN')}>Abertas</FilterButton>
      <FilterButton active={currentFilter === 'RESOLVED'} onClick={() => onFilterChange('RESOLVED')}>Resolvidas</FilterButton>
      <FilterButton active={currentFilter === 'ARCHIVED'} onClick={() => onFilterChange('ARCHIVED')}>Arquivadas</FilterButton>
    </div>
  );
}
