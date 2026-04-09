import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from '../../lib/i18n';

const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Produkt påkrevd'),
  description: z.string().min(1, 'Beskrivelse påkrevd'),
  quantity: z.coerce.number().min(1, 'Må være > 0'),
  price: z.coerce.number().min(0, 'Ugyldig pris'),
  vatRate: z.coerce.number().min(0, 'Ugyldig MVA'),
});

const invoiceSchema = z.object({
  contactId: z.string().min(1, 'Du må velge en kunde'),
  clientName: z.string().min(1, 'Kundenavn mangler fra register'),
  clientEmail: z.string().email('Ugyldig e-post').optional().or(z.literal('')),
  issueDate: z.string().min(10, 'Gyldig dato påkrevd'),
  dueDate: z.string().min(10, 'Gyldig dato påkrevd'),
  status: z.enum(['sent', 'paid', 'overdue']).default('sent'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'Minst én vare påkrevd'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list()
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      contactId: '',
      clientName: '',
      clientEmail: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'sent',
      notes: '',
      items: [{ productId: crypto.randomUUID(), description: '', quantity: 1, price: 0, vatRate: 25 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const selectedContactId = watch('contactId');
  const issueDateStr = watch('issueDate');

  useEffect(() => {
    if (selectedContactId && contacts) {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (contact) {
        setValue('clientName', contact.name, { shouldValidate: true });
        setValue('clientEmail', contact.email || '');
        
        const terms = contact.paymentTermsDays || 14;
        const issue = new Date(issueDateStr);
        if (!isNaN(issue.getTime())) {
          const due = new Date(issue.getTime() + terms * 86400000);
          setValue('dueDate', due.toISOString().split('T')[0]);
        }
      }
    }
  }, [selectedContactId, issueDateStr, contacts, setValue]);

  const items = watch('items');
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  const totalVat = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) * (Number(item.vatRate) / 100)), 0);
  const total = subtotal + totalVat;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.invoices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    }
  });

  const onSubmit = (data: InvoiceFormValues) => {
    createMutation.mutate({
      ...data,
      subtotal: Number(subtotal.toFixed(2)),
      taxRate: data.items.length > 0 ? Math.max(...data.items.map(i => i.vatRate)) : 25, 
      total: Number(total.toFixed(2)),
      items: data.items.map(i => ({ ...i, id: crypto.randomUUID() }))
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4">
      <div className="flex flex-col items-start gap-6 border-b-4 border-black pb-4">
        {/* Navigation Action */}
        <button 
          onClick={() => navigate(-1)} 
          type="button" 
          className="flex items-center gap-2 font-bold tracking-widest text-zinc-500 hover:text-black transition-colors min-h-[44px] min-w-[44px]"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> {t('invoice_form.back')}
        </button>
        
        <h1 className="text-3xl font-black tracking-widest">
          {t('invoice_form.title')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('invoice_form.client_details')}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-full md:col-span-1">
              <label className="font-bold text-sm tracking-wider">{t('invoice_form.select_client')}</label>
              <select 
                {...register('contactId')} 
                className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
              >
                <option value="">{t('invoice_form.select_placeholder')}</option>
                {contacts?.filter(c => c.relationType === 'Kunde' || c.relationType === 'Alle').map(contact => (
                   <option key={contact.id} value={contact.id}>{contact.name} ({contact.orgNumber || t('invoice_form.no_org')})</option>
                ))}
              </select>
              {errors.contactId && <p className="text-red-600 font-bold text-xs">{errors.contactId.message}</p>}
              
              <input type="hidden" {...register('clientName')} />
              <input type="hidden" {...register('clientEmail')} />
            </div>

            <div className="space-y-2 hidden md:block">
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm tracking-wider">{t('invoice_form.issue_date')}</label>
              <input 
                type="date"
                {...register('issueDate')} 
                className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div className="space-y-2">
              <label className="font-bold text-sm tracking-wider">{t('invoice_form.due_date_auto')}</label>
              <input 
                type="date"
                {...register('dueDate')} 
                className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-100"
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>{t('invoice_form.line_items')}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: crypto.randomUUID(), description: '', quantity: 1, price: 0, vatRate: 25 })}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" /> {t('invoice_form.add_item')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-zinc-50 p-4 border-2 border-black">
                <div className="flex-1 space-y-2 w-full">
                  <input placeholder={t('invoice_form.desc_placeholder')} {...register(`items.${index}.description`)} className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none" />
                  {errors.items?.[index]?.description && <p className="text-red-600 font-bold text-xs">{errors.items[index]?.description?.message}</p>}
                </div>
                <div className="w-full md:w-24 space-y-2">
                   <input type="number" placeholder={t('invoice_form.qty_placeholder')} {...register(`items.${index}.quantity`)} className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none" />
                </div>
                <div className="w-full md:w-32 space-y-2">
                   <input type="number" step="0.01" placeholder={t('invoice_form.price_placeholder')} {...register(`items.${index}.price`)} className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none" />
                </div>
                 <div className="w-full md:w-24 space-y-2">
                   <select {...register(`items.${index}.vatRate`)} className="w-full border-2 border-black px-4 py-2 font-bold focus:outline-none bg-white">
                      <option value={25}>25%</option>
                      <option value={15}>15%</option>
                      <option value={0}>0%</option>
                   </select>
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="w-full md:w-auto h-[44px]">
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            ))}
            {errors.items?.root && <p className="text-red-600 font-bold text-sm tracking-wider mt-2">{errors.items.root.message}</p>}
          </CardContent>
        </Card>

        <Card className="bg-black text-white">
           <CardContent className="p-6">
             <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
               <span className="font-bold tracking-widest text-zinc-400">{t('invoice_detail.subtotal')}</span>
               <span className="font-black text-xl">{subtotal.toLocaleString('no-NO')} kr</span>
             </div>
             <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
               <span className="font-bold tracking-widest text-zinc-400">{t('invoice_detail.vat')}</span>
               <span className="font-black text-xl">{totalVat.toLocaleString('no-NO')} kr</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="font-black tracking-widest text-2xl">{t('invoice_detail.total')}</span>
               <span className="font-black text-4xl">{total.toLocaleString('no-NO')} kr</span>
             </div>
           </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-8">
           <Button type="button" variant="outline" className="min-h-[44px]" onClick={() => navigate(-1)}>{t('invoice_form.cancel')}</Button>
           <Button type="submit" className="min-h-[44px]" disabled={createMutation.isPending}>
             {createMutation.isPending ? t('invoice_form.saving') : t('invoice_form.create_btn')}
           </Button>
        </div>
      </form>
    </div>
  );
}
