import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, type Invoice } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { Textarea } from '@/components/ui/textarea';
import type { z } from 'zod';
import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/formatting';

type InvoiceFormValues = z.input<typeof invoiceSchema>;

export function InvoiceBuilder({ open, onOpenChange, invoice }: { open: boolean; onOpenChange: (open: boolean) => void; invoice?: Invoice }) {
 const queryClient = useQueryClient();

 const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: api.contacts.list });
 const { data: products } = useQuery({ queryKey: ['products'], queryFn: api.products.list });

 const customers = contacts?.filter(c => c.relationType === 'Kunde' || c.relationType === 'Begge') || [];

 const form = useForm<InvoiceFormValues>({
 resolver: zodResolver(invoiceSchema),
 defaultValues: {
 clientName: '',
 clientEmail: '',
 issueDate: new Date().toISOString(),
 // eslint-disable-next-line react-hooks/purity
 dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
 items: [{ description: '', quantity: 1, price: 0 }],
 taxRate: 0,
 status: 'draft',
 }
 });

 const { fields, append, remove } = useFieldArray({
 control: form.control,
 name: "items"
 });
 const watchedItems = useWatch({ control: form.control, name: 'items' }) || fields;

 useEffect(() => {
 if (open && invoice) {
 form.reset({
 clientName: invoice.clientName,
 clientEmail: invoice.clientEmail || '',
 issueDate: invoice.issueDate,
 dueDate: invoice.dueDate,
 items: invoice.items,
 taxRate: invoice.taxRate,
 status: invoice.status,
 notes: invoice.notes
 });
 } else if (open && !invoice) {
 form.reset({
 clientName: '',
 clientEmail: '',
 issueDate: new Date().toISOString(),
 dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
 items: [{ description: '', quantity: 1, price: 0 }],
 taxRate: 0,
 status: 'draft',
 });
 }
 }, [open, invoice, form]);

 const createMutation = useMutation({
 mutationFn: async (data: Invoice) => {
 // Inventory depletion logic
 if (data.status === 'sent' || data.status === 'paid') {
 for (const item of data.items) {
 if (item.productId) {
 const product = products?.find(p => p.id === item.productId);
 if (product) {
 await api.products.update(product.id!, { 
 stockQuantity: Math.max(0, product.stockQuantity - item.quantity) 
 });
 }
 }
 }
 }
 if (invoice?.id) {
 return api.invoices.update(invoice.id, data);
 }
 return api.invoices.create(data);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['invoices'] });
 queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh inventory view
 form.reset();
 onOpenChange(false);
 }
 });

 const onSubmit = (data: InvoiceFormValues) => {
 const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
 // Dynamic single total (multi-VAT is handled in the UI visual loop, but sum it accurately here)
 const total = data.items.reduce((acc, item) => acc + (item.quantity * item.price * (1 + (item.vatRate || 25) / 100)), 0);
 createMutation.mutate({ ...data, subtotal, total } as Invoice);
 };

 const handleClientSelect = (clientId: string | null) => {
 if (!clientId) return;
 const client = customers.find(c => c.id === clientId);
 if (!client) return;
 
 form.setValue('clientName', client.name);
 form.setValue('clientEmail', client.email || '');
 
 // Calculate Due Date based on Payment Terms
 const issue = new Date(form.getValues('issueDate'));
 const due = new Date(issue.getTime() + (client.paymentTermsDays * 24 * 60 * 60 * 1000));
 form.setValue('dueDate', due.toISOString());
 };

 const handleProductSelect = (index: number, productId: string | null) => {
 if (!productId) return;
 const product = products?.find(p => p.id === productId);
 if (!product) return;

 form.setValue(`items.${index}.productId`, product.id);
 form.setValue(`items.${index}.description`, `${product.name} ${product.sku ? `(${product.sku})` : ''}`);
 form.setValue(`items.${index}.price`, Number(product.salesPriceIncVat / (1 + product.vatRate / 100))); // Enhetspris Ex Vat is required to calculate dynamic totals
 form.setValue(`items.${index}.vatRate`, product.vatRate);
 };

 return (
 <SidePanelForm
 open={open}
 onOpenChange={onOpenChange}
 title={invoice?.id ? "Endre Faktura" : "Opprett Faktura"}
 description={invoice?.id ? "Oppdater detaljene for valgt faktura." : "Fyll ut detaljene for å generere en faktura."}
 onSubmit={form.handleSubmit(onSubmit)}
 onCancel={() => onOpenChange(false)}
 isSubmitting={createMutation.isPending}
 submitText={invoice?.id ? "Lagre endringer" : "Opprett Faktura"}
 >
 <div className="space-y-8">
 <div className="grid grid-cols-1 gap-6">
 <div className="space-y-2">
 <Label>Kunde</Label>
 <Select onValueChange={handleClientSelect}>
 <SelectTrigger>
 <SelectValue placeholder="Søk og velg kunde fra CRM..." />
 </SelectTrigger>
 <SelectContent>
 {customers.map((c) => (
 <SelectItem key={c.id} value={c.id!}>
 {c.name} {c.orgNumber ? `(Org: ${c.orgNumber})` : ''}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <input type="hidden" {...form.register('clientName')} />
 {form.formState.errors.clientName && <p className="text-destructive text-sm">{form.formState.errors.clientName.message}</p>}
 </div>
 
 <div className="space-y-2 hidden">
 <Label htmlFor="clientEmail">Faktura E-post (Auto-utfylt)</Label>
 <Input id="clientEmail" type="email" readOnly disabled className="bg-muted/50" {...form.register('clientEmail')} placeholder="billing@acme.com" />
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-medium">Produktlinjer</h3>
 <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, price: 0, vatRate: 25 })}>
 <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" /> Legg til rad
 </Button>
 </div>

 <div className="hidden sm:grid grid-cols-[1fr_80px_100px_80px_40px] gap-3 px-2 text-sm font-medium tracking-tight text-muted-foreground mb-2">
 <div>Tjeneste / Produkt</div>
 <div>Antall</div>
 <div>Pris Ex Mva</div>
 <div>Mva %</div>
 <div></div>
 </div>

 {fields.map((field, index) => (
 <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_80px_100px_80px_40px] gap-3 items-end sm:items-center bg-card p-3 sm:p-2 sm:bg-transparent rounded-none border sm:border-none focus-within:ring-1 focus-within:ring-ring">
 <div className="flex-1 w-full min-w-[200px]">
 <Label className="sm:hidden mb-2 block">Produkt</Label>
 <Select onValueChange={(val: string | null) => handleProductSelect(index, val)}>
 <SelectTrigger className="h-10">
 <SelectValue placeholder="Velg fra varelager..." />
 </SelectTrigger>
 <SelectContent>
 {products?.map(p => (
 <SelectItem key={p.id} value={p.id!}>
 {p.name} - kr {p.salesPriceIncVat}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <input type="hidden" {...form.register(`items.${index}.description`)} />
 </div>
 <div className="w-full sm:w-auto">
 <Label className="sm:hidden mb-2 block">Antall</Label>
 <Input className="h-10" type="number" step="1" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
 </div>
 <div className="w-full sm:w-auto">
 <Label className="sm:hidden mb-2 block">Pris Ex Mva</Label>
 <Input className="h-10 bg-muted/50" type="number" step="0.01" readOnly disabled {...form.register(`items.${index}.price`, { valueAsNumber: true })} />
 </div>
 <div className="w-full sm:w-auto">
 <Label className="sm:hidden mb-2 block">Mva %</Label>
 <Select 
 value={String(form.watch(`items.${index}.vatRate`) ?? 25)}
 onValueChange={(val: string | null) => val && form.setValue(`items.${index}.vatRate`, parseInt(val, 10))}
 >
 <SelectTrigger className="h-10">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="25">25%</SelectItem>
 <SelectItem value="15">15%</SelectItem>
 <SelectItem value="0">0%</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="flex justify-end sm:justify-center mt-2 sm:mt-0">
 <Button 
 type="button" 
 variant="ghost" 
 size="icon" 
 className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
 onClick={() => remove(index)}
 >
 <FontAwesomeIcon icon={faTrashCan} className="w-4 h-4" />
 </Button>
 </div>
 </div>
 ))}
 {form.formState.errors.items && <p className="text-destructive text-sm">{form.formState.errors.items.message}</p>}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="status">Fakturastatus</Label>
 <Select 
 value={form.watch('status')} 
 onValueChange={(val) => form.setValue('status', val as "draft" | "sent" | "paid" | "overdue")}
 >
 <SelectTrigger>
 <SelectValue placeholder="Velg status">
 {form.watch('status') === 'draft' ? 'Utkast' : 
 form.watch('status') === 'sent' ? 'Sendt' : 
 form.watch('status') === 'paid' ? 'Betalt' : 
 form.watch('status') === 'overdue' ? 'Forfalt' : 'Velg status'}
 </SelectValue>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="draft">Utkast</SelectItem>
 <SelectItem value="sent">Sendt</SelectItem>
 <SelectItem value="paid">Betalt</SelectItem>
 <SelectItem value="overdue">Forfalt</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label htmlFor="notes">Notater (Til Kunde)</Label>
 <Textarea id="notes" {...form.register('notes')} placeholder="Evt. kommentarer som skal stå på fakturaen." />
 </div>
 </div>

 <div className="space-y-3 pt-8 border-t md:border-t-0 md:pt-0">
 <Label>Sammendrag</Label>
 <div className="p-4 bg-muted/30 rounded-none space-y-2 border">
 <div className="flex justify-between text-sm text-muted-foreground">
 <span>Sum Eks. Mva:</span>
 <span className="font-mono">
 {formatCurrency(watchedItems.reduce((acc, item) => {
 const q = item.quantity || 0;
 const p = item.price || 0;
 return acc + (q * p);
 }, 0))}
 </span>
 </div>
 
 {/* Dynamic MVA Aggregation */}
 {Object.entries(
 watchedItems.reduce((acc: Record<number, number>, item) => {
 const q = item.quantity || 0;
 const p = item.price || 0;
 const r = item.vatRate || 0;
 if (r > 0) {
 acc[r] = (acc[r] || 0) + (q * p * (r / 100));
 }
 return acc;
 }, {})
 ).map(([rate, amount]) => (
 <div key={rate} className="flex justify-between text-sm text-muted-foreground">
 <span>Mva ({rate}%):</span>
 <span className="font-mono">{formatCurrency(amount as number)}</span>
 </div>
 ))}

 <div className="flex justify-between text-lg font-medium tracking-tight border-t pt-2 mt-2">
 <span>Totalt (NOK):</span>
 <span className="font-mono text-xl">
 {formatCurrency(watchedItems.reduce((acc, item) => {
 const q = item.quantity || 0;
 const p = item.price || 0;
 const r = item.vatRate || 0;
 return acc + (q * p * (1 + r / 100));
 }, 0))}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </SidePanelForm>
 );
}
