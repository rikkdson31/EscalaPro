import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { PendingItem, ActionBlueprint } from '../../types';

interface PriorityActionCardProps {
  item: PendingItem | null;
  blueprint: ActionBlueprint | null;
  onActionClick: () => void;
}

export function PriorityActionCard({ item, blueprint, onActionClick }: PriorityActionCardProps) {
  if (!item || !blueprint) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-orange-200 shadow-md bg-orange-50/50 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0 mt-1 sm:mt-0">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Ação Prioritária</p>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{blueprint.title}</h3>
              <p className="text-sm text-slate-600">{blueprint.description}</p>
            </div>
          </div>
          
          <Button 
            onClick={onActionClick}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white shadow-sm shrink-0 gap-2"
          >
            {blueprint.primaryButton.label}
            <ArrowRight size={16} />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
