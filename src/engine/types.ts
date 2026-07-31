export type DayType = 'TRABALHO' | 'FOLGA';

export interface ScheduleConfig {
  empresa: string;
  cliente: string;
  tipoEscala: string; // '3x3', etc.
  turma: string;
  entrada: string;
  saida: string;
  referenceDate: string; // YYYY-MM-DD format
  referenceCycleDay: number; // 0-5 for 3x3
  exibirMensagensAssistente: boolean;
}

export interface DayInfo {
  data: Date;
  diaDaSemana: number;
  tipo: DayType;
  posicaoCiclo: number;
  posicaoLabel: string;
  turma: string;
  entrada: string;
  saida: string;
}
