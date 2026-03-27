import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faFileAlt, faCalculator, faCubes, faDownload, faFloppyDisk, faArrowLeft, faChevronRight, faPalette } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { settingsSchema, type Settings } from '@/types/schema';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { CompanySettings } from '@/features/settings/CompanySettings';
import { ThemeSettings } from '@/features/settings/ThemeSettings';
import { InvoiceSettings } from '@/features/settings/InvoiceSettings';
import { VATSettings } from '@/features/settings/VATSettings';
import { IntegrationSettings } from '@/features/settings/IntegrationSettings';
import { DataExportSettings } from '@/features/settings/DataExportSettings';

export function Settings() {
 const [isLoading, setIsLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [saveIndicator, setSaveIndicator] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState("bedrift");
 const [showMobileMenu, setShowMobileMenu] = useState(true);
 const [showLogo, setShowLogo] = useState(true);
 const [exportFormat, setExportFormat] = useState("csv");

 const tabInfo = {
 bedrift: { title: "Bedriftsopplysninger", icon: faBuilding },
 utseende: { title: "Utseende & Profil", icon: faPalette },
 faktura: { title: "Fakturaoppsett", icon: faFileAlt },
 regnskap: { title: "Regnskap & MVA", icon: faCalculator },
 api: { title: "Integrasjoner", icon: faCubes },
 eksport: { title: "Eksport & Data", icon: faDownload },
 };

 const activeTabDetails = tabInfo[activeTab as keyof typeof tabInfo];
 const ActiveIcon = activeTabDetails?.icon;

 const form = useForm<z.input<typeof settingsSchema>>({
 resolver: zodResolver(settingsSchema),
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

 const onSubmit = async (formValues: z.input<typeof settingsSchema>) => {
 const values = formValues as Settings;
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

 const generateSAFT = () => downloadMockFile('SAFT_Mintech_2026.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<AuditFile xmlns="urn:StandardAuditFile-Taxation-Financial:NO" version="1.0">\n <Header>\n <CompanyID>987654321</CompanyID>\n </Header>\n</AuditFile>');
 const generateZIP = () => downloadMockFile('Bilagsarkiv_2026.zip', 'Mock ZIP Archive binary data...');
 const generateCSV = () => downloadMockFile('Raadata_2026.csv', 'id,date,amount,category\n123,2026-03-20,499.00,Salg B2C\n124,2026-03-21,1200.00,Salg B2B');

 const handleLogoUpload = () => {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = 'image/png, image/jpeg, image/svg+xml';
 input.onchange = () => setShowLogo(true);
 input.click();
 };

 const simulateAltinnLogin = () => {
 alert("Navigerer til ID-porten (Maskinporten)...\nAutentisering vellykket.\nTilgangstoken mottatt for Skatteetaten API.");
 form.setValue('altinnConnected', true, { shouldDirty: true });
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-8 text-muted-foreground ">
 Henter innstillinger...
 </div>
 );
 }

 return (
 <div className="max-w-4xl space-y-6 pb-12 sm:pb-8">
 <header className="flex flex-col gap-4">
 <div className={["flex flex-col sm:flex-row sm:items-center justify-between gap-4", showMobileMenu ? "flex" : "hidden sm:flex"].filter(Boolean).join(' ')}>
 <div>
 <h1 className="text-3xl font-heading font-medium tracking-tight">Innstillinger</h1>
 <p className="text-muted-foreground">Administrer bedriftsprofil, fakturaoppsett og regnskapsintegrasjoner.</p>
 </div>
 </div>

 {!showMobileMenu && (
 <div className="sm:hidden flex flex-col gap-4">
 <Button variant="ghost" className="w-fit -ml-3 text-muted-foreground hover:text-foreground" onClick={() => setShowMobileMenu(true)}>
 <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" /> Tilbake til meny
 </Button>
 <div className="flex items-center gap-3">
 <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary shrink-0">
 {ActiveIcon && <FontAwesomeIcon icon={ActiveIcon} className="w-5 h-5" />}
 </div>
 <h1 className="text-2xl font-heading font-medium tracking-tight pb-0.5">{activeTabDetails?.title}</h1>
 </div>
 </div>
 )}
 </header>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
 
 {showMobileMenu && (
 <div className="sm:hidden flex flex-col gap-2 mb-6">
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("bedrift"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faBuilding} className="w-5 h-5 mr-3 text-primary" /> Bedriftsopplysninger</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("utseende"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faPalette} className="w-5 h-5 mr-3 text-primary" /> Utseende & Profil</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("faktura"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 mr-3 text-primary" /> Fakturaoppsett</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("regnskap"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faCalculator} className="w-5 h-5 mr-3 text-primary" /> Regnskap & MVA</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("api"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faCubes} className="w-5 h-5 mr-3 text-primary" /> Integrasjoner</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 <Button variant="outline" type="button" className="justify-between h-14 bg-card hover:bg-muted" onClick={() => { setActiveTab("eksport"); setShowMobileMenu(false); }}>
 <div className="flex items-center"><FontAwesomeIcon icon={faDownload} className="w-5 h-5 mr-3 text-primary" /> Eksport & Data</div>
 <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 opacity-50" />
 </Button>
 </div>
 )}

 <TabsList className="!hidden sm:!flex w-full justify-start h-auto bg-transparent border-b rounded-none px-0 pb-px mb-6 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 <TabsTrigger value="bedrift" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2" />
 Bedriftsopplysninger
 </TabsTrigger>
 <TabsTrigger value="utseende" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faPalette} className="w-4 h-4 mr-2" />
 Utseende & Profil
 </TabsTrigger>
 <TabsTrigger value="faktura" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-2" />
 Fakturaoppsett
 </TabsTrigger>
 <TabsTrigger value="regnskap" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faCalculator} className="w-4 h-4 mr-2" />
 Regnskap & MVA
 </TabsTrigger>
 <TabsTrigger value="api" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faCubes} className="w-4 h-4 mr-2" />
 Integrasjoner
 </TabsTrigger>
 <TabsTrigger value="eksport" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2">
 <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
 Eksport & Data
 </TabsTrigger>
 </TabsList>

 <div className={["sm:block", showMobileMenu ? "hidden" : "block "].filter(Boolean).join(' ')}>
 <TabsContent value="bedrift">
 <CompanySettings form={form} />
 </TabsContent>

 <TabsContent value="utseende">
 <ThemeSettings />
 </TabsContent>

 <TabsContent value="faktura">
 <InvoiceSettings form={form} showLogo={showLogo} handleLogoUpload={handleLogoUpload} setShowLogo={setShowLogo} />
 </TabsContent>

 <TabsContent value="regnskap">
 <VATSettings form={form} />
 </TabsContent>

 <TabsContent value="api">
 <IntegrationSettings form={form} simulateAltinnLogin={simulateAltinnLogin} />
 </TabsContent>

 <TabsContent value="eksport">
 <DataExportSettings 
 exportFormat={exportFormat} 
 setExportFormat={setExportFormat} 
 generateSAFT={generateSAFT} 
 generateZIP={generateZIP} 
 generateCSV={generateCSV} 
 />
 </TabsContent>
 </div>
 </Tabs>

 <div className={["pt-6 border-t mt-8 flex-col sm:flex-row items-center justify-between gap-4", showMobileMenu ? "hidden sm:flex" : "flex"].filter(Boolean).join(' ')}>
 <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
 {saveIndicator && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{saveIndicator}</span>}
 </div>
 <div className="flex items-center w-full sm:w-auto gap-3">
 <Button variant="outline" type="button" className="flex-1 sm:flex-none" onClick={() => form.reset()}>Avbryt</Button>
 <Button type="submit" className="flex-1 sm:flex-none" disabled={isSaving}>
 <FontAwesomeIcon icon={faFloppyDisk} className="w-4 h-4 mr-2" />
 {isSaving ? 'Lagrer...' : 'Lagre'}
 </Button>
 </div>
 </div>
 </form>
 </Form>

 <div className="sm:hidden text-center text-xs text-muted-foreground pt-8 pb-4">
 Designet og utviklet av{" "}
 <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline transition-colors">
 Jens Kjerpeset
 </a>
 </div>
 </div>
 );
}
