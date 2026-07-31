import React, { useState } from 'react';
import { OCCURRENCE_TYPES } from './OccurrenceList';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronRight, Clock, Calendar } from 'lucide-react';
import { dateService } from '../../services/DateService';
import { ScheduleService } from '../../services/ScheduleService';
import { PendingItemType } from '../../types';

interface OccurrenceFormProps {
  occurrenceId: string;
  scheduleService: ScheduleService;
  todayDate: Date;
  onBack: () => void;
  onSubmit: (data: any, type: PendingItemType) => void;
}

export function OccurrenceForm({ occurrenceId, scheduleService, todayDate, onBack, onSubmit }: OccurrenceFormProps) {
  const occ = OCCURRENCE_TYPES.find(o => o.id === occurrenceId);
  const todayInfo = scheduleService.getDayInfo(todayDate);
  const isWorkDay = todayInfo.tipo === 'TRABALHO';
  
  const [time, setTime] = useState(() => {
    if (occurrenceId === 'forgot_entry' && isWorkDay) return todayInfo.entrada || '';
    if (occurrenceId === 'forgot_exit' && isWorkDay) return todayInfo.saida || '';
    return '';
  });
  
  const [justification, setJustification] = useState('');
  
  if (!occ) return null;
  const Icon = occ.icon;

  const handleSubmit = () => {
    onSubmit({ time, justification, occurrenceId: occ.id, title: occ.title }, occ.type as PendingItemType);
  };

  const needsTime = occurrenceId === 'forgot_entry' || occurrenceId === 'forgot_exit' || occurrenceId === 'extra_hours';

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white">
      <div className={`p-4 border-b border-slate-100 flex items-center gap-3 ${occ.bg}`}>
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-600"
        >
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <div className={`p-2 rounded-lg bg-white ${occ.color} shadow-sm`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">
          {occ.title}
        </h3>
      </div>
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data da Ocorrência</label>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
            <Calendar size={18} className="text-slate-400" />
            {dateService.formatExtenso(todayDate)}
          </div>
        </div>

        {needsTime && (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
              Horário
              {time && (occurrenceId === 'forgot_entry' || occurrenceId === 'forgot_exit') && isWorkDay && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full normal-case">
                  Sugestão com base na escala
                </span>
              )}
            </label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none text-lg font-medium"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalhes e Justificativa</label>
          <textarea 
            value={justification}
            onChange={e => setJustification(e.target.value)}
            className="w-full p-4 bg-white rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none min-h-[120px] resize-none"
            placeholder="Adicione observações importantes..."
          ></textarea>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!justification.trim() && (!time && needsTime)}
          className="w-full h-14 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg mt-2"
        >
          Enviar Ocorrência
        </Button>
      </CardContent>
    </Card>
  );
}
