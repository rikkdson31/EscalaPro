import { timeRecordRepository } from '../repositories/TimeRecordRepository';
import { StorageKeys } from '../constants/StorageKeys';
import { dateService } from './DateService';
import {
  TimeRecord,
  TimeRecordStatus,
  TimeEntry,
  TimeEntryType,
  TimeEntryOrigin
} from '../types';

export class TimeRecordService {
  private generateId(): string {
    return 'tr_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateEntryId(): string {
    return 'te_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtém todos os registros de um perfil
   */
  public getRecords(profileId: string): TimeRecord[] {
    const data = timeRecordRepository.getAllByProfile(profileId);
    return data || [];
  }

  /**
   * Salva a lista completa de registros de um perfil
   */
  private saveRecords(profileId: string, records: TimeRecord[]): void {
    timeRecordRepository.save(profileId, records);
  }

  /**
   * Obtém registro por data específica (YYYY-MM-DD)
   */
  public getRecordById(profileId: string, id: string): TimeRecord | null {
    const records = this.getRecords(profileId);
    return records.find(r => r.id === id) || null;
  }

  public getRecordByDate(profileId: string, dateStr: string): TimeRecord | null {
    const records = this.getRecords(profileId);
    return records.find(r => r.date === dateStr) || null;
  }

  /**
   * Obtém registros por um período
   */
  public getRecordsByPeriod(profileId: string, startDateStr: string, endDateStr: string): TimeRecord[] {
    const records = this.getRecords(profileId);
    const start = dateService.parseISODate(startDateStr).getTime();
    const end = dateService.parseISODate(endDateStr).getTime();

    return records.filter(r => {
      const d = dateService.parseISODate(r.date).getTime();
      return d >= start && d <= end;
    });
  }

  /**
   * Obtém registros de um mês específico
   */
  public getRecordsByMonth(profileId: string, year: number, monthIndex: number): TimeRecord[] {
    const records = this.getRecords(profileId);
    return records.filter(r => {
      // Usando substrings para ser mais rápido (formato YYYY-MM-DD)
      const rYear = parseInt(r.date.substring(0, 4), 10);
      const rMonth = parseInt(r.date.substring(5, 7), 10) - 1;
      return rYear === year && rMonth === monthIndex;
    });
  }

  /**
   * Cria o registro de um dia, caso não exista
   */
  public createRecordForDay(profileId: string, date: Date): TimeRecord {
    const dateStr = dateService.toISODate(date);
    const existing = this.getRecordByDate(profileId, dateStr);
    if (existing) {
      return existing;
    }

    const newRecord: TimeRecord = {
      id: this.generateId(),
      profileId,
      date: dateStr,
      status: TimeRecordStatus.PENDENTE,
      createdAt: dateService.now().toISOString(),
      updatedAt: dateService.now().toISOString(),
      entries: []
    };

    const records = this.getRecords(profileId);
    records.push(newRecord);
    this.saveRecords(profileId, records);
    
    return newRecord;
  }

  private validateSequence(entries: TimeEntry[]): void {
    const types = entries.map(e => e.tipo);
    
    const counts = types.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (counts[TimeEntryType.ENTRADA] > 1) throw new Error('Não é possível registrar entradas duplicadas.');
    if (counts[TimeEntryType.SAIDA] > 1) throw new Error('Não é possível registrar saídas duplicadas.');
    if (counts[TimeEntryType.SAIDA_INTERVALO] > 1) throw new Error('Não é possível registrar saída de intervalo duplicada.');
    if (counts[TimeEntryType.RETORNO_INTERVALO] > 1) throw new Error('Não é possível registrar retorno de intervalo duplicado.');

    if (types.length > 0 && types[0] !== TimeEntryType.ENTRADA) {
      throw new Error('A primeira marcação do dia deve ser a entrada.');
    }
    
    let foundEntrada = false;
    let foundSaidaIntervalo = false;
    let foundRetornoIntervalo = false;
    
    for (const t of types) {
      if (t === TimeEntryType.ENTRADA) foundEntrada = true;
      if (t === TimeEntryType.SAIDA_INTERVALO) {
        if (!foundEntrada) throw new Error('Saída para intervalo registrada antes da entrada.');
        foundSaidaIntervalo = true;
      }
      if (t === TimeEntryType.RETORNO_INTERVALO) {
        if (!foundSaidaIntervalo) throw new Error('Retorno registrado sem saída para intervalo.');
        foundRetornoIntervalo = true;
      }
      if (t === TimeEntryType.SAIDA) {
        if (!foundEntrada) throw new Error('Saída registrada antes da entrada.');
        if (foundSaidaIntervalo && !foundRetornoIntervalo) throw new Error('Saída registrada sem retorno do intervalo.');
      }
    }
  }

  /**
   * Adiciona uma nova marcação validando as regras de negócio
   */
  public addEntry(
    profileId: string,
    date: Date,
    type: TimeEntryType,
    origin: TimeEntryOrigin,
    timeStr?: string,
    obs?: string
  ): TimeRecord {
    const dateStr = dateService.toISODate(date);
    let record = this.getRecordByDate(profileId, dateStr);
    
    if (!record) {
      record = this.createRecordForDay(profileId, date);
    }

    const finalTime = timeStr || dateService.formatTime(dateService.now());

    const newEntry: TimeEntry = {
      id: this.generateEntryId(),
      tipo: type,
      horario: finalTime,
      origem: origin,
      observacao: obs
    };

    const tempEntries = [...record.entries, newEntry];
    tempEntries.sort((a, b) => a.horario.localeCompare(b.horario));
    
    this.validateSequence(tempEntries);

    record.entries = tempEntries;
    
    record.updatedAt = dateService.now().toISOString();
    record.status = this.calculateRecordStatus(record);

    this.updateRecord(profileId, record);
    return record;
  }

  /**
   * Edita uma marcação existente
   */
  public editEntry(
    profileId: string,
    recordId: string,
    entryId: string,
    updates: Partial<TimeEntry>
  ): TimeRecord {
    const records = this.getRecords(profileId);
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error('Registro diário não encontrado.');
    }
    
    const record = records[recordIndex];
    const entryIndex = record.entries.findIndex(e => e.id === entryId);
    
    if (entryIndex === -1) {
      throw new Error('Marcação não encontrada.');
    }

    const updatedEntry = {
      ...record.entries[entryIndex],
      ...updates
    };

    const tempEntries = [...record.entries];
    tempEntries[entryIndex] = updatedEntry;
    tempEntries.sort((a, b) => a.horario.localeCompare(b.horario));
    
    this.validateSequence(tempEntries);

    record.entries = tempEntries;
    
    record.updatedAt = dateService.now().toISOString();
    record.status = this.calculateRecordStatus(record);
    
    records[recordIndex] = record;
    this.saveRecords(profileId, records);
    
    return record;
  }

  /**
   * Remove uma marcação
   */
  public removeEntry(profileId: string, recordId: string, entryId: string): TimeRecord {
    const records = this.getRecords(profileId);
    const recordIndex = records.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      throw new Error('Registro diário não encontrado.');
    }
    
    const record = records[recordIndex];
    record.entries = record.entries.filter(e => e.id !== entryId);
    
    record.updatedAt = dateService.now().toISOString();
    record.status = this.calculateRecordStatus(record);
    
    records[recordIndex] = record;
    this.saveRecords(profileId, records);
    
    return record;
  }

  /**
   * Atualiza todo um record no banco
   */
  private updateRecord(profileId: string, updatedRecord: TimeRecord): void {
    const records = this.getRecords(profileId);
    const index = records.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
      records[index] = updatedRecord;
    } else {
      records.push(updatedRecord);
    }
    this.saveRecords(profileId, records);
  }

  /**
   * Calcula o status atual do registro baseado nas batidas
   */
  private calculateRecordStatus(record: TimeRecord): TimeRecordStatus {
    const entries = record.entries;
    
    if (entries.length === 0) {
      return TimeRecordStatus.PENDENTE;
    }

    if (record.justificativa) {
      if (record.justificativa.status === 'PENDENTE') return TimeRecordStatus.JUSTIFICATIVA_PENDENTE;
      if (record.justificativa.status === 'APROVADA') return TimeRecordStatus.JUSTIFICADO;
    }

    const hasEntrada = entries.some(e => e.tipo === TimeEntryType.ENTRADA);
    const hasSaida = entries.some(e => e.tipo === TimeEntryType.SAIDA);
    
    const isToday = record.date === dateService.toISODate(dateService.now());
    
    if (hasEntrada && !hasSaida) {
      return isToday ? TimeRecordStatus.EM_ANDAMENTO : TimeRecordStatus.INCOMPLETO;
    }
    
    if (hasEntrada && hasSaida) {
      return TimeRecordStatus.COMPLETO;
    }
    
    return TimeRecordStatus.INCOMPLETO;
  }

  // ==========================================
  // ESTATÍSTICAS E RELATÓRIOS
  // ==========================================

  public getDiasTrabalhados(profileId: string, startDateStr: string, endDateStr: string): number {
    const records = this.getRecordsByPeriod(profileId, startDateStr, endDateStr);
    return records.filter(r => r.status === TimeRecordStatus.COMPLETO || r.status === TimeRecordStatus.JUSTIFICADO).length;
  }

  public getDiasIncompletos(profileId: string, startDateStr: string, endDateStr: string): number {
    const records = this.getRecordsByPeriod(profileId, startDateStr, endDateStr);
    return records.filter(r => r.status === TimeRecordStatus.INCOMPLETO).length;
  }

  public getDiasPendentes(profileId: string, startDateStr: string, endDateStr: string): number {
    const records = this.getRecordsByPeriod(profileId, startDateStr, endDateStr);
    return records.filter(r => r.status === TimeRecordStatus.PENDENTE || r.status === TimeRecordStatus.JUSTIFICATIVA_PENDENTE).length;
  }

  public getHorasRegistradasTotais(profileId: string, startDateStr: string, endDateStr: string): number {
    const records = this.getRecordsByPeriod(profileId, startDateStr, endDateStr);
    let totalMinutes = 0;
    
    records.forEach(r => {
      // Implementação simplificada: Pegamos ENTRADA e SAIDA se existirem e calculamos a diferença, 
      // subtraindo o intervalo (SAIDA_INTERVALO a RETORNO_INTERVALO)
      let entrada: number | null = null;
      let saida: number | null = null;
      let saidaIntervalo: number | null = null;
      let retornoIntervalo: number | null = null;
      
      r.entries.forEach(e => {
        const [h, m] = e.horario.split(':').map(Number);
        const mins = h * 60 + m;
        
        if (e.tipo === TimeEntryType.ENTRADA) entrada = mins;
        if (e.tipo === TimeEntryType.SAIDA) saida = mins;
        if (e.tipo === TimeEntryType.SAIDA_INTERVALO) saidaIntervalo = mins;
        if (e.tipo === TimeEntryType.RETORNO_INTERVALO) retornoIntervalo = mins;
      });

      if (entrada !== null && saida !== null) {
        let dailyMins = saida - entrada;
        if (saidaIntervalo !== null && retornoIntervalo !== null) {
          const intervalMins = retornoIntervalo - saidaIntervalo;
          if (intervalMins > 0) {
            dailyMins -= intervalMins;
          }
        }
        if (dailyMins > 0) {
          totalMinutes += dailyMins;
        }
      }
    });

    return totalMinutes / 60; // retorna em horas
  }

  public getQuantidadeDeAjustes(profileId: string, startDateStr: string, endDateStr: string): number {
    const records = this.getRecordsByPeriod(profileId, startDateStr, endDateStr);
    let adjustments = 0;
    
    records.forEach(r => {
      adjustments += r.entries.filter(e => e.origem === TimeEntryOrigin.MANUAL).length;
    });
    
    return adjustments;
  }
}

export const timeRecordService = new TimeRecordService();
