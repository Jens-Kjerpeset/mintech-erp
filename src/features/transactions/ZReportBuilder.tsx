import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ZReport } from '@/types/schema';
import { SidePanelForm } from '@/components/layout/SidePanelForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Receipt, Paperclip, AlertTriangle, DownloadCloud, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/formatting';
import { compressImage } from '@/lib/imageCompression';
import { Button } from '@/components/ui/button';

function ValutaInput({ value, onChange, highlight }: { value: number, onChange: (val: number) => void, highlight?: boolean }) {
  const [localStr, setLocalStr] = useState("");
  useEffect(() => {
    if (value === 0 && localStr === "") return;
    const currentVal = parseFloat(localStr.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    if (currentVal !== value) {
      const formatted = value.toString().replace('.', ',');
      const parts = formatted.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      setLocalStr(parts.join(','));
    }
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="decimal"
      className={`font-mono transition-all duration-500 ${highlight ? 'ring-2 ring-primary/50 bg-primary/10' : ''}`}
      value={localStr}
      onChange={(e) => {
        const val = e.target.value.replace(/[^0-9,]/g, '');
        const parts = val.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        setLocalStr(parts.join(','));
        onChange(parseFloat(val.replace(',', '.')) || 0);
      }}
    />
  );
}

export function ZReportBuilder({ open, onOpenChange }: { open: boolean; onOpenChange: (show: boolean) => void }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }));
  const [draft, setDraft] = useState<Partial<ZReport>>({
    date: new Date().toISOString().split('T')[0],
    cardSales: 0,
    vippsSales: 0,
    cashSales: 0,
    vat25: 0,
    vat15: 0,
    actualCash: 0,
    receiptUrl: ''
  });
  const [error, setError] = useState('');
  const [isFetchingPOS, setIsFetchingPOS] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Omit<ZReport, 'id'>) => api.zreports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zreports'] });
      onOpenChange(false);
      // Reset
      setDraft({
        date: new Date().toISOString().split('T')[0],
        cardSales: 0, vippsSales: 0, cashSales: 0,
        vat25: 0, vat15: 0, vat0: 0,
        actualCash: 0, receiptUrl: ''
      });
      setTime(new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }));
      setError('');
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file);
      setDraft(prev => ({ ...prev, receiptUrl: compressedBase64 }));
      setError(''); // clear receipt errors
    } catch (err) {
      console.error("Failed to compress image", err);
    }
  };

  const autopopulatePOS = () => {
    setIsFetchingPOS(true);
    setError('');
    setTimeout(() => {
      // API Failure State Simulation
      if (Math.random() > 0.6) { // 40% chance of failure
        setIsFetchingPOS(false);
        setError('Nettverksfeil: Tidsavbrudd ved kommunikasjon mot iZettle/Vipps. Koblingen kunne ikke verifiseres akkurat nå. Vennligst benytt tallene fra Z-rapport kvitteringen og legg inn beløpene manuelt som reserveløsning.');
        return;
      }

      setDraft(prev => ({
        ...prev,
        cardSales: 3450.50,
        vippsSales: 1200.00,
        cashSales: 450.00,
        vat25: 2500.50,
        vat15: 2600.00,
        vat0: 0,
        actualCash: 450.00
      }));
      setIsFetchingPOS(false);
      setError('');
      setAutoFilled(true);
      setTimeout(() => setAutoFilled(false), 3000);
    }, 1200);
  };

  const grossSales = Math.round(((draft.cardSales || 0) + (draft.vippsSales || 0) + (draft.cashSales || 0)) * 100) / 100;
  const totalVatInputs = Math.round(((draft.vat25 || 0) + (draft.vat15 || 0) + (draft.vat0 || 0)) * 100) / 100;
  const isVatBalanced = totalVatInputs === grossSales && grossSales > 0;

  // Forventet Kontantbeholdning = Previous day's closing balance (mocked as 0) + today's cash sales
  const expectedCash = 0 + (draft.cashSales || 0);
  const cashDifference = (draft.actualCash || 0) - expectedCash;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draft.receiptUrl) {
      setError('Obligatorisk: Du må laste opp Z-rapport kvitteringen for å bokføre (Bokføringsloven).');
      return;
    }
    if (!isVatBalanced) {
      setError('Feil i mva-grunnlag: Summen av salg fordelt på mva-satser er ikke lik brutto omsetning.');
      return;
    }

    createMutation.mutate({
      date: new Date(`${draft.date}T${time}:00`).toISOString(),
      cardSales: draft.cardSales || 0,
      vippsSales: draft.vippsSales || 0,
      cashSales: draft.cashSales || 0,
      grossSales,
      vat25: draft.vat25 || 0,
      vat15: draft.vat15 || 0,
      vat0: draft.vat0 || 0,
      expectedCash,
      actualCash: draft.actualCash || 0,
      cashDifference,
      receiptUrl: draft.receiptUrl,
      status: 'completed'
    });
  };

  return (
    <SidePanelForm
      open={open}
      onOpenChange={onOpenChange}
      maxWidthClass="sm:max-w-md"
      title={<><Store className="h-6 w-6 text-primary shrink-0" /> Nytt kasseoppgjør</>}
      description="Dagsavslutning for fysisk kassesystem og utsalgssted."
      onSubmit={handleSave}
      onCancel={() => onOpenChange(false)}
      isSubmitting={createMutation.isPending || (grossSales > 0 && !isVatBalanced)}
      submitText="Bokfør"
    >
      <div className="space-y-8">
            {error && (
              <div className="mb-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-start">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              Dato & Tidspunkt
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-end gap-2">
                <Label>Dato for avslutning</Label>
                <Input 
                  type="date" 
                  value={draft.date} 
                  onChange={e => setDraft(prev => ({ ...prev, date: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="flex flex-col justify-end gap-2">
                <Label>Klokkeslett</Label>
                <Input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                Betalingsmidler
              </h3>
              <Button type="button" variant="secondary" size="sm" className="gap-2" onClick={autopopulatePOS} disabled={isFetchingPOS}>
                {isFetchingPOS ? <><Sparkles className="w-4 h-4 animate-pulse" /> Henter kassedata...</> : <><DownloadCloud className="w-4 h-4" /> Hent fra kassesystem</>}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-end gap-2"><Label>Kort (iZettle / Terminal)</Label><ValutaInput highlight={autoFilled} value={draft.cardSales || 0} onChange={(v: number) => setDraft(p => ({ ...p, cardSales: v }))} /></div>
              <div className="flex flex-col justify-end gap-2"><Label>Vipps</Label><ValutaInput highlight={autoFilled} value={draft.vippsSales || 0} onChange={(v: number) => setDraft(p => ({ ...p, vippsSales: v }))} /></div>
              <div className="flex flex-col justify-end gap-2"><Label>Kontant (Salg)</Label><ValutaInput highlight={autoFilled} value={draft.cashSales || 0} onChange={(v: number) => setDraft(p => ({ ...p, cashSales: v }))} /></div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between border">
              <span className="font-medium text-muted-foreground">Brutto omsetning</span>
              <span className="text-xl font-bold font-mono">{formatCurrency(grossSales)}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              MVA-grunnlag
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col justify-end gap-2"><Label>Salg 25%</Label><ValutaInput highlight={autoFilled} value={draft.vat25 || 0} onChange={(v: number) => setDraft(p => ({ ...p, vat25: v }))} /></div>
              <div className="flex flex-col justify-end gap-2"><Label>Salg 15%</Label><ValutaInput highlight={autoFilled} value={draft.vat15 || 0} onChange={(v: number) => setDraft(p => ({ ...p, vat15: v }))} /></div>
              <div className="flex flex-col justify-end gap-2"><Label>Fritatt (0%)</Label><ValutaInput highlight={autoFilled} value={draft.vat0 || 0} onChange={(v: number) => setDraft(p => ({ ...p, vat0: v }))} /></div>
            </div>
            
            <div className={`p-3 rounded-lg flex flex-col justify-center border transition-colors ${isVatBalanced ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Sum Fordelt</span>
                <span className="font-bold font-mono">{formatCurrency(totalVatInputs)}</span>
              </div>
              {!isVatBalanced && grossSales > 0 && (
                <p className="text-xs font-semibold mt-1 text-center">MVA-registreringen stemmer ikke med brutto omsetning.</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              Kassedifferanse
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col justify-end gap-2"><Label>Forventet Kontantbeholdning</Label><Input type="text" readOnly disabled value={formatCurrency(expectedCash)} className="bg-muted/50 font-mono" /></div>
              <div className="flex flex-col justify-end gap-2"><Label>Talt Opp i Kassen</Label><ValutaInput highlight={autoFilled} value={draft.actualCash || 0} onChange={(v: number) => setDraft(p => ({ ...p, actualCash: v }))} /></div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <span className="font-medium text-muted-foreground">Kassedifferanse (Manko/Overskudd)</span>
              <span className={`text-xl font-bold font-mono ${cashDifference === 0 ? 'text-primary' : cashDifference > 0 ? 'text-green-500' : 'text-destructive'}`}>
                {cashDifference > 0 ? '+' : ''}{formatCurrency(cashDifference)}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
              Obligatorisk Vedlegg
            </h3>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${draft.receiptUrl ? 'bg-primary/5 border-primary/30' : 'hover:bg-accent/50 hover:border-primary/30'}`}
            >
              {draft.receiptUrl ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                    <Receipt className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="font-medium">Z-Rapport vedlagt</p>
                  <p className="text-xs text-muted-foreground mt-1">Trykk for å endre fil</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Paperclip className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-center">Last opp terminal-/kassekvittering</p>
                  <p className="text-xs text-red-500 mt-1">Lovpålagt for bokføring</p>
                </>
              )}
            </div>
          </div>

      </div>
    </SidePanelForm>
  );
}
