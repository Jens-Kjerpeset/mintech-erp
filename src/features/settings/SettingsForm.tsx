import React, { useEffect } from'react';
import { useForm } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import * as z from'zod';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { useAppStore } from'../../store/useAppStore';
import { cn } from'../../lib/utils';
import { useTranslation } from '../../lib/i18n';
import { Button } from'../../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from'../../components/ui/accordion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner, faBuilding, faCreditCard, faGear, faPalette, faSun, faMoon, faIdCard } from '@fortawesome/free-solid-svg-icons';

const settingsSchema = z.object({
  id: z.string().default('default'),
  companyName: z.string().min(2,'Selskapsnavn må ha minst 2 tegn'),
  orgNumber: z.string()
    .min(9,'Ugyldig organisasjonsnummer')
    .regex(/^[0-9\s]+(\s?MVA)?$/i,'Må være gyldig format, f.eks"123 456 789 MVA"'),
  companyAddress: z.string().min(2,'Gateadresse kreves'),
  companyZipCode: z.string().min(4,'Postnummer kreves'),
  companyCity: z.string().min(2,'Poststed kreves'),
  bankAccount: z.string().min(5,'Gyldig kontonummer kreves'),
  iban: z.string().default(''),
  swift: z.string().default(''),
  vippsNumber: z.string().default(''),
  logoUrl: z.string().default(''),
  defaultCreditDays: z.coerce.number().min(0).default(14),
  nextInvoiceNumber: z.coerce.number().min(1,'Fakturanummer må være minst 1'),
  defaultNote: z.string().default(''),
  priceDisplay: z.string().default('inc_vat'),
  mvaTerm: z.enum(['BiMonthly','Yearly']).default('BiMonthly'),
  fiscalYear: z.string().default((new Date()).getFullYear().toString()),
  psd2Connected: z.boolean().default(false),
  izettleConnected: z.boolean().default(false),
  altinnConnected: z.boolean().default(false),
  language: z.enum(['no', 'en']).default('no'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const queryClient = useQueryClient();
  const theme = useAppStore(state => state.theme);
  const setTheme = useAppStore(state => state.setTheme);
  const { t } = useTranslation();

  const { data: initialSettings, isLoading: isFetching } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.settings.get()
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list()
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: (initialSettings as any) || {
      mvaTerm: 'BiMonthly',
      nextInvoiceNumber: 1000,
    } as any
  });

  useEffect(() => {
    if (initialSettings) {
      reset(initialSettings as any);
    }
  }, [initialSettings, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      await api.settings.update(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate(data);
  };

  const hasInvoices = invoices && invoices.length > 0;

  if (isFetching) {
    return <div className="text-xl font-bold animate-pulse p-4 tracking-widest">{t('settings.loading')}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <div className="border-b-4 border-[var(--border-brutal)] pb-2 mb-6">
        <h1 className="text-3xl font-black tracking-widest">{t('settings.title')}</h1>
      </div>

      <form id="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <Accordion type="single" collapsible className="space-y-6">
          
          {/* Seksjon 1: Juridisk Informasjon */}
          <AccordionItem value="juridisk">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faBuilding} className="text-zinc-400" /> {t('settings.legal')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.legal_name')}</label>
                <input 
                  {...register('companyName')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                  placeholder="Mintech AS"
                />
                {errors.companyName && <p className="text-red-600 font-bold text-xs">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.legal_org')}</label>
                <input 
                  {...register('orgNumber')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                  placeholder="123 456 789 MVA"
                />
                {errors.orgNumber && <p className="text-red-600 font-bold text-xs">{errors.orgNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.legal_address')}</label>
                <input 
                  {...register('companyAddress')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                  placeholder="Storgata 1"
                />
                {errors.companyAddress && <p className="text-red-600 font-bold text-xs">{errors.companyAddress.message}</p>}
              </div>

              <div className="flex flex-row gap-4">
                 <div className="space-y-2 w-1/3">
                    <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.legal_zip')}</label>
                    <input 
                      {...register('companyZipCode')} 
                      className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                      placeholder="0000"
                    />
                    {errors.companyZipCode && <p className="text-red-600 font-bold text-xs">{errors.companyZipCode.message}</p>}
                 </div>
                 <div className="space-y-2 flex-1">
                    <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.legal_city')}</label>
                    <input 
                      {...register('companyCity')} 
                      className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                      placeholder="Oslo"
                    />
                    {errors.companyCity && <p className="text-red-600 font-bold text-xs">{errors.companyCity.message}</p>}
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 2: Betalingsinformasjon */}
          <AccordionItem value="betaling">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faCreditCard} className="text-zinc-400" /> {t('settings.payment')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.payment_bank')}</label>
                <input 
                  {...register('bankAccount')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)] text-xl"
                  placeholder="0000.00.00000"
                />
                {errors.bankAccount && <p className="text-red-600 font-bold text-xs">{errors.bankAccount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.payment_vipps')}</label>
                <input 
                  {...register('vippsNumber')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                  placeholder="12345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.payment_iban')}</label>
                   <input 
                     {...register('iban')} 
                     className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.payment_swift')}</label>
                   <input 
                     {...register('swift')} 
                     className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                   />
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 3: System & Fakturering */}
          <AccordionItem value="system">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faGear} className="text-zinc-400" /> {t('settings.system')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.system_next_inv')}</label>
                   <input 
                     type="number"
                     disabled={hasInvoices}
                     {...register('nextInvoiceNumber')} 
                     title={hasInvoices ? t('settings.system_next_inv_locked') : ""}
                     className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--muted-bg)]"
                   />
                   {hasInvoices && <p className="text-zinc-500 font-bold text-xs">{t('settings.system_next_inv_locked')}</p>}
                   {errors.nextInvoiceNumber && <p className="text-red-600 font-bold text-xs">{errors.nextInvoiceNumber.message}</p>}
                 </div>

                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.system_mva')}</label>
                   <select 
                     {...register('mvaTerm')} 
                     className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                   >
                     <option value="BiMonthly">{t('settings.system_mva_bimo')}</option>
                     <option value="Yearly">{t('settings.system_mva_year')}</option>
                   </select>
                   {errors.mvaTerm && <p className="text-red-600 font-bold text-xs">{errors.mvaTerm.message}</p>}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.system_credit')}</label>
                  <input 
                    type="number"
                    {...register('defaultCreditDays')} 
                    className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)] max-w-[150px]"
                  />
                  {errors.defaultCreditDays && <p className="text-red-600 font-bold text-xs">{errors.defaultCreditDays.message}</p>}
                </div>

                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.system_lang')}</label>
                   <select 
                     {...register('language')} 
                     className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                   >
                     <option value="no">{t('settings.system_lang_no')}</option>
                     <option value="en">{t('settings.system_lang_en')}</option>
                   </select>
                   {errors.language && <p className="text-red-600 font-bold text-xs">{errors.language.message}</p>}
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 4: Profilering */}
          <AccordionItem value="profilering">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faIdCard} className="text-zinc-400" /> {t('settings.profile')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.profile_logo')}</label>
                <input 
                  {...register('logoUrl')} 
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)]"
                  placeholder="https://example.com/logo.png"
                />
                {errors.logoUrl && <p className="text-red-600 font-bold text-xs">{errors.logoUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">{t('settings.profile_note')}</label>
                <textarea 
                  {...register('defaultNote')} 
                  rows={3}
                  className="w-full border-2 border-[var(--border-brutal)] px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-[var(--border-brutal)] bg-[var(--card-bg)] text-[var(--text-base)] resize-none"
                  placeholder={t('settings.profile_note_placeholder')}
                />
                {errors.defaultNote && <p className="text-red-600 font-bold text-xs">{errors.defaultNote.message}</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 5: Utseende */}
          <AccordionItem value="utseende">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPalette} className="text-zinc-400" /> {t('settings.theme')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="flex flex-row gap-4 mt-2 p-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn("flex-1 aspect-square bg-white border-2 border-black flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    theme ==='light' ?"ring-4 ring-offset-2 ring-black dark:ring-white dark:ring-offset-zinc-950" :"opacity-80"
                  )}
                >
                  <FontAwesomeIcon icon={faSun} className="text-3xl text-black" />
                  <span className="font-bold text-black tracking-wider text-sm">{t('settings.theme_light')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn("flex-1 aspect-square bg-zinc-950 border-2 border-zinc-700 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    theme ==='dark' ?"ring-4 ring-offset-2 ring-black dark:ring-white dark:ring-offset-zinc-950" :"opacity-80"
                  )}
                >
                  <FontAwesomeIcon icon={faMoon} className="text-3xl text-white" />
                  <span className="font-bold text-white tracking-wider text-sm">{t('settings.theme_dark')}</span>
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </form>

      {/* Sticky footer for saving (Outside Accordion Tree, mapped to form ID) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--muted-bg)] border-t-4 border-[var(--border-brutal)] p-4 flex justify-end shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_0_0_rgba(24,24,27,0.5)]">
        <div className="max-w-3xl mx-auto w-full flex justify-end">
          <Button 
            type="submit" 
            form="settings-form"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto h-14 text-lg min-w-[250px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            {updateMutation.isPending ? (
              <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> {t('settings.saving')}</>
            ) : (
              <><FontAwesomeIcon icon={faSave} className="mr-2" /> {t('settings.save')}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
