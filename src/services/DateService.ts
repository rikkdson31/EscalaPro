import { AppConfig } from '../constants/AppConfig';

export class DateService {
  public today(): Date {
    return new Date();
  }

  public now(): Date {
    return new Date();
  }

  public yesterday(): Date {
    return this.addDays(this.today(), -1);
  }

  public tomorrow(): Date {
    return this.addDays(this.today(), 1);
  }

  public isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  public isToday(date: Date): boolean {
    return this.isSameDay(date, this.today());
  }

  public isTomorrow(date: Date): boolean {
    return this.isSameDay(date, this.tomorrow());
  }

  public isYesterday(date: Date): boolean {
    return this.isSameDay(date, this.yesterday());
  }

  public createDate(year: number, month: number, day: number): Date {
    return new Date(year, month, day);
  }

  public diffDays(date1: Date, date2: Date): number {
    const d1 = this.startOfDay(new Date(date1));
    const d2 = this.startOfDay(new Date(date2));
    const diffTime = d2.getTime() - d1.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  public diffInDays(date1: Date, date2: Date): number {
    const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
  }

  public diffMinutes(date1: Date, date2: Date): number {
    const diffTime = date2.getTime() - date1.getTime();
    return Math.round(diffTime / (1000 * 60));
  }

  public diffMonths(date1: Date, date2: Date): number {
    return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
  }

  public diffYears(date1: Date, date2: Date): number {
    return date2.getFullYear() - date1.getFullYear();
  }

  public startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  public endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }
  
  public daysInMonth(date: Date): number {
    return this.endOfMonth(date).getDate();
  }

  public startOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  public endOfWeek(date: Date): Date {
    const d = this.startOfWeek(date);
    d.setDate(d.getDate() + 6);
    return d;
  }

  public dayOfWeekIndex(date: Date): number {
    return date.getDay();
  }
  
  public monthIndex(date: Date): number {
    return date.getMonth();
  }

  public getYear(date: Date): number { return date.getFullYear(); }
  public getMonth(date: Date): number { return date.getMonth() + 1; }
  public getDay(date: Date): number { return date.getDate(); }
  public getHour(date: Date): number { return date.getHours(); }
  public getMinute(date: Date): number { return date.getMinutes(); }
  public getSecond(date: Date): number { return date.getSeconds(); }

  public isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  public isWeekday(date: Date): boolean {
    return !this.isWeekend(date);
  }

  public isLeapYear(date: Date): boolean {
    const year = date.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  public startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  public endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  public addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  public addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  public addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  public formatDDMM(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { day: '2-digit', month: '2-digit' }).format(date);
  }

  public formatDDMMYYYY(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  public formatExtenso(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { day: 'numeric', month: 'long' }).format(date);
  }

  public formatWeekdayLong(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { weekday: 'long' }).format(date);
  }

  public formatWeekdayShort(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { weekday: 'short' }).format(date).replace('.', '').toUpperCase();
  }

  public formatMonthLong(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { month: 'long' }).format(date);
  }

  public toISODate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public parseISODate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  public parseISOString(isoStr: string): Date {
    return new Date(isoStr);
  }

  public formatTime(date: Date): string {
    return new Intl.DateTimeFormat(AppConfig.DEFAULT_LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date);
  }
}

export const dateService = new DateService();
