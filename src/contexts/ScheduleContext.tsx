import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScheduleConfig } from '../engine/types';
import { ScheduleService } from '../services/ScheduleService';
import { storageService } from '../services/StorageService';
import { UserProfile } from '../types';
import { dateService } from '../services/DateService';

interface ScheduleContextType {
  config: ScheduleConfig | null;
  activeProfile: UserProfile | null;
  scheduleService: ScheduleService | null;
  isLoaded: boolean;
  saveConfig: (config: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => void;
  updateProfileInfo: (updates: Partial<UserProfile>) => void;
  clearConfig: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [scheduleService, setScheduleService] = useState<ScheduleService | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const mapProfileToConfig = (profile: UserProfile): ScheduleConfig => {
    return {
      empresa: profile.empresa,
      cliente: profile.cliente,
      tipoEscala: profile.tipoEscala,
      turma: profile.turma,
      entrada: profile.entrada,
      saida: profile.saida,
      referenceDate: profile.dataConfiguracaoInicial,
      referenceCycleDay: profile.posicaoInicialCiclo,
      exibirMensagensAssistente: profile.exibirMensagensAssistente !== undefined ? profile.exibirMensagensAssistente : true,
    };
  };

  useEffect(() => {
    const profile = storageService.getActiveProfile();
    if (profile) {
      setActiveProfile(profile);
      const schedConfig = mapProfileToConfig(profile);
      setConfig(schedConfig);
      setScheduleService(new ScheduleService(schedConfig));
    }
    setIsLoaded(true);
  }, []);

  const saveConfig = (newConfig: ScheduleConfig, profileUpdates?: Partial<UserProfile>) => {
    const now = dateService.toISODate(dateService.now());
    
    let profileToSave: UserProfile;
    
    if (activeProfile) {
      profileToSave = {
        ...activeProfile,
        empresa: newConfig.empresa,
        cliente: newConfig.cliente,
        tipoEscala: newConfig.tipoEscala,
        turma: newConfig.turma,
        entrada: newConfig.entrada,
        saida: newConfig.saida,
        dataConfiguracaoInicial: newConfig.referenceDate,
        posicaoInicialCiclo: newConfig.referenceCycleDay,
        exibirMensagensAssistente: newConfig.exibirMensagensAssistente,
        ultimaAtualizacao: now,
        ...(profileUpdates || {})
      };
    } else {
      profileToSave = {
        id: generateId(),
        nome: 'Meu Perfil',
        empresa: newConfig.empresa,
        cliente: newConfig.cliente,
        tipoEscala: newConfig.tipoEscala,
        turma: newConfig.turma,
        entrada: newConfig.entrada,
        saida: newConfig.saida,
        dataConfiguracaoInicial: newConfig.referenceDate,
        posicaoInicialCiclo: newConfig.referenceCycleDay,
        temaPreferido: 'light',
        exibirMensagensAssistente: newConfig.exibirMensagensAssistente !== undefined ? newConfig.exibirMensagensAssistente : true,
        dataCriacao: now,
        ultimaAtualizacao: now,
        ...(profileUpdates || {})
      };
    }

    storageService.saveProfile(profileToSave);
    
    if (!activeProfile) {
      storageService.setActiveProfileId(profileToSave.id);
    }
    
    setActiveProfile(profileToSave);
    setConfig(newConfig);
    setScheduleService(new ScheduleService(newConfig));
  };

  const updateProfileInfo = (updates: Partial<UserProfile>) => {
    if (activeProfile) {
      storageService.updateProfile(activeProfile.id, updates);
      setActiveProfile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const clearConfig = () => {
    storageService.clearAll();
    setActiveProfile(null);
    setConfig(null);
    setScheduleService(null);
  };

  return (
    <ScheduleContext.Provider value={{ config, activeProfile, scheduleService, isLoaded, saveConfig, updateProfileInfo, clearConfig }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
}
