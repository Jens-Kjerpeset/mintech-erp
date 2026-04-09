import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDrag } from '@use-gesture/react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';
import { Transaction } from '../../types/schema';

const editSchema = z.object({
  category: z.string().min(2, 'Kategori kreves'),
  status: z.string().min(2, 'Status kreves')
});

type EditFormValues = z.infer<typeof editSchema>;

export function LedgerEditSheet({ transaction, onClose }: { transaction: Transaction | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isOpen = !!transaction;

  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
    if (my < -50) cancel();
    if (last && (my > 100 || (vy > 0.5 && dy > 0))) {
      onClose();
    }
  }, {
    from: () => [0, 0],
    bounds: { top: 0 },
    rubberband: true,
    axis: 'y'
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (transaction) {
      reset({ category: transaction.category, status: transaction.status });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [transaction, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      if (!transaction) return;
      await api.transactions.update(transaction.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    }
  });

  const onSubmit = (data: EditFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        {...bind()}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white border-t-4 border-black rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] transition-transform duration-300 h-fit max-h-[90vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          "touch-none"
        )}
      >
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {transaction && (
          <div className="flex-1 px-6 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
              <h2 className="text-2xl font-black tracking-widest">Endre Postering</h2>
              <Button type="button" variant="outline" size="icon" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-zinc-100 p-4 border-4 border-black mb-6">
                <span className="block font-bold text-sm text-zinc-500 tracking-widest">{new Date(transaction.date).toLocaleDateString('no-NO')}</span>
                <span className="block font-black text-xl overflow-hidden text-ellipsis whitespace-nowrap">{transaction.description || "Ingen beskrivelse"}</span>
                <span className={cn("block font-black text-3xl mt-2 font-mono", transaction.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('no-NO')} kr
                </span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider">Kategori *</label>
                <input 
                  {...register('category')} 
                  className="w-full border-2 border-black px-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-black relative z-10"
                />
                {errors.category && <p className="text-red-600 font-bold text-xs">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider">Status *</label>
                <input 
                  {...register('status')} 
                  className="w-full border-2 border-black px-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-black relative z-10"
                />
                {errors.status && <p className="text-red-600 font-bold text-xs">{errors.status.message}</p>}
              </div>

              <Button type="submit" className="w-full mt-6" size="lg" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Lagrer...</>
                ) : (
                  <><FontAwesomeIcon icon={faSave} className="mr-2" /> Oppdater Transaksjon</>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
