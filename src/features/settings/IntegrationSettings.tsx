import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { settingsSchema } from '@/types/schema';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function IntegrationSettings({ form, simulateAltinnLogin }: { 
  form: UseFormReturn<z.input<typeof settingsSchema>>;
  simulateAltinnLogin: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Altinn / Skatteetaten (MVA-melding)</CardTitle>
          <CardDescription>Koble til Skatteetaten for direkte innsending av mva-melding via Maskinporten.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-none bg-card mt-2">
            <div className="space-y-0.5">
              <FormLabel className="text-base">MVA-melding API</FormLabel>
              <p className="text-sm text-muted-foreground">
                {form.watch('altinnConnected') ? 'Tilkoblet Maskinporten. Klar for validering og innsending.' : 'Ikke tilkoblet. Krever BankID.'}
              </p>
            </div>
            {form.watch('altinnConnected') ? (
              <Button type="button" variant="outline" className="text-destructive border-destructive" onClick={() => form.setValue('altinnConnected', false, { shouldDirty: true })}>Koble fra</Button>
            ) : (
              <Button type="button" onClick={simulateAltinnLogin}>Koble til med BankID</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Andre Integrasjoner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="psd2Connected" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-none border p-4 shadow-sm space-y-0 gap-2">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-foreground">Bankintegrasjon (PSD2)</FormLabel>
                <FormDescription>Automatisk bankavstemming mot inngående innbetalinger.</FormDescription>
              </div>
              <FormControl>
                <input 
                  type="checkbox" 
                  checked={field.value} 
                  onChange={(e) => field.onChange(e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer shrink-0" 
                />
              </FormControl>
            </FormItem>
          )} />

          <FormField control={form.control} name="izettleConnected" render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-none border p-4 shadow-sm space-y-0 gap-2">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-foreground">Kassesystem (iZettle / POS)</FormLabel>
                <FormDescription>Synkroniser dagsoppgjør automatisk.</FormDescription>
              </div>
              <FormControl>
                <input 
                  type="checkbox" 
                  checked={field.value} 
                  onChange={(e) => field.onChange(e.target.checked)} 
                  className="w-5 h-5 accent-primary cursor-pointer shrink-0" 
                />
              </FormControl>
            </FormItem>
          )} />
        </CardContent>
      </Card>
    </div>
  );
}
