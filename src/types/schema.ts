export interface Transaction {
  id: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  status: string;
  receiptUrl?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  price: number;
  vatRate: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  total: number;
  status: 'sent' | 'paid' | 'overdue' | string;
  notes?: string;
}

export interface Contact {
  id: string;
  name: string;
  relationType: 'Kunde' | 'Leverandør' | string;
  orgNumber: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  paymentTermsDays?: number;
  currency?: string;
  vatHandling?: string;
  ehfEnabled?: boolean;
  defaultAccount?: string;
}

export interface Product {
  id: string;
  type?: 'physical' | 'service';
  name: string;
  sku: string;
  ean?: string;
  unit: string;
  costPriceExVat: number;
  salesPriceIncVat: number;
  vatRate: number;
  stockQuantity: number | null;
  warningLimit: number | null;
  supplierId: string;
}

export interface ZReport {
  id: string;
  date: string;
  grossSales: number;
  cardSales: number;
  vippsSales: number;
  cashSales: number;
  vat25: number;
  vat15: number;
  vat0: number;
  expectedCash: number;
  actualCash: number;
  cashDifference: number;
  receiptUrl: string;
  status: string;
}

export interface Settings {
  id: 'default' | string;
  companyName: string;
  orgNumber: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  bankAccount: string;
  iban: string;
  swift: string;
  vippsNumber: string;
  logoUrl: string;
  defaultCreditDays: number;
  nextInvoiceNumber: number;
  defaultNote: string;
  priceDisplay: string;
  mvaTerm: string;
  fiscalYear: string;
  psd2Connected: boolean;
  izettleConnected: boolean;
  altinnConnected: boolean;
}
