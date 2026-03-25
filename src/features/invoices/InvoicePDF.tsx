import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import type { Invoice } from '@/types/schema';

// Create styles for PDF
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 12, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 10, color: '#666', marginBottom: 4 },
  
  clientSection: { marginBottom: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  clientTitle: { fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 8 },
  clientName: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },

  table: { width: '100%', marginBottom: 30 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  
  colHeader: { fontSize: 10, fontWeight: 'bold', color: '#888', textTransform: 'uppercase' },

  totalsSection: { width: '40%', alignSelf: 'flex-end', marginTop: 20 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalText: { fontSize: 14, fontWeight: 'bold' },
  
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', color: '#888', fontSize: 10 }
});

export const InvoiceDocument = ({ invoice }: { invoice: Invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>FAKTURA</Text>
          <Text style={styles.subtitle}>#{invoice.id?.split('-')[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.subtitle}>Fakturadato: {new Date(invoice.issueDate).toLocaleDateString()}</Text>
          <Text style={styles.subtitle}>Forfallsdato: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.clientSection}>
        <Text style={styles.clientTitle}>Fakturert Til</Text>
        <Text style={styles.clientName}>{invoice.clientName}</Text>
        {invoice.clientEmail && <Text style={styles.subtitle}>{invoice.clientEmail}</Text>}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.colHeader]}>Beskrivelse</Text>
          <Text style={[styles.colQty, styles.colHeader]}>Antall</Text>
          <Text style={[styles.colPrice, styles.colHeader]}>Pris</Text>
          <Text style={[styles.colTotal, styles.colHeader]}>Beløp</Text>
        </View>

        {invoice.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{item.price.toFixed(2)} kr</Text>
            <Text style={styles.colTotal}>{(item.quantity * item.price).toFixed(2)} kr</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalsRow}>
          <Text>Delsum:</Text>
          <Text>{invoice.subtotal.toFixed(2)} kr</Text>
        </View>
        {Object.entries(
          invoice.items.reduce((acc: Record<number, number>, item) => {
            const q = item.quantity || 0;
            const p = item.price || 0;
            const r = item.vatRate || 0;
            if (r > 0) {
              acc[r] = (acc[r] || 0) + (q * p * (r / 100));
            }
            return acc;
          }, {})
        ).map(([rate, amount]) => (
          <View key={rate} style={styles.totalsRow}>
            <Text>Mva ({rate}%):</Text>
            <Text>{(amount as number).toFixed(2)} kr</Text>
          </View>
        ))}
        <View style={[styles.totalsRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#000' }]}>
          <Text style={styles.totalText}>Totalt:</Text>
          <Text style={styles.totalText}>{invoice.total.toFixed(2)} kr</Text>
        </View>
      </View>

      {invoice.notes && (
        <View style={{ marginTop: 40 }}>
          <Text style={styles.clientTitle}>Notater</Text>
          <Text style={{ fontSize: 10 }}>{invoice.notes}</Text>
        </View>
      )}

      <Text style={styles.footer}>Takk for at du handler hos oss!</Text>
    </Page>
  </Document>
);

export function InvoicePDFViewer({ invoice }: { invoice: Invoice }) {
  if (!invoice) return null;
  
  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-white">
      <PDFViewer className="w-full h-full border-none">
        <InvoiceDocument invoice={invoice} />
      </PDFViewer>
    </div>
  );
}
