import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Clock, ShieldCheck, Moon, Sun, ArrowRight, Briefcase } from 'lucide-react';
import { dateService } from '../../services/DateService';
import { ScheduleService } from '../../services/ScheduleService';
import { UserProfile } from '../../types';
import { ScheduleConfig } from '../../engine/types';

interface CycleOverviewCardProps {
  scheduleService: ScheduleService;
  config: ScheduleConfig | null;
  activeProfile: UserProfile | null;
}

export function CycleOverviewCard({ scheduleService, config, activeProfile }: CycleOverviewCardProps) {
  if (!config || !activeProfile) return null;

  const today = dateService.now();
  const todayInfo = scheduleService.getDayInfo(today);
  const isWorkDay = todayInfo.tipo === 'TRABALHO';
  
  // Find next event (next shift if today is off, next off if today is work)
  let nextEventDate = today;
  let nextEventInfo = todayInfo;
  
  const MAX_LOOKAHEAD = 30;
  for (let i = 1; i <= MAX_LOOKAHEAD; i++) {
    const d = dateService.addDays(today, i);
    const info = scheduleService.getDayInfo(d);
    
    if (isWorkDay && info.tipo === 'FOLGA') {
      nextEventDate = d;
      nextEventInfo = info;
      break;
    }
    
    if (!isWorkDay && info.tipo === 'TRABALHO') {
      nextEventDate = d;
      nextEventInfo = info;
      break;
    }
  }

  const getDayName = (date: Date) => {
    if (dateService.isTomorrow(date)) return 'Amanhã';
    return dateService.formatWeekdayLong(date);
  };
  
  const contextualMessage = isWorkDay
    ? `Sua próxima folga será: ${getDayName(nextEventDate)}`
    : `Seu próximo turno será: ${getDayName(nextEventDate)} ${nextEventInfo.entrada} às ${nextEventInfo.saida}`;

  return (
    <Card className={`shadow-sm mb-6 relative overflow-hidden ${isWorkDay ? 'bg-gradient-to-br from-emerald-50 to-teal-50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${isWorkDay ? 'bg-emerald-500' : 'bg-blue-500'}`} />
      
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isWorkDay ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
            {isWorkDay ? (
              todayInfo.entrada && parseInt(todayInfo.entrada) >= 18 ? <Moon size={28} /> : <Sun size={28} />
            ) : (
              <ShieldCheck size={28} />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {isWorkDay ? 'Hoje é dia de trabalho.' : 'Hoje é dia de folga.'}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium capitalize">
              {contextualMessage}
            </p>
            {isWorkDay && (
              <div className="flex items-center gap-2 mt-3 bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-100 inline-flex">
                <Clock size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">
                  Hoje das {todayInfo.entrada} às {todayInfo.saida}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
