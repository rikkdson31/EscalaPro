import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSchedule } from '../contexts/ScheduleContext';
import { motion } from 'motion/react';
import { dateService } from '../services/DateService';

export function SetupWizard() {
  const { saveConfig } = useSchedule();
  
  const [empresa, setEmpresa] = useState('');
  const [cliente, setCliente] = useState('');
  const [tipoEscala, setTipoEscala] = useState('3x3');
  const [turma, setTurma] = useState('');
  const [entrada, setEntrada] = useState('07:00');
  const [saida, setSaida] = useState('19:00');
  const [referenceCycleDay, setReferenceCycleDay] = useState(0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const today = dateService.today();
    const referenceDate = dateService.toISODate(today);

    saveConfig({
      empresa,
      cliente,
      tipoEscala,
      turma,
      entrada,
      saida,
      referenceDate,
      referenceCycleDay
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo ao EscalaPro</h1>
          <p className="text-slate-500">Configure sua escala para começar.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Empresa</label>
                <input 
                  type="text" 
                  required
                  value={empresa}
                  onChange={e => setEmpresa(e.target.value)}
                  placeholder="Nome da empresa"
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Cliente / Setor</label>
                <input 
                  type="text" 
                  value={cliente}
                  onChange={e => setCliente(e.target.value)}
                  placeholder="Setor ou cliente"
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tipo de Escala</label>
                <select 
                  value={tipoEscala}
                  onChange={e => setTipoEscala(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
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

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-sm font-semibold text-slate-900">Em qual dia do ciclo você está hoje?</label>
                <select 
                  value={referenceCycleDay}
                  onChange={e => setReferenceCycleDay(Number(e.target.value))}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                >
                  <option value={0}>1º dia de trabalho</option>
                  <option value={1}>2º dia de trabalho</option>
                  <option value={2}>3º dia de trabalho</option>
                  <option value={3}>1º dia de folga</option>
                  <option value={4}>2º dia de folga</option>
                  <option value={5}>3º dia de folga</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-6" size="lg">
                Concluir Configuração
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
