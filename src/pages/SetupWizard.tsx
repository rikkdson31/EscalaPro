import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSchedule } from '../contexts/ScheduleContext';
import { motion, AnimatePresence } from 'motion/react';
import { dateService } from '../services/DateService';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/StorageService';
import { performInitialCloudUpload } from '../cloud/InitialSync';
import { ChevronRight, ChevronLeft, Check, User, Briefcase, Calendar } from 'lucide-react';

export function SetupWizard() {
  const { saveConfig } = useSchedule();
  const { session } = useAuth();
  
  const [step, setStep] = useState(1);
  
  // Step 1
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  
  // Step 2
  const [empresa, setEmpresa] = useState('');
  const [cliente, setCliente] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Step 3
  const [tipoEscala, setTipoEscala] = useState('3x3');
  const [turma, setTurma] = useState('');
  const [entrada, setEntrada] = useState('07:00');
  const [saida, setSaida] = useState('19:00');
  
  const today = dateService.today();
  const [referenceDate, setReferenceDate] = useState(dateService.toISODate(today));
  const [referenceCycleDay, setReferenceCycleDay] = useState(0);

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = {
      empresa,
      cliente,
      tipoEscala,
      turma,
      entrada,
      saida,
      referenceDate,
      referenceCycleDay
    };
    const profile = saveConfig(config, {
      nome,
      apelido,
      cargo
    });
    
    if (session && profile) {
      await performInitialCloudUpload(
        session.user.id,
        profile,
        config
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
            <User size={20} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
            <Briefcase size={20} />
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
            <Calendar size={20} />
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Quem é você?</h2>
              <p className="text-slate-500 mb-6">Vamos personalizar sua experiência.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
                  <input 
                    type="text" 
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Apelido (Opcional)</label>
                  <input 
                    type="text" 
                    value={apelido}
                    onChange={e => setApelido(e.target.value)}
                    placeholder="Como prefere ser chamado"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleNext} 
                disabled={!nome.trim()} 
                className="w-full mt-8"
              >
                Continuar <ChevronRight size={18} className="ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Seu Trabalho</h2>
              <p className="text-slate-500 mb-6">Onde você aplica sua jornada.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Empresa</label>
                  <input 
                    type="text" 
                    value={empresa}
                    onChange={e => setEmpresa(e.target.value)}
                    placeholder="Ex: Petrobras, Vale, etc."
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Cliente / Setor</label>
                  <input 
                    type="text" 
                    value={cliente}
                    onChange={e => setCliente(e.target.value)}
                    placeholder="Setor ou cliente específico"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Cargo</label>
                  <input 
                    type="text" 
                    value={cargo}
                    onChange={e => setCargo(e.target.value)}
                    placeholder="Qual sua função?"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <Button onClick={handlePrev} variant="outline" className="flex-1">
                  <ChevronLeft size={18} className="mr-2" /> Voltar
                </Button>
                <Button onClick={handleNext} disabled={!empresa.trim()} className="flex-1">
                  Continuar <ChevronRight size={18} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Sua Escala</h2>
              <p className="text-slate-500 mb-6">Como funciona o seu ciclo.</p>
              
              <form onSubmit={handleFinish} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Tipo de Escala</label>
                  <select 
                    value={tipoEscala}
                    onChange={e => setTipoEscala(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="3x3">3x3</option>
                    <option value="12x36" disabled>12x36 (Em breve)</option>
                    <option value="5x2" disabled>5x2 (Em breve)</option>
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Turma</label>
                  <input 
                    type="text" 
                    required
                    value={turma}
                    onChange={e => setTurma(e.target.value)}
                    placeholder="Ex: Turma A"
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Entrada</label>
                    <input 
                      type="time" 
                      required
                      value={entrada}
                      onChange={e => setEntrada(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Saída</label>
                    <input 
                      type="time" 
                      required
                      value={saida}
                      onChange={e => setSaida(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Data Base do Ciclo</label>
                  <input 
                    type="date" 
                    required
                    value={referenceDate}
                    onChange={e => setReferenceDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Posição no Ciclo (nesta data)</label>
                  <select 
                    value={referenceCycleDay}
                    onChange={e => setReferenceCycleDay(Number(e.target.value))}
                    className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value={0}>1º dia de trabalho</option>
                    <option value={1}>2º dia de trabalho</option>
                    <option value={2}>3º dia de trabalho</option>
                    <option value={3}>1º dia de folga</option>
                    <option value={4}>2º dia de folga</option>
                    <option value={5}>3º dia de folga</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={handlePrev} variant="outline" className="flex-1">
                    <ChevronLeft size={18} className="mr-2" /> Voltar
                  </Button>
                  <Button type="submit" disabled={!turma.trim()} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                    Concluir <Check size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
