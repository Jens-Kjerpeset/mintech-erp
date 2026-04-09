import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';

const zReportSchema = z.object({
  cardSales: z.coerce.number().min(0, 'Må være gyldig tall'),
  vippsSales: z.coerce.number().min(0, 'Må være gyldig tall'),
  expectedCash: z.coerce.number().min(0, 'Må være gyldig tall'),
  actualCash: z.coerce.number().min(0, 'Må være gyldig tall'),
});

type ZReportFormValues = z.infer<typeof zReportSchema>;

export function ZReportForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ZReportFormValues>({
    resolver: zodResolver(zReportSchema),
    defaultValues: {
      cardSales: 0,
      vippsSales: 0,
      expectedCash: 0,
      actualCash: 0
    }
  });

  const cardSales = watch('cardSales') || 0;
  const vippsSales = watch('vippsSales') || 0;
  const expectedCash = watch('expectedCash') || 0;
  const actualCash = watch('actualCash') || 0;

  const cashDifference = actualCash - expectedCash;
  const grossSales = Number(cardSales) + Number(vippsSales) + Number(actualCash);

  const createMutation = useMutation({
    mutationFn: async (data: ZReportFormValues) => {
      const payload = {
        date: new Date().toISOString(),
        grossSales,
        cardSales: data.cardSales,
        vippsSales: data.vippsSales,
        cashSales: data.actualCash,
        vat25: grossSales * 0.2, // Fast approximation for offline testing scope
        vat15: 0,
        vat0: 0,
        expectedCash: data.expectedCash,
        actualCash: data.actualCash,
        cashDifference,
        receiptUrl: '',
        status: 'completed'
      };
      await api.zreports.create(payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zreports'] });
      onSuccess?.();
    }
  });

  const onSubmit = (data: ZReportFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-xs font-bold tracking-widest text-zinc-500 mb-6 border-l-4 border-black pl-3 py-1">
        Eventuelle kassedifferanser vil automatisk bokføres i hovedboken mot konto for Drift.
      </p>

      {cashDifference !== 0 && (
        <div className={cn(
          "p-4 border-4 border-black font-black tracking-widest text-lg flex justify-between items-center mb-4",
          cashDifference < 0 ? "bg-red-500 text-white" : "bg-yellow-400 text-black"
        )}>
          <span>{cashDifference < 0 ? 'Manko' : 'Overskudd'}</span>
          <span className="font-mono">{cashDifference > 0 ? '+' : ''}{cashDifference.toLocaleString('no-NO')} kr</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-4 border-4 border-black">
        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">Kortsalg *</label>
          <input 
            type="number" step="0.01"
            {...register('cardSales')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black relative z-10"
          />
          {errors.cardSales && <p className="text-red-600 font-bold text-xs">{errors.cardSales.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">Vipps-salg *</label>
          <input 
             type="number" step="0.01"
            {...register('vippsSales')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black relative z-10"
          />
          {errors.vippsSales && <p className="text-red-600 font-bold text-xs">{errors.vippsSales.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider text-zinc-500">Forventet Kontant *</label>
          <input 
             type="number" step="0.01"
            {...register('expectedCash')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold text-zinc-500 bg-zinc-200 focus:outline-none relative z-10"
          />
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">Opptalt Kontant *</label>
          <input 
             type="number" step="0.01"
            {...register('actualCash')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-black text-xl focus:outline-none focus:ring-2 focus:ring-black relative z-10"
          />
        </div>
      </div>

      <div className="bg-black text-white p-4 flex justify-between items-center text-xl tracking-widest font-black">
         <span>Bruttoomsetning</span>
         <span className="font-mono">{grossSales.toLocaleString('no-NO')} kr</span>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full sm:w-auto"
          size="lg"
        >
          {createMutation.isPending ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Bokfører...</>
          ) : (
            <><FontAwesomeIcon icon={faSave} className="mr-2" /> Bokfør Z-Rapport</>
          )}
        </Button>
      </div>
    </form>
  );
}
