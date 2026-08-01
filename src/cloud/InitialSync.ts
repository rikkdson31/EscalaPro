import { supabase } from './SupabaseClient';
import { UserProfile } from '../types';
import { ScheduleConfig } from '../engine/types';
import { cloudSyncEngine } from './CloudSyncEngine';
import { settingsRepository } from '../repositories/SettingsRepository';

export async function uploadInitialProfile(userId: string, profile: UserProfile) {
  try {
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
    
    console.log('4. Antes do upsert - Tabela: profiles', 'Payload:', JSON.stringify(payload, null, 2));
    
    const response = await supabase.from('profiles').upsert(payload);
    
    console.log('5. Depois do upsert - profiles:');
    console.log('data:', response.data);
    console.log('error:', response.error);
    console.log('status:', response.status);
    console.log('statusText:', response.statusText);
    
    if (response.error) {
      console.error('Error uploading profile:', response.error);
    }
  } catch (err) {
    console.error('Exception in uploadInitialProfile:', err);
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

    const response = await supabase.from('schedules').upsert(payload);

    console.log('5. Depois do upsert - schedules:');
    console.log('data:', response.data);
    console.log('error:', response.error);
    console.log('status:', response.status);
    console.log('statusText:', response.statusText);
    
    if (response.error) {
      console.error('Error uploading schedule:', response.error);
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

    const response = await supabase.from('settings').upsert(payload);

    console.log('5. Depois do upsert - settings:');
    console.log('data:', response.data);
    console.log('error:', response.error);
    console.log('status:', response.status);
    console.log('statusText:', response.statusText);
    
    if (response.error) {
      console.error('Error uploading settings:', response.error);
    }
  } catch (err) {
    console.error('Exception in uploadInitialSettings:', err);
  }
}

export async function performInitialCloudUpload(userId: string, profile: UserProfile, config: ScheduleConfig) {
  console.log('1. A função performInitialCloudUpload() foi chamada? SIM');
  
  try {
    const sessionResponse = await supabase.auth.getSession();
    console.log('2. Resultado de await supabase.auth.getSession():', sessionResponse);
    
    if (!sessionResponse.data.session) {
      console.log('6. Retorno antecipado: !sessionResponse.data.session (não há sessão válida)');
      return;
    }
    
    const authUid = sessionResponse.data.session.user.id;
    console.log('3. Qual é o auth.uid() obtido?', authUid);
    
    await uploadInitialProfile(userId, profile);
    await uploadInitialSchedule(userId, profile.id, config);
    await uploadInitialSettings(userId, profile.id);
    
    // After finishing, ensure the sync engine is started
    cloudSyncEngine.start();
  } catch (err) {
    console.error('Exception in performInitialCloudUpload:', err);
  }
}
