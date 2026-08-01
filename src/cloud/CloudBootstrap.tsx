import React, { useEffect, useState } from 'react';
import { supabase } from './SupabaseClient';
import { storageService } from '../services/StorageService';
import { profileRepository } from '../repositories/ProfileRepository';
import { timeRecordRepository } from '../repositories/TimeRecordRepository';
import { pendingRepository } from '../repositories/PendingRepository';
import { settingsRepository } from '../repositories/SettingsRepository';
import { occurrencesRepository } from '../repositories/OccurrencesRepository';
import { activityLogRepository } from '../repositories/ActivityLogRepository';
import { devicesRepository } from '../repositories/DevicesRepository';
import { dateService } from '../services/DateService';
import { UserProfile } from '../types';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface CloudBootstrapProps {
  userId: string;
  onComplete: () => void;
}

export function CloudBootstrap({ userId, onComplete }: CloudBootstrapProps) {
  const [progress, setProgress] = useState({
    profiles: false,
    settings: false,
    schedules: false,
    records: false,
    occurrences: false,
    offline: false
  });

  useEffect(() => {
    let isMounted = true;
    
    const runBootstrap = async () => {
      
      
      try {
        // 1. Fetch Profiles
        const { data: profilesData } = await supabase.from('profiles').select('*').eq('user_id', userId);
        
        
        
        
        if (profilesData && profilesData.length > 0) {
          // Check if schedules exist to enrich the local profile
          const { data: schedulesData } = await supabase.from('schedules').select('*').eq('user_id', userId);
          
          for (const p of profilesData) {
            const s = schedulesData?.find(sched => sched.profile_id === p.id);
            
            const localProfile: UserProfile = {
              id: p.id,
              nome: p.nome || 'Meu Perfil',
              apelido: p.apelido || '',
              matricula: p.matricula || '',
              cargo: p.cargo || '',
              foto: p.foto_url || '',
              dataCriacao: p.created_at || dateService.toISODate(dateService.now()),
              ultimaAtualizacao: p.updated_at || dateService.toISODate(dateService.now()),
              
              empresa: s?.empresa || '',
              cliente: s?.cliente || '',
              tipoEscala: s?.tipo_escala || '3x3',
              turma: s?.turma || '',
              entrada: s?.entrada || '07:00',
              saida: s?.saida || '19:00',
              dataConfiguracaoInicial: s?.reference_date || dateService.toISODate(dateService.now()),
              posicaoInicialCiclo: s?.reference_cycle_day || 0,
              temaPreferido: 'light',
              exibirMensagensAssistente: true
            };
            profileRepository.saveProfile(localProfile);
          }
          
          // Validate and enforce active profile for the current user
          const currentActiveId = settingsRepository.getActiveProfileId();
          const isValidForUser = profilesData.some(p => p.id === currentActiveId);
          
          if (!isValidForUser) {
            // Se o perfil atual não pertence ao usuário (ou se não houver perfil ativo)
            // forçamos o activeProfileId para o primeiro perfil válido deste usuário.
            settingsRepository.setActiveProfileId(profilesData[0].id);
          }
        }
        
        if (isMounted) setProgress(prev => ({ ...prev, profiles: true, schedules: true }));
        
        // 2. Fetch Settings
        const { data: settingsData } = await supabase.from('settings').select('*').eq('user_id', userId);
        if (settingsData) {
          for (const row of settingsData) {
            if (row.profile_id && row.config_value) {
              settingsRepository.set(row.config_value, row.profile_id);
            }
          }
        }
        if (isMounted) setProgress(prev => ({ ...prev, settings: true }));

        // 3. Fetch Time Records
        const { data: timeRecordsData } = await supabase.from('time_records').select('*').eq('user_id', userId);
        if (timeRecordsData) {
          // Group by profileId
          const grouped: Record<string, any[]> = {};
          for (const row of timeRecordsData) {
            const pId = row.profile_id;
            if (!grouped[pId]) grouped[pId] = [];
            grouped[pId].push({
              id: row.id,
              date: row.date,
              status: row.status,
              observations: row.observations,
              entries: row.entries || [],
              justificativa: row.justificativa,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            });
          }
          for (const pId of Object.keys(grouped)) {
            timeRecordRepository.save(pId, grouped[pId]);
          }
        }

        // Fetch Pending Items
        const { data: pendingData } = await supabase.from('pending_items').select('*').eq('user_id', userId);
        if (pendingData) {
          const grouped: Record<string, any[]> = {};
          for (const row of pendingData) {
            const pId = row.profile_id;
            if (!grouped[pId]) grouped[pId] = [];
            grouped[pId].push({
              id: row.id,
              timeRecordId: row.time_record_id,
              type: row.type,
              status: row.status,
              priority: row.priority,
              title: row.title,
              description: row.description,
              recommendation: row.recommendation,
              notes: row.notes,
              resolvedAt: row.resolved_at,
              dueDate: row.due_date,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            });
          }
          for (const pId of Object.keys(grouped)) {
            pendingRepository.save(pId, grouped[pId]);
          }
        }
        
        if (isMounted) setProgress(prev => ({ ...prev, records: true }));

        // 4. Fetch Occurrences, Activity Log, Devices
        try {
          const { data: occurrences } = await supabase.from('occurrences').select('*').eq('user_id', userId);
          if (occurrences) occurrencesRepository.save('global', occurrences);
        } catch (e) { /* ignore if doesn't exist */ }

        try {
          const { data: activityLog } = await supabase.from('activity_log').select('*').eq('user_id', userId);
          if (activityLog) activityLogRepository.save('global', activityLog);
        } catch (e) { /* ignore */ }

        try {
          const { data: devices } = await supabase.from('devices').select('*').eq('user_id', userId);
          if (devices) devicesRepository.save('global', devices);
        } catch (e) { /* ignore */ }

        if (isMounted) setProgress(prev => ({ ...prev, occurrences: true }));

        // Finish up
        if (isMounted) {
          
          setProgress(prev => ({ ...prev, offline: true }));
          setTimeout(() => {
            if (isMounted) onComplete();
          }, 600); // small delay to let user see "Preparando modo offline..."
        }

      } catch (err) {
        console.error('Error during cloud bootstrap', err);
        // Even if it fails, we should let them in (using whatever local cache they have)
        if (isMounted) onComplete();
      }
    };

    runBootstrap();

    return () => { isMounted = false; };
  }, [userId, onComplete]);

  const CheckItem = ({ label, done }: { label: string, done: boolean }) => (
    <div className="flex items-center space-x-3 text-sm font-medium">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
        <Check size={12} strokeWidth={3} />
      </div>
      <span className={done ? 'text-slate-800' : 'text-slate-400'}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Sincronizando seus dados...</h2>
        
        <div className="space-y-4">
          <CheckItem label="Perfil" done={progress.profiles} />
          <CheckItem label="Configurações" done={progress.settings} />
          <CheckItem label="Escalas" done={progress.schedules} />
          <CheckItem label="Registros" done={progress.records} />
          <CheckItem label="Ocorrências" done={progress.occurrences} />
          <CheckItem label="Preparando modo offline..." done={progress.offline} />
        </div>
      </div>
    </div>
  );
}
