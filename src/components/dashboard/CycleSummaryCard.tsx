import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Briefcase, Calendar as CalendarIcon, ArrowRightCircle } from 'lucide-react';
import { ScheduleService } from '../../services/ScheduleService';
import { ScheduleConfig } from '../../engine/types';

interface CycleSummaryCardProps {
  scheduleService: ScheduleService;
  todayDate: Date;
  config: ScheduleConfig;
}

export function CycleSummaryCard({ scheduleService, todayDate, config }: CycleSummaryCardProps) {
  const todayInfo = scheduleService.getDayInfo(todayDate);
  const isWorkDay = todayInfo.tipo === 'TRABALHO';
  
  // Quick forward calculation to find days until change using central function
  const remainingDays = isWorkDay 
    ? scheduleService.getDaysUntilNextOff(todayDate) - 1
    : scheduleService.getDaysUntilNextWork(todayDate) - 1;

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Meu Ciclo</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" />
              <span className="text-sm text-slate-700 font-medium">Escala</span>
            </div>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-sm">{config.tipoEscala}</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon size={16} className={isWorkDay ? 'text-emerald-500' : 'text-blue-500'} />
              <span className="text-sm text-slate-700 font-medium">Dia Atual</span>
            </div>
            <span className="font-bold text-slate-900">{todayInfo.posicaoLabel}</span>
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <div className="flex items-center gap-2">
              <ArrowRightCircle size={16} className="text-purple-500" />
              <span className="text-sm text-slate-700 font-medium">Faltam p/ mudança</span>
            </div>
            <span className="font-bold text-slate-900">{remainingDays} dia{remainingDays !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
