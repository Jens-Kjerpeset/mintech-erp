import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faReceipt, faPaperclip, faTrashCan, faStore, faFloppyDisk, faCamera, faWandMagicSparkles, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useState, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { TransactionList } from '@/features/transactions/TransactionList';
import { Button } from '@/components/ui/button';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ZReportBuilder } from '@/features/transactions/ZReportBuilder';
import { compressImage } from '@/lib/imageCompression';
import type { Transaction } from '@/types/schema';

const CATEGORIES = ["Salg B2B", "Salg B2C", "Varekjøp", "Frakt", "Markedsføring", "Gebyrer", "Drift"];

const getVatRateForCategory = (cat: string) => {
 if (cat === 'Frakt') return 12;
 if (cat === 'Gebyrer') return 0;
 return 25;
};

export function Transactions() {
 const [searchParams, setSearchParams] = useSearchParams();
 
 const isOpenFromUrl = searchParams.get('action') === 'new';
 const isZReportOpenFromUrl = searchParams.get('action') === 'zreport';
 
 const [isLocalOpen, setIsLocalOpen] = useState(false);
 const [isLocalZReportOpen, setIsLocalZReportOpen] = useState(false);
 
 const isOpen = isOpenFromUrl || isLocalOpen;
 const isZReportOpen = isZReportOpenFromUrl || isLocalZReportOpen;

 const location = useLocation();
 const navigate = useNavigate();

 const handleOpenChange = (open: boolean) => {
 if (!open) {
 setIsLocalOpen(false);
 if (isOpenFromUrl) {
 searchParams.delete('action');
 setSearchParams(searchParams, { replace: true, state: location.state });
 }
 if (location.state?.returnToDashboard) {
 setTimeout(() => navigate('/', { replace: true }), 300);
 }
 } else {
 setIsLocalOpen(true);
 }
 };

 const handleZReportOpenChange = (open: boolean) => {
 if (!open) {
 setIsLocalZReportOpen(false);
 if (isZReportOpenFromUrl) {
 searchParams.delete('action');
 setSearchParams(searchParams, { replace: true, state: location.state });
 }
 if (location.state?.returnToDashboard) {
 setTimeout(() => navigate('/', { replace: true }), 300);
 }
 } else {
 setIsLocalZReportOpen(true);
 }
 };
 const [amountStr, setAmountStr] = useState("");
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [isScanning, setIsScanning] = useState(false);
 const [autoFilled, setAutoFilled] = useState(false);
 const [scanWarning, setScanWarning] = useState<string | null>(null);
 const [draft, setDraft] = useState<Partial<Transaction>>({
 amount: 0,
 date: new Date().toISOString().split('T')[0],
 type: 'expense',
 category: '',
 description: '',
 receiptUrl: undefined,
 vatRate: 25,
 vatAmount: 0
 });
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 try {
 const base64String = await compressImage(file);
 setDraft(prev => ({ ...prev, receiptUrl: base64String }));
 } catch (err) {
 console.error(err);
 }
 };
 
 const queryClient = useQueryClient();

 const createMutation = useMutation({
 mutationFn: (tx: Omit<Transaction, 'id'>) => api.transactions.create(tx),
 onMutate: async (newTx) => {
 await queryClient.cancelQueries({ queryKey: ['transactions'] });
 const previousTxs = queryClient.getQueryData<Transaction[]>(['transactions']);
 const optimisticTx: Transaction = {
 ...newTx,
 id: Math.random().toString(36).substring(7),
 } as Transaction;
 if (previousTxs) {
 queryClient.setQueryData<Transaction[]>(['transactions'], [optimisticTx, ...previousTxs]);
 }
 return { previousTxs };
 },
 onError: (_err, _newTx, context) => {
 if (context?.previousTxs) {
 queryClient.setQueryData(['transactions'], context.previousTxs);
 }
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['transactions'] });
 handleOpenChange(false);
 setAmountStr("");
 setErrors({});
 setScanWarning(null);
 setDraft({
 amount: 0,
 date: new Date().toISOString().split('T')[0],
 type: 'expense',
 category: '',
 description: ''
 });
 }
 });

 const handleSave = (e?: React.FormEvent) => {
 if (e) e.preventDefault();
 const newErrors: Record<string, string> = {};
 if (!draft.amount || draft.amount <= 0) newErrors.amount = "Beløp må være større enn 0";
 if (!draft.category) newErrors.category = "Du må velge en kategori";
 if (!draft.date) newErrors.date = "Dato er påkrevd";

 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }
 setErrors({});

 createMutation.mutate({
 amount: Number(draft.amount),
 date: new Date(draft.date!).toISOString(),
 type: draft.type as 'income' | 'expense',
 category: draft.category!,
 vatRate: draft.vatRate,
 vatAmount: draft.vatAmount,
 description: draft.description || draft.category!,
 receiptUrl: draft.receiptUrl,
 status: 'completed'
 });
 };

 return (
 <>
 <div className="space-y-6 pb-20 md:pb-6 ">
 <header className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-heading font-medium tracking-tight">Transaksjoner</h1>
 <p className="text-muted-foreground">Administrer inntekter og utgifter.</p>
 </div>
 </header>

 <SidePanelForm
 open={isOpen}
 onOpenChange={handleOpenChange}
 maxWidthClass="sm:max-w-md"
 title={<><FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-primary shrink-0" /> Legg til transaksjon</>}
 description="Opprett en ny inntekt eller utgift."
 onSubmit={handleSave}
 onCancel={() => handleOpenChange(false)}
 isSubmitting={createMutation.isPending}
 submitText={<><FontAwesomeIcon icon={faFloppyDisk} className="mr-2 h-5 w-5" /> Lagre</>}
 >
 <div className="space-y-6">
 {/* Type Toggle */}
 <div className="flex gap-3">
 <div 
 onClick={() => !isScanning && setDraft({ ...draft, type: 'expense' })}
 className={`flex-1 p-4 text-center rounded-none border-2 font-medium tracking-tight ${draft.type === 'expense' ? 'bg-destructive/10 text-destructive border-destructive' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'} ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
 >
 Utgift
 </div>
 <div 
 onClick={() => !isScanning && setDraft({ ...draft, type: 'income' })}
 className={`flex-1 p-4 text-center rounded-none border-2 font-medium tracking-tight ${draft.type === 'income' ? 'bg-green-600/10 dark:bg-green-500/10 text-green-600 dark:text-green-500 border-green-600 dark:border-green-500' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'} ${isScanning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
 >
 Inntekt
 </div>
 </div>

 {/* Amount & Date */}
 <div className="grid grid-cols-2 gap-5">
 <div className="space-y-2">
 <Label className={`text-base ${errors.amount ? 'text-red-500' : ''}`}>Beløp (kr)</Label>
 <Input 
 type="text"
 inputMode="decimal"
 required
 disabled={isScanning}
 className={`h-14 text-xl font-mono text-ellipsis ${autoFilled ? 'ring-2 ring-primary/50 bg-primary/10' : ''}`}
 value={amountStr}
 onChange={(e) => {
 const val = e.target.value.replace(/[^0-9,]/g, '');
 const parts = val.split(',');
 parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
 setAmountStr(parts.join(','));
 
 const amount = parseFloat(val.replace(',', '.')) || 0;
 const rate = draft.vatRate ?? 25;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraft({ ...draft, amount, vatAmount });
 }}
 placeholder="0,00"
 />
 {errors.amount && <p className="text-xs text-red-500 font-medium">{errors.amount}</p>}
 </div>
 <div className="space-y-2">
 <Label className={`text-base ${errors.date ? 'text-red-500' : ''}`}>Dato</Label>
 <Input 
 type="date"
 required
 disabled={isScanning}
 className={`h-14 text-base appearance-none ${errors.date ? 'border-red-500' : ''}`}
 onClick={(e) => {
 try { if ('showPicker' in HTMLInputElement.prototype) e.currentTarget.showPicker() } catch (e) { console.warn(e) }
 }}
 value={draft.date ? new Date(draft.date).toISOString().split('T')[0] : ''} 
 onChange={(e) => {
 setDraft({ ...draft, date: new Date(e.target.value).toISOString() });
 if (errors.date) setErrors({ ...errors, date: '' });
 }}
 />
 {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date}</p>}
 </div>
 </div>

 {/* Category */}
 <div className="space-y-2">
 <Label className={`text-base ${errors.category ? 'text-red-500' : ''}`}>Kategori</Label>
 <Select 
 required
 disabled={isScanning}
 value={draft.category} 
 onValueChange={(val: string | null) => {
 if (val) {
 const rate = getVatRateForCategory(val);
 const amount = draft.amount || 0;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraft({ ...draft, category: val, vatRate: rate, vatAmount });
 if (errors.category) setErrors({ ...errors, category: '' });
 }
 }}
 >
 <SelectTrigger className={`h-14 text-base ${errors.category ? 'border-red-500' : ''} ${autoFilled ? 'ring-2 ring-primary/50 bg-primary/10' : ''}`} aria-label="Velg kategori">
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
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
 <div className="space-y-2">
 <Label className="text-base text-muted-foreground">Mva-sats</Label>
 <Select 
 disabled={isScanning}
 value={draft.vatRate?.toString() || "0"} 
 onValueChange={(val) => {
 const rate = Number(val);
 const amount = draft.amount || 0;
 const vatAmount = Math.round((amount * (rate / (100 + rate))) * 100) / 100;
 setDraft({ ...draft, vatRate: rate, vatAmount });
 }}
 >
 <SelectTrigger className="h-14 text-base font-medium" aria-label="Mva-sats">
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
 <div className="space-y-2">
 <Label className="text-base text-muted-foreground">Mva-beløp</Label>
 <Input 
 disabled
 className="h-14 text-base font-medium bg-muted/50"
 value={draft.vatAmount !== undefined ? draft.vatAmount.toString().replace('.', ',') : ''} 
 />
 </div>
 <div className="space-y-2">
 <Label className="text-base text-muted-foreground">Nettobeløp</Label>
 <Input 
 disabled
 className="h-14 text-base font-medium bg-muted/50"
 value={((draft.amount || 0) - (draft.vatAmount || 0)).toFixed(2).replace('.', ',')} 
 />
 </div>
 </div>

 {/* Description */}
 <div className="space-y-2">
 <Label className="text-base">Beskrivelse (valgfri)</Label>
 <Input 
 disabled={isScanning}
 className={`h-14 text-base text-ellipsis ${autoFilled ? 'ring-2 ring-primary/50 bg-primary/10' : ''}`}
 value={draft.description || ''} 
 onChange={(e) => setDraft({ ...draft, description: e.target.value })}
 placeholder="Hva gjelder det?"
 />
 </div>

 {/* Scan Warning */}
 {scanWarning && (
 <div className="p-4 rounded-none bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3 ">
 <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
 <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500 leading-snug">{scanWarning}</p>
 </div>
 )}

 {/* Receipts Component */}
 <div className="pt-2 space-y-3">
 <div className="flex items-center justify-between">
 <Label className="text-base flex items-center gap-2">
 <FontAwesomeIcon icon={faPaperclip} className="h-5 w-5 text-muted-foreground" /> Kvittering (valgfri)
 </Label>
 <Button 
 type="button" 
 variant="secondary" 
 size="sm" 
 disabled={isScanning}
 onClick={() => {
 setIsScanning(true);
 setTimeout(() => {
 const scanAmount = 249.50;
 const scanCat = "Drift";
 const scanRate = getVatRateForCategory(scanCat);
 const scanVat = Math.round((scanAmount * (scanRate / (100 + scanRate))) * 100) / 100;
 
 if (draft.amount && draft.amount > 0 && draft.amount !== scanAmount) {
 setScanWarning(`Avvik oppdaget: Kvitteringen viser 249,50 kr, men transaksjonen var lagt inn med ${amountStr} kr. Kontroller tallene før du lagrer.`);
 } else {
 setScanWarning(null);
 }

 setDraft({ ...draft, amount: scanAmount, category: scanCat, vatRate: scanRate, vatAmount: scanVat, description: "Kjøp hos Clas Ohlson" });
 setAmountStr("249,50");
 setErrors({});
 setIsScanning(false);
 setAutoFilled(true);
 setTimeout(() => setAutoFilled(false), 3000);
 }, 1500);
 }}
 >
 {isScanning ? <><FontAwesomeIcon icon={faWandMagicSparkles} className="w-4 h-4 mr-2 " /> Henter data...</> : <><FontAwesomeIcon icon={faCamera} className="w-4 h-4 mr-2" /> Smart Skanning</>}
 </Button>
 </div>
 
 {draft.receiptUrl ? (
 <div className="relative border rounded-none overflow-hidden bg-muted/20 group">
 <img src={draft.receiptUrl} alt="Kvittering" className="w-full h-auto max-h-48 object-contain" />
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <Button variant="destructive" size="sm" onClick={() => setDraft({ ...draft, receiptUrl: undefined })}>
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
 <Button type="button" variant="outline" className="mt-1" onClick={() => fileInputRef.current?.click()}>
 Last opp bilag
 </Button>
 </div>
 )}
 </div>

 </div>
 </SidePanelForm>
 
 <TransactionList />
 <ZReportBuilder open={isZReportOpen} onOpenChange={handleZReportOpenChange} />
 </div>

 <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 ">
 <DropdownMenu>
 <DropdownMenuTrigger className="focus:outline-none flex items-center justify-center rounded-full h-14 w-14 shadow-sm hover:shadow-sm cursor-pointer bg-primary text-primary-foreground" aria-label="Ny handling">
 <FontAwesomeIcon icon={faPlus} className="size-6" />
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 mb-2">
 <DropdownMenuItem 
 onClick={() => setIsLocalOpen(true)}
 className="py-3 cursor-pointer rounded-md focus:bg-primary/10"
 >
 <FontAwesomeIcon icon={faReceipt} className="mr-2 h-5 w-5 opacity-70" />
 <span className="font-medium">Ny transaksjon</span>
 </DropdownMenuItem>
 <DropdownMenuItem 
 onClick={() => setIsLocalZReportOpen(true)}
 className="py-3 cursor-pointer rounded-md focus:bg-primary/10"
 >
 <FontAwesomeIcon icon={faStore} className="mr-2 h-5 w-5 opacity-70" />
 <span className="font-medium">Nytt kasseoppgjør (Z-Rapport)</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </>
 );
}

