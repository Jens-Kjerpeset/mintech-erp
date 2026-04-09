import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faTimesCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { api } from '../../lib/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { InvoiceDetailSheet } from './InvoiceDetailSheet';
import { Invoice } from '../../types/schema';

export function InvoiceList() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.invoices.list()
  });

  if (isLoading) {
    return <div className="text-xl font-bold animate-pulse">Laster fakturaer...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-3xl" />;
      case 'sent':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500 text-3xl" />;
      case 'overdue':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 text-3xl" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-zinc-400 text-3xl" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center border-b-4 border-black pb-2">
        <h1 className="text-3xl font-black tracking-widest">Fakturaer</h1>
        <Button asChild>
          <Link to="/invoices/new">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Ny Faktura
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {invoices?.map((invoice) => (
          <button 
             key={invoice.id} 
             onClick={() => setSelectedInvoice(invoice)}
             className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
          >
            <Card className="hover:bg-zinc-50 border-2 border-black transition-colors w-full">
              <CardContent className="p-5 flex flex-col gap-3">
                {/* Top Row: Icon + Client Name */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 leading-none">
                    {getStatusIcon(invoice.status)}
                  </div>
                  <h3 className="font-bold text-xl leading-none truncate w-full text-zinc-900 border-b border-transparent">
                    {invoice.clientName}
                  </h3>
                </div>

                {/* Middle Row: Meta Information (ID, Due Date) */}
                <div className="flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest pt-1">
                  <span className="font-mono">ID: {invoice.id.split('-')[0]}</span>
                  <span>Forfall: {new Date(invoice.dueDate).toLocaleDateString('no-NO')}</span>
                </div>

                {/* Bottom Row: Financial Target */}
                <div className="flex justify-end pt-3 border-t-2 border-black/5 mt-1">
                  <div className="text-3xl font-black font-mono tracking-tight text-black">
                    {invoice.total.toLocaleString('no-NO')} kr
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
        {invoices?.length === 0 && (
          <div className="p-8 text-center border-4 border-black border-dashed font-black tracking-widest text-xl text-zinc-400">
            Ingen fakturaer registrert.
          </div>
        )}
      </div>

      <InvoiceDetailSheet 
         invoice={selectedInvoice} 
         onClose={() => setSelectedInvoice(null)} 
      />
    </div>
  );
}
