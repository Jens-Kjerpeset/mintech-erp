import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { settingsSchema } from '@/types/schema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export function VATSettings({ form }: { form: UseFormReturn<z.input<typeof settingsSchema>> }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Regnskap & Avgiftsinnstillinger</CardTitle>
          <CardDescription>Definerer frekvens for momsrapportering til Skatteetaten.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="mvaTerm" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>MVA-termin</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Velg MVA-termin" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="BiMonthly">Tomånedlig</SelectItem>
                  <SelectItem value="Monthly">Månedlig</SelectItem>
                  <SelectItem value="Annually">Årlig (Småselskap)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fiscalYear" render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <FormLabel>Regnskapsår</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Velg regnskapsår" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Calendar">Kalenderår</SelectItem>
                  <SelectItem value="Split">Avvikende Regnskapsår</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </CardContent>
      </Card>
    </div>
  );
}
