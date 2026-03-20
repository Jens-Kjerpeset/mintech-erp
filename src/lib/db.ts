import Dexie, { type Table } from 'dexie';
import type { Transaction, Invoice, Contact, Product, ZReport, Settings } from '../types/schema';

export class MintechDB extends Dexie {
  transactions!: Table<Transaction>;
  invoices!: Table<Invoice>;
  contacts!: Table<Contact>;
  products!: Table<Product>;
  zreports!: Table<ZReport>;
  settings!: Table<Settings>;

  constructor() {
    super('MintechDB_v8');
    this.version(1).stores({
      transactions: '++id, amount, date, type, category, status',
      invoices: '++id, clientName, issueDate, dueDate, status',
      contacts: '++id, name, relationType, orgNumber',
      products: '++id, name, sku, supplierId',
      zreports: '++id, date, status',
      settings: 'id'
    });
  }
}

export const db = new MintechDB();
