import { ScheduleConfig, DayInfo, DayType } from './types';
import { dateService } from '../services/DateService';

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

  private getCyclePosition(date: Date): number {
    // Parser for YYYY-MM-DD to avoid timezone issues
    const [year, month, day] = this.config.referenceDate.split('-').map(Number);
    const refDate = dateService.createDate(year, month - 1, day);
    
    const diff = dateService.diffInDays(date, refDate);
    const cycleLength = this.getCycleLength();
    
    let pos = (this.config.referenceCycleDay + diff) % cycleLength;
    if (pos < 0) {
      pos += cycleLength;
    }
    return pos;
  }

  public getDayInfo(date: Date): DayInfo {
    const pos = this.getCyclePosition(date);
    const workDays = this.getWorkDaysCount();
    
    const isWork = pos < workDays;
    const tipo: DayType = isWork ? 'TRABALHO' : 'FOLGA';
    const posicaoNoTipo = isWork ? pos + 1 : (pos - workDays) + 1;
    const posicaoLabel = `${posicaoNoTipo}º ${isWork ? 'Trabalho' : 'Folga'}`;

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
    return this.getDayInfo(date).tipo === 'TRABALHO';
  }

  public isOffDay(date: Date): boolean {
    return this.getDayInfo(date).tipo === 'FOLGA';
  }

  public getNextWorkDay(date: Date): DayInfo {
    let current = dateService.addDays(date, 1);
    while (this.isOffDay(current)) {
      current = dateService.addDays(current, 1);
    }
    return this.getDayInfo(current);
  }

  public getNextOffDay(date: Date): DayInfo {
    let current = dateService.addDays(date, 1);
    while (this.isWorkDay(current)) {
      current = dateService.addDays(current, 1);
    }
    return this.getDayInfo(current);
  }

  public getDaysUntilNextOff(date: Date): number {
    let current = dateService.addDays(date, 1);
    let days = 1;
    while (this.isWorkDay(current)) {
      days++;
      current = dateService.addDays(current, 1);
    }
    return days;
  }

  public getDaysUntilNextWork(date: Date): number {
    let current = dateService.addDays(date, 1);
    let days = 1;
    while (this.isOffDay(current)) {
      days++;
      current = dateService.addDays(current, 1);
    }
    return days;
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
