import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDrag } from '@use-gesture/react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFilePdf, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/utils';
import { Invoice } from '../../types/schema';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';

export function InvoiceDetailSheet({ invoice, onClose }: { invoice: Invoice | null, onClose: () => void }) {
  const queryClient = useQueryClient();
  const isOpen = !!invoice;
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch contextual settings and contacts to pass to the PDF generator
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: () => api.settings.get() });
  const { data: contacts } = useQuery({ queryKey: ['contacts'], queryFn: () => api.contacts.list() });

  const currentContact = contacts?.find(c => c.name === invoice?.clientName) || null;

  const bind = useDrag(({ movement: [, my], velocity: [, vy], direction: [, dy], cancel, last }) => {
    if (my < -50) cancel();
    if (last && (my > 100 || (vy > 0.5 && dy > 0))) {
      onClose();
    }
  }, {
    from: () => [0, 0],
    bounds: { top: 0 },
    rubberband: true,
    axis: 'y'
  });

  useEffect(() => {
    if (invoice) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [invoice]);

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.invoices.update(id, { status: 'paid' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const handleMarkAsPaid = () => {
    if (invoice) {
      updateMutation.mutate(invoice.id);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !settings) return;
    try {
      setIsGenerating(true);
      const doc = <InvoicePDF invoice={invoice} settings={settings} contact={currentContact} />;
      const blob = await pdf(doc).toBlob();
      const invoiceNumber = invoice.id.split('-')[0];
      const filename = `Faktura-${invoiceNumber}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Web Share API fallback architecture
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Faktura ${invoiceNumber}`,
          files: [file]
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    } catch (err) {
      console.error('PDF sharing failed:', err);
      // In production we would surface a toast error here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div 
        className={cn("fixed inset-0 z-40 bg-black/60 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        {...bind()}
        className={cn("fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white border-t-4 border-black rounded-t-2xl shadow-[0_-4px_0_0_rgba(0,0,0,0.1)] touch-none transition-transform duration-300 h-[85vh]",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0 mt-2">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>
        
        {invoice && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 flex justify-between items-start mb-4 flex-none">
              <div>
                <h2 className="text-2xl font-black tracking-widest">{invoice.clientName}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-bold text-xs bg-black text-white px-2 py-1 tracking-widest">ID: {invoice.id.split('-')[0]}</span>
                  <span className={cn("font-bold text-xs px-2 py-1 tracking-widest border-2",
                    invoice.status === 'paid' ? "border-green-600 text-green-700 bg-green-50" : 
                    invoice.status === 'overdue' ? "border-red-600 text-red-700 bg-red-50" : "border-yellow-500 text-yellow-700 bg-yellow-50"
                  )}>
                    {invoice.status}
                  </span>
                </div>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={onClose} className="shrink-0">
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 border-2 border-black">
                  <div>
                    <span className="block font-bold text-xs text-zinc-500 tracking-widest">Fakturadato</span>
                    <span className="font-mono font-bold text-lg">{new Date(invoice.issueDate).toLocaleDateString('no-NO')}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-xs text-zinc-500 tracking-widest">Forfallsdato</span>
                    <span className="font-mono font-bold text-lg">{new Date(invoice.dueDate).toLocaleDateString('no-NO')}</span>
                  </div>
                </div>

                <div className="border-4 border-black">
                  <div className="bg-black text-white p-3 font-bold tracking-widest text-sm flex justify-between">
                    <span>Varelinjer</span>
                  </div>
                  <div className="divide-y-2 divide-black">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white">
                        <div className="font-bold">{item.description}</div>
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-zinc-500 font-bold">{item.quantity} x {item.price.toLocaleString('no-NO')} kr</span>
                          <span className="font-mono font-bold text-lg">{(item.quantity * item.price).toLocaleString('no-NO')} kr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-zinc-100 p-4 space-y-2 border-t-2 border-black font-mono">
                    <div className="flex justify-between items-center text-sm font-bold text-zinc-600">
                      <span className="font-sans tracking-widest">Delsum</span>
                      <span>{invoice.subtotal.toLocaleString('no-NO')} kr</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-zinc-600 border-b border-zinc-300 pb-2">
                       <span className="font-sans tracking-widest">MVA ({invoice.taxRate}%)</span>
                       <span>{(invoice.total - invoice.subtotal).toLocaleString('no-NO')} kr</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black pt-2">
                      <span className="font-sans tracking-widest text-lg">Total</span>
                      <span>{invoice.total.toLocaleString('no-NO')} kr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="flex-none p-4 bg-white border-t-4 border-black sticky bottom-0 space-y-3 pb-8 w-full z-10">
               <Button 
                 variant="outline" 
                 className="w-full text-lg h-14" 
                 disabled={isGenerating || !settings}
                 onClick={handleDownloadPDF}
               >
                 {isGenerating ? (
                    <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Genererer PDF...</>
                 ) : (
                    <><FontAwesomeIcon icon={faFilePdf} className="mr-2" /> Last Ned PDF</>
                 )}
               </Button>
               
               {invoice.status !== 'paid' && (
                 <Button 
                   className="w-full text-lg h-14 bg-black hover:bg-zinc-800 text-white" 
                   onClick={handleMarkAsPaid}
                   disabled={updateMutation.isPending}
                 >
                   {updateMutation.isPending ? (
                     <><FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Oppdaterer...</>
                   ) : (
                     <><FontAwesomeIcon icon={faCheck} className="mr-2" /> Marker som Betalt</>
                   )}
                 </Button>
               )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
