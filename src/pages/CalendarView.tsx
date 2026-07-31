import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useSchedule } from '../contexts/ScheduleContext';
import { useState } from 'react';
import { dateService } from '../services/DateService';
import { AppConfig } from '../constants/AppConfig';

export function CalendarView() {
  const { scheduleService } = useSchedule();
  const [currentDate, setCurrentDate] = useState(dateService.today());

  const year = dateService.getYear(currentDate);
  const month = dateService.monthIndex(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(dateService.addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(dateService.addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(dateService.today());
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthDays = scheduleService!.getCalendarMonth(year, month);
  
  // Padding para o primeiro dia do mês alinhar com a semana correta
  const firstDayOfMonth = dateService.startOfMonth(currentDate);
  const firstDayOfWeek = dateService.dayOfWeekIndex(firstDayOfMonth);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  
  const monthName = new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { month: 'long', year: 'numeric' }).format(currentDate);

  const today = dateService.today();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 capitalize">{monthName}</h2>
            <div className="flex space-x-2">
              <Button onClick={handlePrevMonth} variant="outline" size="sm" className="px-2">
                <ChevronLeft size={18} />
              </Button>
              <Button onClick={handleToday} variant="outline" size="sm" className="px-2">
                Hoje
              </Button>
              <Button onClick={handleNextMonth} variant="outline" size="sm" className="px-2">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Button variant="ghost" size="sm" className="text-slate-500 w-full flex justify-center items-center gap-2">
              <CalendarIcon size={16} />
              Selecionar Ano
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysOfWeek.map(day => (
              <div key={day} className="text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
            
            {paddingDays.map(pad => (
              <div key={`pad-${pad}`} className="aspect-square p-1 opacity-0 pointer-events-none"></div>
            ))}

            {monthDays.map((dayInfo, i) => {
              const isWork = dayInfo.tipo === 'TRABALHO';
              const isToday = dateService.isToday(dayInfo.data);
              
              return (
                <div key={i} className="aspect-square p-0.5">
                  <div 
                    title={dayInfo.posicaoLabel}
                    className={`w-full h-full flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
                    ${isToday ? 'ring-2 ring-slate-900 font-bold' : ''}
                    ${isWork 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }
                  `}>
                    <span>{dateService.getDay(dayInfo.data)}</span>
                    <span className="text-[9px] opacity-70 mt-0.5 -mb-1">{dayInfo.posicaoCiclo}º</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center space-x-4 mt-6 text-sm">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <span className="text-slate-600">Trabalho</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-slate-600">Folga</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
