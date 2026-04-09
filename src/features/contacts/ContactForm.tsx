import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';

const contactSchema = z.object({
  name: z.string().min(2, 'Navn må ha minst 2 tegn'),
  relationType: z.enum(['Kunde', 'Leverandør']),
  orgNumber: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
       if (!val) return true;
       return /^[0-9\s]+(\s?MVA)?$/i.test(val);
    }, 'Ugyldig, f.eks "123 456 789 MVA" for B2B'),
  email: z.string().email('Ugyldig e-post').optional().or(z.literal('')),
  paymentTermsDays: z.coerce.number().min(0).default(14),
  contactPerson: z.string().optional().default(''),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {
      relationType: 'Kunde',
      paymentTermsDays: 14,
      orgNumber: '',
      email: '',
      contactPerson: ''
    }
  });

  const relationType = watch('relationType');

  const createMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      if (initialData?.id) {
         await api.contacts.update(initialData.id, data);
      } else {
         await api.contacts.create(data as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      onSuccess?.();
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 col-span-full">
          <label className="font-bold text-sm tracking-wider">Type Relasjon</label>
          <select 
            {...register('relationType')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="Kunde">Kunde (Customer)</option>
            <option value="Leverandør">Leverandør (Vendor)</option>
          </select>
        </div>

        <div className="space-y-2 col-span-full">
          <label className="font-bold text-sm tracking-wider">Navn / Selskap *</label>
          <input 
            {...register('name')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.name && <p className="text-red-600 font-bold text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">OrgNummer {relationType === 'Leverandør' ? '*' : '(For B2B)'}</label>
          <input 
            {...register('orgNumber')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.orgNumber && <p className="text-red-600 font-bold text-xs">{errors.orgNumber.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">E-post</label>
          <input 
            {...register('email')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.email && <p className="text-red-600 font-bold text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">Standard Kredittid (Dager)</label>
          <input 
            type="number"
            {...register('paymentTermsDays')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black relative z-10"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Lagrer...</>
          ) : (
            <><FontAwesomeIcon icon={faSave} className="mr-2" /> Lagre Kontakt</>
          )}
        </Button>
      </div>
    </form>
  );
}
