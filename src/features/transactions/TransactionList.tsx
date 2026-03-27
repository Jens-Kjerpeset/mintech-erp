import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faShoppingCart, faTruck, faWrench, faBullhorn, faArrowDown, faStore, faCreditCard, faMoneyBillWave, faReceipt, faPaperclip, faFloppyDisk, faTags } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import type { Transaction } from '@/types/schema';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { RecordItem } from '@/components/ui/record-item';

const getCategoryIcon = (category: string) => {
 switch(category) {
 case 'Salg B2C': return <FontAwesomeIcon icon={faStore} className="w-5 h-5" />;
 case 'Salg B2B': return <FontAwesomeIcon icon={faArrowDown} className="w-5 h-5" />;
 case 'Varekjøp': return <FontAwesomeIcon icon={faShoppingCart} className="w-5 h-5" />;
 case 'Frakt': return <FontAwesomeIcon icon={faTruck} className="w-5 h-5" />;
 case 'Markedsføring': return <FontAwesomeIcon icon={faBullhorn} className="w-5 h-5" />;
 case 'Gebyrer': return <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5" />;
 case 'Drift': return <FontAwesomeIcon icon={faWrench} className="w-5 h-5" />;
 default: return <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5" />;
 }
};

const getVatRateForCategory = (cat: string) => {
 if (cat === 'Frakt') return 12;
 if (cat === 'Gebyrer') return 0;
 return 25;
};

const CATEGORIES = ["Salg B2B", "Salg B2C", "Varekjøp", "Frakt", "Markedsføring", "Gebyrer", "Drift"];

const STATUS_LABELS: Record<string, string> = {
 pending: "venter",
 completed: "fullført",
 cancelled: "avbrutt"
};

export function TransactionList() {
 const queryClient = useQueryClient();
 const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
 const [draftTx, setDraftTx] = useState<Partial<Transaction> | null>(null);
 const [amountStr, setAmountStr] = useState("");
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [searchTerm, setSearchTerm] = useState("");
 const [categoryFilter, setCategoryFilter] = useState("alle");
 const [deleteConfirmType, setDeleteConfirmType] = useState<'single' | 'bulk' | null>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
 const isSelectionMode = selectedIds.size > 0;

 const toggleSelect = (id: string) => {
 const newSet = new Set(selectedIds);
 if (newSet.has(id)) newSet.delete(id);
 else newSet.add(id);
 setSelectedIds(newSet);
 };

 const deleteMultipleMutation = useMutation({
 mutationFn: (ids: string[]) => api.transactions.deleteMultiple(ids),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['transactions'] });
 setSelectedIds(new Set());
 }
 });

 const updateMultipleMutation = useMutation({
 mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Transaction> }) => api.transactions.updateMultiple(ids, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['transactions'] });
 setSelectedIds(new Set());
 }
 });

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 
 const reader = new FileReader();
 reader.onload = (event) => {
 const base64String = event.target?.result as string;
 setDraftTx(prev => prev ? { ...prev, receiptUrl: base64String } : null);
 };
 reader.readAsDataURL(file);
 };

 const { data: transactions, isLoading } = useQuery({
 queryKey: ['transactions'],
 queryFn: () => api.transactions.list(),
 });

 const deleteMutation = useMutation({
 mutationFn: (id: string) => api.transactions.delete(id),
 onMutate: async (id) => {
 await queryClient.cancelQueries({ queryKey: ['transactions'] });
 const previousTxs = queryClient.getQueryData<Transaction[]>(['transactions']);
 if (previousTxs) {
 queryClient.setQueryData<Transaction[]>(['transactions'], previousTxs.filter(t => t.id !== id));
 }
 return { previousTxs };
 },
 onError: (_err, _id, context) => {
 if (context?.previousTxs) queryClient.setQueryData(['transactions'], context.previousTxs);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['transactions'] });
 setSelectedTx(null);
 },
 });

 const updateMutation = useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => api.transactions.update(id, data),
 onMutate: async ({ id, data }) => {
 await queryClient.cancelQueries({ queryKey: ['transactions'] });
 const previousTxs = queryClient.getQueryData<Transaction[]>(['transactions']);
 if (previousTxs) {
 queryClient.setQueryData<Transaction[]>(['transactions'], previousTxs.map(t => t.id === id ? { ...t, ...data } : t));
 }
 return { previousTxs };
 },
 onError: (_err, _newTx, context) => {
 if (context?.previousTxs) queryClient.setQueryData(['transactions'], context.previousTxs);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['transactions'] });
 setSelectedTx(null);
 setErrors({});
 },
 });



 if (isLoading) {
 return <div className="p-4 text-center text-muted-foreground ">Laster transaksjoner...</div>;
 }

 if (!transactions || transactions.length === 0) {
 return <div className="p-4 text-center text-muted-foreground border rounded-none bg-card">Ingen transaksjoner funnet.</div>;
 }

 const handleSave = () => {
 if (selectedTx?.id && draftTx) {
 const newErrors: Record<string, string> = {};
 if (!draftTx.amount || draftTx.amount <= 0) newErrors.amount = "Beløp må være større enn 0";
 if (!draftTx.category) newErrors.category = "Du må velge en kategori";
 if (!draftTx.date) newErrors.date = "Dato er påkrevd";

 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }
 setErrors({});
 updateMutation.mutate({ id: selectedTx.id, data: draftTx });
 }
 };

 const groupTransactionsByMonth = (txs: Transaction[]) => {
 const grouped: Record<string, Transaction[]> = {};
 for (const t of txs) {
 const date = new Date(t.date);
 const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
 if (!grouped[key]) grouped[key] = [];
 grouped[key].push(t);
 }
 return grouped;
 };

 const filteredTransactions = transactions.filter(tx => {
 const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory = categoryFilter === "alle" || tx.category === categoryFilter;
 return matchesSearch && matchesCategory;
 });

 const groupedTransactions = groupTransactionsByMonth(filteredTransactions);
 const monthKeys = Object.keys(groupedTransactions).sort((a, b) => b.localeCompare(a));
 
 const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
 
 const formatMonthKey = (key: string) => {
 const [year, month] = key.split('-');
 const date = new Date(parseInt(year), parseInt(month) - 1, 1);
 const monthName = new Intl.DateTimeFormat('nb-NO', { month: 'long' }).format(date);
 return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
 };

 return (
 <div className="space-y-6">
 {/* Search and Filter */}
 <div className="flex flex-col sm:flex-row gap-4">
 <Input 
 placeholder="Søk i transaksjoner..." 
 className="flex-1"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "alle")}>
 <SelectTrigger className="w-full sm:w-52" aria-label="Filtrer på kategori">
 <SelectValue placeholder="Alle kategorier" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="alle">Alle kategorier</SelectItem>
 {CATEGORIES.map(cat => (
 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <Accordion defaultValue={[currentMonthKey]} className="w-full space-y-4">
 {monthKeys.map((monthKey) => (
 <AccordionItem key={monthKey} value={monthKey} className="border bg-card rounded-none px-4 shadow-sm">
 <AccordionTrigger className="hover:no-underline py-4">
 <span className="text-lg font-medium tracking-tight">{formatMonthKey(monthKey)}</span>
 <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
 {groupedTransactions[monthKey].length} {groupedTransactions[monthKey].length === 1 ? 'transaksjon' : 'transaksjoner'}
 </span>
 </AccordionTrigger>
 <AccordionContent className="pt-2 pb-4 space-y-3">
 {groupedTransactions[monthKey].map((tx: Transaction) => (
 <TransactionListItem 
 key={tx.id} 
 transaction={tx} 
 isSelected={selectedIds.has(tx.id!)}
 isSelectionMode={isSelectionMode}
 onToggle={toggleSelect}
 onClick={() => { 
 setSelectedTx(tx); 
 setDraftTx(tx); 
 const initialVal = (tx.amount || 0).toString().replace('.', ',');
 const parts = initialVal.split(',');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 setAmountStr(parts.join(','));
 }}
 />
 ))}
 </AccordionContent>
 </AccordionItem>
 ))}
 </Accordion>

 {isSelectionMode && (
 <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-popover border shadow-sm rounded-full px-6 py-3 flex items-center gap-4 z-[60] w-[92%] sm:w-auto max-w-md justify-between">
 <span className="font-medium tracking-tight text-sm whitespace-nowrap">{selectedIds.size} valgt</span>
 <div className="flex gap-1 sm:gap-2">
 <Button size="sm" variant="outline" className="rounded-full rounded-r-none h-10 border-r-0" onClick={() => setSelectedIds(new Set())}>Avbryt</Button>
 <Button 
 size="sm" 
 className="rounded-none h-10 border-l border-r"
 disabled={updateMultipleMutation.isPending}
 onClick={() => {
 const newCat = prompt("Skriv inn ny kategori for de valgte transaksjonene:");
 if (newCat) {
 updateMultipleMutation.mutate({ ids: Array.from(selectedIds), data: { category: newCat } });
 }
 }}
 >
 <FontAwesomeIcon icon={faTags} className="w-4 h-4 mr-1" /> Kategori
 </Button>
 <Button 
 size="sm" 
 variant="destructive" 
 className="rounded-full rounded-l-none h-10 flex gap-1 items-center" 
 disabled={deleteMultipleMutation.isPending}
 onClick={() => setDeleteConfirmType('bulk')}
 >
 <FontAwesomeIcon icon={faTrashCan} className="w-4 h-4 hidden sm:block" /> Slett
 </Button>
 </div>
 </div>
 )}

 <Sheet open={!!selectedTx} onOpenChange={(open) => {
 if (!open) {
 setSelectedTx(null);
 setAmountStr("");
 setErrors({});
 setDeleteConfirmType(null);
 }
 }}>
 <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full border-l bg-background shadow-sm">
 <div tabIndex={0} autoFocus className="outline-none w-0 h-0 absolute top-0" />
 {selectedTx && draftTx && (
 <>
 <SheetHeader className="px-6 sm:px-8 py-5 sm:py-6 shrink-0 border-b">
 <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2 leading-tight">
 <FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-primary shrink-0" /> <span className="break-words">Transaksjonsdetaljer</span>
 </SheetTitle>
 <SheetDescription className="sr-only">
 Transaksjonsdetaljer
 </SheetDescription>
 </SheetHeader>
 
 <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
 {/* Visual Header */}
 <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-none bg-muted/40">
 <div className={`size-12 sm:size-14 rounded-full flex shrink-0 items-center justify-center ${draftTx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
 {getCategoryIcon(draftTx.category || '')}
 </div>
 <div className="flex-1 min-w-0">
 <p className={`text-xl md:text-2xl font-medium tracking-tight font-mono tracking-tight break-words ${draftTx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
 {draftTx.type === 'income' ? '+' : '-'}{formatCurrency(draftTx.amount || 0)}
 </p>
 <p className="text-sm text-muted-foreground capitalize">{STATUS_LABELS[draftTx.status || 'completed']}</p>
 </div>
 </div>

 {/* Edit Form Elements */}
 <div className="space-y-4">
 <div className="space-y-2">
 <Label className="text-base text-muted-foreground">Beskrivelse</Label>
 <Input 
 className="h-12 text-base font-medium text-ellipsis"
 value={draftTx.description || ''} 
 onChange={(e) => setDraftTx({ ...draftTx, description: e.target.value })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col justify-end gap-2">
 <Label className={`text-base text-muted-foreground ${errors.amount ? 'text-red-500' : ''}`}>Beløp (kr)</Label>
 <Input 
 type="text"
 inputMode="decimal"
 className={`h-12 text-base font-medium font-mono text-ellipsis ${errors.amount ? 'border-red-500' : ''}`}
 value={amountStr} 
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9,]/g, '');
 const parts = val.split(',');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 setAmountStr(parts.join(','));
 
 const amount = parseFloat(val.replace(',', '.')) || 0;
 const rate = draftTx.vatRate ?? 25;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraftTx({ ...draftTx, amount, vatAmount });
 if (errors.amount) setErrors({ ...errors, amount: '' });
 }}
 />
 {errors.amount && <p className="text-xs text-red-500 font-medium -mt-1">{errors.amount}</p>}
 </div>
 <div className="flex flex-col justify-end gap-2">
 <Label className={`text-base text-muted-foreground ${errors.date ? 'text-red-500' : ''}`}>Dato</Label>
 <div className="relative cursor-pointer" onClick={(e) => {
 const input = e.currentTarget.querySelector('input');
 try { if ('showPicker' in HTMLInputElement.prototype) input?.showPicker() } catch (e) { console.warn(e) }
 }}>
 <Input 
 type="date"
 className={`h-12 text-base font-medium appearance-none cursor-pointer w-full ${errors.date ? 'border-red-500' : ''}`}
 value={draftTx.date ? new Date(draftTx.date).toISOString().split('T')[0] : ''} 
 onChange={(e) => {
 setDraftTx({ ...draftTx, date: new Date(e.target.value).toISOString() });
 if (errors.date) setErrors({ ...errors, date: '' });
 }}
 />
 </div>
 {errors.date && <p className="text-xs text-red-500 font-medium -mt-1">{errors.date}</p>}
 </div>
 </div>

 <div className="space-y-2">
 <Label className={`text-base text-muted-foreground ${errors.category ? 'text-red-500' : ''}`}>Kategori</Label>
 <Select 
 value={draftTx.category} 
 onValueChange={(val: string | null) => {
 if (val) {
 const rate = getVatRateForCategory(val);
 const amount = draftTx.amount || 0;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraftTx({ ...draftTx, category: val, vatRate: rate, vatAmount });
 if (errors.category) setErrors({ ...errors, category: '' });
 }
 }}
 >
 <SelectTrigger className={`h-12 text-base font-medium ${errors.category ? 'border-red-500' : ''}`} aria-label="Velg kategori">
 <SelectValue placeholder="Velg kategori" />
 </SelectTrigger>
 <SelectContent>
 {CATEGORIES.map(cat => (
 <SelectItem key={cat} value={cat}>{cat}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category}</p>}
 </div>

 {/* VAT Details */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
 <div className="flex flex-col justify-end gap-2">
 <Label className="text-base text-muted-foreground">Mva-sats</Label>
 <Select 
 value={draftTx.vatRate?.toString() || "0"} 
 onValueChange={(val) => {
 const rate = Number(val);
 const amount = draftTx.amount || 0;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraftTx({ ...draftTx, vatRate: rate, vatAmount });
 }}
 >
 <SelectTrigger className="h-12 text-base font-medium" aria-label="Mva-sats">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="25">25% (Standard)</SelectItem>
 <SelectItem value="15">15% (Mat/Drikke)</SelectItem>
 <SelectItem value="12">12% (Transport)</SelectItem>
 <SelectItem value="0">0% (Avgiftsfri)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="flex flex-col justify-end gap-2">
 <Label className="text-base text-muted-foreground">Mva-beløp</Label>
 <Input 
 disabled
 className="h-12 text-base font-medium bg-muted/50"
 value={draftTx.vatAmount !== undefined ? draftTx.vatAmount.toString().replace('.', ',') : ''} 
 />
 </div>
 <div className="flex flex-col justify-end gap-2">
 <Label className="text-base text-muted-foreground">Nettobeløp</Label>
 <Input 
 disabled
 className="h-12 text-base font-medium bg-muted/50"
 value={((draftTx.amount || 0) - (draftTx.vatAmount || 0)).toFixed(2).replace('.', ',')} 
 />
 </div>
 </div>
 </div>

 {/* Receipts Component */}
 <div className="pt-4 border-t space-y-3">
 <h3 className="font-medium tracking-tight text-base flex items-center gap-2">
 <FontAwesomeIcon icon={faPaperclip} className="h-5 w-5 text-muted-foreground" /> Kvitteringer & vedlegg
 </h3>
 
 {draftTx.receiptUrl ? (
 <div className="relative border rounded-none overflow-hidden bg-muted/20 group">
 <img src={draftTx.receiptUrl} alt="Kvittering" className="w-full h-auto max-h-56 object-contain" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <Button variant="destructive" size="sm" onClick={() => setDraftTx({ ...draftTx, receiptUrl: undefined })}>
 <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4 mr-2" /> Fjern
 </Button>
 </div>
 </div>
 ) : (
 <div className="border border-dashed rounded-none p-6 flex flex-col items-center justify-center text-center space-y-3 bg-muted/10 transition-colors hover:bg-muted/30">
 <p className="text-sm text-muted-foreground">Ingen vedlegg er lastet opp.</p>
 <input 
 type="file" 
 accept="image/*" 
 className="hidden" 
 ref={fileInputRef}
 onChange={handleFileUpload}
 />
 <Button variant="outline" className="mt-1" onClick={() => fileInputRef.current?.click()}>
 Last opp bilag
 </Button>
 </div>
 )}
 </div>
 
 {selectedTx?.id && (
 <div className="pt-6 mt-4 border-t">
 <Button 
 type="button" 
 variant="destructive" 
 className="w-full h-12"
 onClick={() => setDeleteConfirmType('single')}
 >
 Slett transaksjon
 </Button>
 </div>
 )}
 </div>

 {/* Action Footers Anchored to Bottom */}
 <div className="mt-auto px-6 sm:px-8 py-4 border-t bg-background shrink-0 z-10 w-full">
 <div className="flex gap-3">
 <Button type="button" variant="outline" className="flex-1 h-14 text-lg rounded-none font-medium tracking-tight" onClick={() => { setSelectedTx(null); setAmountStr(""); setErrors({}); }}>
 Avbryt
 </Button>
 <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 h-14 text-lg rounded-none shadow-sm flex items-center justify-center gap-2 font-medium tracking-tight">
 <FontAwesomeIcon icon={faFloppyDisk} className="h-5 w-5" /> Lagre
 </Button>
 </div>
 </div>
 </>
 )}
 </SheetContent>
 </Sheet>

 <Dialog open={deleteConfirmType !== null} onOpenChange={(open) => !open && setDeleteConfirmType(null)}>
 <DialogContent className="sm:max-w-md">
 <DialogHeader>
 <DialogTitle className="text-destructive flex items-center gap-2">
 <FontAwesomeIcon icon={faTrashCan} className="w-5 h-5" /> Slett {deleteConfirmType === 'bulk' ? 'transaksjoner' : 'transaksjon'}
 </DialogTitle>
 <DialogDescription className="pt-2 text-base">
 Er du sikker på at du vil slette {deleteConfirmType === 'bulk' ? `${selectedIds.size} transaksjoner` : 'denne transaksjonen'}? Denne handlingen kan ikke angres.
 </DialogDescription>
 </DialogHeader>
 <div className="flex gap-3 pt-4">
 <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteConfirmType(null)}>
 Avbryt
 </Button>
 <Button 
 type="button" 
 variant="destructive" 
 className="flex-1"
 disabled={deleteMutation.isPending || deleteMultipleMutation.isPending}
 onClick={() => {
 if (deleteConfirmType === 'single' && selectedTx?.id) {
 deleteMutation.mutate(selectedTx.id);
 setDeleteConfirmType(null); // Force close modal so state resets
 } else if (deleteConfirmType === 'bulk') {
 deleteMultipleMutation.mutate(Array.from(selectedIds));
 setDeleteConfirmType(null);
 }
 }}
 >
 Ja, slett
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 );
}

function TransactionListItem({ transaction, onClick, isSelected, isSelectionMode, onToggle }: { transaction: Transaction, onClick: () => void, isSelected?: boolean, isSelectionMode?: boolean, onToggle?: (id: string) => void }) {
 const isIncome = transaction.type === "income";
 const timerRef = useRef<NodeJS.Timeout | null>(null);

 const handleStart = () => {
 if (onToggle) {
 timerRef.current = setTimeout(() => {
 onToggle(transaction.id!);
 if (navigator.vibrate) navigator.vibrate(50);
 }, 500);
 }
 };
 
 const handleEnd = () => {
 if (timerRef.current) clearTimeout(timerRef.current);
 };

 return (
 <RecordItem
 onContextMenu={(e) => {
 if (onToggle) {
 e.preventDefault();
 onToggle(transaction.id!);
 }
 }}
 onTouchStart={handleStart}
 onTouchEnd={handleEnd}
 onTouchCancel={handleEnd}
 onMouseDown={handleStart}
 onMouseUp={handleEnd}
 onMouseLeave={handleEnd}
 onClick={(e: React.MouseEvent) => {
 if (isSelectionMode && onToggle) {
 e.preventDefault();
 onToggle(transaction.id!);
 } else {
 onClick();
 }
 }}
 className={isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''}
 icon={
 isSelectionMode ? (
 <input 
 type="checkbox" 
 checked={!!isSelected}
 readOnly
 className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
 />
 ) : getCategoryIcon(transaction.category)
 }
 iconBgClass={isIncome && !isSelectionMode ? 'bg-green-500/10 text-green-500' : (!isSelectionMode ? 'bg-red-500/10 text-red-500' : 'bg-transparent')}
 title={transaction.description || transaction.category}
 primaryValue={`${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}`}
 primaryValueClass={isIncome && !isSelectionMode ? 'text-green-600 dark:text-green-500' : (!isSelectionMode ? 'text-red-500' : '')}
 secondaryValue={formatDate(transaction.date)}
 />
 );
}
