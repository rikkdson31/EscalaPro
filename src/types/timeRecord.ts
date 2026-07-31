export enum TimeRecordStatus {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  COMPLETO = 'COMPLETO',
  INCOMPLETO = 'INCOMPLETO',
  JUSTIFICATIVA_PENDENTE = 'JUSTIFICATIVA_PENDENTE',
  JUSTIFICADO = 'JUSTIFICADO'
}

export enum TimeEntryType {
  ENTRADA = 'ENTRADA',
  SAIDA_INTERVALO = 'SAIDA_INTERVALO',
  RETORNO_INTERVALO = 'RETORNO_INTERVALO',
  SAIDA = 'SAIDA'
}

export enum TimeEntryOrigin {
  MANUAL = 'MANUAL',
  SISTEMA = 'SISTEMA',
  INTEGRACAO = 'INTEGRACAO'
}

export interface TimeEntryAttachment {
  id: string;
  type: 'FOTO' | 'PDF' | 'DOCUMENTO';
  url: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  tipo: TimeEntryType;
  horario: string; // ISO String ou HH:mm
  origem: TimeEntryOrigin;
  observacao?: string;
  anexos?: TimeEntryAttachment[]; // Preparado para anexos
}

export interface TimeRecordJustification {
  id: string;
  motivo: string;
  detalhes?: string;
  anexos?: TimeEntryAttachment[];
  protocoloEmpresa?: string; // Protocolo da empresa
  responsavelAprovacao?: string; // Responsável pela aprovação
  dataSolicitacao: string;
  status: 'PENDENTE' | 'APROVADA' | 'REJEITADA';
}

export interface TimeRecord {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD
  status: TimeRecordStatus;
  createdAt: string;
  updatedAt: string;
  observations?: string;
  entries: TimeEntry[];
  justificativa?: TimeRecordJustification; // Preparado para justificativas
}
