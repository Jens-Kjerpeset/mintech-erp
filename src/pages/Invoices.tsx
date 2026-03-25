import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { InvoiceBuilder } from '@/features/invoices/InvoiceBuilder';
import { InvoiceList } from '@/features/invoices/InvoiceList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Invoice } from '@/types/schema';

export function Invoices() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true, state: location.state });
    }
  }, [searchParams, setSearchParams, location.state]);

  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => setEditingInvoice(undefined), 300); // Wait for transition
      if (location.state?.returnToDashboard) {
        setTimeout(() => navigate('/', { replace: true }), 300);
      }
    }
  };

  const openForEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsOpen(true);
  };

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Fakturaer</h1>
            <p className="text-muted-foreground">Opprett og spor fakturaer til kunder.</p>
          </div>
        </header>
        
        <InvoiceBuilder open={isOpen} onOpenChange={handleOpenChange} invoice={editingInvoice} />
        <InvoiceList onEdit={openForEdit} />
      </div>

      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full h-14 w-14 shadow-xl hover:shadow-2xl transition-all">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
