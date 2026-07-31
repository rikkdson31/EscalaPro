import { ScheduleEngine } from '../engine/ScheduleEngine';
import { ScheduleConfig, DayInfo } from '../engine/types';

/**
 * ScheduleService
 * 
 * Atua como camada de abstração e acesso ao ScheduleEngine.
 * Centraliza as operações de escala para que os componentes 
 * da interface não precisem instanciar ou conhecer detalhes do motor.
 */
export class ScheduleService {
  private engine: ScheduleEngine;

  constructor(config: ScheduleConfig) {
    this.engine = new ScheduleEngine(config);
  }

  public getDayInfo(date: Date): DayInfo {
    return this.engine.getDayInfo(date);
  }

  public isWorkDay(date: Date): boolean {
    return this.engine.isWorkDay(date);
  }

  public isOffDay(date: Date): boolean {
    return this.engine.isOffDay(date);
  }

  public getNextWorkDay(date: Date): DayInfo {
    return this.engine.getNextWorkDay(date);
  }

  public getNextOffDay(date: Date): DayInfo {
    return this.engine.getNextOffDay(date);
  }

  public getDaysUntilNextOff(date: Date): number {
    return this.engine.getDaysUntilNextOff(date);
  }

  public getDaysUntilNextWork(date: Date): number {
    return this.engine.getDaysUntilNextWork(date);
  }

  public getCalendarMonth(year: number, month: number): DayInfo[] {
    return this.engine.getCalendarMonth(year, month);
  }

  public getNextOffDays(date: Date, limit: number = 5): DayInfo[] {
    return this.engine.getNextOffDays(date, limit);
  }

  public getNextWorkDays(date: Date, limit: number = 5): DayInfo[] {
    return this.engine.getNextWorkDays(date, limit);
  }
}
