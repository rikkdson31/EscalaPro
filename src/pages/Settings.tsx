import { Card, CardContent } from '../components/ui/Card';
import { BackupSettings } from '../components/BackupSettings';
import { Button } from '../components/ui/Button';
import { Save, RefreshCw, Camera, User } from 'lucide-react';
import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useSchedule } from '../contexts/ScheduleContext';
import { useState } from 'react';

export function Settings() {
  const { config, activeProfile, saveConfig, updateProfileInfo, clearConfig } = useSchedule();

  
  const [nome, setNome] = useState(activeProfile?.nome || '');
  const [apelido, setApelido] = useState(activeProfile?.apelido || '');
  const [matricula, setMatricula] = useState(activeProfile?.matricula || '');
  const [cargo, setCargo] = useState(activeProfile?.cargo || '');
  const [foto, setFoto] = useState(activeProfile?.foto || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Recortar do centro (quadrado)
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
            
            // Redimensionar para tamanho menor (ex: 256x256) para não estourar localStorage
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = 256;
            finalCanvas.height = 256;
            const finalCtx = finalCanvas.getContext('2d');
            finalCtx?.drawImage(canvas, 0, 0, 256, 256);
            
            setFoto(finalCanvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const [empresa, setEmpresa] = useState(config?.empresa || '');
  const [cliente, setCliente] = useState(config?.cliente || '');
  const [tipoEscala, setTipoEscala] = useState(config?.tipoEscala || '3x3');
  const [turma, setTurma] = useState(config?.turma || '');
  const [entrada, setEntrada] = useState(config?.entrada || '07:00');
  const [saida, setSaida] = useState(config?.saida || '19:00');
  const [referenceDate, setReferenceDate] = useState(config?.referenceDate || '');
  const [referenceCycleDay, setReferenceCycleDay] = useState(config?.referenceCycleDay || 0);
  const [exibirMensagensAssistente, setExibirMensagensAssistente] = useState(config?.exibirMensagensAssistente !== undefined ? config.exibirMensagensAssistente : true);

  const handleSave = () => {
    saveConfig({
      empresa,
      cliente,
      tipoEscala,
      turma,
      entrada,
      saida,
      referenceDate,
      referenceCycleDay,
      exibirMensagensAssistente
    });
    updateProfileInfo({
      nome,
      apelido,
      matricula,
      cargo,
      foto
    });
    alert('Configurações salvas!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pb-6"
    >
      
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col items-center justify-center pb-4">
            <div 
              className="relative w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-white shadow-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {foto ? (
                <img src={foto} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-slate-400">
                  {nome ? nome.charAt(0).toUpperCase() : 'PM'}
                </span>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
            
            <div className="mt-3 text-center">
              <h2 className="text-xl font-bold text-slate-900">{nome || 'Seu Nome'}</h2>
              <p className="text-sm font-medium text-slate-500">Turma {turma} • {empresa}</p>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Dados Pessoais</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
            <input 
              type="text" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Paulo Martins"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Apelido <span className="font-normal text-slate-400">(Opcional)</span></label>
              <input 
                type="text" 
                value={apelido}
                onChange={e => setApelido(e.target.value)}
                placeholder="Ex: Paulinho"
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Matrícula <span className="font-normal text-slate-400">(Opcional)</span></label>
              <input 
                type="text" 
                value={matricula}
                onChange={e => setMatricula(e.target.value)}
                placeholder="Ex: 12345"
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Cargo/Função <span className="font-normal text-slate-400">(Opcional)</span></label>
            <input 
              type="text" 
              value={cargo}
              onChange={e => setCargo(e.target.value)}
              placeholder="Ex: Operador de Máquinas"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Informações Profissionais</h3>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Empresa</label>
            <input 
              type="text" 
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
              placeholder="Nome da sua empresa"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Cliente / Setor</label>
            <input 
              type="text" 
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Cliente ou setor que trabalha"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Configurações de Escala</h3>
          
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
              value={turma}
              onChange={e => setTurma(e.target.value)}
              placeholder="Ex: Turma A, Grupo 2"
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Horário de Entrada</label>
              <input 
                type="time" 
                value={entrada}
                onChange={e => setEntrada(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Horário de Saída</label>
              <input 
                type="time" 
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
              value={referenceDate}
              onChange={e => setReferenceDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Posição no Ciclo na Data Base</label>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Assistente EscalaPro</h3>
          <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <input 
              type="checkbox" 
              checked={exibirMensagensAssistente}
              onChange={e => setExibirMensagensAssistente(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
            />
            <div>
              <p className="font-semibold text-slate-900">Exibir mensagens do Assistente</p>
              <p className="text-xs text-slate-500">Mensagens motivacionais nos retornos de ciclo.</p>
            </div>
          </label>
        </CardContent>
      </Card>

      
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Backup e Restauração</h2>
        <p className="text-sm text-slate-600 mb-4">Gerencie cópias de segurança dos seus dados offline.</p>
        <BackupSettings />
      </div>
  
      <Button onClick={handleSave} className="w-full gap-2 mt-4" size="lg">
        <Save size={18} />
        Salvar Configurações
      </Button>

      <Button onClick={clearConfig} variant="ghost" className="w-full gap-2 mt-4 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
        <RefreshCw size={18} />
        Refazer Configuração Inicial
      </Button>
    </motion.div>
  );
}
