import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Briefcase, FileText, AlertCircle, Clock, CheckCircle2, 
  Search, Filter, Activity, BarChart2, MessageSquare, Plus
} from 'lucide-react';
import { useSchedule } from '../contexts/ScheduleContext';
import { pendingCenterService } from '../services/PendingCenterService';
import { dateService } from '../services/DateService';
import { timeRecordService } from '../services/TimeRecordService';
import { PendingItemStatus, PendingItemType } from '../types';

type TimelineItemType = 'WORK' | 'OFF' | 'OCCURRENCE' | 'PENDENCY' | 'CHANGE' | 'SUMMARY';

interface TimelineItem {
  id: string;
  date: Date;
  type: TimelineItemType;
  subType?: string;
  icon: any;
  title: string;
  description: string;
  status?: string;
  color: string;
  bg: string;
  border: string;
}

const mapTypeToSubType = (t: string) => {
  if (t === 'MISSING_ENTRY' || t === 'MISSING_EXIT' || t === 'MISSING_BREAK' || t === 'MISSING_RETURN') return 'Esquecimento';
  if (t === 'MANUAL_REVIEW') return 'Ocorrência Manual';
  return 'Geral';
};

export function Timeline() {
  const { activeProfile, scheduleService } = useSchedule();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, WORK, OFF, OCCURRENCE, PENDENCY
  
  const today = dateService.now();
  
  const allItems = useMemo(() => {
    if (!activeProfile || !scheduleService) return [];
    
    const items: TimelineItem[] = [];
    const pendencies = pendingCenterService.getPendingByProfile(activeProfile.id);
    
    // Generate past 60 days
    const startDate = dateService.addDays(today, -60);
    
    let daysSinceStart = 0;
    while (daysSinceStart <= 60) {
      const d = dateService.addDays(startDate, daysSinceStart);
      const dateStr = dateService.toISODate(d);
      const dayInfo = scheduleService.getDayInfo(d);
      
      // Work or Off
      if (dayInfo.tipo === 'TRABALHO') {
        items.push({
          id: `sch_${dateStr}`,
          date: d,
          type: 'WORK',
          subType: 'Trabalho',
          icon: Briefcase,
          title: `Turno de Trabalho (${dayInfo.posicaoLabel})`,
          description: `${dayInfo.entrada} às ${dayInfo.saida}`,
          status: 'Escala Padrão',
          color: 'text-slate-500',
          bg: 'bg-white',
          border: 'border-slate-200'
        });
      } else {
        items.push({
          id: `sch_${dateStr}`,
          date: d,
          type: 'OFF',
          subType: 'Folga',
          icon: Calendar,
          title: `Dia de Folga (${dayInfo.posicaoLabel})`,
          description: 'Descanso programado',
          status: 'Escala Padrão',
          color: 'text-blue-500',
          bg: 'bg-white',
          border: 'border-blue-100'
        });
      }
      
      // Pendencies and Occurrences
      const pends = pendencies.filter(p => p.timeRecordId === `rec_${dateStr}` || (p.createdAt && p.createdAt.startsWith(dateStr)));
      pends.forEach(p => {
        const isResolved = p.status === PendingItemStatus.RESOLVED || p.status === PendingItemStatus.JUSTIFIED || p.status === PendingItemStatus.ARCHIVED;
        
        let color = 'text-orange-500';
        let bg = 'bg-orange-50';
        let border = 'border-orange-200';
        let icon = AlertCircle;
        
        if (isResolved) {
          color = 'text-emerald-500';
          bg = 'bg-emerald-50';
          border = 'border-emerald-200';
          icon = CheckCircle2;
        } else if (p.priority === 'CRITICAL') {
          color = 'text-rose-500';
          bg = 'bg-rose-50';
          border = 'border-rose-200';
        }
        
        items.push({
          id: `pend_${p.id}`,
          date: d,
          type: isResolved ? 'OCCURRENCE' : 'PENDENCY',
          subType: mapTypeToSubType(p.type),
          icon: icon,
          title: p.title,
          description: p.description,
          status: isResolved ? 'Resolvida' : 'Pendente',
          color,
          bg,
          border
        });
      });
      
      daysSinceStart++;
    }
    
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [activeProfile, scheduleService, today]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      // Apply text search
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        if (!item.title.toLowerCase().includes(lowerSearch) && 
            !item.description.toLowerCase().includes(lowerSearch)) {
          return false;
        }
      }
      
      // Apply type filter
      if (filterType !== 'ALL') {
        if (filterType === 'WORK' && item.type !== 'WORK') return false;
        if (filterType === 'OFF' && item.type !== 'OFF') return false;
        if (filterType === 'OCCURRENCE' && item.type !== 'OCCURRENCE') return false;
        if (filterType === 'PENDENCY' && item.type !== 'PENDENCY') return false;
      }
      
      return true;
    });
  }, [allItems, searchTerm, filterType]);

  const groupedItems = useMemo<Record<string, TimelineItem[]>>(() => {
    const groups: Record<string, TimelineItem[]> = {
      'Hoje': [],
      'Ontem': [],
      'Últimos 7 dias': [],
      'Este mês': [],
      'Meses anteriores': []
    };
    
    


    const todayStr = dateService.toISODate(today);

    const yesterdayStr = dateService.toISODate(dateService.addDays(today, -1));
    const d7Str = dateService.toISODate(dateService.addDays(today, -7));
    const currentMonth = dateService.monthIndex(today);
    const currentYear = dateService.getYear(today);
    
    
    const itemsWithSummaries = [...filteredItems];
    
    // Inject summaries based on filters
    if (filterType === 'ALL') {
       const workDaysWeek = filteredItems.filter(i => i.type === 'WORK' && i.date >= dateService.addDays(today, -7)).length;
       const occWeek = filteredItems.filter(i => (i.type === 'OCCURRENCE' || i.type === 'PENDENCY') && i.date >= dateService.addDays(today, -7)).length;
       
       itemsWithSummaries.unshift({
         id: 'sum_week',
         date: today,
         type: 'SUMMARY',
         icon: Activity,
         title: 'Resumo dos Últimos 7 dias',
         description: `${workDaysWeek} turnos concluídos • ${occWeek} ocorrências reportadas`,
         color: 'text-indigo-500',
         bg: 'bg-indigo-50',
         border: 'border-indigo-200'
       });
       
       const workDaysMonth = filteredItems.filter(i => i.type === 'WORK' && dateService.monthIndex(i.date) === dateService.monthIndex(today) && dateService.getYear(i.date) === dateService.getYear(today)).length;
       const occMonth = filteredItems.filter(i => (i.type === 'OCCURRENCE' || i.type === 'PENDENCY') && dateService.monthIndex(i.date) === dateService.monthIndex(today) && dateService.getYear(i.date) === dateService.getYear(today)).length;
       
       const lastMonthDate = dateService.addDays(today, -10);
       itemsWithSummaries.push({
         id: 'sum_month',
         date: lastMonthDate, 
         type: 'SUMMARY',
         icon: BarChart2,
         title: 'Resumo do Mês Atual',
         description: `${workDaysMonth} turnos concluídos • ${occMonth} ocorrências`,
         color: 'text-purple-500',
         bg: 'bg-purple-50',
         border: 'border-purple-200'
       });
    }

    itemsWithSummaries.forEach(item => {
      const itemStr = dateService.toISODate(item.date);
      if (itemStr === todayStr) {
        groups['Hoje'].push(item);
      } else if (itemStr === yesterdayStr) {
        groups['Ontem'].push(item);
      } else if (itemStr > d7Str) {
        groups['Últimos 7 dias'].push(item);
      } else if (dateService.monthIndex(item.date) === currentMonth && dateService.getYear(item.date) === currentYear) {
        groups['Este mês'].push(item);
      } else {
        groups['Meses anteriores'].push(item);
      }
    });
    
    return groups;
  }, [filteredItems, today]);

  if (!activeProfile) return null;

  const filters = [
    { id: 'ALL', label: 'Todos' },
    { id: 'WORK', label: 'Trabalho' },
    { id: 'OFF', label: 'Folga' },
    { id: 'OCCURRENCE', label: 'Ocorrências' },
    { id: 'PENDENCY', label: 'Pendências' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-20">
      
      {/* Search and Filters */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar histórico..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-slate-900 text-sm font-medium outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  filterType === f.id 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        <AnimatePresence>
          {Object.entries(groupedItems).map(([groupName, items]: [string, TimelineItem[]]) => {
            if (items.length === 0) return null;
            return (
              <motion.div 
                key={groupName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">
                  {groupName}
                </h2>
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[21px] top-4 bottom-4 w-px bg-slate-200" />
                  
                  <div className="space-y-4 relative">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className="flex gap-4 group">
                          {/* Timeline Dot & Icon */}
                          <div className={`relative z-10 flex items-center justify-center w-11 h-11 rounded-full shrink-0 shadow-sm border-4 border-slate-50 ${item.bg} ${item.color}`}>
                            <Icon size={18} strokeWidth={2.5} />
                          </div>
                          
                          {/* Content Card */}
                          <div className={`flex-1 bg-white p-4 rounded-2xl shadow-sm border ${item.border} hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h3 className="font-bold text-slate-800 text-base leading-tight">{item.title}</h3>
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0`}>
                                {dateService.formatDDMM(item.date)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-2">
                              {item.description}
                            </p>
                            
                            {(item.status || item.subType) && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.status && (
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                                    item.type === 'PENDENCY' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {item.status}
                                  </span>
                                )}
                                {item.subType && item.type !== 'WORK' && item.type !== 'OFF' && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    {item.subType}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {filteredItems?.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum resultado</h3>
              <p className="text-slate-500 text-sm font-medium">Nenhum registro encontrado para os filtros atuais.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
