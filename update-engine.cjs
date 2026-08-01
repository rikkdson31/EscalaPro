const fs = require('fs');

const content = `import { ScheduleConfig, DayInfo, DayType } from './types';
import { dateService } from '../services/DateService';

export interface ScaleStatus {
  isWork: boolean;
  posicaoNoTipo: number;
  posicaoCiclo: number;
  daysUntilNextWork: number;
  daysUntilNextOff: number;
}

export class ScheduleEngine {
  private config: ScheduleConfig;

  constructor(config: ScheduleConfig) {
    this.config = config;
  }

  private getCycleLength(): number {
    if (this.config.tipoEscala === '3x3') return 6;
    if (this.config.tipoEscala === '12x36') return 2;
    if (this.config.tipoEscala === '5x2') return 7;
    return 6; // default 3x3
  }

  private getWorkDaysCount(): number {
    if (this.config.tipoEscala === '3x3') return 3;
    if (this.config.tipoEscala === '12x36') return 1;
    if (this.config.tipoEscala === '5x2') return 5;
    return 3; // default 3x3
  }

  /**
   * FUNÇÃO CENTRAL RESPONSÁVEL PELO CÁLCULO DA ESCALA
   * Elimina qualquer loop, utilizando puramente matemática com base na data de referência.
   */
  public getCentralScaleInfo(date: Date): ScaleStatus {
    const [year, month, day] = this.config.referenceDate.split('-').map(Number);
    const refDate = dateService.createDate(year, month - 1, day);
    
    const diff = dateService.diffInDays(date, refDate);
    const cycleLength = this.getCycleLength();
    const workDays = this.getWorkDaysCount();
    
    let pos = (this.config.referenceCycleDay + diff) % cycleLength;
    if (pos < 0) {
      pos += cycleLength;
    }
    
    const isWork = pos < workDays;
    const posicaoNoTipo = isWork ? pos + 1 : (pos - workDays) + 1;
    
    let daysUntilNextWork = 0;
    let daysUntilNextOff = 0;
    
    if (isWork) {
      daysUntilNextOff = workDays - pos; // time left in work block
      daysUntilNextWork = (pos === workDays - 1) ? (cycleLength - workDays + 1) : 1;
    } else {
      daysUntilNextWork = cycleLength - pos; // time left in off block
      daysUntilNextOff = (pos === cycleLength - 1) ? (workDays + 1) : 1;
    }
    
    return {
      isWork,
      posicaoNoTipo,
      posicaoCiclo: pos,
      daysUntilNextWork,
      daysUntilNextOff
    };
  }

  public getDayInfo(date: Date): DayInfo {
    const { isWork, posicaoNoTipo } = this.getCentralScaleInfo(date);
    
    const tipo: DayType = isWork ? 'TRABALHO' : 'FOLGA';
    const posicaoLabel = \`\${posicaoNoTipo}º \${isWork ? 'Trabalho' : 'Folga'}\`;

    return {
      data: date,
      diaDaSemana: dateService.dayOfWeekIndex(date),
      tipo,
      posicaoCiclo: posicaoNoTipo,
      posicaoLabel,
      turma: this.config.turma,
      entrada: this.config.entrada,
      saida: this.config.saida
    };
  }

  public isWorkDay(date: Date): boolean {
    return this.getCentralScaleInfo(date).isWork;
  }

  public isOffDay(date: Date): boolean {
    return !this.getCentralScaleInfo(date).isWork;
  }

  public getNextWorkDay(date: Date): DayInfo {
    const { daysUntilNextWork } = this.getCentralScaleInfo(date);
    return this.getDayInfo(dateService.addDays(date, daysUntilNextWork));
  }

  public getNextOffDay(date: Date): DayInfo {
    const { daysUntilNextOff } = this.getCentralScaleInfo(date);
    return this.getDayInfo(dateService.addDays(date, daysUntilNextOff));
  }

  public getDaysUntilNextOff(date: Date): number {
    return this.getCentralScaleInfo(date).daysUntilNextOff;
  }

  public getDaysUntilNextWork(date: Date): number {
    return this.getCentralScaleInfo(date).daysUntilNextWork;
  }

  public getCalendarMonth(year: number, month: number): DayInfo[] {
    const days: DayInfo[] = [];
    let date = dateService.createDate(year, month, 1);
    while (dateService.monthIndex(date) === month) {
      days.push(this.getDayInfo(date));
      date = dateService.addDays(date, 1);
    }
    return days;
  }

  public getNextOffDays(date: Date, limit: number = 5): DayInfo[] {
    const days: DayInfo[] = [];
    let current = date;
    while (days.length < limit) {
      current = dateService.addDays(current, 1);
      if (this.isOffDay(current)) {
        days.push(this.getDayInfo(current));
      }
    }
    return days;
  }

  public getNextWorkDays(date: Date, limit: number = 5): DayInfo[] {
    const days: DayInfo[] = [];
    let current = date;
    while (days.length < limit) {
      current = dateService.addDays(current, 1);
      if (this.isWorkDay(current)) {
        days.push(this.getDayInfo(current));
      }
    }
    return days;
  }
}
`;
fs.writeFileSync('src/engine/ScheduleEngine.ts', content);
