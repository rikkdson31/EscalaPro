import { assistantMessages, AssistantMessage, AssistantMessageCategory } from './assistantMessages';
import { settingsRepository } from '../repositories/SettingsRepository';
import { ScheduleService } from './ScheduleService';
import { StorageKeys } from '../constants/StorageKeys';
import { AppConfig } from '../constants/AppConfig';
import { dateService } from './DateService';

export interface AssistantStats {
  totalExibidas: number;
  categoriasUtilizadas: Record<string, number>;
  ultimaMensagemId: string | null;
}

export class EscalaAssistantService {
  
  /**
   * Obtém a lista de IDs de mensagens recentes exibidas
   */
  public getRecentMessages(profileId: string): string[] {
    const data = settingsRepository.getProfileSetting<string[]>(profileId, StorageKeys.RECENT_MESSAGES);
    return data || [];
  }

  private addRecentMessage(profileId: string, messageId: string) {
    const recent = this.getRecentMessages(profileId);
    recent.unshift(messageId);
    if (recent.length > AppConfig.MAX_RECENT_MESSAGES) {
      recent.pop();
    }
    settingsRepository.saveProfileSetting(profileId, StorageKeys.RECENT_MESSAGES, recent);
  }

  private getLastShownDateString(profileId: string): string | null {
    return settingsRepository.getProfileSetting<string>(profileId, StorageKeys.LAST_SHOWN_DATE);
  }

  private setLastShownDateString(profileId: string, dateStr: string) {
    settingsRepository.saveProfileSetting(profileId, StorageKeys.LAST_SHOWN_DATE, dateStr);
  }

  /**
   * Obtém a categoria contextual de mensagem para uma determinada data
   */
  public getCategoryForDate(scheduleService: ScheduleService, date: Date): AssistantMessageCategory | null {
    const dayInfo = scheduleService.getDayInfo(date);
    const diffNextOff = scheduleService.getDaysUntilNextOff(date);
    const diffNextWork = scheduleService.getDaysUntilNextWork(date);

    if (dayInfo.tipo === 'TRABALHO') {
      if (dayInfo.posicaoCiclo === 1) return 'primeiro_dia_trabalho';
      if (dayInfo.posicaoCiclo === 2) return 'segundo_dia_trabalho';
      if (dayInfo.posicaoCiclo === 3) return 'terceiro_dia_trabalho';
      if (diffNextOff === 1) return 'ultimo_turno_antes_folga';
    } else {
      if (dayInfo.posicaoCiclo === 1) return 'primeiro_dia_folga';
      if (dayInfo.posicaoCiclo === 2) return 'segundo_dia_folga';
      if (dayInfo.posicaoCiclo === 3) return 'terceiro_dia_folga';
      if (diffNextWork === 1) return 'vespera_retorno_trabalho';
    }
    
    return null;
  }

  /**
   * Verifica se o assistente deve exibir mensagem neste dia
   */
  public shouldShowMessage(profileId: string, scheduleService: ScheduleService, date: Date): boolean {
    const category = this.getCategoryForDate(scheduleService, date);
    
    // Inicialmente, exibir apenas no primeiro dia de trabalho e de folga
    if (category !== 'primeiro_dia_trabalho' && category !== 'primeiro_dia_folga') {
      return false;
    }

    const dateStr = dateService.toISODate(date);
    const lastShown = this.getLastShownDateString(profileId);
    
    if (lastShown === dateStr) {
      return false;
    }
    
    return true;
  }

  /**
   * Obtém as estatísticas do assistente para o perfil
   */
  public obterEstatisticas(profileId: string): AssistantStats {
    return settingsRepository.getProfileSetting<AssistantStats>(profileId, StorageKeys.STATS) || {
      totalExibidas: 0,
      categoriasUtilizadas: {},
      ultimaMensagemId: null
    };
  }

  private registerStats(profileId: string, messageId: string, categoria: string) {
    const stats = this.obterEstatisticas(profileId);
    stats.totalExibidas += 1;
    stats.categoriasUtilizadas[categoria] = (stats.categoriasUtilizadas[categoria] || 0) + 1;
    stats.ultimaMensagemId = messageId;
    settingsRepository.saveProfileSetting(profileId, StorageKeys.STATS, stats);
  }

  /**
   * Adiciona uma mensagem aos favoritos
   */
  public adicionarFavorito(profileId: string, messageId: string) {
    const favorites = this.obterFavoritos(profileId);
    if (!favorites.includes(messageId)) {
      favorites.push(messageId);
      // Ensure we don't exceed max favorites, removing oldest if needed
      if (favorites.length > AppConfig.MAX_FAVORITES) {
        favorites.shift();
      }
      settingsRepository.saveProfileSetting(profileId, StorageKeys.FAVORITES, favorites);
    }
  }

  /**
   * Remove uma mensagem dos favoritos
   */
  public removerFavorito(profileId: string, messageId: string) {
    let favorites = this.obterFavoritos(profileId);
    favorites = favorites.filter(id => id !== messageId);
    settingsRepository.saveProfileSetting(profileId, StorageKeys.FAVORITES, favorites);
  }

  /**
   * Obtém a lista de IDs favoritos do perfil
   */
  public obterFavoritos(profileId: string): string[] {
    return settingsRepository.getProfileSetting<string[]>(profileId, StorageKeys.FAVORITES) || [];
  }

  /**
   * Sorteia uma mensagem de acordo com a categoria da data, 
   * respeitando o histórico
   */
  public getMessageForToday(profileId: string, scheduleService: ScheduleService, date: Date, forceNew: boolean = false): AssistantMessage | null {
    const category = this.getCategoryForDate(scheduleService, date);
    
    if (category !== 'primeiro_dia_trabalho' && category !== 'primeiro_dia_folga') {
      return null;
    }

    const availableMessages = assistantMessages.filter(m => m.categoria === category);
    const recent = this.getRecentMessages(profileId);
    
    let unshownMessages = availableMessages.filter(m => !recent.includes(m.id));
    
    // Se esgotaram as mensagens, recomeça o ciclo usando todas
    let pool = unshownMessages.length > 0 ? unshownMessages : availableMessages;
    
    // Evita repetir exatamente a última, a menos que seja a única
    if (pool.length > 1 && recent.length > 0) {
      pool = pool.filter(m => m.id !== recent[0]);
    }
    
    // Pick random message
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    
    if (selected) {
      this.addRecentMessage(profileId, selected.id);
      this.registerStats(profileId, selected.id, selected.categoria);
      
      if (!forceNew) {
        const dateStr = dateService.toISODate(date);
        this.setLastShownDateString(profileId, dateStr);
      }
    }
    
    return selected;
  }
}

export const escalaAssistantService = new EscalaAssistantService();
