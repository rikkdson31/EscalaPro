import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Calendar as CalendarIcon, ArrowRight, Briefcase, ShieldCheck, RefreshCw } from 'lucide-react';
import { dateService } from '../../services/DateService';
import { ScheduleService } from '../../services/ScheduleService';
import { DayInfo } from '../../engine/types';

interface NextEventsCardProps {
  scheduleService: ScheduleService;
  todayDate: Date;
}

export function NextEventsCard({ scheduleService, todayDate }: NextEventsCardProps) {
  let nextWork: DayInfo | null = null;
  let nextOff: DayInfo | null = null;
  let cycleChange: DayInfo | null = null;
  
  const todayInfo = scheduleService.getDayInfo(todayDate);
  const isWorkToday = todayInfo.tipo === 'TRABALHO';
  
  const MAX_LOOKAHEAD = 60;
  for (let i = 1; i <= MAX_LOOKAHEAD; i++) {
    const d = dateService.addDays(todayDate, i);
    const info = scheduleService.getDayInfo(d);
    
    if (!nextWork && info.tipo === 'TRABALHO') {
      nextWork = info;
    }
    if (!nextOff && info.tipo === 'FOLGA') {
      nextOff = info;
    }
    
    if (!cycleChange && info.tipo !== todayInfo.tipo) {
      cycleChange = info;
    }
    
    if (nextWork && nextOff && cycleChange) break;
  }
  
  const formatShort = (d: Date) => {
    return dateService.formatDDMM(d) + ' (' + dateService.formatWeekdayShort(d) + ')';
  };

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Próximos Eventos</h3>
        
        <div className="space-y-4">
          {nextWork && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Briefcase size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Próximo Turno: {formatShort(nextWork.data)}</p>
                <p className="text-sm font-bold text-slate-900">{nextWork.entrada} às {nextWork.saida}</p>
              </div>
            </div>
          )}
          
          {nextOff && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Próxima Folga: {formatShort(nextOff.data)}</p>
                <p className="text-sm font-bold text-slate-900">Dia Inteiro</p>
              </div>
            </div>
          )}
          
          {cycleChange && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <RefreshCw size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">Troca de Ciclo: {formatShort(cycleChange.data)}</p>
                <p className="text-sm font-bold text-slate-900">
                  {cycleChange.tipo === 'TRABALHO' ? 'Início do trabalho' : 'Início das folgas'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
