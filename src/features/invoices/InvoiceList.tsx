import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUpRightFromSquare, faSpinner, faPenToSquare, faDollarSign, faBell, faEnvelope, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Invoice, InvoiceItem } from '@/types/schema';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { RecordItem } from '@/components/ui/record-item';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { pdf } from '@react-pdf/renderer';
import { InvoiceDocument } from './InvoicePDF';
import { formatCurrency, formatDate } from '@/lib/formatting';

const STATUS_LABELS: Record<string, string> = {
 draft: 'Utkast',
 sent: 'Sendt',
 paid: 'Betalt',
 overdue: 'Forfalt',
};

export function InvoiceList({ onEdit }: { onEdit?: (invoice: Invoice) => void }) {
 const queryClient = useQueryClient();
 const updateMutation = useMutation({
 mutationFn: ({ id, data }: { id: string, data: Partial<Invoice> }) => api.invoices.update(id, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['invoices'] });
 }
 });

 const { data: invoices, isLoading } = useQuery({
 queryKey: ['invoices'],
 queryFn: () => api.invoices.list(),
 });

 const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
 const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
 const [searchParams, setSearchParams] = useSearchParams();
 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState(searchParams.get("filter") || "alle");

 useEffect(() => {
 const filter = searchParams.get("filter");
 if (filter) {
 setStatusFilter(filter);
 searchParams.delete("filter");
 setSearchParams(searchParams, { replace: true });
 }
 }, [searchParams, setSearchParams]);

 if (isLoading) {
 return <div className="p-4 text-center text-muted-foreground ">Loading invoices...</div>;
 }

 if (!invoices || invoices.length === 0) {
 return <div className="p-4 text-center text-muted-foreground border rounded-none bg-card mt-6">No invoices found.</div>;
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

 const filteredInvoices = invoices.filter(invoice => {
 const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
 (invoice.clientEmail && invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()));
 const matchesStatus = statusFilter === "alle" || invoice.status === statusFilter;
 return matchesSearch && matchesStatus;
 });

 const groupedInvoices = groupInvoicesByMonth(filteredInvoices);
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
 {/* Search and Filter */}
 <div className="flex flex-col sm:flex-row gap-4 mb-2">
 <Input 
 placeholder="Søk etter kunde eller e-post..." 
 className="flex-1"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "alle")}>
 <SelectTrigger className="w-full sm:w-52" aria-label="Filtrer på status">
 <SelectValue placeholder="Alle statuser" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="alle">Alle statuser</SelectItem>
 <SelectItem value="draft">Utkast</SelectItem>
 <SelectItem value="sent">Sendt</SelectItem>
 <SelectItem value="paid">Betalt</SelectItem>
 <SelectItem value="overdue">Forfalt</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <Accordion defaultValue={[currentMonthKey]} className="w-full space-y-4">
 {monthKeys.map((monthKey) => (
 <AccordionItem key={monthKey} value={monthKey} className="border bg-card rounded-none px-4 shadow-sm">
 <AccordionTrigger className="hover:no-underline py-4">
 <span className="text-lg font-medium tracking-tight">{formatMonthKey(monthKey)}</span>
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
 <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col h-full border-l bg-background shadow-sm">
 <div tabIndex={0} autoFocus className="outline-none w-0 h-0 absolute top-0" />
 {selectedInvoice && (
 <>
 <SheetHeader className="px-6 sm:px-8 py-5 sm:py-6 shrink-0 border-b">
 <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2 leading-tight">
 <FontAwesomeIcon icon={faFileAlt} className="h-6 w-6 text-primary shrink-0" /> <span className="break-words">Fakturadetaljer</span>
 </SheetTitle>
 <SheetDescription className="sr-only">
 Detaljert oversikt for faktura til {selectedInvoice.clientName}.
 </SheetDescription>
 </SheetHeader>
 
 <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
 <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-none">
 <div>
 <span className="text-muted-foreground block mb-1">Status</span>
 <span className="capitalize font-medium tracking-tight">{STATUS_LABELS[selectedInvoice.status] || selectedInvoice.status}</span>
 </div>
 <div>
 <span className="text-muted-foreground block mb-1">Utstedt</span>
 <span className="font-medium tracking-tight">{formatDate(selectedInvoice.issueDate)}</span>
 </div>
 <div className="break-words">
 <span className="text-muted-foreground block mb-1">E-post</span>
 <span className="font-medium tracking-tight break-all">{selectedInvoice.clientEmail || 'Ikke oppgitt'}</span>
 </div>
 <div>
 <span className="text-muted-foreground block mb-1">Forfallsdato</span>
 <span className="font-medium tracking-tight">{formatDate(selectedInvoice.dueDate)}</span>
 </div>
 </section>

 <section>
 <h3 className="text-lg font-medium mb-4 pb-2 border-b">Produktlinjer</h3>
 <div className="space-y-4">
 {selectedInvoice.items.map((item: InvoiceItem, idx: number) => (
 <div key={item.id || idx} className="flex justify-between items-start text-sm">
 <div className="flex-1 min-w-0 pr-4">
 <p className="font-medium truncate" title={item.description}>{item.description}</p>
 <p className="text-muted-foreground font-mono">{item.quantity} x {formatCurrency(item.price)}</p>
 </div>
 <p className="font-medium tracking-tight font-mono shrink-0">{formatCurrency(item.quantity * item.price)}</p>
 </div>
 ))}
 </div>
 </section>

 <section className="border-t pt-4 space-y-2 text-sm text-right">
 <div className="flex justify-between">
 <span className="text-muted-foreground">Delsum:</span>
 <span className="font-mono">{formatCurrency(selectedInvoice.subtotal)}</span>
 </div>
 
 {Object.entries(
 selectedInvoice.items.reduce((acc: Record<number, number>, item) => {
 const q = item.quantity || 0;
 const p = item.price || 0;
 const r = item.vatRate || 0;
 if (r > 0) {
 acc[r] = (acc[r] || 0) + (q * p * (r / 100));
 }
 return acc;
 }, {})
 ).map(([rate, amount]) => (
 <div key={rate} className="flex justify-between">
 <span className="text-muted-foreground">Mva ({rate}%):</span>
 <span className="font-mono">{formatCurrency(amount as number)}</span>
 </div>
 ))}

 <div className="flex justify-between text-base font-medium tracking-tight pt-2 border-t">
 <span>Totalt (NOK):</span>
 <span className="font-mono">{formatCurrency(selectedInvoice.total)}</span>
 </div>
 </section>

 {selectedInvoice.notes && (
 <section>
 <h3 className="text-sm font-medium mb-2 text-muted-foreground">Notater</h3>
 <div className="p-4 bg-muted/50 rounded-none text-sm text-foreground">
 {selectedInvoice.notes}
 </div>
 </section>
 )}
 </div>

 <div className="mt-auto px-6 sm:px-8 py-4 border-t bg-background shrink-0 z-10 w-full flex flex-col gap-3">
 {selectedInvoice.status === 'draft' && (
 <div className="flex flex-col gap-3">
 <div className="grid grid-cols-2 gap-3">
 <Button 
 className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
 disabled={updateMutation.isPending}
 onClick={() => {
 updateMutation.mutate({ id: selectedInvoice.id!, data: { status: 'sent' } });
 setSelectedInvoice({ ...selectedInvoice, status: 'sent' });
 }}
 >
 <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" /> E-post
 </Button>
 <Button 
 className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
 disabled={updateMutation.isPending}
 onClick={() => {
 updateMutation.mutate({ id: selectedInvoice.id!, data: { status: 'sent' } });
 setSelectedInvoice({ ...selectedInvoice, status: 'sent' });
 }}
 >
 <FontAwesomeIcon icon={faDatabase} className="w-4 h-4 mr-2" /> EHF
 </Button>
 </div>
 <Button 
 variant="outline" 
 className="w-full h-12"
 onClick={() => {
 if (onEdit) {
 setSelectedInvoice(null);
 setTimeout(() => onEdit(selectedInvoice), 150);
 }
 }}
 >
 <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 mr-2" /> Endre Utkast
 </Button>
 </div>
 )}
 {selectedInvoice.status === 'sent' && (
 <div className="flex gap-3">
 <Button 
 variant="outline" 
 className="flex-1 h-12"
 disabled={updateMutation.isPending}
 onClick={() => {
 const currentItems = selectedInvoice.items;
 const hasDunning = currentItems.some(i => i.description.includes('Purregebyr'));
 
 if (!hasDunning) {
 const dunningFee = 35.00;
 const dunningItem: InvoiceItem = {
 id: crypto.randomUUID(),
 description: 'Purregebyr',
 quantity: 1,
 price: dunningFee,
 vatRate: 0
 };
 const newItems = [...currentItems, dunningItem];
 const newSubtotal = selectedInvoice.subtotal + dunningFee;
 const newTotal = selectedInvoice.total + dunningFee;
 
 updateMutation.mutate({ 
 id: selectedInvoice.id!, 
 data: { status: 'overdue', items: newItems, subtotal: newSubtotal, total: newTotal } 
 });
 setSelectedInvoice({ ...selectedInvoice, status: 'overdue', items: newItems, subtotal: newSubtotal, total: newTotal });
 } else {
 updateMutation.mutate({ id: selectedInvoice.id!, data: { status: 'overdue' } });
 setSelectedInvoice({ ...selectedInvoice, status: 'overdue' });
 }
 }}
 >
 <FontAwesomeIcon icon={faBell} className="w-4 h-4 mr-2 hidden sm:block" /> Send Purring
 </Button>
 <Button 
 className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
 disabled={updateMutation.isPending}
 onClick={() => {
 updateMutation.mutate({ id: selectedInvoice.id!, data: { status: 'paid' } });
 setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
 }}
 >
 <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 mr-2 hidden sm:block" /> Innbetaling
 </Button>
 </div>
 )}
 
 <Button 
 className="w-full h-14 text-lg rounded-none shadow-sm mt-2"
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
 {isGeneratingPDF ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 " /> : <FontAwesomeIcon icon={faUpRightFromSquare} className="w-4 h-4 mr-2" />}
 {isGeneratingPDF ? 'Laster...' : 'Last ned PDF'}
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
 <span className={`text-xs px-1.5 py-0.5 leading-none rounded-none font-medium tracking-tight tracking-wider shrink-0 ${statusColors[invoice.status] || 'bg-muted'}`}>
 {STATUS_LABELS[invoice.status] || invoice.status}
 </span>
 );

 return (
 <RecordItem
 onClick={onClick}
 title={invoice.clientName}
 badge={badge}
 primaryValue={formatCurrency(invoice.total)}
 secondaryValue={formattedDate}
 />
 );
}
