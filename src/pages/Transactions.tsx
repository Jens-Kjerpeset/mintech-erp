import { useState, useRef } from 'react';
import { TransactionList } from '@/features/transactions/TransactionList';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Paperclip, Trash2, Store } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ZReportBuilder } from '@/features/transactions/ZReportBuilder';
import type { Transaction } from '@/types/schema';

const CATEGORIES = ["Salg B2B", "Salg B2C", "Varekjøp", "Frakt", "Markedsføring", "Gebyrer", "Drift"];

const getVatRateForCategory = (cat: string) => {
  if (cat === 'Frakt') return 12;
  if (cat === 'Gebyrer') return 0;
  return 25;
};

export function Transactions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setDraft(prev => ({ ...prev, receiptUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };
  
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (tx: Omit<Transaction, 'id'>) => api.transactions.create(tx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setIsOpen(false);
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
    if (!draft.amount || !draft.category || !draft.date) return;
    createMutation.mutate({
      amount: Number(draft.amount),
      date: new Date(draft.date).toISOString(),
      type: draft.type as 'income' | 'expense',
      category: draft.category,
      vatRate: draft.vatRate,
      vatAmount: draft.vatAmount,
      description: draft.description || draft.category,
      receiptUrl: draft.receiptUrl,
      status: 'completed'
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Transaksjoner</h1>
          <p className="text-muted-foreground">Administrer inntekter og utgifter.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center justify-center rounded-full h-12 w-12 shadow-md hover:shadow-lg transition-all bg-primary text-primary-foreground cursor-pointer" aria-label="Ny handling">
              <Plus className="h-6 w-6" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
            <DropdownMenuItem 
              onClick={() => setIsOpen(true)}
              className="py-3 cursor-pointer rounded-md focus:bg-primary/10"
            >
              <Receipt className="mr-2 h-5 w-5 opacity-70" />
              <span className="font-medium">Ny transaksjon</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setIsZReportOpen(true)}
              className="py-3 cursor-pointer rounded-md focus:bg-primary/10"
            >
              <Store className="mr-2 h-5 w-5 opacity-70" />
              <span className="font-medium">Nytt kasseoppgjør (Z-Rapport)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SidePanelForm
          open={isOpen}
          onOpenChange={setIsOpen}
          maxWidthClass="sm:max-w-md"
          title={<><Receipt className="h-6 w-6 text-primary shrink-0" /> Legg til transaksjon</>}
          description="Opprett en ny inntekt eller utgift."
          onSubmit={handleSave}
          onCancel={() => setIsOpen(false)}
          isSubmitting={createMutation.isPending}
          submitText="Lagre"
        >
          <div className="space-y-6">
              {/* Type Toggle */}
              <div className="flex gap-3">
                <div 
                  onClick={() => setDraft({ ...draft, type: 'expense' })}
                  className={`flex-1 p-4 text-center rounded-xl border-2 font-semibold cursor-pointer transition-all ${draft.type === 'expense' ? 'bg-red-50 text-red-600 border-red-500 dark:bg-red-950/30' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}
                >
                  Utgift
                </div>
                <div 
                  onClick={() => setDraft({ ...draft, type: 'income' })}
                  className={`flex-1 p-4 text-center rounded-xl border-2 font-semibold cursor-pointer transition-all ${draft.type === 'income' ? 'bg-green-50 text-green-600 border-green-500 dark:bg-green-950/30' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'}`}
                >
                  Inntekt
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-base">Beløp (kr)</Label>
                  <Input 
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="h-14 text-xl font-mono text-ellipsis"
                    value={draft.amount || ''}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      const rate = draft.vatRate ?? 25;
                      const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                      setDraft({ ...draft, amount, vatAmount });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Dato</Label>
                  <Input 
                    type="date"
                    required
                    className="h-14 text-base appearance-none"
                    onClick={(e) => {
                      try { if ('showPicker' in HTMLInputElement.prototype) e.currentTarget.showPicker() } catch (e) { console.warn(e) }
                    }}
                    value={draft.date ? new Date(draft.date).toISOString().split('T')[0] : ''} 
                    onChange={(e) => setDraft({ ...draft, date: new Date(e.target.value).toISOString() })}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-base">Kategori</Label>
                <Select 
                  required
                  value={draft.category} 
                  onValueChange={(val: string | null) => {
                    if (val) {
                      const rate = getVatRateForCategory(val);
                      const amount = draft.amount || 0;
                      const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                      setDraft({ ...draft, category: val, vatRate: rate, vatAmount });
                    }
                  }}
                >
                  <SelectTrigger className="h-14 text-base">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Mva-sats</Label>
                  <Select 
                    value={draft.vatRate?.toString() || "0"} 
                    onValueChange={(val) => {
                      const rate = Number(val);
                      const amount = draft.amount || 0;
                      const vatAmount = Number((amount * (rate / (100 + rate))).toFixed(2));
                      setDraft({ ...draft, vatRate: rate, vatAmount });
                    }}
                  >
                    <SelectTrigger className="h-14 text-base font-medium">
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
                    type="number"
                    step="0.01"
                    className="h-14 text-base font-medium"
                    value={draft.vatAmount || ''} 
                    onChange={(e) => setDraft({ ...draft, vatAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base text-muted-foreground">Nettobeløp</Label>
                  <Input 
                    disabled
                    className="h-14 text-base font-medium bg-muted/50"
                    value={((draft.amount || 0) - (draft.vatAmount || 0)).toFixed(2)} 
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-base">Beskrivelse (Valgfri)</Label>
                <Input 
                  className="h-14 text-base text-ellipsis"
                  value={draft.description || ''} 
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Hva gjelder det?"
                />
              </div>

              {/* Receipts Component */}
              <div className="pt-2 space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-muted-foreground" /> Kvittering (Valgfri)
                </Label>
                
                {draft.receiptUrl ? (
                  <div className="relative border rounded-xl overflow-hidden bg-muted/20 group">
                    <img src={draft.receiptUrl} alt="Kvittering" className="w-full h-auto max-h-48 object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="sm" onClick={() => setDraft({ ...draft, receiptUrl: undefined })}>
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
                    <Button type="button" variant="outline" className="mt-1" onClick={() => fileInputRef.current?.click()}>
                      Last opp bilag
                    </Button>
                  </div>
                )}
              </div>

          </div>
        </SidePanelForm>
      </header>
      
      <TransactionList />
      <ZReportBuilder open={isZReportOpen} onOpenChange={setIsZReportOpen} />
    </div>
  );
}

