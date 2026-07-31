import React from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import { dateService } from '../../services/DateService';
import { UserProfile } from '../../types';
import { ScheduleConfig, DayInfo } from '../../engine/types';
import { ScheduleService } from '../../services/ScheduleService';

interface DashboardGreetingProps {
  activeProfile: UserProfile | null;
  config: ScheduleConfig | null;
  scheduleService?: ScheduleService | null;
}

export function DashboardGreeting({ activeProfile, config, scheduleService }: DashboardGreetingProps) {
  const getGreeting = () => {
    const hour = dateService.now().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const name = activeProfile?.nome.split(' ')[0] || 'Usuário';
  const todayStr = dateService.formatExtenso(dateService.now());

  let currentStatus = null;
  let nextDays: DayInfo[] = [];

  if (scheduleService) {
    const today = dateService.now();
    const todayInfo = scheduleService.getDayInfo(today);
    currentStatus = todayInfo.tipo;
    
    for (let i = 0; i < 6; i++) {
      const d = dateService.addDays(today, i);
      nextDays.push(scheduleService.getDayInfo(d));
    }
  }

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        {getGreeting()}, {name}
      </h1>
      <p className="text-slate-500 mb-4 capitalize">{todayStr}</p>
      
      {config && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm">
              <Briefcase size={14} className="text-blue-500" />
              {config.empresa} - {config.tipoEscala}
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm">
              <Calendar size={14} className="text-emerald-500" />
              Turma {config.turma}
            </div>
          </div>
          
          {nextDays.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Ciclo Atual</span>
              <div className="flex items-end gap-1.5 mt-2">
                {nextDays.map((day, i) => {
                  const isTypeChange = i > 0 && nextDays[i - 1].tipo !== day.tipo;
                  const shortWeekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                  const weekdayStr = shortWeekdays[dateService.dayOfWeekIndex(day.data)];
                  return (
                    <React.Fragment key={i}>
                      {isTypeChange && <span className="text-slate-300 pb-4">│</span>}
                      <div className="flex flex-col items-center justify-end h-[58px]">
                        {i === 0 && (
                          <span className="text-[10px] font-bold text-blue-500 text-center leading-tight mb-0.5">
                            Hoje<br />↓
                          </span>
                        )}
                        <span className="text-[22px] leading-none" title={day.tipo === 'TRABALHO' ? 'Trabalho' : 'Folga'}>
                          {day.tipo === 'TRABALHO' ? '💼' : '🏖️'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium mt-1">
                          {weekdayStr}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
