import React, { useEffect } from'react';
import { useForm } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import * as z from'zod';
import { useMutation, useQuery, useQueryClient } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { Button } from'../../components/ui/button';
import { FontAwesomeIcon } from'@fortawesome/react-fontawesome';
import { faSave, faSpinner } from'@fortawesome/free-solid-svg-icons';
import { useTranslation } from '../../lib/i18n';

const productSchema = z.object({
  type: z.enum(['physical','service']).default('physical'),
  name: z.string().min(2,'Navn kreves'),
  sku: z.string().min(1,'SKU kreves'),
  unit: z.string().min(1,'Enhet kreves'),
  costPriceExVat: z.coerce.number().min(0,'Ugyldig pris'),
  salesPriceIncVat: z.coerce.number().min(0,'Ugyldig pris'),
  vatRate: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().nullable().default(0),
  warningLimit: z.coerce.number().nullable().default(0),
  supplierId: z.string().optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.list()
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      type:'physical',
      name:'',
      sku:'',
      unit:'stk',
      costPriceExVat: 0,
      salesPriceIncVat: 0,
      vatRate: 25,
      stockQuantity: 0,
      warningLimit: 5,
      supplierId:''
    }
  });

  const selectedType = watch('type');

  useEffect(() => {
     if (selectedType ==='service') {
        setValue('stockQuantity', null);
        setValue('warningLimit', null);
     } else if (selectedType ==='physical' && initialData?.stockQuantity === undefined) {
        setValue('stockQuantity', 0);
        setValue('warningLimit', 5);
     }
  }, [selectedType, setValue, initialData]);

  const saveMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      if (initialData?.id) {
         await api.products.update(initialData.id, data);
      } else {
         await api.products.create(data as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onSuccess?.();
    }
  });

  const onSubmit = (data: ProductFormValues) => {
    saveMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-4 border-2 border-black">
        <div className="space-y-2 col-span-full mb-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.type')}</label>
           <select 
            {...register('type')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white tracking-widest text-sm"
          >
            <option value="physical">{t('product_form.type_physical')}</option>
            <option value="service">{t('product_form.type_service')}</option>
          </select>
        </div>

        <div className="space-y-2 col-span-full">
          <label className="font-bold text-sm tracking-wider">{t('product_form.name')}</label>
          <input 
            {...register('name')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {errors.name && <p className="text-red-600 font-bold text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.sku')}</label>
          <input 
            {...register('sku')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {errors.sku && <p className="text-red-600 font-bold text-xs">{errors.sku.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.unit')}</label>
          <input 
            {...register('unit')} 
            placeholder={t('product_form.unit_placeholder')}
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {errors.unit && <p className="text-red-600 font-bold text-xs">{errors.unit.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.cost_price')}</label>
          <input 
             type="number" step="0.01"
            {...register('costPriceExVat')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {errors.costPriceExVat && <p className="text-red-600 font-bold text-xs">{errors.costPriceExVat.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.sales_price')}</label>
          <input 
             type="number" step="0.01"
            {...register('salesPriceIncVat')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {errors.salesPriceIncVat && <p className="text-red-600 font-bold text-xs">{errors.salesPriceIncVat.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="font-bold text-sm tracking-wider">{t('product_form.vat_rate')}</label>
          <select 
            {...register('vatRate')} 
            className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value={25}>{t('product_form.vat_25')}</option>
            <option value={15}>{t('product_form.vat_15')}</option>
            <option value={12}>{t('product_form.vat_12')}</option>
            <option value={0}>{t('product_form.vat_0')}</option>
          </select>
          {errors.vatRate && <p className="text-red-600 font-bold text-xs">{errors.vatRate.message}</p>}
        </div>

        <div className="space-y-2 col-span-full">
          <label className="font-bold text-sm tracking-wider">{t('product_form.supplier')}</label>
           <select 
            {...register('supplierId')} 
            className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">{t('product_form.supplier_none')}</option>
            {contacts?.filter(c => c.relationType ==='Leverandør').map((contact) => (
               <option key={contact.id} value={contact.id}>{contact.name} ({contact.orgNumber})</option>
            ))}
          </select>
        </div>

        {selectedType ==='physical' && (
          <>
            <div className="space-y-2">
              <label className="font-bold text-sm tracking-wider text-black">{t('product_form.active_stock')}</label>
              <input 
                 type="number"
                {...register('stockQuantity')} 
                className="w-full border-2 border-black px-4 py-3 font-mono font-black text-xl focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-sm tracking-wider text-black">{t('product_form.warning_limit')}</label>
              <input 
                 type="number"
                {...register('warningLimit')} 
                className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          type="submit" 
          disabled={saveMutation.isPending}
          className="w-full sm:w-auto min-h-[50px] text-lg px-8"
        >
          {saveMutation.isPending ? (
            <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> {t('product_form.saving')}</>
          ) : (
            <><FontAwesomeIcon icon={faSave} className="mr-2" /> {t('product_form.save_btn')}</>
          )}
        </Button>
      </div>
    </form>
  );
}
