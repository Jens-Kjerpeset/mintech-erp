import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { settingsSchema } from '@/types/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function CompanySettings({ form }: { form: UseFormReturn<z.input<typeof settingsSchema>> }) {
  return (
    <div className="space-y-4 m-0">
      <Card>
        <CardHeader>
          <CardTitle>Juridisk Informasjon</CardTitle>
          <CardDescription>Synlig på alle utgående fakturaer og dokumenter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField control={form.control} name="companyName" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Juridisk Selskapsnavn</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="orgNumber" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Organisasjonsnummer</FormLabel>
              <FormControl><Input placeholder="F.eks. 987 654 321 MVA" {...field} /></FormControl>
              <FormDescription>Inkluder 'MVA' på slutten hvis selskapet er mva-registrert.</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="companyAddress" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Gateadresse</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-[1fr_2fr] gap-4">
            <FormField control={form.control} name="companyZipCode" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Postnummer</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companyCity" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Poststed</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utbetalingsinformasjon</CardTitle>
          <CardDescription>Hvor kundene dine skal betale.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="bankAccount" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Kontonummer (Standard)</FormLabel>
                <FormControl><Input placeholder="1111.22.33333" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vippsNumber" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>Vipps-nummer (Valgfritt)</FormLabel>
                <FormControl><Input placeholder="F.eks. 12345" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="iban" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>IBAN (Internasjonal Betaling)</FormLabel>
                <FormControl><Input placeholder="NO00 0000..." {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="swift" render={({ field }) => (
              <FormItem className="flex flex-col gap-2 space-y-0">
                <FormLabel>BIC / SWIFT</FormLabel>
                <FormControl><Input placeholder="DNBANO22XXX" {...field} value={field.value || ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
