import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Plus, CheckCircle2 } from 'lucide-react';
import { dateService } from '../services/DateService';
import { useSchedule } from '../contexts/ScheduleContext';
import { pendingCenterService } from '../services/PendingCenterService';
import { timeRecordService } from '../services/TimeRecordService';
import { PendingItem, PendingItemType, PendingItemPriority } from '../types';

import { OccurrenceList } from '../components/occurrences/OccurrenceList';
import { OccurrenceForm } from '../components/occurrences/OccurrenceForm';
import { OccurrenceHistory } from '../components/occurrences/OccurrenceHistory';

export function TimeTracking() {
  const { activeProfile, scheduleService } = useSchedule();
  const today = dateService.now();
  
  const [view, setView] = useState<'list' | 'form' | 'history' | 'success'>('list');
  const [selectedOcc, setSelectedOcc] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    if (activeProfile && view === 'history') {
      const items = pendingCenterService.getPendingItems(activeProfile.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryItems(items);
    }
  }, [activeProfile, view]);

  if (!activeProfile || !scheduleService) return null;

  const handleSelectOccurrence = (id: string) => {
    setSelectedOcc(id);
    setView('form');
  };

  const handleSubmit = (data: any, type: PendingItemType) => {
    const record = timeRecordService.getRecordByDate(activeProfile.id, dateService.toISODate(today));
    const recordId = record ? record.id : `rec_${dateService.toISODate(today)}`;
    
    const desc = `${data.time ? `Horário: ${data.time}. ` : ''}Justificativa: ${data.justification}`;
    
    pendingCenterService.createPending(
      activeProfile.id,
      recordId,
      type,
      data.title,
      desc,
      'Aguardando revisão ou processamento automático.',
      PendingItemPriority.HIGH
    );

    setView('success');
    setTimeout(() => {
      setView('list');
      setSelectedOcc(null);
    }, 2500);
  };

  return (
    <div className="min-h-full flex flex-col pb-24 bg-slate-50">
      {/* Header Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-xl mx-auto flex p-2 gap-2">
          <button
            onClick={() => { setView('list'); setSelectedOcc(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              (view === 'list' || view === 'form' || view === 'success')
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-transparent text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Plus size={18} />
            Nova Ocorrência
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              view === 'history' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-transparent text-slate-500 hover:bg-slate-100'
            }`}
          >
            <History size={18} />
            Histórico
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center p-8 text-center h-full mt-12"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Registrado!</h3>
              <p className="text-slate-600 font-medium">Sua ocorrência foi enviada com sucesso e será analisada.</p>
            </motion.div>
          )}

          {view === 'form' && selectedOcc && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OccurrenceForm 
                occurrenceId={selectedOcc} 
                scheduleService={scheduleService} 
                todayDate={today} 
                onBack={() => setView('list')}
                onSubmit={handleSubmit}
              />
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">O que aconteceu hoje?</h2>
                <p className="text-sm font-medium text-slate-500">
                  Relate apenas exceções ou inconsistências. A jornada padrão é computada automaticamente.
                </p>
              </div>
              <OccurrenceList onSelect={handleSelectOccurrence} />
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Histórico de Ocorrências</h2>
                <p className="text-sm font-medium text-slate-500">
                  Acompanhe o status das exceções que você relatou.
                </p>
              </div>
              <OccurrenceHistory items={historyItems} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
