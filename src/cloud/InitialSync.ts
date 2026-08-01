import { supabase } from './SupabaseClient';
import { UserProfile } from '../types';
import { ScheduleConfig } from '../engine/types';
import { cloudSyncEngine } from './CloudSyncEngine';
import { settingsRepository } from '../repositories/SettingsRepository';

export async function uploadInitialProfile(userId: string, profile: UserProfile) {
  const payload = {
    id: profile.id,
    user_id: userId,
    nome: profile.nome,
    apelido: profile.apelido,
    matricula: profile.matricula,
    cargo: profile.cargo,
    foto_url: profile.foto,
    created_at: profile.dataCriacao || new Date().toISOString(),
    updated_at: profile.ultimaAtualizacao || new Date().toISOString()
  };
  
  const { data, error, status, statusText } = await supabase.from('profiles').insert(payload).select();
  
  console.log('Insert profile response:', { data, error, status, statusText });

  if (error) {
    throw new Error(
      JSON.stringify({
        message: 'Insert profiles failed',
        data,
        error,
        status,
        statusText
      }, null, 2)
    );
  }
}

export async function uploadInitialSchedule(userId: string, profileId: string, config: ScheduleConfig) {
  try {
    const payload = {
      id: profileId,
      user_id: userId,
      profile_id: profileId,
      empresa: config.empresa,
      cliente: config.cliente,
      tipo_escala: config.tipoEscala,
      turma: config.turma,
      entrada: config.entrada,
      saida: config.saida,
      reference_date: config.referenceDate,
      reference_cycle_day: config.referenceCycleDay,
      updated_at: new Date().toISOString()
    };

    console.log('4. Antes do upsert - Tabela: schedules', 'Payload:', JSON.stringify(payload, null, 2));

    const { data, error, status, statusText } = await supabase.from('schedules').upsert(payload).select();
    
    console.log('5. Depois do upsert - schedules:');
    console.log(data);
    console.log(error);
    console.log(status);
    console.log(statusText);
    
    if (error) {
      console.error('Error uploading schedule:', error);
    }
  } catch (err) {
    console.error('Exception in uploadInitialSchedule:', err);
  }
}

export async function uploadInitialSettings(userId: string, profileId: string) {
  try {
    const settingsData = settingsRepository.get(profileId) || {};
    
    const payload = {
      id: profileId,
      user_id: userId,
      profile_id: profileId,
      config_key: 'general',
      config_value: settingsData,
      updated_at: new Date().toISOString()
    };

    console.log('4. Antes do upsert - Tabela: settings', 'Payload:', JSON.stringify(payload, null, 2));

    const { data, error, status, statusText } = await supabase.from('settings').upsert(payload).select();
    
    console.log('5. Depois do upsert - settings:');
    console.log(data);
    console.log(error);
    console.log(status);
    console.log(statusText);
    
    if (error) {
      console.error('Error uploading settings:', error);
    }
  } catch (err) {
    console.error('Exception in uploadInitialSettings:', err);
  }
}

export async function performInitialCloudUpload(userId: string, profile: UserProfile, config: ScheduleConfig) {
  await uploadInitialProfile(userId, profile);
  await uploadInitialSchedule(userId, profile.id, config);
  await uploadInitialSettings(userId, profile.id);
  
  // After finishing, ensure the sync engine is started
  cloudSyncEngine.start();
}
