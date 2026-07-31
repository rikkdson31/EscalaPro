import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/Card';
import { Clock, Play, Pause, Square, RotateCcw, ArrowRight } from 'lucide-react';
import { TimeRecord, WorkflowStatus, WorkflowState, TimeEntryType } from '../../types';

interface JourneyStatusCardProps {
  record: TimeRecord | null;
  status: WorkflowStatus;
  isWorkDay: boolean;
  expectedStart: string;
  expectedEnd: string;
}

export function JourneyStatusCard({ record, status, isWorkDay, expectedStart, expectedEnd }: JourneyStatusCardProps) {
  if (!isWorkDay && (!record || record.entries.length === 0)) {
    return (
      <Card className="shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Clock size={20} />
            </div>
            <h2 className="font-bold text-lg">Dia de Folga</h2>
          </div>
          <p className="text-blue-800 font-medium">Aproveite o seu dia de descanso.</p>
        </CardContent>
      </Card>
    );
  }

  const getEntryTime = (type: TimeEntryType) => {
    const entry = record?.entries.find(e => e.tipo === type);
    return entry ? entry.horario : '--:--';
  };

  const getStatusColor = () => {
    switch(status.currentState) {
      case WorkflowState.WORKING: return 'bg-emerald-500';
      case WorkflowState.BREAK: return 'bg-amber-500';
      case WorkflowState.FINISHED: return 'bg-slate-500';
      case WorkflowState.INCOMPLETE:
      case WorkflowState.INVALID_SEQUENCE:
      case WorkflowState.JUSTIFICATION_REQUIRED: return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusLabel = () => {
    switch(status.currentState) {
      case WorkflowState.NOT_STARTED: return 'Aguardando Início';
      case WorkflowState.WORKING: return 'Em Andamento';
      case WorkflowState.BREAK: return 'Em Intervalo';
      case WorkflowState.RETURNED: return 'Em Andamento';
      case WorkflowState.FINISHED: return 'Finalizado';
      default: return 'Atenção Necessária';
    }
  };

  return (
    <Card className="shadow-md mb-6 overflow-hidden">
      <div className={`h-1.5 w-full ${getStatusColor()}`} />
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Status da Jornada</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{getStatusLabel()}</span>
              {status.currentState === WorkflowState.WORKING && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3">
            <Clock size={18} className="text-slate-400" />
            <div className="text-sm font-medium text-slate-700">
              Previsto: {expectedStart} às {expectedEnd}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6 relative">
          <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-slate-100 -z-10" />
          
          <TimePoint 
            label="Entrada" 
            time={getEntryTime(TimeEntryType.ENTRADA)} 
            icon={<Play size={14} />} 
            active={!!getEntryTime(TimeEntryType.ENTRADA) && getEntryTime(TimeEntryType.ENTRADA) !== '--:--'} 
          />
          <TimePoint 
            label="Intervalo" 
            time={getEntryTime(TimeEntryType.SAIDA_INTERVALO)} 
            icon={<Pause size={14} />} 
            active={!!getEntryTime(TimeEntryType.SAIDA_INTERVALO) && getEntryTime(TimeEntryType.SAIDA_INTERVALO) !== '--:--'} 
          />
          <TimePoint 
            label="Retorno" 
            time={getEntryTime(TimeEntryType.RETORNO_INTERVALO)} 
            icon={<RotateCcw size={14} />} 
            active={!!getEntryTime(TimeEntryType.RETORNO_INTERVALO) && getEntryTime(TimeEntryType.RETORNO_INTERVALO) !== '--:--'} 
          />
          <TimePoint 
            label="Saída" 
            time={getEntryTime(TimeEntryType.SAIDA)} 
            icon={<Square size={14} />} 
            active={!!getEntryTime(TimeEntryType.SAIDA) && getEntryTime(TimeEntryType.SAIDA) !== '--:--'} 
          />
        </div>

        {/* Progress & Next Action */}
        <div className="bg-slate-50 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 border border-slate-100">
          <div className="flex-1 w-full">
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="text-slate-500 uppercase">Progresso</span>
              <span className="text-slate-900">{status.progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${getStatusColor()}`}
              />
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden md:block" />
          <div className="shrink-0 text-center md:text-left flex-1 md:flex-none">
            <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Próxima Ação Esperada</p>
            <p className="font-bold text-slate-900 flex items-center justify-center md:justify-start gap-1">
              {status.label}
              {!status.completed && <ArrowRight size={14} className="text-slate-400" />}
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

function TimePoint({ label, time, icon, active }: { label: string, time: string, icon: React.ReactNode, active: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors z-10 ${
        active ? 'bg-slate-800 text-white shadow-md' : 'bg-white border-2 border-slate-100 text-slate-300'
      }`}>
        {icon}
      </div>
      <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase">{label}</p>
      <p className={`text-sm sm:text-base font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{time}</p>
    </div>
  );
}
