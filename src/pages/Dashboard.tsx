import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faExclamationTriangle, faExclamationCircle, faClock, faBox, faChevronRight, faStore, faCreditCard, faPlus, faMinus, faReceipt, faFileInvoice, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { RecordItem } from '@/components/ui/record-item';

import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
 const navigate = useNavigate();
 const [chartView, setChartView] = useState<'month' | 'week'>('month');
 const { data: transactions, isLoading: txLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => api.transactions.list() });
 const { data: chartData = [], isLoading: chartLoading } = useQuery({ queryKey: ['chartData', chartView], queryFn: () => api.transactions.getChartData(chartView) });
 const { data: invoices, isLoading: invLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => api.invoices.list() });
 const { data: products, isLoading: prodLoading } = useQuery({ queryKey: ['products'], queryFn: () => api.products.list() });
 const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.settings.get() });

 const totalBalance = transactions?.reduce((acc, tx) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0) || 0;
 const income = transactions?.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0) || 0;
 const expenses = transactions?.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0) || 0;

 const overdueInvoices = invoices?.filter(i => i.status === 'overdue' || (i.status === 'sent' && new Date(i.dueDate) < new Date())) || [];
 const lowStockProducts = products?.filter(p => p.stockQuantity <= p.warningLimit) || [];
 const recentActivity = transactions?.slice(0, 5) || [];

 const vatDeadlineData = useMemo(() => {
 const now = new Date();
 const currentYear = now.getFullYear();
 const deadlines = [
 new Date(currentYear, 3, 10), // 10 Apr
 new Date(currentYear, 5, 10), // 10 Jun
 new Date(currentYear, 7, 31), // 31 Aug
 new Date(currentYear, 9, 10), // 10 Oct
 new Date(currentYear, 11, 10), // 10 Dec
 new Date(currentYear + 1, 1, 10), // 10 Feb (Next year)
 ];
 const allDeadlines = [new Date(currentYear - 1, 11, 10), ...deadlines].sort((a,b) => a.getTime() - b.getTime());
 const next = allDeadlines.find(d => d.getTime() >= now.getTime()) || deadlines[0];
 const daysLeft = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
 return { nextDate: next, daysLeft };
 }, []);

 const isLoading = txLoading || invLoading || prodLoading;

 return (
 <div className="space-y-8 pb-20 md:pb-12 max-w-5xl mx-auto px-2">
 <header className="flex items-center justify-between border-b pb-6 mt-4">
 <div>
 <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors hidden md:inline-block mb-1">
 Designet og utviklet av Jens Kjerpeset
 </a>
 <h1 className="text-3xl font-heading font-medium tracking-tight">
 Oversikt {settings?.companyName && `for ${settings.companyName}`}
 </h1>
 <p className="text-muted-foreground">Velkommen tilbake, Jens.</p>
 </div>
 <Link to="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted" aria-label="Innstillinger">
 <FontAwesomeIcon icon={faCog} className="w-6 h-6" />
 </Link>
 </header>

 {/* Flat Metrics List */}
 <section className="flex flex-col md:flex-row gap-8 pb-8 border-b border-solid">
 <div className="flex-1 space-y-2">
 <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
 Total saldo
 </h2>
 <div className="text-4xl font-medium tracking-tight font-mono">{isLoading ? '...' : formatCurrency(totalBalance)}</div>
 </div>
 <div className="flex-1 space-y-2">
 <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 text-green-600 dark:text-green-500">
 Totale inntekter
 </h2>
 <div className="text-3xl font-medium tracking-tight font-mono text-green-600 dark:text-green-500">{isLoading ? '...' : formatCurrency(income)}</div>
 </div>
 <div className="flex-1 space-y-2">
 <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 text-red-500">
 Totale utgifter
 </h2>
 <div className="text-3xl font-medium tracking-tight font-mono text-red-500">{isLoading ? '...' : formatCurrency(expenses)}</div>
 </div>
 </section>

 {/* Snarveier Flat List */}
 <section className="pb-8 border-b border-solid">
 <h2 className="text-sm font-medium tracking-tight text-muted-foreground mb-4">Snarveier</h2>
 <div className="grid grid-cols-2 gap-2 sm:gap-4">
 <Button variant="outline" className="min-h-14 h-auto w-full font-medium justify-start px-3 sm:px-4 py-3 flex bg-transparent !border-primary/20 hover:bg-primary/5 shadow-none rounded-none text-left whitespace-normal" onClick={() => navigate('/transactions?action=zreport', { state: { returnToDashboard: true } })}>
 <div className="w-5 sm:w-6 flex justify-center shrink-0 mr-2 sm:mr-3">
 <FontAwesomeIcon icon={faReceipt} className="text-primary text-base" />
 </div>
 <span className="leading-tight text-xs sm:text-sm">Nytt Kasseoppgjør</span>
 </Button>
 <Button variant="outline" className="min-h-14 h-auto w-full font-medium justify-start px-3 sm:px-4 py-3 flex bg-transparent !border-blue-500/20 hover:bg-blue-500/5 shadow-none rounded-none text-left whitespace-normal" onClick={() => navigate('/invoices?action=new', { state: { returnToDashboard: true } })}>
 <div className="w-5 sm:w-6 flex justify-center shrink-0 mr-2 sm:mr-3">
 <FontAwesomeIcon icon={faFileInvoice} className="text-blue-500 text-base" />
 </div>
 <span className="leading-tight text-xs sm:text-sm">Opprett Faktura</span>
 </Button>
 <Button variant="outline" className="min-h-14 h-auto w-full font-medium justify-start px-3 sm:px-4 py-3 flex bg-transparent !border-orange-500/20 hover:bg-orange-500/5 shadow-none rounded-none text-left whitespace-normal" onClick={() => navigate('/katalog?action=new', { state: { returnToDashboard: true } })}>
 <div className="w-5 sm:w-6 flex justify-center shrink-0 mr-2 sm:mr-3">
 <FontAwesomeIcon icon={faUserPlus} className="text-orange-500 text-base" />
 </div>
 <span className="leading-tight text-xs sm:text-sm">Ny Kontakt</span>
 </Button>
 <Button variant="outline" className="min-h-14 h-auto w-full font-medium justify-start px-3 sm:px-4 py-3 flex bg-transparent !border-green-500/20 hover:bg-green-500/5 shadow-none rounded-none text-left whitespace-normal" onClick={() => navigate('/invoices?filter=sent')}>
 <div className="w-5 sm:w-6 flex justify-center shrink-0 mr-2 sm:mr-3">
 <FontAwesomeIcon icon={faCreditCard} className="text-green-500 text-base" />
 </div>
 <span className="leading-tight text-xs sm:text-sm">Innbetalinger</span>
 </Button>
 </div>
 </section>

 <div className="flex flex-col lg:flex-row gap-12 pt-4">
 <div className="flex-1 space-y-12">
 {/* Chart Section */}
 <section>
 <div className="flex flex-row items-start lg:items-center justify-between pb-6">
 <div className="space-y-1">
 <h2 className="text-xl font-medium tracking-tight">Kontantstrøm</h2>
 <p className="text-sm text-muted-foreground">Inntekt vs Utgift (siste 6 perioder)</p>
 </div>
 <Tabs value={chartView} onValueChange={(v) => setChartView(v as 'month' | 'week')} className="w-auto border rounded-none p-1">
 <TabsList className="!grid w-32 grid-cols-2 rounded-none bg-transparent">
 <TabsTrigger value="month" className="text-xs rounded-none">Mnd</TabsTrigger>
 <TabsTrigger value="week" className="text-xs rounded-none">Uke</TabsTrigger>
 </TabsList>
 </Tabs>
 </div>
 <div className="h-72 w-full">
 {chartLoading ? (
 <div className="h-full w-full flex items-center justify-center text-muted-foreground">Laster...</div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
 <YAxis fontSize={12} tickFormatter={(val) => `kr ${val/1000}k`} tickLine={false} axisLine={false} />
 {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
 <Tooltip cursor={{ fill: 'transparent' }} position={{ y: 0 }} formatter={(val: any) => formatCurrency(Number(val || 0))} labelStyle={{color: 'black'}} />
 <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
 <Bar dataKey="inntekt" fill="#22c55e" name="Inntekter" />
 <Bar dataKey="utgift" fill="#ef4444" name="Utgifter" />
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 </section>

 {/* Recent Activity Section */}
 <section>
 <div className="flex flex-row items-center justify-between pb-6">
 <div>
 <h2 className="text-xl font-medium tracking-tight">Siste aktivitet</h2>
 <p className="text-sm text-muted-foreground">De nyeste hendelsene i bøkene.</p>
 </div>
 <Link to="/transactions" className="text-sm font-medium text-primary flex items-center hover:underline">Se alle <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 ml-1"/></Link>
 </div>
 <div className="space-y-3 border-t pt-3">
 {recentActivity.map(tx => {
 const isStore = tx.category.toLowerCase().includes('kasse') || tx.category.toLowerCase().includes('salg');
 const isFee = tx.category.toLowerCase().includes('gebyr') || tx.category.toLowerCase().includes('kort');
 let IconChild = tx.type === 'income' ? <FontAwesomeIcon icon={faPlus} className="w-4 h-4" /> : <FontAwesomeIcon icon={faMinus} className="w-4 h-4" />;
 if (isStore) IconChild = <FontAwesomeIcon icon={faStore} className="w-4 h-4" />;
 if (isFee) IconChild = <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4" />;

 return (
 <RecordItem
 key={tx.id}
 icon={IconChild}
 iconBgClass={tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}
 title={tx.description || tx.category}
 titleClass="line-clamp-2 whitespace-normal truncate-none"
 primaryValue={`${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}`}
 primaryValueClass={tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-500'}
 secondaryValue={formatDate(tx.date)}
 />
 )
 })}
 {recentActivity.length === 0 && !isLoading && (
 <div className="text-center py-8 border-b text-muted-foreground text-sm">Ingen aktivitet funnet.</div>
 )}
 </div>
 </section>
 </div>

 {/* Alerts Sidebar / Flat */}
 <aside className="w-full lg:w-80 space-y-6 lg:border-l lg:pl-12 order-first lg:order-last">
 <div>
 <h2 className="text-xl font-medium tracking-tight flex items-center gap-2 mb-2">
 <FontAwesomeIcon icon={faExclamationCircle} className="w-5 h-5 text-orange-500" />
 Varsler & Gjøremål
 </h2>
 
 <div className="space-y-8">
 {overdueInvoices.length > 0 && (
 <div className="border-l-4 border-solid pl-4 border-destructive space-y-2">
 <p className="font-medium tracking-tight text-sm text-destructive flex gap-2 items-center">
 <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 shrink-0" /> {overdueInvoices.length} forfalte faktura{overdueInvoices.length !== 1 ? 'er' : ''}
 </p>
 <p className="text-xs text-muted-foreground">
 Du har utestående beløp som har passert betalingsfristen.
 </p>
 <Button variant="outline" className="h-8 px-3 text-xs font-medium tracking-tight border-destructive text-destructive hover:bg-destructive/10 rounded-none w-full justify-between" onClick={() => navigate('/invoices?filter=overdue')}>
 Følg opp nå <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 ml-1" />
 </Button>
 </div>
 )}

 {lowStockProducts.length > 0 && (
 <div className="border-l-4 border-solid pl-4 border-orange-500 space-y-2">
 <p className="font-medium tracking-tight text-sm text-orange-600 dark:text-orange-400 flex gap-2 items-center">
 <FontAwesomeIcon icon={faBox} className="w-4 h-4 shrink-0" /> Lagerbeholdning: {lowStockProducts.length} varsler
 </p>
 <p className="text-xs text-muted-foreground">
 Enkelte produkter i varelageret har falt under varslingsgrensen.
 </p>
 <Button variant="outline" onClick={() => navigate('/katalog')} className="h-8 px-3 text-xs font-medium tracking-tight border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 rounded-none w-full justify-between">
 Vis katalog <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 ml-1" />
 </Button>
 </div>
 )}

 <div className="border-l-4 border-solid pl-4 border-primary space-y-2">
 <p className="font-medium tracking-tight text-sm text-primary flex gap-2 items-center">
 <FontAwesomeIcon icon={faClock} className="w-4 h-4 shrink-0" /> MVA-frist om {vatDeadlineData.daysLeft} dager
 </p>
 <p className="text-xs text-muted-foreground">
 Neste termin forfaller {vatDeadlineData.nextDate.toLocaleDateString('no-NO')}.
 </p>
 <Button variant="outline" className="h-8 px-3 text-xs font-medium tracking-tight border-primary text-primary hover:bg-primary/10 rounded-none w-full justify-between" onClick={() => navigate('/settings')}>
 Gå til MVA <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 ml-1" />
 </Button>
 </div>
 </div>
 </div>
 </aside>
 </div>

 {/* Mobile Footer Attribution */}
 <div className="md:hidden flex justify-center pt-8 border-t mt-8">
 <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors inline-block">
 Designet og utviklet av Jens Kjerpeset
 </a>
 </div>
 </div>
 );
}
