export * from './types/timeRecord';
export * from './types/timeRecordWorkflow';
export * from './types/pendingItem';
export * from './types/smartAction';

export type TabId = 'dashboard' | 'calendar' | 'time' | 'timeline' | 'settings' | 'tasks' | 'statistics';

export interface UserProfile {
  id: string;
  nome: string;
  empresa: string;
  cliente: string;
  tipoEscala: string;
  turma: string;
  entrada: string;
  saida: string;
  dataConfiguracaoInicial: string; // referenceDate
  posicaoInicialCiclo: number; // referenceCycleDay
  temaPreferido: string;
  exibirMensagensAssistente: boolean;
  dataCriacao: string;
  ultimaAtualizacao: string;
  apelido?: string;
  matricula?: string;
  cargo?: string;
  foto?: string;
}
