import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Cloud, Download, Upload, AlertTriangle } from 'lucide-react';
import { backupService, BackupData } from '../services/BackupService';
import { dateService } from '../services/DateService';

export function BackupSettings() {
  const [lastBackup, setLastBackup] = useState<any>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLastBackup(backupService.getLastBackupInfo());
  }, []);

  const handleBackupNow = async () => {
    const backup = await backupService.createBackup();
    
    // Calculate stats
    const profilesCount = Object.keys(backup.profile || {}).length;
    let timeRecordsCount = 0;
    let pendingCount = 0;
    
    Object.values(backup.timeRecords || {}).forEach((records: any) => {
      timeRecordsCount += Array.isArray(records) ? records.length : 0;
    });
    
    Object.values(backup.pendingItems || {}).forEach((items: any) => {
      pendingCount += Array.isArray(items) ? items.length : 0;
    });
    
    const sizeBytes = new Blob([JSON.stringify(backup)]).size;
    const sizeKB = Math.round(sizeBytes / 1024);

    const info = {
      date: dateService.formatDDMMYYYY(dateService.now()),
      time: dateService.now().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      profiles: profilesCount,
      occurrences: timeRecordsCount,
      pending: pendingCount,
      version: backup.metadata.version,
      size: `${sizeKB} KB`
    };
    
    backupService.saveLastBackupInfo(info);
    setLastBackup(info);
    alert('Backup criado com sucesso! (Preparado para sincronização na nuvem)');
  };

  const handleExport = async () => {
    const backup = await backupService.createBackup();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `escalapro_backup_${dateService.toISODate(dateService.now())}.escalapro`);
    dlAnchorElem.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setShowRestoreConfirm(true);
    }
  };

  const handleRestore = () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const backupData: BackupData = JSON.parse(content);
        await backupService.restoreBackup(backupData);
        alert('Restauração concluída com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Erro ao restaurar backup. Verifique se o arquivo é válido.');
        console.error(err);
      }
    };
    reader.readAsText(selectedFile);
    setShowRestoreConfirm(false);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* ☁️ Backup Manual */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cloud className="text-slate-900" size={20} />
            <h3 className="font-bold text-slate-900">Backup Manual</h3>
          </div>
          <p className="text-sm text-slate-600">Proteja seus dados criando um backup quando desejar.</p>
          <Button onClick={handleBackupNow} className="w-full gap-2">
            <Cloud size={18} />
            Fazer Backup Agora
          </Button>

          {lastBackup && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900 mb-2">Último backup</p>
              <div className="grid grid-cols-2 gap-y-2">
                <div><span className="text-slate-500">Data:</span> {lastBackup.date}</div>
                <div><span className="text-slate-500">Hora:</span> {lastBackup.time}</div>
                <div><span className="text-slate-500">Perfil:</span> {lastBackup.profiles}</div>
                <div><span className="text-slate-500">Ocorrências:</span> {lastBackup.occurrences}</div>
                <div><span className="text-slate-500">Pendências:</span> {lastBackup.pending}</div>
                <div><span className="text-slate-500">Versão:</span> {lastBackup.version}</div>
                <div className="col-span-2"><span className="text-slate-500">Tamanho:</span> {lastBackup.size}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 📁 Exportar Backup */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Download className="text-slate-900" size={20} />
            <h3 className="font-bold text-slate-900">Exportar Backup</h3>
          </div>
          <p className="text-sm text-slate-600">Salve uma cópia física dos seus dados no dispositivo.</p>
          <Button onClick={handleExport} variant="outline" className="w-full gap-2">
            <Download size={18} />
            Exportar Arquivo (.escalapro)
          </Button>
        </CardContent>
      </Card>

      {/* 📂 Restaurar Backup */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Upload className="text-slate-900" size={20} />
            <h3 className="font-bold text-slate-900">Restaurar Backup</h3>
          </div>
          <p className="text-sm text-slate-600">Restaure seus dados a partir de um arquivo previamente exportado.</p>
          <input 
            type="file" 
            accept=".escalapro,.json" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
            <Upload size={18} />
            Selecionar Arquivo
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-lg text-slate-900">Atenção!</h3>
            </div>
            <p className="text-slate-600 text-sm">
              Todos os dados atuais serão substituídos pelos dados contidos no backup. Deseja continuar?
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => {
                setShowRestoreConfirm(false);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}>
                Cancelar
              </Button>
              <Button onClick={handleRestore} className="bg-amber-600 hover:bg-amber-700 text-white">
                Restaurar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
