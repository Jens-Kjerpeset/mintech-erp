import { describe, it, expect } from 'vitest';
import { generateJournalEntries } from './saft-engine';
import type { ZReport, Invoice } from '../types/schema';

describe('SAF-T Financial Engine', () => {

  it('Test Case 1: The Standard Z-Report', () => {
    // Input: A Z-report with 10 000 kr gross sales, containing both 25% and 15% VAT amounts.
    // Let's assume:
    // 25% VAT = 1000 kr (Meaning Net was 4000)
    // 15% VAT = 600 kr (Meaning Net was 4000)
    // Gross = (4000+1000) + (4000+600) + 0 = 9600. So we need 400 left for 0% net. Total Gross = 10000.
    const zreport: ZReport = {
      id: 'z1',
      date: new Date().toISOString(),
      grossSales: 10000,
      cardSales: 10000,
      vippsSales: 0,
      cashSales: 0,
      expectedCash: 0,
      actualCash: 0,
      cashDifference: 0,
      vat25: 1000,
      vat15: 600,
      vat0: 0,
      receiptUrl: '',
      status: 'completed'
    };

    const entries = generateJournalEntries([], [zreport]);
    expect(entries.length).toBe(1);

    const je = entries[0];
    
    // Check back-calculations
    const net25Line = je.lines.find(l => l.accountId === '3000');
    expect(net25Line).toBeDefined();
    expect(net25Line?.credit).toBe(4000); // 1000 / 0.25

    const net15Line = je.lines.find(l => l.accountId === '3030');
    expect(net15Line).toBeDefined();
    expect(net15Line?.credit).toBe(4000); // 600 / 0.15
  });

  it('Test Case 2: The 0% VAT Deduction (The Trap)', () => {
    // 5 000 kr gross, 0 kr in 25%, 0 kr in 15%
    const zreport: ZReport = {
      id: 'z2',
      date: new Date().toISOString(),
      grossSales: 5000,
      cardSales: 5000,
      vippsSales: 0,
      cashSales: 0,
      expectedCash: 0,
      actualCash: 0,
      cashDifference: 0,
      vat25: 0,
      vat15: 0,
      vat0: 0,
      receiptUrl: '',
      status: 'completed'
    };

    const entries = generateJournalEntries([], [zreport]);
    const je = entries[0];
    
    const net0Line = je.lines.find(l => l.accountId === '3100');
    expect(net0Line).toBeDefined();
    expect(net0Line?.credit).toBe(5000);
  });

  it('Test Case 3: The Double-Entry Ledger Balance', () => {
    // Invoice 1: 2000(net25) + 500(v) + 500(net15) + 75(v) + 200(net0) = 3275 Total
    const invoices: Invoice[] = [
      {
        id: 'inv1',
        clientName: 'Test Client',
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        items: [
          { id: 'i1', productId: 'p1', description: 'Item 1', quantity: 2, price: 1000, vatRate: 25 },
          { id: 'i2', productId: 'p2', description: 'Item 2', quantity: 1, price: 500, vatRate: 15 },
          { id: 'i3', productId: 'p3', description: 'Item 3', quantity: 1, price: 200, vatRate: 0 },
        ],
        subtotal: 2700,
        taxRate: 0,
        total: 3275,
        status: 'sent',
      }
    ];

    // ZReport: Gross 15750. ExpectedCash 750 + Card 15000.
    const zreports: ZReport[] = [
      {
        id: 'z3',
        date: new Date().toISOString(),
        grossSales: 15750,
        cardSales: 15000,
        vippsSales: 0,
        cashSales: 750,
        expectedCash: 750,
        actualCash: 750,
        cashDifference: 0,
        vat25: 2000, // net: 8000, gross: 10000
        vat15: 300,  // net: 2000, gross: 2300
        vat0: 0,     // net: 3450 => Total gross = 10000 + 2300 + 3450 = 15750.
        receiptUrl: '',
        status: 'completed'
      }
    ];

    const entries = generateJournalEntries(invoices, zreports);
    expect(entries.length).toBe(2);

    entries.forEach(je => {
      const totalDebit = je.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = je.lines.reduce((sum, line) => sum + line.credit, 0);
      
      expect(totalDebit).toBeGreaterThan(0);
      expect(totalDebit).toBe(totalCredit);
    });
  });
});
