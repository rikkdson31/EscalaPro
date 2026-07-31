import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Calendar, FileText, AlertCircle, BarChart2 } from 'lucide-react';
import { TabId } from '../../types';

interface ShortcutsProps {
  onNavigate: (tab: TabId) => void;
  openActionsCount: number;
}

export function Shortcuts({ onNavigate, openActionsCount }: ShortcutsProps) {
  const items = [
    { icon: <FileText size={20} />, label: 'Ocorrências', tab: 'time' as TabId, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: <AlertCircle size={20} />, label: 'Pendências', tab: 'tasks' as TabId, color: 'text-orange-600', bg: 'bg-orange-50', badge: openActionsCount },
    { icon: <Calendar size={20} />, label: 'Calendário', tab: 'calendar' as TabId, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <BarChart2 size={20} />, label: 'Estatísticas', tab: 'statistics' as TabId, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  return (
    <Card className="border-none shadow-sm mb-6">
      <CardContent className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Acesso Rápido</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {items.map((item, idx) => (
            <button 
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`relative p-3 rounded-2xl ${item.bg} ${item.color} transition-transform group-hover:scale-105`}>
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
