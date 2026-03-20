import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invoice, InvoiceItem } from '@/types/schema';
import { RecordItem } from '@/components/ui/record-item';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { pdf } from '@react-pdf/renderer';
import { InvoiceDocument } from './InvoicePDF';
import { formatCurrency, formatDate } from '@/lib/formatting';

const STATUS_LABELS: Record<string, string> = {
  draft: 'UTKAST',
  sent: 'SENDT',
  paid: 'BETALT',
  overdue: 'FORFALT',
};

export function InvoiceList() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list(),
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse">Loading invoices...</div>;
  }

  if (!invoices || invoices.length === 0) {
    return <div className="p-4 text-center text-muted-foreground border rounded-lg bg-card mt-6">No invoices found.</div>;
  }

  const groupInvoicesByMonth = (invs: Invoice[]) => {
    const grouped: Record<string, Invoice[]> = {};
    for (const i of invs) {
      const date = new Date(i.issueDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(i);
    }
    return grouped;
  };

  const groupedInvoices = groupInvoicesByMonth(invoices);
  const monthKeys = Object.keys(groupedInvoices).sort((a, b) => b.localeCompare(a));
  
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  
  const formatMonthKey = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = new Intl.DateTimeFormat('nb-NO', { month: 'long' }).format(date);
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  return (
    <div className="space-y-6 mt-6">
      <Accordion defaultValue={[currentMonthKey]} className="w-full space-y-4">
        {monthKeys.map((monthKey) => (
          <AccordionItem key={monthKey} value={monthKey} className="border bg-card rounded-xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-lg font-semibold tracking-tight">{formatMonthKey(monthKey)}</span>
              <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {groupedInvoices[monthKey].length} {groupedInvoices[monthKey].length === 1 ? 'faktura' : 'fakturaer'}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {groupedInvoices[monthKey].map((invoice: Invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} onClick={() => setSelectedInvoice(invoice)} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Sheet open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <SheetContent className="w-[88vw] sm:max-w-xl p-0 flex flex-col h-full border-l bg-background shadow-2xl">
          <div tabIndex={0} autoFocus className="outline-none w-0 h-0 absolute top-0" />
          {selectedInvoice && (
            <>
              <SheetHeader className="px-6 sm:px-8 py-5 sm:py-6 shrink-0 border-b">
                <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2 leading-tight">
                  <FileText className="h-6 w-6 text-primary shrink-0" /> <span className="break-words">Fakturadetaljer</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Detaljert oversikt for faktura til {selectedInvoice.clientName}.
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                  <div>
                    <span className="text-muted-foreground block mb-1">Status</span>
                    <span className="capitalize font-semibold">{STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Utstedt</span>
                    <span className="font-semibold">{formatDate(selectedInvoice.issueDate)}</span>
                  </div>
                  <div className="break-words">
                    <span className="text-muted-foreground block mb-1">E-post</span>
                    <span className="font-semibold break-all">{selectedInvoice.clientEmail || 'Ikke oppgitt'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Forfallsdato</span>
                    <span className="font-semibold">{formatDate(selectedInvoice.dueDate)}</span>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Produktlinjer</h3>
                  <div className="space-y-4">
                    {selectedInvoice.items.map((item: InvoiceItem, idx: number) => (
                      <div key={item.id || idx} className="flex justify-between items-start text-sm">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-medium truncate" title={item.description}>{item.description}</p>
                          <p className="text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <p className="font-semibold shrink-0">{formatCurrency(item.quantity * item.price)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="border-t pt-4 space-y-2 text-sm text-right">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delsum:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mva ({selectedInvoice.taxRate}%):</span>
                    <span>{formatCurrency(selectedInvoice.subtotal * (selectedInvoice.taxRate / 100))}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Totalt (NOK):</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </section>

                {selectedInvoice.notes && (
                  <section>
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Notater</h3>
                    <div className="p-4 bg-muted/50 rounded-lg text-sm text-foreground">
                      {selectedInvoice.notes}
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-auto px-6 sm:px-8 py-4 border-t bg-background shrink-0 z-10 w-full">
                 <Button 
                   className="w-full h-14 text-lg rounded-xl shadow-xl"
                   disabled={isGeneratingPDF}
                   onClick={async () => {
                     if (!selectedInvoice) return;
                     setIsGeneratingPDF(true);
                     try {
                       const blob = await pdf(<InvoiceDocument invoice={selectedInvoice} />).toBlob();
                       const url = URL.createObjectURL(blob);
                       window.open(url, '_blank');
                     } catch (error) {
                       console.error("Failed to generate PDF", error);
                     } finally {
                       setIsGeneratingPDF(false);
                     }
                   }}
                 >
                   {isGeneratingPDF ? (
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                   ) : (
                     <ExternalLink className="w-5 h-5 mr-2" />
                   )}
                   {isGeneratingPDF ? 'Genererer PDF...' : 'Vis PDF'}
                 </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InvoiceCard({ invoice, onClick }: { invoice: Invoice, onClick: () => void }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-500/10 text-blue-500',
    paid: 'bg-green-500/10 text-green-500',
    overdue: 'bg-destructive/10 text-destructive',
  };

  const formattedDate = formatDate(invoice.dueDate);

  const badge = (
    <span className={`text-[10px] px-1.5 py-0.5 leading-none rounded-full font-bold uppercase tracking-wider shrink-0 ${statusColors[invoice.status] || 'bg-muted'}`}>
      {STATUS_LABELS[invoice.status] || invoice.status}
    </span>
  );

  return (
    <RecordItem
      onClick={onClick}
      icon={<FileText className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />}
      title={invoice.clientName}
      badge={badge}
      primaryValue={formatCurrency(invoice.total)}
      secondaryValue={formattedDate}
    />
  );
}
