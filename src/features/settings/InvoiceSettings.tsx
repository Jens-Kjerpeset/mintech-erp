import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { settingsSchema } from '@/types/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';


export function InvoiceSettings({ form, showLogo, handleLogoUpload, setShowLogo }: { 
  form: UseFormReturn<z.input<typeof settingsSchema>>;
  showLogo: boolean;
  handleLogoUpload: () => void;
  setShowLogo: (val: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Visuell Identitet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-16 rounded-md bg-white flex items-center justify-center shrink-0 border p-2 object-contain overflow-hidden shadow-sm">
              {showLogo ? (
                <img src="/logo.png" alt="Bedriftslogo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground/50 font-medium">Laster Logo...</span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Bedriftslogo</p>
              <p className="text-xs text-muted-foreground">Optimal størrelse: 400x120px. Maks filstørrelse 2MB.</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" type="button" onClick={handleLogoUpload}>Last opp ny</Button>
                <Button variant="ghost" size="sm" type="button" className="text-destructive" onClick={() => setShowLogo(false)}>Fjern</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fakturanummerserie & Betingelser</CardTitle>
          <CardDescription>Bokføringsloven krever at fakturanummer følger en ubrutt rekke.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="nextInvoiceNumber" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Neste Fakturanummer</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type="number" 
                      className="bg-muted/50 font-mono pr-10" 
                      readOnly 
                      {...field} 
                    />
                  </FormControl>
                  <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-muted-foreground absolute right-3 top-3 opacity-50" />
                </div>
                <FormDescription>Låst. Genereres automatisk av systemet.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="defaultCreditDays" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Standard Kredittid</FormLabel>
                <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={field.value?.toString() ?? "14"}>
                  <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Velg frist" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="10">10 dager</SelectItem>
                    <SelectItem value="14">14 dager (Standard)</SelectItem>
                    <SelectItem value="20">20 dager</SelectItem>
                    <SelectItem value="30">30 dager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="priceDisplay" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0 pt-2">
              <FormLabel>Standard Prisvisning på Fakturalinjer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="w-full sm:w-1/2"><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="ExVat">Eks. MVA</SelectItem>
                  <SelectItem value="IncVat">Inkl. MVA</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tekst & Meldinger</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField control={form.control} name="defaultNote" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Standard melding til kunde (valgfritt)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="F.eks. Takk for handelen!" 
                  className="resize-none min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>Legges til automatisk nederst på alle nye fakturaer.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>
    </div>
  );
}
