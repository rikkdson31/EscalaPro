import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { ActionBlueprint } from '../../types';
import { Button } from '../ui/Button';

interface ResolutionDialogProps {
  blueprint: ActionBlueprint | null;
  actionType: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export function ResolutionDialog({ blueprint, actionType, isOpen, onClose, onComplete }: ResolutionDialogProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (isOpen && blueprint) {
      setCurrentStepIndex(0);
      setFormData(blueprint.suggestedData || {});
    }
  }, [isOpen, blueprint]);

  if (!isOpen || !blueprint) return null;

  const steps = blueprint.resolutionSteps;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(i => i + 1);
    } else {
      onComplete(formData);
    }
  };

  const isSaveStep = currentStep.type === 'SAVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{blueprint.title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <h4 className="font-medium text-lg text-slate-900">{currentStep.label}</h4>
              
              {currentStep.type === 'EDIT_TIME' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Horário</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="time" 
                      value={formData.time || ''}
                      onChange={e => setFormData({ ...formData, time: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none"
                    />
                  </div>
                </div>
              )}

              {currentStep.type === 'TEXT_INPUT' && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700">Justificativa</label>
                  <textarea 
                    rows={4}
                    value={formData.justification || ''}
                    onChange={e => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Descreva o motivo..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none resize-none"
                  />
                </div>
              )}

              {currentStep.type === 'REVIEW' && (
                <div className="text-slate-600">
                  <p>Por favor, revise as informações e confirme a resolução desta pendência.</p>
                </div>
              )}

              {currentStep.type === 'REVIEW_LIST' && (
                <div className="text-slate-600">
                  <p>A funcionalidade de revisão detalhada estará disponível em breve.</p>
                  <p className="text-sm mt-2 text-slate-500">Para prosseguir, confirme a leitura.</p>
                </div>
              )}

              {currentStep.type === 'CONFIRM' && (
                <div className="text-slate-600">
                  <p>{blueprint.description}</p>
                </div>
              )}
              
              {isSaveStep && (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-center text-slate-700 font-medium">Tudo pronto para salvar as alterações.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            onClick={handleNext}
            className="bg-slate-800 hover:bg-slate-900 text-white"
          >
            {isSaveStep ? 'Concluir' : 'Próximo'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
