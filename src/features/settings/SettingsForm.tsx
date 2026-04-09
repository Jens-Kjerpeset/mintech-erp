import React, { useEffect } from'react';
import { useForm } from'react-hook-form';
import { zodResolver } from'@hookform/resolvers/zod';
import * as z from'zod';
import { useQuery, useMutation, useQueryClient } from'@tanstack/react-query';
import { api } from'../../lib/api';
import { useAppStore } from'../../store/useAppStore';
import { cn } from'../../lib/utils';
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
    return <div className="text-xl font-bold animate-pulse p-4 tracking-widest">Laster innstillinger...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      <div className="border-b-4 border-black pb-2 mb-6">
        <h1 className="text-3xl font-black tracking-widest">Systemoppsett</h1>
      </div>

      <form id="settings-form" onSubmit={handleSubmit(onSubmit)}>
        <Accordion type="single" collapsible className="space-y-6">
          
          {/* Seksjon 1: Juridisk Informasjon */}
          <AccordionItem value="juridisk">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faBuilding} className="text-zinc-400" /> Juridisk Informasjon
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Selskapsnavn *</label>
                <input 
                  {...register('companyName')} 
                  className="w-full border-2 border-black px-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                  placeholder="Mintech AS"
                />
                {errors.companyName && <p className="text-red-600 font-bold text-xs">{errors.companyName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Organisasjonsnummer *</label>
                <input 
                  {...register('orgNumber')} 
                  className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                  placeholder="123 456 789 MVA"
                />
                {errors.orgNumber && <p className="text-red-600 font-bold text-xs">{errors.orgNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Gateadresse *</label>
                <input 
                  {...register('companyAddress')} 
                  className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                  placeholder="Storgata 1"
                />
                {errors.companyAddress && <p className="text-red-600 font-bold text-xs">{errors.companyAddress.message}</p>}
              </div>

              <div className="flex flex-row gap-4">
                 <div className="space-y-2 w-1/3">
                    <label className="font-bold text-sm tracking-wider text-zinc-500">Postnummer *</label>
                    <input 
                      {...register('companyZipCode')} 
                      className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                      placeholder="0000"
                    />
                    {errors.companyZipCode && <p className="text-red-600 font-bold text-xs">{errors.companyZipCode.message}</p>}
                 </div>
                 <div className="space-y-2 flex-1">
                    <label className="font-bold text-sm tracking-wider text-zinc-500">Poststed *</label>
                    <input 
                      {...register('companyCity')} 
                      className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
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
                <FontAwesomeIcon icon={faCreditCard} className="text-zinc-400" /> Betalingsinformasjon
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Bankkontonummer *</label>
                <input 
                  {...register('bankAccount')} 
                  className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50 text-xl"
                  placeholder="0000.00.00000"
                />
                {errors.bankAccount && <p className="text-red-600 font-bold text-xs">{errors.bankAccount.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Vipps-nummer (Valgfritt)</label>
                <input 
                  {...register('vippsNumber')} 
                  className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                  placeholder="12345"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">IBAN (Valgfritt)</label>
                   <input 
                     {...register('iban')} 
                     className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">SWIFT/BIC (Valgfritt)</label>
                   <input 
                     {...register('swift')} 
                     className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                   />
                 </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 3: System & Fakturering */}
          <AccordionItem value="system">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faGear} className="text-zinc-400" /> System & Fakturering
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">Neste Fakturanummer</label>
                   <input 
                     type="number"
                     disabled={hasInvoices}
                     {...register('nextInvoiceNumber')} 
                     title={hasInvoices ?"Fakturanummer kan ikke endres etter første faktura er sendt" :""}
                     className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-200"
                   />
                   {hasInvoices && <p className="text-zinc-500 font-bold text-xs">Låst av systemet (Fakturaer eksisterer)</p>}
                   {errors.nextInvoiceNumber && <p className="text-red-600 font-bold text-xs">{errors.nextInvoiceNumber.message}</p>}
                 </div>

                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">MVA Termin</label>
                   <select 
                     {...register('mvaTerm')} 
                     className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                   >
                     <option value="BiMonthly">Annenhver måned</option>
                     <option value="Yearly">Årlig</option>
                   </select>
                   {errors.mvaTerm && <p className="text-red-600 font-bold text-xs">{errors.mvaTerm.message}</p>}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-bold text-sm tracking-wider text-zinc-500">Standard Kredittid (Dager)</label>
                  <input 
                    type="number"
                    {...register('defaultCreditDays')} 
                    className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50 max-w-[150px]"
                  />
                  {errors.defaultCreditDays && <p className="text-red-600 font-bold text-xs">{errors.defaultCreditDays.message}</p>}
                </div>

                 <div className="space-y-2">
                   <label className="font-bold text-sm tracking-wider text-zinc-500">Språk / Language</label>
                   <select 
                     {...register('language')} 
                     className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                   >
                     <option value="no">Norsk (Norway)</option>
                     <option value="en">English (US)</option>
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
                <FontAwesomeIcon icon={faIdCard} className="text-zinc-400" /> Profilering
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Logo URL</label>
                <input 
                  {...register('logoUrl')} 
                  className="w-full border-2 border-black px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50"
                  placeholder="https://example.com/logo.png"
                />
                {errors.logoUrl && <p className="text-red-600 font-bold text-xs">{errors.logoUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-sm tracking-wider text-zinc-500">Standard Fakturatekst</label>
                <textarea 
                  {...register('defaultNote')} 
                  rows={3}
                  className="w-full border-2 border-black px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-black bg-zinc-50 resize-none"
                  placeholder="Skriv inn en melding som vises på alle fakturaer..."
                />
                {errors.defaultNote && <p className="text-red-600 font-bold text-xs">{errors.defaultNote.message}</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Seksjon 5: Utseende */}
          <AccordionItem value="utseende">
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPalette} className="text-zinc-400" /> Utseende & Tema
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
                  <span className="font-bold text-black tracking-wider text-sm">Lys</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn("flex-1 aspect-square bg-zinc-950 border-2 border-zinc-700 flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    theme ==='dark' ?"ring-4 ring-offset-2 ring-black dark:ring-white dark:ring-offset-zinc-950" :"opacity-80"
                  )}
                >
                  <FontAwesomeIcon icon={faMoon} className="text-3xl text-white" />
                  <span className="font-bold text-white tracking-wider text-sm">Mørk</span>
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </form>

      {/* Sticky footer for saving (Outside Accordion Tree, mapped to form ID) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-100 border-t-4 border-black p-4 flex justify-end shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto w-full flex justify-end">
          <Button 
            type="submit" 
            form="settings-form"
            disabled={updateMutation.isPending}
            className="w-full sm:w-auto h-14 text-lg min-w-[250px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            {updateMutation.isPending ? (
              <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Lagrer...</>
            ) : (
              <><FontAwesomeIcon icon={faSave} className="mr-2" /> Lagre Innstillinger</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
