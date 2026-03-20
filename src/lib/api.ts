import { db } from './db';
import type { Transaction, Invoice, InvoiceItem, Contact, Product, ZReport, Settings } from '../types/schema';
import { faker } from '@faker-js/faker';

const DELAY_MS = 600;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  transactions: {
    list: async () => {
      await sleep(DELAY_MS);
      return db.transactions.orderBy('date').reverse().toArray();
    },
    create: async (data: Omit<Transaction, 'id'>) => {
      await sleep(DELAY_MS);
      const id = crypto.randomUUID();
      const newTx: Transaction = { ...data, id };
      await db.transactions.add(newTx);
      return newTx;
    },
    delete: async (id: string) => {
      await sleep(DELAY_MS);
      await db.transactions.delete(id);
      return id;
    },
    update: async (id: string, data: Partial<Transaction>) => {
      await sleep(DELAY_MS);
      await db.transactions.update(id, data);
      return { id, ...data };
    }
  },
  invoices: {
    list: async () => {
      await sleep(DELAY_MS);
      return db.invoices.orderBy('issueDate').reverse().toArray();
    },
    create: async (data: Omit<Invoice, 'id'>) => {
      await sleep(DELAY_MS);
      const id = crypto.randomUUID();
      const newInvoice: Invoice = { ...data, id };
      await db.invoices.add(newInvoice);
      return newInvoice;
    }
  },
  contacts: {
    list: async () => {
      await sleep(DELAY_MS);
      return db.contacts.toArray();
    },
    create: async (data: Omit<Contact, 'id'>) => {
      await sleep(DELAY_MS);
      const id = crypto.randomUUID();
      const newContact: Contact = { ...data, id };
      await db.contacts.add(newContact);
      return newContact;
    },
    update: async (id: string, data: Partial<Contact>) => {
      await sleep(DELAY_MS);
      await db.contacts.update(id, data);
      return { id, ...data };
    },
    delete: async (id: string) => {
      await sleep(DELAY_MS);
      await db.contacts.delete(id);
      return id;
    }
  },
  products: {
    list: async () => {
      await sleep(DELAY_MS);
      return db.products.toArray();
    },
    create: async (data: Omit<Product, 'id'>) => {
      await sleep(DELAY_MS);
      const id = crypto.randomUUID();
      const newProduct: Product = { ...data, id };
      await db.products.add(newProduct);
      return newProduct;
    },
    update: async (id: string, data: Partial<Product>) => {
      await sleep(DELAY_MS);
      await db.products.update(id, data);
      return { id, ...data };
    },
    delete: async (id: string) => {
      await sleep(DELAY_MS);
      await db.products.delete(id);
      return id;
    }
  },
  zreports: {
    list: async () => {
      await sleep(DELAY_MS);
      return db.zreports.orderBy('date').reverse().toArray();
    },
    create: async (data: Omit<ZReport, 'id'>) => {
      await sleep(DELAY_MS);
      const id = crypto.randomUUID();
      const newReport: ZReport = { ...data, id };
      await db.zreports.add(newReport);
      return newReport;
    }
  },
  settings: {
    get: async () => {
      await sleep(DELAY_MS);
      let config = await db.settings.get('default');
      if (!config) {
        config = {
          id: 'default',
          companyName: 'Kotta',
          orgNumber: '987 654 321 MVA',
          companyAddress: 'Bergen, Norge',
          bankAccount: '1234.56.78901',
          iban: 'NO12 1234 5678 9012',
          swift: 'DNBANOKK',
          vippsNumber: '12345',
          logoUrl: 'https://images.unsplash.com/photo-1512418490979-92798cec1380?w=100&h=100&fit=crop&q=80',
          defaultCreditDays: 14,
          nextInvoiceNumber: 10001,
          defaultNote: 'Takk for handelen!',
          priceDisplay: 'ExVat',
          mvaTerm: 'BiMonthly',
          fiscalYear: 'Calendar',
          psd2Connected: false,
          izettleConnected: false,
          altinnConnected: false
        } as Settings;
        await db.settings.add(config);
      }
      return config;
    },
    update: async (data: Partial<Settings>) => {
      await sleep(DELAY_MS);
      await db.settings.update('default', data);
      return await db.settings.get('default');
    }
  },
  seedDataIfNeeded: async () => {
    const demoVersion = localStorage.getItem('demo_data_v6');
    if (!demoVersion) {
      await db.settings.clear();
      await db.transactions.clear();
      await db.invoices.clear();
      await db.contacts.clear();
      await db.products.clear();
      await db.zreports.clear();
      localStorage.setItem('demo_data_v6', 'true');
    } else {
      const txCount = await db.transactions.count();
      if (txCount > 0) return;
    }

    // --- 1. Contacts (Hovedbok) ---
    const b2bClientsData: Contact[] = [
      { id: crypto.randomUUID(), name: "Cornelius Sjømatrestaurant AS", relationType: "Kunde", orgNumber: "987654321", contactPerson: "Ola Nordmann", email: "faktura@cornelius.no", phone: "55 12 34 56", address: "Holmen 1", zipCity: "5177 Mathopen", paymentTermsDays: 14, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Bryggeloftet & Stuene", relationType: "Kunde", orgNumber: "876543210", contactPerson: "Kari Nilsen", email: "regnskap@bryggeloftet.no", phone: "55 31 06 30", address: "Bryggen 11", zipCity: "5003 Bergen", paymentTermsDays: 14, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Colonialen KS", relationType: "Kunde", orgNumber: "765432109", contactPerson: "Espen Askeladd", email: "faktura@colonialen.no", phone: "55 90 16 00", address: "Paradisleitet 1", zipCity: "5231 Paradis", paymentTermsDays: 20, currency: "NOK", vatHandling: "Standard" }
    ];

    const b2cClientsData: Contact[] = [
      { id: crypto.randomUUID(), name: "Hans Haukås", relationType: "Kunde", orgNumber: "", contactPerson: "Hans", email: "hans.haukaas@privat.no", phone: "98 12 34 56", address: "Storgata 14", zipCity: "0185 Oslo", paymentTermsDays: 10, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Sofie Solberg", relationType: "Kunde", orgNumber: "", contactPerson: "Sofie", email: "sofiemat99@gmail.com", phone: "44 55 66 77", address: "Furueveien 8", zipCity: "1344 Haslum", paymentTermsDays: 10, currency: "NOK", vatHandling: "Standard" }
    ];

    const vendorsData: Contact[] = [
      { id: crypto.randomUUID(), name: "Bama Storkjøkken AS", relationType: "Leverandør", orgNumber: "912345678", contactPerson: "Jens Hansen", email: "ordre@bama.no", phone: "22 88 00 00", address: "Nedre Kalbakkvei 40", zipCity: "1081 Oslo", paymentTermsDays: 30, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Glass & Emballasje AS", relationType: "Leverandør", orgNumber: "923456789", contactPerson: "Siri Pettersen", email: "post@emballasje.no", phone: "69 12 34 56", address: "Industriveien 5", zipCity: "1600 Fredrikstad", paymentTermsDays: 14, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Engrosfrukt AS", relationType: "Leverandør", orgNumber: "934567890", contactPerson: "Per Olsen", email: "faktura@engrosfrukt.no", phone: "55 55 55 55", address: "Fruktåsen 1", zipCity: "5081 Bergen", paymentTermsDays: 14, currency: "NOK", vatHandling: "Standard" },
      { id: crypto.randomUUID(), name: "Posten Bring AS", relationType: "Leverandør", orgNumber: "984661185", contactPerson: "Kundeservice", email: "faktura@bring.no", phone: "04045", address: "Biskop Gunnerus' gate 14A", zipCity: "0185 Oslo", paymentTermsDays: 14, currency: "NOK", vatHandling: "Standard" }
    ];

    const allContacts = [...b2bClientsData, ...b2cClientsData, ...vendorsData];

    // --- 2. Products (Varelager) ---
    const initialProducts: Product[] = [
      { id: crypto.randomUUID(), name: "Sibirsk Himalayasalt (10kg)", sku: "SALT-001", ean: "7041234567890", unit: "kg", costPriceExVat: 45.00, salesPriceIncVat: 149.00, vatRate: 15, stockQuantity: 124, warningLimit: 20, supplierId: vendorsData[0].id },
      { id: crypto.randomUUID(), name: "Ekte Madagaskar Vaniljestenger (10pk)", sku: "VAN-002", ean: "7041234567891", unit: "stk", costPriceExVat: 350.00, salesPriceIncVat: 899.00, vatRate: 15, stockQuantity: 45, warningLimit: 15, supplierId: vendorsData[0].id },
      { id: crypto.randomUUID(), name: "Røkt Paprika fra Spania (5kg)", sku: "PAP-003", ean: "7041234567892", unit: "kg", costPriceExVat: 85.00, salesPriceIncVat: 249.00, vatRate: 15, stockQuantity: 18, warningLimit: 15, supplierId: vendorsData[0].id },
      { id: crypto.randomUUID(), name: "Økologisk Olivenolje Extra Virgin (10L)", sku: "OLI-004", ean: "7041234567893", unit: "liter", costPriceExVat: 720.00, salesPriceIncVat: 1849.00, vatRate: 15, stockQuantity: 22, warningLimit: 10, supplierId: vendorsData[2].id },
      { id: crypto.randomUUID(), name: "Gourmet Safran (10g)", sku: "SAF-005", ean: "7041234567894", unit: "stk", costPriceExVat: 480.00, salesPriceIncVat: 1299.00, vatRate: 15, stockQuantity: 12, warningLimit: 5, supplierId: vendorsData[0].id },
      { id: crypto.randomUUID(), name: "Gaveeske Eksklusiv m/ Gullbånd", sku: "GAV-006", ean: "7041234567895", unit: "stk", costPriceExVat: 25.00, salesPriceIncVat: 75.00, vatRate: 25, stockQuantity: 210, warningLimit: 50, supplierId: vendorsData[1].id },
      { id: crypto.randomUUID(), name: "Frakt og Ekspedering (Standard)", sku: "FRAKT-1", ean: "", unit: "stk", costPriceExVat: 0.00, salesPriceIncVat: 149.00, vatRate: 25, stockQuantity: 9999, warningLimit: 0, supplierId: vendorsData[3].id }
    ];

    const allTransactions: Transaction[] = [];
    
    // --- 3. Relational Invoices & Invoice Transactions ---
    const allInvoices: Invoice[] = Array.from({ length: 12 }).map((_, idx) => {
      // Alternate between B2B and B2C clients
      const client = idx % 3 === 0 ? faker.helpers.arrayElement(b2cClientsData) : faker.helpers.arrayElement(b2bClientsData);
      const isPaid = idx % 2 === 0; // 50% paid
      const issueDate = faker.date.recent({ days: 40 });
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + (client.paymentTermsDays || 14));

      const numItems = faker.number.int({ min: 1, max: 4 });
      const items: InvoiceItem[] = Array.from({ length: numItems }).map(() => {
        const prod = faker.helpers.arrayElement(initialProducts);
        const qty = faker.number.int({ min: 1, max: 10 });
        const priceExVat = Number((prod.salesPriceIncVat / (1 + prod.vatRate / 100)).toFixed(2));
        return {
          id: crypto.randomUUID(),
          productId: prod.id,
          description: prod.name,
          quantity: qty,
          price: priceExVat,
          vatRate: prod.vatRate
        };
      });

      // Always add shipping if it's B2C
      if (client.orgNumber === "" && Math.random() > 0.3) {
        items.push({
          id: crypto.randomUUID(),
          productId: initialProducts[6].id,
          description: initialProducts[6].name,
          quantity: 1,
          price: 119.20, // 149 inc vat
          vatRate: 25
        });
      }

      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const totalVat = items.reduce((sum, item) => sum + (item.quantity * item.price * (item.vatRate / 100)), 0);
      const total = subtotal + totalVat;
      
      const status = isPaid ? "paid" : (dueDate < new Date() ? "overdue" : "sent");
      const invoiceId = crypto.randomUUID();
      const invoiceNum = 10001 + idx;

      if (isPaid) {
        // Generate a corresponding Income transaction for the paid invoice!
        const paymentDate = new Date(issueDate);
        paymentDate.setDate(paymentDate.getDate() + faker.number.int({ min: 1, max: 10 }));
        allTransactions.push({
          id: crypto.randomUUID(),
          amount: Number(total.toFixed(2)),
          vatRate: 15, // Blended/approx for simple view, real accounting splits it. We'll mark the highest.
          vatAmount: Number(totalVat.toFixed(2)),
          date: paymentDate.toISOString(),
          type: "income",
          category: client.orgNumber === "" ? "Salg B2C" : "Salg B2B",
          description: `Innbetaling Faktura #${invoiceNum} (${client.name})`,
          status: "completed"
        });
      }

      return {
        id: invoiceId,
        clientName: client.name,
        clientEmail: client.email,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        items,
        subtotal: Number(subtotal.toFixed(2)),
        taxRate: 15, // Legacy field, mostly ignored now that we have line-item MVA
        total: Number(total.toFixed(2)),
        status,
        notes: "Takk for at du handler hos Mintech Gourmet!"
      };
    });

    // --- 4. Z-Reports (Kasseoppgjør) & POS Transactions ---
    const allZReports: ZReport[] = Array.from({ length: 14 }).map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (14 - index));
      d.setHours(23, 15, 0, 0); 
      
      const vippsGross = parseFloat(faker.finance.amount({ min: 500, max: 3000 }));
      const cardGross = parseFloat(faker.finance.amount({ min: 2000, max: 8000 }));
      const expectedCash = parseFloat(faker.finance.amount({ min: 0, max: 1500 }));
      const grossSales = vippsGross + cardGross + expectedCash;
      
      const isPerfect = Math.random() > 0.2;
      const actualCash = isPerfect ? expectedCash : expectedCash + faker.helpers.arrayElement([-50, -25, 10, 100]);
      const cashDifference = actualCash - expectedCash;

      // 80% of sales are food (15%), 20% is non-food items/giftboxes (25%)
      const vat15 = Number((grossSales * 0.8 * 0.15).toFixed(2));
      const vat25 = Number((grossSales * 0.2 * 0.25).toFixed(2));

      // Daily settlement transaction for Card/Vipps payouts hitting the bank 1-2 days later
      if (vippsGross + cardGross > 0) {
        const payoutDate = new Date(d);
        payoutDate.setDate(payoutDate.getDate() + 1); // Next day payout
        allTransactions.push({
          id: crypto.randomUUID(),
          amount: Number((vippsGross + cardGross).toFixed(2)),
          vatRate: 15,
          vatAmount: Number((vat15 + vat25).toFixed(2)),
          date: payoutDate.toISOString(),
          type: "income",
          category: "Salg B2C",
          description: `iZettle / Vipps Oppgjør - ${d.toLocaleDateString("no-NO")}`,
          status: "completed"
        });
      }

      return {
        id: crypto.randomUUID(),
        date: d.toISOString(),
        grossSales: Number(grossSales.toFixed(2)),
        cardSales: Number(cardGross.toFixed(2)),
        vippsSales: Number(vippsGross.toFixed(2)),
        cashSales: Number(expectedCash.toFixed(2)),
        vat25,
        vat15,
        vat0: 0,
        expectedCash: Number(expectedCash.toFixed(2)),
        actualCash: Number(actualCash.toFixed(2)),
        cashDifference: Number(cashDifference.toFixed(2)),
        receiptUrl: "https://z-report-dummy-receipt.pdf",
        status: "completed"
      };
    });

    // --- 5. Expense Transactions (To Suppliers) ---
    const expenseTypes = [
      { vendor: vendorsData[0], cat: "Varekjøp", name: "Råvareinnkjøp", vatRate: 15 },
      { vendor: vendorsData[1], cat: "Varekjøp", name: "Innkjøp Emballasje", vatRate: 25 },
      { vendor: vendorsData[2], cat: "Varekjøp", name: "Frukt og Grønt", vatRate: 15 },
      { vendor: vendorsData[3], cat: "Frakt", name: "Logistikk og Frakt", vatRate: 25 }
    ];

    Array.from({ length: 15 }).forEach(() => {
      const exp = faker.helpers.arrayElement(expenseTypes);
      const gross = parseFloat(faker.finance.amount({ min: 450, max: 6500 }));
      const vatAmt = Number((gross * (exp.vatRate / (100 + exp.vatRate))).toFixed(2));
      
      allTransactions.push({
        id: crypto.randomUUID(),
        amount: gross,
        vatRate: exp.vatRate,
        vatAmount: vatAmt,
        date: faker.date.recent({ days: 30 }).toISOString(),
        type: "expense",
        category: exp.cat,
        description: `Betalt Faktura - ${exp.vendor.name}`,
        receiptUrl: "https://z-report-dummy-receipt.pdf",
        status: "completed"
      });
    });

    // Add exactly one pure Bank Fee (0% VAT)
    allTransactions.push({
      id: crypto.randomUUID(),
      amount: 250.00,
      vatRate: 0,
      vatAmount: 0,
      date: new Date().toISOString(),
      type: "expense",
      category: "Gebyrer",
      description: "DNB Bankgebyrer og Årsavgift",
      status: "completed"
    });

    // Save all to database
    await db.contacts.bulkAdd(allContacts);
    await db.products.bulkAdd(initialProducts);
    await db.transactions.bulkAdd(allTransactions);
    await db.invoices.bulkAdd(allInvoices);
    await db.zreports.bulkAdd(allZReports);
  }
};
