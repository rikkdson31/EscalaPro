import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TimeRecord, PendingItem } from '../../types';
import { dateService } from '../../services/DateService';

interface DaySummaryCardProps {
  record: TimeRecord | null;
  pendenciesCount: number;
  expectedStart: string;
  expectedEnd: string;
}

export function DaySummaryCard({ record, pendenciesCount, expectedStart, expectedEnd }: DaySummaryCardProps) {
  // Calcular horas previstas
  const calcDiff = (start: string, end: string) => {
    if (!start || !end || start === '--:--' || end === '--:--') return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // atravessou meia noite
    return diff / 60;
  };
  
  const expectedHours = calcDiff(expectedStart, expectedEnd).toFixed(1);
  
  // Calcular horas registradas
  let registeredHours = '0.0';
  let completedRecords = 0;
  if (record) {
    completedRecords = record.entries.length;
    // simplificado: (saida - entrada) - (retorno - ida_intervalo)
    const e = record.entries.find(x => x.tipo === 'ENTRADA')?.horario;
    const si = record.entries.find(x => x.tipo === 'SAIDA_INTERVALO')?.horario;
    const ri = record.entries.find(x => x.tipo === 'RETORNO_INTERVALO')?.horario;
    const s = record.entries.find(x => x.tipo === 'SAIDA')?.horario;
    
    let total = 0;
    if (e && s) {
      total = calcDiff(e, s);
      if (si && ri) {
        total -= calcDiff(si, ri);
      }
    } else if (e) {
      // If still working, calculate until now
      const now = dateService.formatTime(dateService.now());
      if (si && !ri) {
        // In break
        total = calcDiff(e, si);
      } else {
        total = calcDiff(e, now);
        if (si && ri) {
          total -= calcDiff(si, ri);
        }
      }
    }
    registeredHours = Math.max(0, total).toFixed(1);
  }

  return (
    <Card className="border-none shadow-sm h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Resumo do Dia</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Previsto</p>
            <p className="text-xl font-bold text-slate-900 flex items-center gap-1">
              {expectedHours} <span className="text-sm font-normal text-slate-500">h</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Registrado</p>
            <p className="text-xl font-bold text-slate-900 flex items-center gap-1">
              {registeredHours} <span className="text-sm font-normal text-slate-500">h</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" /> Registros
            </p>
            <p className="text-xl font-bold text-slate-900">{completedRecords}/4</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
              <AlertTriangle size={12} className={pendenciesCount > 0 ? "text-orange-500" : "text-slate-300"} /> 
              Pendências
            </p>
            <p className={`text-xl font-bold ${pendenciesCount > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{pendenciesCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
