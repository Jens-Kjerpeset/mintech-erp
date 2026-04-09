import type { Invoice, ZReport, Settings, Contact } from '../types/schema';

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  lines: JournalLine[];
}

export interface JournalLine {
  accountId: string;
  debit: number;
  credit: number;
}

export const generateJournalEntries = (invoices: Invoice[], zreports: ZReport[]): JournalEntry[] => {
  const entries: JournalEntry[] = [];

  // Invoices
  invoices.forEach(inv => {
    const lines: JournalLine[] = [];
    
    // Debit 1500 (Accounts Receivable) with Total
    lines.push({ accountId: '1500', debit: inv.total, credit: 0 });

    inv.items.forEach(item => {
      const net = item.quantity * item.price;
      const vat = net * (item.vatRate / 100);

      // Determine Sales Account
      let salesAccount = '3100'; // Default to 0% MVA
      if (item.vatRate === 25) salesAccount = '3000';
      else if (item.vatRate === 15) salesAccount = '3030';
      
      lines.push({ accountId: salesAccount, debit: 0, credit: net });

      // Determine Output VAT Account
      if (vat > 0) {
        let vatAccount = '2700'; // Output VAT 25% by default
        if (item.vatRate === 15) vatAccount = '2730';
        lines.push({ accountId: vatAccount, debit: 0, credit: vat });
      }
    });

    entries.push({
      id: `INV-${inv.id}`,
      date: inv.issueDate,
      description: `Faktura ${inv.id} - ${inv.clientName}`,
      lines
    });
  });

  // ZReports
  zreports.forEach(z => {
    const lines: JournalLine[] = [];

    // Debit Bank and Cash
    if (z.cardSales + z.vippsSales > 0) {
      lines.push({ accountId: '1920', debit: z.cardSales + z.vippsSales, credit: 0 });
    }
    if (z.expectedCash > 0) {
      lines.push({ accountId: '1900', debit: z.expectedCash, credit: 0 });
    }

    // Calculate Nets
    const net25 = z.vat25 ? z.vat25 / 0.25 : 0;
    const net15 = z.vat15 ? z.vat15 / 0.15 : 0;
    const gross25 = net25 + (z.vat25 || 0);
    const gross15 = net15 + (z.vat15 || 0);
    const net0 = z.grossSales - gross25 - gross15;

    // Credit Sales
    if (net25 > 0) lines.push({ accountId: '3000', debit: 0, credit: net25 });
    if (net15 > 0) lines.push({ accountId: '3030', debit: 0, credit: net15 });
    if (net0 > 0) lines.push({ accountId: '3100', debit: 0, credit: net0 });

    // Credit VAT
    if (z.vat25 > 0) lines.push({ accountId: '2700', debit: 0, credit: z.vat25 });
    if (z.vat15 > 0) lines.push({ accountId: '2730', debit: 0, credit: z.vat15 });

    entries.push({
      id: `ZREP-${z.id}`,
      date: z.date,
      description: `Kasseoppgjør Z-Rapport ${new Date(z.date).toLocaleDateString('no-NO')}`,
      lines
    });
  });

  return entries;
};

// Strict YYYY-MM-DD
const fDate = (d: string) => {
  const dn = new Date(d);
  return `${dn.getFullYear()}-${String(dn.getMonth() + 1).padStart(2, '0')}-${String(dn.getDate()).padStart(2, '0')}`;
};

// Strict . decimal and 2 places
const fMoney = (m: number) => {
  // force period as separator despite node/browser locale
  return Number(m).toFixed(2);
};

export const buildSaftXML = (companySettings: Settings, journalEntries: JournalEntry[], contacts: Contact[]): string => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:StandardAuditFile-Taxation-Financial:NO" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Header>
    <AuditFileVersion>1.0</AuditFileVersion>
    <Company>
      <RegistrationNumber>${companySettings.orgNumber}</RegistrationNumber>
      <Name>${companySettings.companyName}</Name>
      <Address>
        <StreetName>${companySettings.companyAddress}</StreetName>
        <City>${companySettings.companyCity}</City>
        <PostalCode>${companySettings.companyZipCode}</PostalCode>
        <Country>Norway</Country>
      </Address>
    </Company>
  </Header>
  <MasterFiles>
    <GeneralLedgerAccounts>
      <Account><AccountID>1500</AccountID><AccountDescription>Kundefordringer</AccountDescription></Account>
      <Account><AccountID>1900</AccountID><AccountDescription>Kontanter</AccountDescription></Account>
      <Account><AccountID>1920</AccountID><AccountDescription>Bankinnskudd</AccountDescription></Account>
      <Account><AccountID>2700</AccountID><AccountDescription>Utgående MVA, høy sats</AccountDescription></Account>
      <Account><AccountID>2730</AccountID><AccountDescription>Utgående MVA, middels sats</AccountDescription></Account>
      <Account><AccountID>3000</AccountID><AccountDescription>Salgsinntekter 25% MVA</AccountDescription></Account>
      <Account><AccountID>3030</AccountID><AccountDescription>Salgsinntekter 15% MVA</AccountDescription></Account>
      <Account><AccountID>3100</AccountID><AccountDescription>Salgsinntekter avgiftsfritt</AccountDescription></Account>
    </GeneralLedgerAccounts>
    <Customers>
      ${contacts.map(c => `
      <Customer>
        <CustomerID>${c.id}</CustomerID>
        <Name>${c.name}</Name>
        <RegistrationNumber>${c.orgNumber}</RegistrationNumber>
        <Address>
          <StreetName>${c.address || ''}</StreetName>
          <City>${c.city || ''}</City>
          <PostalCode>${c.zipCode || ''}</PostalCode>
        </Address>
      </Customer>`).join('\n')}
    </Customers>
  </MasterFiles>
  <GeneralLedgerEntries>
    <NumberOfEntries>${journalEntries.length}</NumberOfEntries>
    <TotalDebit>${fMoney(journalEntries.reduce((sum, je) => sum + je.lines.reduce((s, l) => s + l.debit, 0), 0))}</TotalDebit>
    <TotalCredit>${fMoney(journalEntries.reduce((sum, je) => sum + je.lines.reduce((s, l) => s + l.credit, 0), 0))}</TotalCredit>
    ${journalEntries.map(je => `
    <Journal>
      <Transaction>
        <TransactionID>${je.id}</TransactionID>
        <SystemEntryDate>${fDate(je.date)}</SystemEntryDate>
        <Description>${je.description}</Description>
        <Lines>
          ${je.lines.map(l => `
          <Line>
            <AccountID>${l.accountId}</AccountID>
            ${l.debit > 0 ? `<DebitAmount><Amount>${fMoney(l.debit)}</Amount></DebitAmount>` : ''}
            ${l.credit > 0 ? `<CreditAmount><Amount>${fMoney(l.credit)}</Amount></CreditAmount>` : ''}
          </Line>`).join('\n').replace(/^\s*[\r\n]/gm, '')}
        </Lines>
      </Transaction>
    </Journal>`).join('\n').replace(/^\s*[\r\n]/gm, '')}
  </GeneralLedgerEntries>
</AuditFile>`;

  return xml.trim();
};
