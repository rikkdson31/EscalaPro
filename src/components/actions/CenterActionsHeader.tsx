import React from 'react';
import { dateService } from '../../services/DateService';

interface CenterActionsHeaderProps {
  openCount: number;
}

export function CenterActionsHeader({ openCount }: CenterActionsHeaderProps) {
  const todayStr = dateService.formatExtenso(dateService.now());
  const hasOpen = openCount > 0;

  return (
    <div className="px-4 pt-6 pb-4 bg-white border-b border-slate-200 shrink-0">
      <h1 className="text-2xl font-bold text-slate-900">Centro de Ações</h1>
      <p className="text-slate-500 mt-1">{todayStr}</p>
      <div className="flex items-center gap-2 mt-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
          hasOpen ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'
        }`}>
          {openCount} {openCount === 1 ? 'ação aberta' : 'ações abertas'}
        </span>
      </div>
    </div>
  );
}
