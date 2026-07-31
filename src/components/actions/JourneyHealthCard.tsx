import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface JourneyHealthCardProps {
  health: number;
}

export function JourneyHealthCard({ health }: JourneyHealthCardProps) {
  const getHealthStatus = (h: number) => {
    if (h >= 90) return { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-500' };
    if (h >= 75) return { label: 'Boa', color: 'text-blue-600', bg: 'bg-blue-100', bar: 'bg-blue-500' };
    if (h >= 50) return { label: 'Atenção', color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500' };
    return { label: 'Necessita Correção', color: 'text-orange-600', bg: 'bg-orange-100', bar: 'bg-orange-500' };
  };

  const status = getHealthStatus(health);

  return (
    <Card className="overflow-hidden shadow-sm h-full">
      <CardContent className="p-5 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-slate-400" />
            Saúde da Jornada
          </h2>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-slate-900">{health}%</span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mt-auto">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${status.bar}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
