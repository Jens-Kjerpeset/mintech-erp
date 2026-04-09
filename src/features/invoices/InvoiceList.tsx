import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faTimesCircle, faPlus, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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

  const groupedData = useMemo(() => {
    const groups: Record<string, Invoice[]> = {};
    if (!invoices) return groups;
    invoices.forEach(i => {
      const monthStr = new Date(i.issueDate).toLocaleString('no-NO', { month: 'long', year: 'numeric' });
      const cappedMonthStr = monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
      if (!groups[cappedMonthStr]) groups[cappedMonthStr] = [];
      groups[cappedMonthStr].push(i);
    });
    return groups;
  }, [invoices]);

  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
    const currentM = new Date().toLocaleString('no-NO', { month: 'long', year: 'numeric' });
    return { [currentM.charAt(0).toUpperCase() + currentM.slice(1)]: true };
  });
  
  const toggleMonth = (month: string) => setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));

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
      <div className="flex flex-col gap-6">
        {Object.entries(groupedData).map(([month, invs]) => (
          <div key={month} className="flex flex-col gap-3">
            <button
              onClick={() => toggleMonth(month)}
              className="bg-black text-white px-4 py-3 font-black text-xl tracking-widest text-left flex justify-between items-center active:scale-95 transition-transform border-4 border-black group"
            >
              <span>{month}</span>
              <FontAwesomeIcon icon={expandedMonths[month] ? faChevronDown : faChevronRight} className="group-active:scale-90" />
            </button>
            
            {expandedMonths[month] && (
              <div className="flex flex-col gap-4 pl-3 border-l-4 border-black ml-1.5 transition-all">
                {invs.map((invoice) => (
                  <button 
                     key={invoice.id} 
                     onClick={() => setSelectedInvoice(invoice)}
                     className="w-full text-left active:scale-[0.98] transition-transform duration-100 ease-in-out focus:outline-none block"
                  >
                    <Card className="hover:bg-zinc-50 border-2 border-black transition-colors w-full">
                      <CardContent className="p-5 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 leading-none">
                            {getStatusIcon(invoice.status)}
                          </div>
                          <h3 className="font-bold text-xl leading-none truncate w-full text-zinc-900 border-b border-transparent">
                            {invoice.clientName}
                          </h3>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-zinc-500 tracking-widest pt-1">
                          <span className="font-mono">ID: {invoice.id.split('-')[0]}</span>
                          <span>Forfall: {new Date(invoice.dueDate).toLocaleDateString('no-NO')}</span>
                        </div>
                        <div className="flex justify-end pt-3 border-t-2 border-black/5 mt-1">
                          <div className="text-3xl font-black font-mono tracking-tight text-black">
                            {invoice.total.toLocaleString('no-NO')} kr
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
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
