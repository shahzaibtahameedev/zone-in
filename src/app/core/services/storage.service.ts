import { Injectable, WritableSignal, signal } from '@angular/core';
import { STORAGE_KEY_PREFIX } from '../config/app.constants';
import { createSeedData } from '../data/seed-data';
import { DatabaseTables, TableName } from '../models';
import { todayIsoDate } from '../utils/date-time.utils';

type TableSignals = { [Table in TableName]: WritableSignal<DatabaseTables[Table]> };

const TABLE_NAMES: TableName[] = [
  'zones',
  'consoles',
  'bookings',
  'customers',
  'tournaments',
  'registrations',
  'matches',
  'matchReports',
];

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly tables: TableSignals;

  constructor() {
    const seedData = createSeedData(todayIsoDate());
    const hasSavedData = TABLE_NAMES.every(
      (table) => localStorage.getItem(this.toStorageKey(table)) !== null,
    );
    if (!hasSavedData) {
      TABLE_NAMES.forEach((table) => this.writeValue(table, seedData[table]));
    }

    this.tables = {
      zones: signal(this.readValue('zones', seedData.zones)),
      consoles: signal(this.readValue('consoles', seedData.consoles)),
      bookings: signal(this.readValue('bookings', seedData.bookings)),
      customers: signal(this.readValue('customers', seedData.customers)),
      tournaments: signal(this.readValue('tournaments', seedData.tournaments)),
      registrations: signal(this.readValue('registrations', seedData.registrations)),
      matches: signal(this.readValue('matches', seedData.matches)),
      matchReports: signal(this.readValue('matchReports', seedData.matchReports)),
    };
  }

  select<Table extends TableName>(table: Table): DatabaseTables[Table] {
    const rows = this.tables[table]();

    return rows;
  }

  save<Table extends TableName>(table: Table, rows: DatabaseTables[Table]): void {
    this.tables[table].set(rows);
    this.writeValue(table, rows);
  }

  readValue<T>(key: string, fallback: T): T {
    const storedValue = localStorage.getItem(this.toStorageKey(key));
    if (storedValue === null) {
      return fallback;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as T;

      return parsedValue;
    } catch {
      return fallback;
    }
  }

  writeValue<T>(key: string, value: T): void {
    localStorage.setItem(this.toStorageKey(key), JSON.stringify(value));
  }

  removeValue(key: string): void {
    localStorage.removeItem(this.toStorageKey(key));
  }

  private toStorageKey(key: string): string {
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`;

    return storageKey;
  }
}
