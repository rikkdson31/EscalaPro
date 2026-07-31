import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center py-16 text-center px-4 h-full"
    >
      <div className="bg-emerald-50 p-6 rounded-full mb-6">
        <CheckCircle2 size={48} className="text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Excelente!</h2>
      <p className="text-slate-500 max-w-sm font-medium">
        Nenhuma pendência aberta. Sua jornada está perfeitamente em dia.
      </p>
    </motion.div>
  );
}
