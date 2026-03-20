import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecordItem } from '@/components/ui/record-item';
import { Wallet, ArrowUpRight, ArrowDownRight, Settings, AlertTriangle, AlertCircle, Clock, Package, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

export function Dashboard() {
  const { data: transactions, isLoading: txLoading } = useQuery({ queryKey: ['transactions'], queryFn: () => api.transactions.list() });
  const { data: invoices, isLoading: invLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => api.invoices.list() });
  const { data: products, isLoading: prodLoading } = useQuery({ queryKey: ['products'], queryFn: () => api.products.list() });
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.settings.get() });

  const totalBalance = transactions?.reduce((acc, tx) => tx.type === 'income' ? acc + tx.amount : acc - tx.amount, 0) || 0;
  const income = transactions?.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0) || 0;
  const expenses = transactions?.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0) || 0;

  const overdueInvoices = invoices?.filter(i => i.status === 'overdue') || [];
  const lowStockProducts = products?.filter(p => p.stockQuantity <= p.warningLimit) || [];
  // Show 5 most recent transactions
  const recentActivity = transactions?.slice(0, 5) || [];

  const chartData = useMemo(() => {
    if (!transactions) return [];
    const grouped = transactions.reduce((acc: Record<string, { name: string, inntekt: number, utgift: number, sortKey: string }>, tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('no-NO', { month: 'short' });
      if (!acc[key]) acc[key] = { name: monthName, inntekt: 0, utgift: 0, sortKey: key };
      if (tx.type === 'income') acc[key].inntekt += tx.amount;
      if (tx.type === 'expense') acc[key].utgift += tx.amount;
      return acc;
    }, {});
    const sorted = Object.values(grouped).sort((a: {sortKey: string}, b: {sortKey: string}) => a.sortKey.localeCompare(b.sortKey));
    return sorted.slice(-6);
  }, [transactions]);

  const isLoading = txLoading || invLoading || prodLoading;

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <a href="https://kjerpeset.no" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors inline-block mb-1">
            Designed and developed by Jens Kjerpeset
          </a>
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Oversikt {settings?.companyName && `for ${settings.companyName}`}
          </h1>
          <p className="text-muted-foreground">Velkommen tilbake, Mina.</p>
        </div>
        <Link to="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted" aria-label="Innstillinger">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      {/* Metrics Top Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 lg:col-span-1 bg-primary text-primary-foreground border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total saldo</CardTitle>
            <Wallet className="w-4 h-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{isLoading ? '...' : formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-green-500">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totale inntekter</CardTitle>
            <ArrowUpRight className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-mono">{isLoading ? '...' : formatCurrency(income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-red-500">
            <CardTitle className="text-sm font-medium text-muted-foreground">Totale utgifter</CardTitle>
            <ArrowDownRight className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold font-mono">{isLoading ? '...' : formatCurrency(expenses)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
          <Card className="border-primary/5">
             <CardHeader>
               <CardTitle>Kontantstrøm</CardTitle>
               <CardDescription>Inntekt vs Utgift (siste {chartData.length} måneder)</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="h-[300px] w-full mt-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                     <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis fontSize={12} tickFormatter={(val) => `kr ${val/1000}k`} tickLine={false} axisLine={false} />
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                     <Tooltip cursor={{ fill: 'transparent' }} formatter={(val: any) => formatCurrency(Number(val || 0))} labelStyle={{color: 'black'}} />
                     <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                     <Bar dataKey="inntekt" fill="#22c55e" radius={[4, 4, 0, 0]} name="Inntekter" />
                     <Bar dataKey="utgift" fill="#ef4444" radius={[4, 4, 0, 0]} name="Utgifter" />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Siste Aktivitet</CardTitle>
                <CardDescription>De nyeste hendelsene i bøkene.</CardDescription>
              </div>
              <Link to="/transactions" className="text-sm font-medium text-primary flex items-center hover:underline">Se alle <ChevronRight className="w-4 h-4 ml-1"/></Link>
            </CardHeader>
            <CardContent className="space-y-3">
               {recentActivity.map(tx => (
                 <RecordItem
                   key={tx.id}
                   icon={tx.type === 'income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                   iconBgClass={tx.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}
                   title={tx.description || tx.category}
                   titleClass="line-clamp-2 whitespace-normal truncate-none"
                   primaryValue={`${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}`}
                   primaryValueClass={tx.type === 'income' ? 'text-primary' : 'text-foreground'}
                   secondaryValue={formatDate(tx.date)}
                 />
               ))}
               {recentActivity.length === 0 && !isLoading && (
                 <div className="text-center p-4 text-muted-foreground text-sm">Ingen aktivitet funnet.</div>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="order-1 lg:order-2 space-y-6">
          <Card className="border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Varsler & Gjøremål
              </CardTitle>
              <CardDescription>Viktige oppgaver som krever din oppmerksomhet akkurat nå.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {overdueInvoices.length > 0 && (
                <div className="p-3 border rounded-md flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-red-700 dark:text-red-400">
                      {overdueInvoices.length} forfalte faktura{overdueInvoices.length !== 1 ? 'er' : ''}
                    </p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                      Du har utestående beløp som har passert betalingsfristen.
                    </p>
                    <Link to="/invoices?filter=overdue" className="text-xs font-bold text-red-700 dark:text-red-400 mt-2 inline-flex items-center hover:underline">
                      Følg opp nå <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div className="p-3 border rounded-md flex items-start gap-3 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30">
                  <Package className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-orange-700 dark:text-orange-400">
                      Lagerbeholdning: {lowStockProducts.length} varsler
                    </p>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                      Enkelte produkter i varelageret har falt under varslingsgrensen.
                    </p>
                    <Link to="/katalog" className="text-xs font-bold text-orange-700 dark:text-orange-400 mt-2 inline-flex items-center hover:underline">
                      Vis katalog <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>
              )}

              {/* VAT Deadline always shows up for the mockup */}
              <div className="p-3 border rounded-md flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-blue-700 dark:text-blue-400">MVA-frist om 21 dager</p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                    Neste mva-termin (Jan-Feb) forfaller 10. April 2026.
                  </p>
                  <Link to="/settings" className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-2 inline-flex items-center hover:underline">
                    Se rapport <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
