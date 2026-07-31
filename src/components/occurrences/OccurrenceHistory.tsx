import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { PendingItem, PendingItemStatus } from '../../types';
import { dateService } from '../../services/DateService';
import { Clock, CheckCircle2, Archive, AlertCircle } from 'lucide-react';

interface OccurrenceHistoryProps {
  items: PendingItem[];
}

export function OccurrenceHistory({ items }: OccurrenceHistoryProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
          <Clock size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Sem registros</h3>
        <p className="text-slate-500 text-sm font-medium">Nenhuma ocorrência registrada no sistema.</p>
      </div>
    );
  }

  const getStatusConfig = (status: PendingItemStatus) => {
    switch (status) {
      case PendingItemStatus.RESOLVED:
      case PendingItemStatus.JUSTIFIED:
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Resolvida' };
      case PendingItemStatus.ARCHIVED:
        return { icon: Archive, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Arquivada' };
      default:
        return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Em Análise' };
    }
  };

  return (
    <div className="space-y-3">
      {items.map(item => {
        const sConf = getStatusConfig(item.status);
        const Icon = sConf.icon;
        
        return (
          <Card key={item.id} className="border-slate-200 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-xl ${sConf.bg} ${sConf.color} shrink-0 mt-0.5`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${sConf.bg} ${sConf.color} shrink-0`}>
                      {sConf.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {dateService.formatDDMMYYYY(dateService.parseISOString(item.createdAt))}
                  </p>
                  <p className="text-sm font-medium text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
