import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { CheckCircle2, AlertTriangle, ShieldCheck, Briefcase } from 'lucide-react';
import { TimeRecord } from '../../types';
import { ScheduleService } from '../../services/ScheduleService';
import { dateService } from '../../services/DateService';

interface QuickStatsCardProps {
  records30Days: TimeRecord[];
  pendenciesCount: number;
  scheduleService: ScheduleService;
}

export function QuickStatsCard({ records30Days, pendenciesCount, scheduleService }: QuickStatsCardProps) {
  let diasTrabalhados = 0;
  let folgas = 0;
  let ocorrencias = 0;

  // Let's generate stats based on the last 30 days
  const today = dateService.now();
  
  for (let i = 0; i < 30; i++) {
    const d = dateService.addDays(today, -i);
    const dateStr = dateService.toISODate(d);
    const isWorkDay = scheduleService.isWorkDay(d);
    
    const record = records30Days.find(r => r.date === dateStr);
    
    if (isWorkDay) {
      diasTrabalhados++;
      if (record) {
         if (record.entries.length > 0 && record.entries.length < 4) {
           ocorrencias++;
         }
      }
    } else {
      folgas++;
    }
  }

  // We add pendencies to ocorrencias just for visual if needed, but it specifically wants "Ocorrências" and "Pendências" separate.
  // We'll keep them separate.

  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex justify-between items-center">
          Resumo
          <span className="text-[10px] font-bold text-slate-400 normal-case bg-slate-100 px-2 py-0.5 rounded-full">Últimos 30 dias</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" />
              <span className="text-sm text-slate-700">Dias trabalhados</span>
            </div>
            <span className="font-bold text-slate-900">{diasTrabalhados}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" />
              <span className="text-sm text-slate-700">Folgas</span>
            </div>
            <span className="font-bold text-slate-900">{folgas}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-500" />
              <span className="text-sm text-slate-700">Ocorrências</span>
            </div>
            <span className="font-bold text-slate-900">{ocorrencias}</span>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={pendenciesCount > 0 ? "text-red-500" : "text-slate-300"} />
                <span className="text-sm text-slate-700 font-medium">Pendências ativas</span>
              </div>
              <span className={`font-bold ${pendenciesCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{pendenciesCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
