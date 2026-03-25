import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme, type Theme } from '@/providers/ThemeProvider';
import { api } from '@/lib/api';
import { settingsSchema, type Settings } from '@/types/schema';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Building2, FileText, Calculator, Blocks, Download, Save, Lock, ArrowLeft, ChevronRight, LogOut, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("bedrift");
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [showLogo, setShowLogo] = useState(true);
  
  // Eksport state
  const [exportFormat, setExportFormat] = useState("csv");

  // Profile Theme state from provider
  const { theme: selectedTheme, setTheme } = useTheme();
  
  const themes: { id: Theme; color: string; shape: string }[] = [
    { id: 'default', color: 'bg-zinc-900 dark:bg-zinc-100', shape: 'rounded-full' },
    { id: 'theme-1', color: 'bg-lime-400 dark:bg-fuchsia-600', shape: 'rounded-none' }, 
    { id: 'theme-2', color: 'bg-emerald-800', shape: 'rounded-full' }, 
    { id: 'theme-3', color: 'bg-zinc-950 border-yellow-400 border-[3px]', shape: 'rounded-none' }, 
    { id: 'theme-4', color: 'bg-pink-400', shape: 'rounded-full' }, 
  ];

  const tabInfo = {
    bedrift: { title: "Bedriftsopplysninger", icon: Building2 },
    utseende: { title: "Utseende & Profil", icon: Palette },
    faktura: { title: "Fakturaoppsett", icon: FileText },
    regnskap: { title: "Regnskap & MVA", icon: Calculator },
    api: { title: "Integrasjoner", icon: Blocks },
    eksport: { title: "Eksport & Data", icon: Download },
  };

  const activeTabDetails = tabInfo[activeTab as keyof typeof tabInfo];
  const ActiveIcon = activeTabDetails?.icon;

  const form = useForm<Settings>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      id: 'default',
      companyName: '',
      orgNumber: '',
      companyAddress: '',
      companyZipCode: '',
      companyCity: '',
      bankAccount: '',
      iban: '',
      swift: '',
      vippsNumber: '',
      logoUrl: '',
      defaultCreditDays: 14,
      nextInvoiceNumber: 10001,
      defaultNote: '',
      priceDisplay: 'ExVat',
      mvaTerm: 'BiMonthly',
      fiscalYear: 'Calendar',
      psd2Connected: false,
      izettleConnected: false,
      altinnConnected: false,
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.settings.get();
        form.reset(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [form]);

  const onSubmit = async (values: Settings) => {
    setIsSaving(true);
    setSaveIndicator(null);
    try {
      await api.settings.update(values);
      form.reset(values);
      setSaveIndicator("Innstillinger lagret!");
      setTimeout(() => setSaveIndicator(null), 3000);
    } catch {
      setSaveIndicator("Lagring feilet.");
      setTimeout(() => setSaveIndicator(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadMockFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateSAFT = () => {
    downloadMockFile('SAFT_Mintech_2026.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<AuditFile xmlns="urn:StandardAuditFile-Taxation-Financial:NO" version="1.0">\n  <Header>\n    <CompanyID>987654321</CompanyID>\n  </Header>\n</AuditFile>');
  };

  const generateZIP = () => {
    downloadMockFile('Bilagsarkiv_2026.zip', 'Mock ZIP Archive binary data...');
  };

  const generateCSV = () => {
    downloadMockFile('Raadata_2026.csv', 'id,date,amount,category\n123,2026-03-20,499.00,Salg B2C\n124,2026-03-21,1200.00,Salg B2B');
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/svg+xml';
    input.onchange = () => {
      setShowLogo(true);
    };
    input.click();
  };

  const simulateAltinnLogin = () => {
    alert("Navigerer til ID-porten (Maskinporten)...\nAutentisering vellykket.\nTilgangstoken mottatt for Skatteetaten API.");
    form.setValue('altinnConnected', true, { shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground animate-pulse">
        Henter innstillinger...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12 sm:pb-8">
      <header className="flex flex-col gap-4">
        {/* Desktop or Mobile Main Menu View */}
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", showMobileMenu ? "flex" : "hidden sm:flex")}>
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Innstillinger</h1>
            <p className="text-muted-foreground">Administrer bedriftsprofil, fakturaoppsett og regnskapsintegrasjoner.</p>
          </div>
        </div>

        {/* Mobile Submenu View Header */}
        {!showMobileMenu && (
          <div className="sm:hidden flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <Button variant="ghost" className="w-fit -ml-3 text-muted-foreground hover:text-foreground" onClick={() => setShowMobileMenu(true)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Tilbake til meny
            </Button>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {ActiveIcon && <ActiveIcon className="w-5 h-5" />}
              </div>
              <h1 className="text-2xl font-heading font-bold tracking-tight pb-0.5">{activeTabDetails?.title}</h1>
            </div>
          </div>
        )}
      </header>



      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            {/* Mobile View: Vertical Tab Menu List */}
            {showMobileMenu && (
              <div className="sm:hidden flex flex-col gap-2 mb-6 animate-in fade-in slide-in-from-left-4 duration-300">
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("bedrift"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><Building2 className="w-5 h-5 mr-3 text-primary" /> Bedriftsopplysninger</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("utseende"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><Palette className="w-5 h-5 mr-3 text-primary" /> Utseende & Profil</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("faktura"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><FileText className="w-5 h-5 mr-3 text-primary" /> Fakturaoppsett</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("regnskap"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><Calculator className="w-5 h-5 mr-3 text-primary" /> Regnskap & MVA</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("api"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><Blocks className="w-5 h-5 mr-3 text-primary" /> Integrasjoner</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
                <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("eksport"); setShowMobileMenu(false); }}>
                  <div className="flex items-center"><Download className="w-5 h-5 mr-3 text-primary" /> Eksport & Data</div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Button>
              </div>
            )}

            {/* Desktop View: Horizontal Tabs */}
            <TabsList className="hidden sm:flex w-full justify-start h-auto bg-transparent border-b rounded-none px-0 pb-px mb-6 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsTrigger value="bedrift" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <Building2 className="w-4 h-4 mr-2" />
                Bedriftsopplysninger
              </TabsTrigger>
              <TabsTrigger value="utseende" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <Palette className="w-4 h-4 mr-2" />
                Utseende & Profil
              </TabsTrigger>
              <TabsTrigger value="faktura" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                Fakturaoppsett
              </TabsTrigger>
              <TabsTrigger value="regnskap" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <Calculator className="w-4 h-4 mr-2" />
                Regnskap & MVA
              </TabsTrigger>
              <TabsTrigger value="api" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <Blocks className="w-4 h-4 mr-2" />
                Integrasjoner
              </TabsTrigger>
              <TabsTrigger value="eksport" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
                <Download className="w-4 h-4 mr-2" />
                Eksport & Data
              </TabsTrigger>
            </TabsList>

            {/* Only show tab contents if on desktop or if a mobile menu item was selected */}
            <div className={cn("sm:block", showMobileMenu ? "hidden" : "block animate-in slide-in-from-right-8 duration-300")}>



              {/* TAB 1: BEDRIFTSOPPLYSNINGER */}
              <TabsContent value="bedrift" className="space-y-4 m-0">
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
            </TabsContent>

            {/* NEW TAB: UTSEENDE & PROFIL */}
            <TabsContent value="utseende" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Utseende & Profil</CardTitle>
                  <CardDescription>Skreddersy farger og applikasjonens formverk.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-lg shrink-0">
                        MH
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-base leading-tight truncate">Mina Haugen</p>
                        <p className="text-sm text-muted-foreground truncate">mina@mintech.no</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button" className="hidden sm:flex gap-2" onClick={() => alert("Logg inn / ut funksjonalitet kommer senere.")}>
                      <LogOut className="size-4" /> Logg ut
                    </Button>
                    <Button variant="outline" size="icon" type="button" className="sm:hidden shrink-0" onClick={() => alert("Logg inn / ut funksjonalitet kommer senere.")}>
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t flex flex-col gap-3">
                    <p className="text-sm font-medium">Tema-akselerator</p>
                    <div className="flex items-center gap-3">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={(e) => { e.preventDefault(); setTheme(t.id); }}
                          className={cn(
                            "size-8 border shadow-sm transition-all focus:outline-none focus-visible:ring-2 ring-primary ring-offset-background",
                            t.color,
                            t.shape,
                            selectedTheme === t.id ? "ring-2 ring-offset-2 border-primary/20 scale-110" : "hover:scale-105"
                          )}
                          title={`Velg ${t.id} tema`}
                          aria-label={`Velg ${t.id} tema`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: FAKTURAOPPSETT */}
            <TabsContent value="faktura" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visuell Identitet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-16 rounded-md bg-white flex items-center justify-center shrink-0 border p-2 object-contain overflow-hidden shadow-sm">
                      {showLogo ? (
                        <img src="/logo.png" alt="Bedriftslogo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground/50 font-medium">Laster Logo...</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Bedriftslogo</p>
                      <p className="text-xs text-muted-foreground">Optimal størrelse: 400x120px. Maks filstørrelse 2MB.</p>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" type="button" onClick={handleLogoUpload}>Last opp ny</Button>
                        <Button variant="ghost" size="sm" type="button" className="text-destructive" onClick={() => setShowLogo(false)}>Fjern</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fakturanummerserie & Betingelser</CardTitle>
                  <CardDescription>Bokføringsloven krever at fakturanummer følger en ubrutt rekke.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="nextInvoiceNumber" render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel>Neste Fakturanummer</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type="number" 
                              className="bg-muted/50 font-mono pr-10" 
                              readOnly 
                              {...field} 
                            />
                          </FormControl>
                          <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-3 opacity-50" />
                        </div>
                        <FormDescription>Låst. Genereres automatisk av systemet.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="defaultCreditDays" render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 space-y-0">
                        <FormLabel>Standard Kredittid</FormLabel>
                        <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={field.value.toString()}>
                          <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Velg frist" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="10">10 dager</SelectItem>
                            <SelectItem value="14">14 dager (Standard)</SelectItem>
                            <SelectItem value="20">20 dager</SelectItem>
                            <SelectItem value="30">30 dager</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="priceDisplay" render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 space-y-0 pt-2">
                      <FormLabel>Standard Prisvisning på Fakturalinjer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="w-full sm:w-1/2"><SelectValue placeholder="Velg" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="ExVat">Eks. MVA</SelectItem>
                            <SelectItem value="IncVat">Inkl. MVA</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tekst & Meldinger</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="defaultNote" render={({ field }) => (
                    <FormItem className="flex flex-col gap-2 space-y-0">
                      <FormLabel>Standard melding til kunde (valgfritt)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="F.eks. Takk for handelen!" 
                          className="resize-none min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Legges til automatisk nederst på alle nye fakturaer.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: REGNSKAP & MVA */}
            <TabsContent value="regnskap" className="space-y-4">
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
            </TabsContent>

            {/* TAB 4: INTEGRATIONS */}
            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Altinn / Skatteetaten (MVA-melding)</CardTitle>
                  <CardDescription>Koble til Skatteetaten for direkte innsending av mva-melding via Maskinporten.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-card mt-2">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm space-y-0 gap-2">
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm space-y-0 gap-2">
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
            </TabsContent>

            {/* TAB 5: EKSPORT & DATA */}
            <TabsContent value="eksport" className="space-y-4">
              <Card className="border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Lovpålagt Revisjonsfil (SAF-T)
                  </CardTitle>
                  <CardDescription>Påkrevd filformat ved bokettersyn fra Skatteetaten. Eksporterer hele hovedboken formatert til SAF-T Financial standarden.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                      <FormLabel>Regnskapsår</FormLabel>
                      <Select defaultValue="2026">
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="2026">2026</SelectItem><SelectItem value="2025">2025</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <Button type="button" onClick={generateSAFT} className="shrink-0 gap-2">
                      <Download className="w-4 h-4" /> Generer SAF-T XML
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sikkerhetskopi & Nedlasting</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg flex flex-col justify-between gap-4">
                    <div className="flex flex-col items-center justify-center text-center gap-3">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Bilagsarkiv (Z-rapporter & Fakturaer)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Last ned kopi av alle PDF-bilag i en ZIP-fil.</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button" className="w-full mt-auto" onClick={generateZIP}>Eksporter ZIP</Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg flex flex-col justify-between gap-4">
                    <div className="flex flex-col items-center justify-center text-center gap-3">
                      <Blocks className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">Rådata (Transaksjoner & Salg)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Eksporter detaljerte transaksjoner med avanserte parametre.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Fra dato</label>
                        <Input type="date" className="h-8 text-xs" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Til dato</label>
                        <Input type="date" className="h-8 text-xs" />
                      </div>
                      <div className="col-span-2 flex flex-col gap-1 mt-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground">Format</label>
                        <Select value={exportFormat} onValueChange={(val) => setExportFormat(val || "csv")}>
                          <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV (Kommaseparert)</SelectItem>
                            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" type="button" className="w-full mt-auto" onClick={generateCSV}>
                      Eksportér Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            </div>
            
          </Tabs>
          {/* Action Bar */}
          <div className={cn("pt-6 border-t mt-8 flex-col sm:flex-row items-center justify-between gap-4", showMobileMenu ? "hidden sm:flex" : "flex")}>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              {saveIndicator && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{saveIndicator}</span>}
            </div>
            <div className="flex items-center w-full sm:w-auto gap-3">
              <Button variant="outline" type="button" className="flex-1 sm:flex-none" onClick={() => form.reset()}>Avbryt</Button>
              <Button type="submit" className="flex-1 sm:flex-none" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Lagrer...' : 'Lagre'}
              </Button>
            </div>
          </div>

        </form>
      </Form>

      {/* Mobile Credits Footer */}
      <div className="sm:hidden text-center text-xs text-muted-foreground pt-8 pb-4">
        Designet og utviklet av{" "}
        <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">
          Jens Kjerpeset
        </a>
      </div>
    </div>
  );
}
