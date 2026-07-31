import { pendingRepository } from '../repositories/PendingRepository';
import { StorageKeys } from '../constants/StorageKeys';
import { dateService } from './DateService';
import { timeRecordService } from './TimeRecordService';
import { timeRecordWorkflowService } from './TimeRecordWorkflowService';
import {
  PendingItem,
  PendingItemType,
  PendingItemStatus,
  PendingItemPriority,
  WorkflowState,
  TimeEntryType
} from '../types';

export class PendingCenterService {
  private generateId(): string {
    return 'pi_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  public getPendingItems(profileId: string): PendingItem[] {
    const data = pendingRepository.getAllByProfile(profileId);
    return data || [];
  }

  private savePendingItems(profileId: string, items: PendingItem[]): void {
    pendingRepository.save(profileId, items);
  }

  public detectPending(profileId: string, dateStr: string): void {
    const record = timeRecordService.getRecordByDate(profileId, dateStr);
    if (!record) return;

    const workflowStatus = timeRecordWorkflowService.getNextAction(profileId, dateStr);
    const currentState = workflowStatus.currentState;

    if (!workflowStatus.requiresAttention && currentState !== WorkflowState.INCOMPLETE && currentState !== WorkflowState.JUSTIFICATION_REQUIRED && currentState !== WorkflowState.INVALID_SEQUENCE) {
      return;
    }
    
    // We only detect for past dates, or if there's an explicit issue today.
    // If it's today and simply not finished, it might not be a pendency yet, but if it is INCOMPLETE from a past date it is.
    const isToday = record.date === dateService.toISODate(dateService.now());
    
    if (isToday && currentState !== WorkflowState.INVALID_SEQUENCE && currentState !== WorkflowState.JUSTIFICATION_REQUIRED) {
       // Today might still be ongoing, so only sequence or explicit justification issues are pendencies right away.
       return;
    }

    const items = this.getPendingItems(profileId);
    
    // Check if there is already an open pendency for this record
    const openPendency = items.find(i => i.timeRecordId === record.id && i.status !== PendingItemStatus.RESOLVED && i.status !== PendingItemStatus.ARCHIVED);
    if (openPendency) {
      return; // Already has an open pendency, don't create a new one to avoid spam
    }

    // Determine type, title, description, priority, recommendation
    let type = PendingItemType.MANUAL_REVIEW;
    let title = 'Revisão Manual Necessária';
    let description = 'O registro requer uma revisão manual.';
    let recommendation = 'Verifique os horários registrados e ajuste conforme necessário.';
    let priority = PendingItemPriority.MEDIUM;

    if (currentState === WorkflowState.INVALID_SEQUENCE) {
      type = PendingItemType.INVALID_SEQUENCE;
      title = 'Sequência Inválida';
      description = 'Foi detectada uma sequência inválida nos registros.';
      recommendation = 'Corrija a ordem das marcações ou remova marcações duplicadas.';
      priority = PendingItemPriority.HIGH;
    } else if (currentState === WorkflowState.JUSTIFICATION_REQUIRED) {
      type = PendingItemType.JUSTIFICATION_REQUIRED;
      title = 'Justificativa Pendente';
      description = 'O registro exige uma justificativa.';
      recommendation = 'Adicione uma justificativa e/ou anexo ao registro.';
      priority = PendingItemPriority.HIGH;
    } else if (currentState === WorkflowState.INCOMPLETE) {
      // Analyze which one is missing
      const types = record.entries.map(e => e.tipo);
      const hasEntrada = types.includes(TimeEntryType.ENTRADA);
      const hasSaidaIntervalo = types.includes(TimeEntryType.SAIDA_INTERVALO);
      const hasRetornoIntervalo = types.includes(TimeEntryType.RETORNO_INTERVALO);
      const hasSaida = types.includes(TimeEntryType.SAIDA);

      if (!hasEntrada) {
        type = PendingItemType.MISSING_ENTRY;
        title = 'Entrada Ausente';
        description = 'Não há registro de entrada para este dia.';
        recommendation = 'Registre a entrada manualmente ou justifique a ausência.';
        priority = PendingItemPriority.CRITICAL;
      } else if (!hasSaida) {
        type = PendingItemType.MISSING_EXIT;
        title = 'Saída Ausente';
        description = 'Não há registro de saída final para este dia.';
        recommendation = 'Registre a saída final ou justifique o esquecimento.';
        priority = PendingItemPriority.CRITICAL;
      } else if (!hasSaidaIntervalo) {
        type = PendingItemType.MISSING_BREAK;
        title = 'Saída de Intervalo Ausente';
        description = 'Não há registro de saída para intervalo.';
        recommendation = 'Adicione a saída do intervalo ou justifique se não houve pausa.';
        priority = PendingItemPriority.MEDIUM;
      } else if (!hasRetornoIntervalo) {
        type = PendingItemType.MISSING_RETURN;
        title = 'Retorno de Intervalo Ausente';
        description = 'Não há registro de retorno do intervalo.';
        recommendation = 'Adicione o retorno do intervalo.';
        priority = PendingItemPriority.MEDIUM;
      }
    }

    this.createPending(profileId, record.id, type, title, description, recommendation, priority);
  }

  public createPending(
    profileId: string, 
    timeRecordId: string, 
    type: PendingItemType,
    title: string,
    description: string,
    recommendation: string,
    priority: PendingItemPriority = PendingItemPriority.MEDIUM
  ): PendingItem {
    const newItem: PendingItem = {
      id: this.generateId(),
      profileId,
      timeRecordId,
      createdAt: dateService.now().toISOString(),
      updatedAt: dateService.now().toISOString(),
      status: PendingItemStatus.CREATED,
      priority,
      type,
      title,
      description,
      recommendation,
    };

    const items = this.getPendingItems(profileId);
    items.push(newItem);
    this.savePendingItems(profileId, items);

    return newItem;
  }

  public updatePending(profileId: string, id: string, updates: Partial<PendingItem>): PendingItem {
    const items = this.getPendingItems(profileId);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Pendência não encontrada.');

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: dateService.now().toISOString()
    };

    items[index] = updatedItem;
    this.savePendingItems(profileId, items);

    return updatedItem;
  }

  public resolvePending(profileId: string, id: string, resolvedBy: string, notes?: string): PendingItem {
    return this.updatePending(profileId, id, {
      status: PendingItemStatus.RESOLVED,
      resolvedAt: dateService.now().toISOString(),
      resolvedBy,
      notes
    });
  }

  public archivePending(profileId: string, id: string): PendingItem {
    return this.updatePending(profileId, id, {
      status: PendingItemStatus.ARCHIVED
    });
  }

  public getPendingByDate(profileId: string, dateStr: string): PendingItem[] {
    const items = this.getPendingItems(profileId);
    const record = timeRecordService.getRecordByDate(profileId, dateStr);
    if (!record) return [];
    
    return items.filter(i => i.timeRecordId === record.id);
  }

  public getPendingByMonth(profileId: string, year: number, monthIndex: number): PendingItem[] {
    const records = timeRecordService.getRecordsByMonth(profileId, year, monthIndex);
    const recordIds = new Set(records.map(r => r.id));
    const items = this.getPendingItems(profileId);
    
    return items.filter(i => recordIds.has(i.timeRecordId));
  }

  public getPendingByProfile(profileId: string): PendingItem[] {
    return this.getPendingItems(profileId);
  }

  public getOpenPendings(profileId: string): PendingItem[] {
    const items = this.getPendingItems(profileId);
    return items.filter(i => 
      i.status !== PendingItemStatus.RESOLVED && 
      i.status !== PendingItemStatus.ARCHIVED &&
      i.status !== PendingItemStatus.JUSTIFIED
    );
  }

  public getResolvedPendings(profileId: string): PendingItem[] {
    const items = this.getPendingItems(profileId);
    return items.filter(i => 
      i.status === PendingItemStatus.RESOLVED || 
      i.status === PendingItemStatus.JUSTIFIED
    );
  }

  /**
   * Índice de saúde: 0 a 100%
   * 100 - (CRITICAL * 10) - (HIGH * 5) - (MEDIUM * 2) - (LOW * 1)
   */
  public calculateJourneyHealth(profileId: string): number {
    const openItems = this.getOpenPendings(profileId);
    let penalty = 0;

    openItems.forEach(item => {
      switch (item.priority) {
        case PendingItemPriority.CRITICAL: penalty += 10; break;
        case PendingItemPriority.HIGH: penalty += 5; break;
        case PendingItemPriority.MEDIUM: penalty += 2; break;
        case PendingItemPriority.LOW: penalty += 1; break;
      }
    });

    const health = 100 - penalty;
    return Math.max(0, health);
  }

  // Estatísticas
  public getPendingStats(profileId: string) {
    const items = this.getPendingItems(profileId);
    
    const open = this.getOpenPendings(profileId).length;
    const resolved = this.getResolvedPendings(profileId).length;
    const archived = items.filter(i => i.status === PendingItemStatus.ARCHIVED).length;

    // Tempo médio de resolução (em minutos)
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    const typesCount: Record<string, number> = {};

    items.forEach(item => {
      // Tipos mais frequentes
      typesCount[item.type] = (typesCount[item.type] || 0) + 1;

      // Tempo de resolução
      if (item.resolvedAt && item.createdAt) {
        const created = dateService.parseISOString(item.createdAt);
        const resolved = dateService.parseISOString(item.resolvedAt);
        const diffMins = dateService.diffMinutes(created, resolved);
        totalResolutionTime += diffMins;
        resolvedCount++;
      }
    });

    const averageResolutionTimeMinutes = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
    
    // Sort types by frequency
    const mostFrequentTypes = Object.entries(typesCount)
      .sort((a, b) => b[1] - a[1])
      .map(entry => ({ type: entry[0] as PendingItemType, count: entry[1] }));

    return {
      open,
      resolved,
      archived,
      averageResolutionTimeMinutes,
      mostFrequentTypes
    };
  }
}

export const pendingCenterService = new PendingCenterService();
