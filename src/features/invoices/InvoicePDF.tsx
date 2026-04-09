import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Invoice, Settings, Contact } from '../../types/schema';

// Register reliable TTF fonts for React-PDF
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' }
  ]
});

Font.register({
  family: 'Roboto Mono',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/robotomono/v13/L0x5DF4xlVMF-BfR8bXMIjhGq3-cXbKDO1w.ttf' },
    { src: 'https://fonts.gstatic.com/s/robotomono/v13/L0x7DF4xlVMF-BfR8bXMIjDwweuHXdRPR0W0xQ.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40
  },
  logoBox: {
    width: '45%'
  },
  logo: {
    maxHeight: 50,
    maxWidth: 200,
    objectFit: 'contain'
  },
  companyNameMassive: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  sellerMeta: {
    fontSize: 10,
    marginTop: 10,
    lineHeight: 1.4
  },
  metaBox: {
    width: '45%',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 12
  },
  fakturaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Roboto Mono'
  },
  buyerSection: {
    marginBottom: 40
  },
  buyerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    color: '#666666'
  },
  buyerName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4
  },
  buyerDetail: {
    fontSize: 10,
    marginBottom: 2
  },
  table: {
    width: '100%',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
    marginBottom: 30
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderBottomWidth: 2,
    borderColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  colDesc: { width: '40%' },
  colQty: { width: '12%', textAlign: 'right' },
  colUnit: { width: '10%', textAlign: 'right' },
  colPrice: { width: '16%', textAlign: 'right' },
  colVat: { width: '8%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5'
  },
  tableRowZebra: {
    backgroundColor: '#F4F4F5'
  },
  tableCell: {
    fontSize: 10
  },
  tableCellMono: {
    fontSize: 10,
    fontFamily: 'Roboto Mono'
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40
  },
  totalsBox: {
    width: '45%'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 10,
    fontFamily: 'Roboto Mono'
  },
  vatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5'
  },
  vatLabel: {
    fontSize: 9,
    color: '#333333'
  },
  vatValueMono: {
    fontSize: 9,
    fontFamily: 'Roboto Mono',
    color: '#333333'
  },
  grandTotalWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 10,
    marginTop: 10
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto Mono'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 2,
    borderColor: '#000000',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerCol: {
    width: '30%'
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4
  },
  footerText: {
    fontSize: 8,
    fontFamily: 'Roboto Mono'
  },
  footerNote: {
    fontSize: 8,
    fontStyle: 'italic',
    marginTop: 8
  }
});

interface InvoicePDFProps {
  invoice: Invoice;
  settings: Settings;
  contact?: Contact | null;
}

export const InvoicePDF = ({ invoice, settings, contact }: InvoicePDFProps) => {
  // Safe default grouping
  const vatGroups = invoice.items.reduce((acc, item) => {
    const rate = item.vatRate || invoice.taxRate || 0;
    const itemNet = item.quantity * item.price;
    const itemVat = itemNet * (rate / 100);
    
    if (!acc[rate]) {
      acc[rate] = { rate, grunnlag: 0, mva: 0 };
    }
    acc[rate].grunnlag += itemNet;
    acc[rate].mva += itemVat;
    return acc;
  }, {} as Record<number, { rate: number, grunnlag: number, mva: number }>);

  const vatRates = Object.values(vatGroups).sort((a, b) => b.rate - a.rate);
  const totalVAT = vatRates.reduce((sum, v) => sum + v.mva, 0);
  const totalSum = invoice.subtotal + totalVAT;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Section A: Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            {settings.logoUrl ? (
              <Image src={settings.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.companyNameMassive}>{settings.companyName}</Text>
            )}
            <View style={styles.sellerMeta}>
              <Text>{settings.companyAddress}</Text>
              <Text>{settings.companyZipCode} {settings.companyCity}</Text>
              {settings.orgNumber && <Text>Org.nr: {settings.orgNumber}{settings.orgNumber.includes('MVA') ? '' : ' MVA'}</Text>}
            </View>
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.fakturaTitle}>Faktura</Text>
            <View style={styles.metaGrid}>
              <Text style={styles.metaLabel}>Fakturanummer:</Text>
              <Text style={styles.metaValue}>{invoice.id.split('-')[0]}</Text>
            </View>
            <View style={styles.metaGrid}>
              <Text style={styles.metaLabel}>Fakturadato:</Text>
              <Text style={styles.metaValue}>{new Date(invoice.issueDate).toLocaleDateString('no-NO')}</Text>
            </View>
            <View style={styles.metaGrid}>
              <Text style={styles.metaLabel}>Forfallsdato:</Text>
              <Text style={styles.metaValue}>{new Date(invoice.dueDate).toLocaleDateString('no-NO')}</Text>
            </View>
          </View>
        </View>

        {/* Section B: Buyer Info */}
        <View style={styles.buyerSection}>
          <Text style={styles.buyerTitle}>Fakturert til:</Text>
          <Text style={styles.buyerName}>{invoice.clientName}</Text>
          {contact?.address && <Text style={styles.buyerDetail}>{contact.address}</Text>}
          {(contact?.zipCode || contact?.city) && (
            <Text style={styles.buyerDetail}>{contact?.zipCode || ''} {contact?.city || ''}</Text>
          )}
          {contact?.orgNumber && <Text style={styles.buyerDetail}>Org.nr: {contact.orgNumber}</Text>}
          {invoice.clientEmail && <Text style={styles.buyerDetail}>{invoice.clientEmail}</Text>}
        </View>

        {/* Section C: Payload Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Beskrivelse</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Antall</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Enhet</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Pris</Text>
            <Text style={[styles.tableHeaderCell, styles.colVat]}>MVA %</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Sum</Text>
          </View>
          
          {invoice.items.map((item, idx) => {
            const rowStyles = [styles.tableRow, idx % 2 === 1 ? styles.tableRowZebra : {}];
            const sumRow = item.quantity * item.price;
            return (
              <View key={idx} style={rowStyles}>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
                <Text style={[styles.tableCellMono, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>stk</Text>
                <Text style={[styles.tableCellMono, styles.colPrice]}>{item.price.toFixed(2)}</Text>
                <Text style={[styles.tableCellMono, styles.colVat]}>{item.vatRate || invoice.taxRate}%</Text>
                <Text style={[styles.tableCellMono, styles.colTotal]}>{sumRow.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        {/* Section D: Totals & Variables */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sum eks. mva</Text>
              <Text style={styles.totalValue}>{invoice.subtotal.toFixed(2)} kr</Text>
            </View>
            
            {vatRates.map((v) => (
              <View key={v.rate} style={styles.vatRow}>
                <Text style={styles.vatLabel}>MVA Grunnlag {v.rate}% ({v.grunnlag.toFixed(2)})</Text>
                <Text style={styles.vatValueMono}>{v.mva.toFixed(2)} kr</Text>
              </View>
            ))}

            <View style={styles.grandTotalWrap}>
              <Text style={styles.grandTotalLabel}>Å Betale</Text>
              <Text style={styles.grandTotalValue}>{totalSum.toFixed(2)} kr</Text>
            </View>
          </View>
        </View>

        {/* Section E: Footer Routing */}
        <View style={styles.footer}>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Betalingsinformasjon</Text>
            <Text style={styles.footerText}>Bankkonto: {settings.bankAccount || 'Ventes'}</Text>
            <Text style={styles.footerText}>KID: {invoice.id.split('-')[0].replace(/\D/g, '') || '-'}</Text>
          </View>
          <View style={styles.footerCol}>
             {settings.vippsNumber && (
               <>
                 <Text style={styles.footerTitle}>Vipps</Text>
                 <Text style={styles.footerText}>{settings.vippsNumber}</Text>
               </>
             )}
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerTitle}>Foretak</Text>
            <Text style={styles.footerText}>{settings.companyName}</Text>
            <Text style={styles.footerText}>Org.nr: {settings.orgNumber}</Text>
            {settings.defaultNote && <Text style={styles.footerNote}>{settings.defaultNote}</Text>}
          </View>
        </View>

      </Page>
    </Document>
  );
};
