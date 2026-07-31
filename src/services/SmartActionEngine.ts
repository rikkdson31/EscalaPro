import { pendingCenterService } from './PendingCenterService';
import { timeRecordService } from './TimeRecordService';
import { timeRecordWorkflowService } from './TimeRecordWorkflowService';
import { dateService } from './DateService';
import { profileRepository } from '../repositories/ProfileRepository';
import { 
  PendingItem, 
  PendingItemType, 
  PendingItemPriority,
  ActionBlueprint,
  ActionResolutionLevel,
  TimeEntryType
} from '../types';

export class SmartActionEngine {
  /**
   * Transforma uma pendência em uma experiência completa de resolução, 
   * gerando um blueprint que a interface pode utilizar para guiar o usuário.
   * 
   * @param profileId Identificador do perfil ativo
   * @param pendingItem A pendência que precisa ser resolvida
   * @returns ActionBlueprint contendo toda a estrutura de fluxo e dados sugeridos
   */
  public generateBlueprint(profileId: string, pendingItem: PendingItem): ActionBlueprint {
    const record = timeRecordService.getRecordById(profileId, pendingItem.timeRecordId);
    const dateStr = record ? record.date : dateService.toISODate(dateService.now());
    
    let blueprint: ActionBlueprint = {
      id: `bp_${pendingItem.id}`,
      pendingType: pendingItem.type,
      title: pendingItem.title,
      description: pendingItem.description,
      icon: 'AlertCircle',
      color: 'slate',
      priority: pendingItem.priority,
      recommendedAction: pendingItem.recommendation,
      primaryButton: { label: 'Resolver', actionType: 'MANUAL_RESOLUTION' },
      requiresConfirmation: true,
      canAutoResolve: false,
      resolutionLevel: ActionResolutionLevel.MANUAL,
      resolutionSteps: [{ id: 'step_1', type: 'CONFIRM', label: 'Confirmar' }],
      successMessage: 'Ação concluída com sucesso.',
      animation: 'fade',
      healthImpact: this.getHealthImpact(pendingItem.priority)
    };

    switch(pendingItem.type) {
      case PendingItemType.MISSING_ENTRY:
        blueprint = this.buildMissingEntryBlueprint(blueprint, profileId, dateStr);
        break;
      case PendingItemType.MISSING_BREAK:
        blueprint = this.buildMissingBreakBlueprint(blueprint, profileId, dateStr);
        break;
      case PendingItemType.MISSING_RETURN:
        blueprint = this.buildMissingReturnBlueprint(blueprint, profileId, dateStr);
        break;
      case PendingItemType.MISSING_EXIT:
        blueprint = this.buildMissingExitBlueprint(blueprint, profileId, dateStr);
        break;
      case PendingItemType.INVALID_SEQUENCE:
        blueprint = this.buildInvalidSequenceBlueprint(blueprint);
        break;
      case PendingItemType.JUSTIFICATION_REQUIRED:
        blueprint = this.buildJustificationBlueprint(blueprint);
        break;
      case PendingItemType.DUPLICATED_RECORD:
        blueprint = this.buildDuplicatedRecordBlueprint(blueprint);
        break;
      case PendingItemType.MANUAL_REVIEW:
        blueprint = this.buildManualReviewBlueprint(blueprint);
        break;
    }

    return blueprint;
  }

  private buildMissingEntryBlueprint(base: ActionBlueprint, profileId: string, dateStr: string): ActionBlueprint {
    // Tentar sugerir horário baseado na configuração do perfil
    const profile = profileRepository.getProfile(profileId);
    const suggestedTime = profile?.entrada || '08:00';

    return {
      ...base,
      icon: 'LogOut',
      color: 'red',
      primaryButton: { label: 'Registrar Entrada', actionType: 'REGISTER_ENTRY' },
      secondaryButton: { label: 'Justificar Ausência', actionType: 'JUSTIFY' },
      resolutionLevel: ActionResolutionLevel.ASSISTED,
      canAutoResolve: true,
      suggestedData: {
        time: suggestedTime,
        type: TimeEntryType.ENTRADA
      },
      resolutionSteps: [
        { id: 'confirm_time', type: 'EDIT_TIME', label: 'Confirmar Horário' },
        { id: 'save', type: 'SAVE', label: 'Salvar Registro' }
      ]
    };
  }

  private buildMissingBreakBlueprint(base: ActionBlueprint, profileId: string, dateStr: string): ActionBlueprint {
    return {
      ...base,
      icon: 'Coffee',
      color: 'orange',
      primaryButton: { label: 'Informar Intervalo', actionType: 'REGISTER_BREAK_START' },
      secondaryButton: { label: 'Sem Intervalo', actionType: 'JUSTIFY_NO_BREAK' },
      resolutionLevel: ActionResolutionLevel.ASSISTED,
      suggestedData: {
        time: '12:00',
        type: TimeEntryType.SAIDA_INTERVALO
      },
      resolutionSteps: [
        { id: 'confirm_time', type: 'EDIT_TIME', label: 'Horário do Intervalo' },
        { id: 'save', type: 'SAVE', label: 'Salvar' }
      ]
    };
  }

  private buildMissingReturnBlueprint(base: ActionBlueprint, profileId: string, dateStr: string): ActionBlueprint {
    return {
      ...base,
      icon: 'RotateCcw',
      color: 'orange',
      primaryButton: { label: 'Registrar Retorno', actionType: 'REGISTER_BREAK_END' },
      resolutionLevel: ActionResolutionLevel.ASSISTED,
      suggestedData: {
        time: '13:00',
        type: TimeEntryType.RETORNO_INTERVALO
      },
      resolutionSteps: [
        { id: 'confirm_time', type: 'EDIT_TIME', label: 'Horário de Retorno' },
        { id: 'save', type: 'SAVE', label: 'Salvar' }
      ]
    };
  }

  private buildMissingExitBlueprint(base: ActionBlueprint, profileId: string, dateStr: string): ActionBlueprint {
    const profile = profileRepository.getAllProfiles().find(p => p.id === profileId);
    const suggestedTime = profile?.saida || '18:00';

    return {
      ...base,
      icon: 'LogOut', // Flipped usually or Square for exit
      color: 'red',
      primaryButton: { label: 'Registrar Saída', actionType: 'REGISTER_EXIT' },
      resolutionLevel: ActionResolutionLevel.ASSISTED,
      canAutoResolve: true,
      suggestedData: {
        time: suggestedTime,
        type: TimeEntryType.SAIDA
      },
      resolutionSteps: [
        { id: 'confirm_time', type: 'EDIT_TIME', label: 'Confirmar Horário' },
        { id: 'save', type: 'SAVE', label: 'Salvar Registro' }
      ]
    };
  }

  private buildInvalidSequenceBlueprint(base: ActionBlueprint): ActionBlueprint {
    return {
      ...base,
      icon: 'AlertTriangle',
      color: 'red',
      primaryButton: { label: 'Corrigir', actionType: 'FIX_SEQUENCE' },
      resolutionLevel: ActionResolutionLevel.REVIEW,
      resolutionSteps: [
        { id: 'review_entries', type: 'REVIEW_LIST', label: 'Revisar Marcações' },
        { id: 'save', type: 'SAVE', label: 'Confirmar Alterações' }
      ]
    };
  }

  private buildJustificationBlueprint(base: ActionBlueprint): ActionBlueprint {
    return {
      ...base,
      icon: 'FileText',
      color: 'yellow',
      primaryButton: { label: 'Justificar', actionType: 'PROVIDE_JUSTIFICATION' },
      resolutionLevel: ActionResolutionLevel.MANUAL,
      resolutionSteps: [
        { id: 'write_justification', type: 'TEXT_INPUT', label: 'Escrever Justificativa' },
        { id: 'save', type: 'SAVE', label: 'Enviar' }
      ]
    };
  }

  private buildDuplicatedRecordBlueprint(base: ActionBlueprint): ActionBlueprint {
    return {
      ...base,
      icon: 'Copy',
      color: 'orange',
      primaryButton: { label: 'Revisar Marcações', actionType: 'REVIEW_DUPLICATES' },
      resolutionLevel: ActionResolutionLevel.REVIEW,
      resolutionSteps: [
        { id: 'remove_duplicate', type: 'REVIEW_LIST', label: 'Remover Duplicata' },
        { id: 'save', type: 'SAVE', label: 'Confirmar' }
      ]
    };
  }

  private buildManualReviewBlueprint(base: ActionBlueprint): ActionBlueprint {
    return {
      ...base,
      icon: 'Search',
      color: 'blue',
      primaryButton: { label: 'Resolver', actionType: 'MANUAL_RESOLUTION' },
      resolutionLevel: ActionResolutionLevel.MANUAL,
      resolutionSteps: [
        { id: 'review', type: 'REVIEW', label: 'Análise' },
        { id: 'save', type: 'SAVE', label: 'Marcar como Resolvido' }
      ]
    };
  }

  private getHealthImpact(priority: PendingItemPriority): number {
    switch(priority) {
      case PendingItemPriority.CRITICAL: return 10;
      case PendingItemPriority.HIGH: return 5;
      case PendingItemPriority.MEDIUM: return 2;
      case PendingItemPriority.LOW: return 1;
      default: return 0;
    }
  }
}

export const smartActionEngine = new SmartActionEngine();
