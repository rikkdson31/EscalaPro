import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface SummaryCardsProps {
  criticalCount: number;
  importantCount: number;
  resolvedCount: number;
  averageTime: number;
}

function StatRow({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={`font-bold ${value > 0 ? color : 'text-slate-400'}`}>{value}</span>
    </div>
  );
}

export function SummaryCards({ criticalCount, importantCount, resolvedCount, averageTime }: SummaryCardsProps) {
  return (
    <Card className="shadow-sm hidden md:block">
      <CardContent className="p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Resumo Geral</h3>
        <div className="space-y-4">
          <StatRow 
            label="Ações Críticas" 
            value={criticalCount} 
            color="text-red-600" 
          />
          <StatRow 
            label="Ações Importantes" 
            value={importantCount} 
            color="text-orange-600" 
          />
          <StatRow 
            label="Ações Resolvidas" 
            value={resolvedCount} 
            color="text-green-600" 
          />
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Tempo Médio</span>
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Clock size={14} className="text-slate-400" />
                {Math.round(averageTime)} min
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
