import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trash2, ShoppingCart, Truck, Wrench, Megaphone, ArrowDownLeft, Store, CreditCard, CircleDollarSign, Receipt, Paperclip, Save } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
    case 'Salg B2C': return <Store className="w-5 h-5" />;
    case 'Salg B2B': return <ArrowDownLeft className="w-5 h-5" />;
    case 'Varekjøp': return <ShoppingCart className="w-5 h-5" />;
    case 'Frakt': return <Truck className="w-5 h-5" />;
    case 'Markedsføring': return <Megaphone className="w-5 h-5" />;
    case 'Gebyrer': return <CreditCard className="w-5 h-5" />;
    case 'Drift': return <Wrench className="w-5 h-5" />;
    default: return <CircleDollarSign className="w-5 h-5" />;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSelectedTx(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => api.transactions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSelectedTx(null);
    },
  });



  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse">Laster transaksjoner...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return <div className="p-4 text-center text-muted-foreground border rounded-lg bg-card">Ingen transaksjoner funnet.</div>;
  }

  const handleSave = () => {
    if (selectedTx?.id && draftTx) {
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

  const groupedTransactions = groupTransactionsByMonth(transactions);
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
      <Accordion defaultValue={[currentMonthKey]} className="w-full space-y-4">
        {monthKeys.map((monthKey) => (
          <AccordionItem key={monthKey} value={monthKey} className="border bg-card rounded-xl px-4 shadow-sm">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-lg font-semibold tracking-tight">{formatMonthKey(monthKey)}</span>
              <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {groupedTransactions[monthKey].length} {groupedTransactions[monthKey].length === 1 ? 'transaksjon' : 'transaksjoner'}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-3">
              {groupedTransactions[monthKey].map((tx: Transaction) => (
                <TransactionListItem 
                  key={tx.id} 
                  transaction={tx} 
                  onClick={() => { setSelectedTx(tx); setDraftTx(tx); }}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Sheet open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent side="right" className="w-[88vw] sm:max-w-md p-0 flex flex-col h-full border-l bg-background shadow-2xl">
          <div tabIndex={0} autoFocus className="outline-none w-0 h-0 absolute top-0" />
          {selectedTx && draftTx && (
            <>
              <SheetHeader className="px-6 sm:px-8 py-5 sm:py-6 shrink-0 border-b">
                <SheetTitle className="text-xl sm:text-2xl flex items-center gap-2 leading-tight">
                  <Receipt className="h-6 w-6 text-primary shrink-0" /> <span className="break-words">Transaksjonsdetaljer</span>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Transaksjonsdetaljer
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
                {/* Visual Header */}
                <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-muted/40">
                  <div className={`size-12 sm:size-14 rounded-full flex shrink-0 items-center justify-center ${draftTx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {getCategoryIcon(draftTx.category || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xl md:text-2xl font-bold font-mono tracking-tight break-words ${draftTx.type === 'income' ? 'text-green-500' : 'text-foreground'}`}>
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
                      <Label className="text-base text-muted-foreground">Beløp (kr)</Label>
                      <Input 
                        type="number"
                        step="0.01"
                        className="h-12 text-base font-medium font-mono text-ellipsis"
                        value={draftTx.amount || ''} 
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const rate = draftTx.vatRate ?? 25;
                          const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                          setDraftTx({ ...draftTx, amount, vatAmount });
                        }}
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <Label className="text-base text-muted-foreground">Dato</Label>
                      <div className="relative cursor-pointer" onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          try { if ('showPicker' in HTMLInputElement.prototype) input?.showPicker() } catch (e) { console.warn(e) }
                      }}>
                        <Input 
                          type="date"
                          className="h-12 text-base font-medium appearance-none cursor-pointer w-full"
                          value={draftTx.date ? new Date(draftTx.date).toISOString().split('T')[0] : ''} 
                          onChange={(e) => setDraftTx({ ...draftTx, date: new Date(e.target.value).toISOString() })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base text-muted-foreground">Kategori</Label>
                    <Select 
                      value={draftTx.category} 
                      onValueChange={(val: string | null) => {
                        if (val) {
                          const rate = getVatRateForCategory(val);
                          const amount = draftTx.amount || 0;
                          const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                          setDraftTx({ ...draftTx, category: val, vatRate: rate, vatAmount });
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 text-base font-medium">
                        <SelectValue placeholder="Velg kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                          setDraftTx({ ...draftTx, vatRate: rate, vatAmount });
                        }}
                      >
                        <SelectTrigger className="h-12 text-base font-medium">
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
                        type="number"
                        step="0.01"
                        className="h-12 text-base font-medium"
                        value={draftTx.vatAmount || ''} 
                        onChange={(e) => setDraftTx({ ...draftTx, vatAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <Label className="text-base text-muted-foreground">Nettobeløp</Label>
                      <Input 
                        disabled
                        className="h-12 text-base font-medium bg-muted/50"
                        value={((draftTx.amount || 0) - (draftTx.vatAmount || 0)).toFixed(2)} 
                      />
                    </div>
                  </div>
                </div>

                {/* Receipts Component */}
                <div className="pt-4 border-t space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-muted-foreground" /> Kvitteringer & Vedlegg
                  </h3>
                  
                  {draftTx.receiptUrl ? (
                    <div className="relative border rounded-xl overflow-hidden bg-muted/20 group">
                      <img src={draftTx.receiptUrl} alt="Kvittering" className="w-full h-auto max-h-56 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="destructive" size="sm" onClick={() => setDraftTx({ ...draftTx, receiptUrl: undefined })}>
                          <Trash2 className="h-4 w-4 mr-2" /> Fjern
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 bg-muted/10 transition-colors hover:bg-muted/30">
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
                      onClick={() => {
                        if (selectedTx.id && confirm('Er du sikker på at du vil slette denne transaksjonen?')) {
                          deleteMutation.mutate(selectedTx.id);
                        }
                      }}
                    >
                      Slett Transaksjon
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Footers Anchored to Bottom */}
              <div className="mt-auto px-6 sm:px-8 py-4 border-t bg-background shrink-0 z-10 w-full">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 h-14 text-lg rounded-xl font-semibold" onClick={() => setSelectedTx(null)}>
                    Avbryt
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending} className="flex-1 h-14 text-lg rounded-xl shadow-xl flex items-center justify-center gap-2 font-semibold">
                    <Save className="h-5 w-5" /> Lagre
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TransactionListItem({ transaction, onClick }: { transaction: Transaction, onClick: () => void }) {
  const isIncome = transaction.type === "income";

  return (
    <RecordItem
      onClick={onClick}
      icon={getCategoryIcon(transaction.category)}
      iconBgClass={isIncome ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
      title={transaction.description || transaction.category}
      primaryValue={`${isIncome ? '+' : '-'}${formatCurrency(transaction.amount)}`}
      primaryValueClass={isIncome ? 'text-green-500' : ''}
      secondaryValue={formatDate(transaction.date)}
    />
  );
}
