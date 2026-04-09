import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export function Dashboard() {
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['transactions', 'chart', 'month'],
    queryFn: () => api.transactions.getChartData('month')
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list()
  });

  const unpaidInvoices = invoices?.filter(inv => inv.status !== 'paid') || [];
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const isLoading = chartLoading || invoicesLoading;

  if (isLoading) {
    return <div className="text-xl font-bold animate-pulse">Laster Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-black tracking-widest border-b-4 border-black pb-2 inline-block self-start">
          Dashboard
        </h1>
        
        {/* Quick Actions / Hurtigvalg */}
        <div className="flex flex-row w-full gap-2 pb-4 pt-1">
          <Link 
            to="/invoices/new" 
            className="flex-1 w-full flex items-center justify-center text-center whitespace-nowrap font-bold text-xs sm:text-sm bg-[var(--text-base)] text-[var(--bg-base)] border-2 border-[var(--border-brutal)] px-1 sm:px-2 py-2 rounded-none shadow-[2px_2px_0px_var(--border-brutal)] hover:bg-[var(--text-base)]/90 active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none transition-all"
          >
            Ny Faktura
          </Link>
          <Link 
            to="/zreports" 
            className="flex-1 w-full flex items-center justify-center text-center whitespace-nowrap font-bold text-xs sm:text-sm bg-[var(--card-bg)] text-[var(--text-base)] border-2 border-[var(--border-brutal)] px-1 sm:px-2 py-2 rounded-none shadow-[2px_2px_0px_var(--border-brutal)] hover:bg-[var(--muted-bg)] active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none transition-all"
          >
            Nytt Salg/Z
          </Link>
          <Link 
            to="/contacts" 
            className="flex-1 w-full flex items-center justify-center text-center whitespace-nowrap font-bold text-xs sm:text-sm bg-[var(--card-bg)] text-[var(--text-base)] border-2 border-[var(--border-brutal)] opacity-90 px-1 sm:px-2 py-2 rounded-none shadow-[2px_2px_0px_var(--border-brutal)] hover:bg-[var(--muted-bg)] hover:opacity-100 active:translate-x-[2px] active:translate-y-[2px] active:scale-[0.98] active:shadow-none transition-all"
          >
            Ny Kontakt
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/invoices" className="block outline-none transition-transform active:scale-[0.98]">
          <Card className="h-full cursor-pointer hover:opacity-90 transition-opacity">
            <CardHeader>
              <CardTitle>Utestående Fakturaer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{unpaidTotal.toLocaleString('no-NO')} kr</div>
              <p className="text-sm font-bold text-red-600 mt-2 tracking-wider">
                {unpaidInvoices.length} aktive krav
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/hovedbok" className="block outline-none transition-transform active:scale-[0.98]">
          <Card className="h-full cursor-pointer hover:opacity-90 transition-opacity">
            <CardHeader>
              <CardTitle>Økonomisk Oversikt (6 mnd)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                   <YAxis 
                     width={65} 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 12, fontWeight: 'bold' }} 
                     tickFormatter={(val) => val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}
                   />
                   <Tooltip 
                     contentStyle={{ border: '2px solid black', borderRadius: 0, fontWeight: 'bold' }} 
                     cursor={{ fill: '#f4f4f5' }}
                     formatter={(value: number) => [`${value.toLocaleString('no-NO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`, undefined]}
                   />
                   <Legend verticalAlign="top" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '14px' }} />
                   <Bar dataKey="inntekt" name="Inntekter" fill="#000000" radius={[0, 0, 0, 0]} />
                   <Bar dataKey="utgift" name="Kostnader" fill="#dc2626" radius={[0, 0, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
