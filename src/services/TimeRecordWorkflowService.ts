import { timeRecordService } from './TimeRecordService';
import { dateService } from './DateService';
import { 
  TimeRecord, 
  TimeEntryType, 
  TimeRecordStatus,
  WorkflowState, 
  WorkflowAction, 
  WorkflowStatus 
} from '../types';

export class TimeRecordWorkflowService {
  
  /**
   * Avalia o estado atual da jornada e determina a próxima ação
   */
  public getNextAction(profileId: string, dateStr: string): WorkflowStatus {
    const record = timeRecordService.getRecordByDate(profileId, dateStr);
    const currentState = this.getCurrentState(record);
    const progress = this.getProgress(record);
    const requiresAttention = this.requiresAttention(record);

    let nextAction = WorkflowAction.NONE;
    let label = 'Jornada Concluída';
    let description = 'Você já encerrou sua jornada de trabalho.';
    let completed = true;

    if (currentState === WorkflowState.NOT_STARTED) {
      nextAction = WorkflowAction.ENTRY;
      label = 'Registrar Entrada';
      description = 'Inicie sua jornada de trabalho.';
      completed = false;
    } else if (currentState === WorkflowState.WORKING) {
      nextAction = WorkflowAction.BREAK_START;
      label = 'Registrar Saída para Intervalo';
      description = 'Inicie seu período de descanso.';
      completed = false;
    } else if (currentState === WorkflowState.BREAK) {
      nextAction = WorkflowAction.BREAK_END;
      label = 'Registrar Retorno do Intervalo';
      description = 'Retorne do seu período de descanso.';
      completed = false;
    } else if (currentState === WorkflowState.RETURNED) {
      nextAction = WorkflowAction.EXIT;
      label = 'Registrar Saída';
      description = 'Encerre sua jornada de trabalho.';
      completed = false;
    } else if (currentState === WorkflowState.INVALID_SEQUENCE) {
      nextAction = WorkflowAction.NONE;
      label = 'Atenção Necessária';
      description = 'Foram detectadas inconsistências nos registros.';
      completed = false;
    } else if (currentState === WorkflowState.INCOMPLETE) {
      nextAction = WorkflowAction.NONE;
      label = 'Jornada Incompleta';
      description = 'A jornada anterior não foi concluída corretamente.';
      completed = false;
    } else if (currentState === WorkflowState.JUSTIFICATION_REQUIRED) {
      nextAction = WorkflowAction.NONE;
      label = 'Justificativa Pendente';
      description = 'É necessário justificar as ausências ou inconsistências.';
      completed = false;
    }

    return {
      currentState,
      nextAction,
      label,
      description,
      completed,
      requiresAttention,
      progress
    };
  }

  /**
   * Retorna o estado da jornada no dia avaliado
   */
  public getCurrentState(record: TimeRecord | null): WorkflowState {
    if (!record || !record.entries || record.entries.length === 0) {
      return WorkflowState.NOT_STARTED;
    }

    if (record.status === TimeRecordStatus.JUSTIFICATIVA_PENDENTE) {
      return WorkflowState.JUSTIFICATION_REQUIRED;
    }

    const types = record.entries.map(e => e.tipo);
    
    // Validar duplicatas e sequências anormais (inconsistências)
    const counts = types.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (
      counts[TimeEntryType.ENTRADA] > 1 || 
      counts[TimeEntryType.SAIDA] > 1 || 
      counts[TimeEntryType.SAIDA_INTERVALO] > 1 || 
      counts[TimeEntryType.RETORNO_INTERVALO] > 1
    ) {
      return WorkflowState.INVALID_SEQUENCE;
    }

    const hasEntrada = types.includes(TimeEntryType.ENTRADA);
    const hasSaidaIntervalo = types.includes(TimeEntryType.SAIDA_INTERVALO);
    const hasRetornoIntervalo = types.includes(TimeEntryType.RETORNO_INTERVALO);
    const hasSaida = types.includes(TimeEntryType.SAIDA);

    const isToday = record.date === dateService.toISODate(dateService.now());

    // Identificar sequência exata baseada na última entrada inserida
    // Assumimos que estão ordenadas por horário no TimeRecordService
    const lastType = types[types.length - 1];

    if (hasSaida) {
      if (!hasEntrada) return WorkflowState.INVALID_SEQUENCE;
      if ((hasSaidaIntervalo && !hasRetornoIntervalo) || (!hasSaidaIntervalo && hasRetornoIntervalo)) {
        return WorkflowState.INVALID_SEQUENCE;
      }
      return WorkflowState.FINISHED;
    }

    if (!isToday) {
      return WorkflowState.INCOMPLETE;
    }

    if (lastType === TimeEntryType.ENTRADA) {
      return WorkflowState.WORKING;
    }

    if (lastType === TimeEntryType.SAIDA_INTERVALO) {
      if (!hasEntrada) return WorkflowState.INVALID_SEQUENCE;
      return WorkflowState.BREAK;
    }

    if (lastType === TimeEntryType.RETORNO_INTERVALO) {
      if (!hasEntrada || !hasSaidaIntervalo) return WorkflowState.INVALID_SEQUENCE;
      return WorkflowState.RETURNED;
    }

    // Se estiver explicitamente incompleto pela engine
    if (record.status === TimeRecordStatus.INCOMPLETO) {
      return WorkflowState.INCOMPLETE;
    }

    return WorkflowState.INVALID_SEQUENCE; // fallback
  }

  /**
   * Obtém um percentual de progresso
   */
  public getProgress(record: TimeRecord | null): number {
    const state = this.getCurrentState(record);
    switch (state) {
      case WorkflowState.NOT_STARTED: return 0;
      case WorkflowState.WORKING: return 25;
      case WorkflowState.BREAK: return 50;
      case WorkflowState.RETURNED: return 75;
      case WorkflowState.FINISHED: return 100;
      default: return 0;
    }
  }

  public requiresAttention(record: TimeRecord | null): boolean {
    const state = this.getCurrentState(record);
    return state === WorkflowState.INVALID_SEQUENCE || 
           state === WorkflowState.INCOMPLETE || 
           state === WorkflowState.JUSTIFICATION_REQUIRED;
  }

  public isCompleted(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.FINISHED;
  }

  public isIncomplete(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.INCOMPLETE;
  }

  public requiresJustification(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.JUSTIFICATION_REQUIRED;
  }

  public canRegisterEntry(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.NOT_STARTED;
  }

  public canRegisterBreakStart(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.WORKING;
  }

  public canRegisterBreakEnd(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.BREAK;
  }

  public canRegisterExit(record: TimeRecord | null): boolean {
    return this.getCurrentState(record) === WorkflowState.RETURNED;
  }
}

export const timeRecordWorkflowService = new TimeRecordWorkflowService();
