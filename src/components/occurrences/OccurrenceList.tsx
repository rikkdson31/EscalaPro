import React from 'react';
import { Clock, Calendar, AlertCircle, MessageSquare, ChevronRight } from 'lucide-react';

export const OCCURRENCE_TYPES = [
  { id: 'forgot_entry', title: 'Esqueci a Entrada', description: 'Não registrei o horário que cheguei.', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', type: 'MISSING_ENTRY' },
  { id: 'forgot_exit', title: 'Esqueci a Saída', description: 'Fui embora e não registrei o ponto final.', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', type: 'MISSING_EXIT' },
  { id: 'worked_offday', title: 'Trabalhei na Folga', description: 'Fui convocado em um dia de descanso.', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', type: 'MANUAL_REVIEW' },
  { id: 'extra_hours', title: 'Fiz Hora Extra', description: 'Trabalhei além do meu horário previsto.', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', type: 'MANUAL_REVIEW' },
  { id: 'shift_change', title: 'Troquei de Turno', description: 'Realizei uma troca com outro colega.', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', type: 'MANUAL_REVIEW' },
  { id: 'different_journey', title: 'Jornada Diferente', description: 'Horários diferentes do programado.', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', type: 'MANUAL_REVIEW' },
  { id: 'other', title: 'Outra Ocorrência', description: 'Relatar um acontecimento diferente.', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', type: 'MANUAL_REVIEW' },
];

interface OccurrenceListProps {
  onSelect: (id: string) => void;
}

export function OccurrenceList({ onSelect }: OccurrenceListProps) {
  return (
    <div className="space-y-3">
      {OCCURRENCE_TYPES.map((occ) => {
        const Icon = occ.icon;
        return (
          <button
            key={occ.id}
            onClick={() => onSelect(occ.id)}
            className={`w-full flex items-center p-4 bg-white rounded-2xl shadow-sm border ${occ.border} hover:border-slate-300 hover:shadow-md transition-all group text-left`}
          >
            <div className={`p-3 rounded-xl ${occ.bg} ${occ.color} mr-4 group-hover:scale-110 transition-transform`}>
              <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <span className="block font-bold text-slate-800 text-lg mb-0.5 group-hover:text-slate-900 transition-colors">
                {occ.title}
              </span>
              <span className="block text-xs font-medium text-slate-500">
                {occ.description}
              </span>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors ml-2" />
          </button>
        );
      })}
    </div>
  );
}
