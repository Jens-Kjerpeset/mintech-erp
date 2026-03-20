import { useState } from 'react';
import { InvoiceBuilder } from '@/features/invoices/InvoiceBuilder';
import { InvoiceList } from '@/features/invoices/InvoiceList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Invoices() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight">Fakturaer</h1>
          <p className="text-muted-foreground">Opprett og spor fakturaer til kunder.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full h-12 w-12 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-6 w-6" />
        </Button>
        <InvoiceBuilder open={isOpen} onOpenChange={setIsOpen} />
      </header>
      
      <InvoiceList />
    </div>
  );
}
