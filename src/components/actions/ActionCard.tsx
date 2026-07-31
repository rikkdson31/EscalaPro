import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  AlertOctagon, AlertTriangle, Info, CheckCircle2, 
  Clock, ArrowRight, LogOut, Coffee, RotateCcw, 
  FileText, Copy, Search, AlertCircle
} from 'lucide-react';
import { ActionBlueprint, PendingItemStatus, PendingItemPriority, PendingItem } from '../../types';
import { dateService } from '../../services/DateService';

interface ActionCardProps {
  key?: string;
  item: PendingItem;
  blueprint: ActionBlueprint;
  onActionClick: (blueprint: ActionBlueprint, actionType: string) => void;
}

const getIconComponent = (iconName: string, size: number) => {
  switch (iconName) {
    case 'AlertOctagon': return <AlertOctagon size={size} />;
    case 'AlertTriangle': return <AlertTriangle size={size} />;
    case 'Info': return <Info size={size} />;
    case 'LogOut': return <LogOut size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'RotateCcw': return <RotateCcw size={size} />;
    case 'FileText': return <FileText size={size} />;
    case 'Copy': return <Copy size={size} />;
    case 'Search': return <Search size={size} />;
    case 'AlertCircle':
    default: return <AlertCircle size={size} />;
  }
};

const getPriorityConfig = (priority: PendingItemPriority) => {
  switch (priority) {
    case PendingItemPriority.CRITICAL: return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', btn: 'bg-rose-600 hover:bg-rose-700', label: 'Crítico' };
    case PendingItemPriority.HIGH: return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', btn: 'bg-orange-600 hover:bg-orange-700', label: 'Importante' };
    case PendingItemPriority.MEDIUM: return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700', label: 'Atenção' };
    case PendingItemPriority.LOW: return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700', label: 'Normal' };
  }
};

export function ActionCard({ item, blueprint, onActionClick }: ActionCardProps) {
  const isResolved = item.status === PendingItemStatus.RESOLVED || item.status === PendingItemStatus.JUSTIFIED || item.status === PendingItemStatus.ARCHIVED;
  const pConfig = getPriorityConfig(blueprint.priority);
  const createdDateStr = dateService.formatDDMMYYYY(dateService.parseISOString(item.createdAt));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden border ${isResolved ? 'border-slate-200 opacity-60' : pConfig.border} transition-all`}>
        <div className={`h-1 w-full ${isResolved ? 'bg-slate-200' : pConfig.bg}`}></div>
        <CardContent className="p-0">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-start">
            
            <div className={`shrink-0 p-3 rounded-full ${isResolved ? 'bg-slate-100 text-slate-400' : pConfig.bg + ' ' + pConfig.color}`}>
              {isResolved ? <CheckCircle2 size={24} /> : getIconComponent(blueprint.icon, 24)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between mb-1">
                <h3 className={`text-lg font-semibold truncate ${isResolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                  {blueprint.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className={`px-2 py-0.5 rounded-full ${isResolved ? 'bg-slate-100 text-slate-500' : pConfig.bg + ' ' + pConfig.color}`}>
                    {isResolved ? 'Resolvido' : pConfig.label}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {createdDateStr}
                  </span>
                </div>
              </div>
              
              <p className="text-slate-600 mb-3 text-sm">
                {blueprint.description}
              </p>
              
              {!isResolved && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <p className="text-sm text-slate-700 flex items-start gap-2">
                    <Info size={16} className={`${pConfig.color} shrink-0 mt-0.5`} />
                    {blueprint.recommendedAction}
                  </p>
                </div>
              )}

              {!isResolved && (
                <div className="flex justify-end gap-2">
                  {blueprint.secondaryButton && (
                    <Button 
                      variant="outline"
                      onClick={() => onActionClick(blueprint, blueprint.secondaryButton!.actionType)}
                      className="text-slate-600"
                    >
                      {blueprint.secondaryButton.label}
                    </Button>
                  )}
                  <Button 
                    onClick={() => onActionClick(blueprint, blueprint.primaryButton.actionType)}
                    className={`${pConfig.btn} text-white shadow-sm gap-2`}
                  >
                    {blueprint.primaryButton.label}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
